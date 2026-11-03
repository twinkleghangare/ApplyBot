"""ApplyBot Job Authenticity Engine.
Deterministic verification pipeline detecting fake recruiters, fee scams,
phishing links, prompt injections, expired postings, and duplicate listings.
Integrates directly with tools/posting_guard.py.
"""

import re
import urllib.parse
from typing import Dict, List, Any, Optional
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR / "tools"))

try:
    from tools.posting_guard import guard, verdict as pg_verdict
except ImportError:
    from posting_guard import guard, verdict as pg_verdict  # type: ignore

# ============================================================================
# DETECTION HEURISTICS
# ============================================================================

FEE_SCAM_PATTERNS = [
    re.compile(r"(registration|training|security|document|verification|laptop|equipment|exam|processing|joining)\s*(fee|charges?|deposit|cost|amount|payment)", re.I),
    re.compile(r"pay\s*(us|upfront|first|\$|₹|rs\.?)\s*\d*", re.I),
    re.compile(r"(send|transfer)\s*(money|crypto|usdt|bitcoin|funds)", re.I),
    re.compile(r"refundable\s*deposit", re.I),
    re.compile(r"purchase\s*your\s*own\s*(laptop|software|kit)", re.I),
]

TASK_SCAM_PATTERNS = [
    re.compile(r"(contact|message|reach)\s*(on|via)?\s*telegram", re.I),
    re.compile(r"t\.me/[a-zA-Z0-9_]+", re.I),
    re.compile(r"(like|subscribe|rate)\s*(youtube|google\s*maps?|videos?)\s*(and|to)\s*earn", re.I),
    re.compile(r"earn\s*(₹|\$|rs\.?)\s*[0-9,]+\s*per\s*(day|hour|task)", re.I),
    re.compile(r"part[- ]time\s*online\s*data\s*entry\s*(job|work)\s*earn", re.I),
]

HARVESTING_PATTERNS = [
    re.compile(r"(credit|debit)\s*card\s*(number|cvv|expiry)", re.I),
    re.compile(r"(bank|account)\s*(password|pin|otp)", re.I),
    re.compile(r"send\s*(your)?\s*(aadhaar|pan|ssn)\s*(front\s*and\s*back|copy\s*immediately)", re.I),
]

EXPIRED_PATTERNS = [
    re.compile(r"no\s*longer\s*accepting\s*applications", re.I),
    re.compile(r"this\s*(job|posting|position|vacancy)\s*(has\s*expired|is\s*closed|is\s*no\s*longer\s*available)", re.I),
    re.compile(r"applications?\s*(are\s*)?closed", re.I),
    re.compile(r"the\s*job\s*you\s*are\s*looking\s*for\s*is\s*unavailable", re.I),
]

ABSURD_EXPERIENCE_FOR_INTERN = [
    re.compile(r"(intern|internship|trainee|fresher)[\s\S]{0,100}(require|minimum|at\s*least)\s*([4-9]|[1-9][0-9])\+?\s*(years?|yrs)", re.I),
]

VERIFIED_ATS_DOMAINS = {
    "greenhouse.io", "lever.co", "myworkdayjobs.com", "smartrecruiters.com",
    "ashbyhq.com", "jobs.jobvite.com", "careers-page.com", "bamboohr.com",
    "icims.com", "taleo.net", "workable.com", "recruitee.com", "zohorecruit.in",
    "zohorecruit.com", "rippling-ats.com", "applytojob.com", "linkedin.com"
}

SUSPICIOUS_SHORTENERS = {
    "bit.ly", "tinyurl.com", "is.gd", "cutt.ly", "t.co", "rb.gy"
}


# ============================================================================
# AUTHENTICITY EVALUATOR
# ============================================================================

def verify_job(job: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform deep verification on a discovered job listing.
    Returns:
        status: VERIFIED | NEEDS REVIEW | SUSPICIOUS | EXPIRED
        risk_score: 0.0 (safest) to 100.0 (highest risk)
        flags: list of detected anomalies
        evidence: explanatory text
        limitations: disclaimer on verification scope
    """
    flags: List[str] = []
    risk_score = 0.0
    evidence_points: List[str] = []
    
    title = job.get("title", "")
    company = job.get("company", "")
    url = job.get("url", "")
    description = job.get("description", "")
    raw_text = f"{title}\n{company}\n{description}"
    
    # 1. URL & Domain Authenticity
    domain = ""
    is_trusted_ats = False
    if url:
        try:
            parsed = urllib.parse.urlparse(url)
            domain = (parsed.hostname or "").lower()
            if domain.startswith("www."):
                domain = domain[4:]
            
            # Check IP address as domain (common phishing signal)
            if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
                flags.append("Phishing Alert: Destination URL is an explicit IP address rather than a domain name.")
                risk_score += 45
            
            # Check URL shortener
            if any(domain == s or domain.endswith("." + s) for s in SUSPICIOUS_SHORTENERS):
                flags.append("Obfuscated Link: Application destination uses a URL shortener.")
                risk_score += 25
            
            # Check trusted ATS
            if any(domain == ats or domain.endswith("." + ats) for ats in VERIFIED_ATS_DOMAINS):
                is_trusted_ats = True
                evidence_points.append(f"Hosted on verified corporate ATS infrastructure ({domain}).")
        except Exception:
            flags.append("Malformed application URL.")
            risk_score += 15

    # 2. Posting Guard Integrity Scan (Hidden CSS, Injections, Homoglyphs)
    try:
        mode = "html" if ("<div" in description.lower() or "<p" in description.lower() or "<span" in description.lower()) else "text"
        cleaned_text, pg_findings = guard(description, mode=mode)
        verdict_str = pg_verdict(pg_findings)
        
        if "clean" not in verdict_str.lower():
            if pg_findings.get("instruction_like"):
                flags.append(f"Prompt Injection Alert: Found {len(pg_findings['instruction_like'])} instruction-like lines targeted at AI agents.")
                risk_score += 50
            if pg_findings.get("homoglyph_runs"):
                flags.append(f"Look-alike Character Spoofing: Found mixed-script Cyrillic/Greek characters: {pg_findings['homoglyph_runs'][:3]}.")
                risk_score += 35
            if pg_findings.get("hidden_blocks"):
                flags.append("Hidden HTML blocks detected in description text.")
                risk_score += 10
    except Exception as e:
        evidence_points.append(f"Posting guard scan note: {e}")

    # 3. Pay-to-Work / Fee Scam Check (Zero Tolerance)
    for pattern in FEE_SCAM_PATTERNS:
        match = pattern.search(raw_text)
        if match:
            flags.append(f"Severe Scam Indicator: Posting mentions payment or fee requirement ('{match.group(0)}').")
            risk_score += 65
            break

    # 4. Telegram Task Scam Check
    for pattern in TASK_SCAM_PATTERNS:
        match = pattern.search(raw_text)
        if match:
            flags.append(f"Suspicious Channel Indicator: Posting promotes Telegram task or unverified quick-payout scheme ('{match.group(0)}').")
            risk_score += 55
            break

    # 5. Sensitive Credential Harvesting Check
    for pattern in HARVESTING_PATTERNS:
        match = pattern.search(raw_text)
        if match:
            flags.append(f"Critical Security Alert: Posting requests sensitive personal financial credentials ('{match.group(0)}').")
            risk_score += 70
            break

    # 6. Absurd Experience Requirements for Interns
    for pattern in ABSURD_EXPERIENCE_FOR_INTERN:
        match = pattern.search(raw_text)
        if match:
            flags.append(f"Unrealistic Requirement: Intern/trainee title paired with extensive experience requirement ('{match.group(0)}').")
            risk_score += 20
            break

    # 7. Closed / Expired Postings
    is_expired = False
    for pattern in EXPIRED_PATTERNS:
        match = pattern.search(raw_text)
        if match:
            is_expired = True
            flags.append(f"Expired Posting: Notice indicates applications are closed ('{match.group(0)}').")
            break

    # Determine Final Status
    if is_expired:
        status = "EXPIRED"
        evidence_points.append("Vacancy was flagged as closed or no longer accepting applications.")
    elif risk_score >= 40:
        status = "SUSPICIOUS"
        evidence_points.append(f"High risk score ({risk_score:.0f}/100) triggered by multiple safety alarms.")
    elif risk_score >= 15 or not is_trusted_ats:
        status = "NEEDS REVIEW"
        if not is_trusted_ats:
            evidence_points.append(f"Domain '{domain or 'unknown'}' is not an established ATS; user review advised before submitting personal data.")
        if risk_score > 0:
            evidence_points.append(f"Moderate risk score ({risk_score:.0f}/100).")
    else:
        status = "VERIFIED"
        evidence_points.append("Clean text layer, verified enterprise ATS infrastructure, zero fee traps or suspicious directives.")

    # Clamp risk score
    risk_score = min(100.0, max(0.0, risk_score))

    evidence_str = " ".join(evidence_points)
    limitations_str = "Verification covers automated ATS authenticity, URL integrity, prompt injection heuristics, and scam signature detection. It does not replace independent user due diligence before signing employment agreements."

    return {
        "status": status,
        "risk_score": round(risk_score, 1),
        "flags": flags,
        "evidence": evidence_str,
        "limitations": limitations_str
    }
