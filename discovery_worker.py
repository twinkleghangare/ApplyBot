"""ApplyBot Autonomous Job Discovery Pipeline.
Periodically searches configured job portals (LinkedIn, FreeHire, ATS crawlers),
deduplicates via tools/job_key.py, verifies authenticity via authenticity_engine.py,
and records jobs into applybot_db.
"""

import os
import json
import shutil
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

import applybot_db
import authenticity_engine
from tools.job_key import make_key

ROOT_DIR = Path(__file__).resolve().parent
BUN_PATH = os.environ.get("BUN_PATH") or shutil.which("bun") or "bun"
LINKEDIN_CLI = ROOT_DIR / ".agents/skills/linkedin-search/cli/src/cli.ts"
FREEHIRE_CLI = ROOT_DIR / ".agents/skills/freehire-search/cli/src/cli.ts"


def load_candidate_preferences() -> Dict[str, Any]:
    """Load candidate profile to get target roles and locations."""
    profile_path = ROOT_DIR / "candidate_profile.json"
    if profile_path.exists():
        try:
            return json.loads(profile_path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {
        "target_roles": ["AI Engineer Intern", "Machine Learning Intern", "Data Science Intern", "Generative AI Intern"],
        "target_locations": ["Bengaluru, Karnataka, India", "Hyderabad, Telangana, India", "Pune, Maharashtra, India", "Remote"]
    }


def search_linkedin(query: str, location: str, limit: int = 6) -> List[Dict[str, Any]]:
    """Search LinkedIn guest API via portable CLI."""
    if not LINKEDIN_CLI.exists() or not shutil.which(BUN_PATH):
        return []
    
    cmd = [
        BUN_PATH, "run", str(LINKEDIN_CLI),
        "search",
        "--query", query,
        "--location", location,
        "--limit", str(limit),
        "--format", "json"
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30, cwd=str(ROOT_DIR))
        if proc.returncode == 0 and proc.stdout.strip():
            data = json.loads(proc.stdout.strip())
            return data.get("results", [])
    except Exception as e:
        applybot_db.log_agent_event("discovery", f"LinkedIn search error for '{query}' in '{location}': {e}", "warning")
    return []


def fetch_linkedin_detail(job_id: str) -> Optional[Dict[str, Any]]:
    """Fetch full detail description for a LinkedIn job ID."""
    if not LINKEDIN_CLI.exists() or not shutil.which(BUN_PATH):
        return None
    cmd = [
        BUN_PATH, "run", str(LINKEDIN_CLI),
        "detail", str(job_id),
        "--format", "json"
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=25, cwd=str(ROOT_DIR))
        if proc.returncode == 0 and proc.stdout.strip():
            return json.loads(proc.stdout.strip())
    except Exception:
        pass
    return None


def search_freehire(query: str, remote_only: bool = False, limit: int = 6) -> List[Dict[str, Any]]:
    """Search FreeHire public ATS aggregator via portable CLI."""
    if not FREEHIRE_CLI.exists() or not shutil.which(BUN_PATH):
        return []
    
    cmd = [
        BUN_PATH, "run", str(FREEHIRE_CLI),
        "search",
        "-q", query,
        "--limit", str(limit),
        "--format", "json"
    ]
    if remote_only:
        cmd.extend(["--remote", "remote"])
    
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=30, cwd=str(ROOT_DIR))
        if proc.returncode == 0 and proc.stdout.strip():
            data = json.loads(proc.stdout.strip())
            return data.get("results", [])
    except Exception as e:
        applybot_db.log_agent_event("discovery", f"FreeHire search error for '{query}': {e}", "warning")
    return []


def run_discovery_cycle(roles: Optional[List[str]] = None, 
                         locations: Optional[List[str]] = None,
                         limit_per_query: int = 4) -> Dict[str, Any]:
    """
    Execute a full autonomous discovery cycle:
    1. Queries LinkedIn and FreeHire for candidate target roles.
    2. Deduplicates via canonical job keys.
    3. Runs authenticity verification.
    4. Upserts jobs and verifications into database.
    """
    prefs = load_candidate_preferences()
    target_roles = roles or prefs.get("target_roles", ["AI Engineer Intern", "Machine Learning Intern"])
    target_locations = locations or prefs.get("target_locations", ["Bengaluru", "Hyderabad", "Remote"])
    
    applybot_db.log_agent_event("discovery", f"Starting discovery cycle across {len(target_roles)} roles and {len(target_locations)} locations", "info")
    
    new_jobs_count = 0
    total_scanned = 0
    verified_count = 0
    suspicious_count = 0
    expired_count = 0
    discovered_jobs: List[Dict[str, Any]] = []

    # 1. Search LinkedIn
    for role in target_roles[:3]: # Cap queries to stay lightweight & fast
        for loc in target_locations[:2]:
            raw_results = search_linkedin(role, loc, limit=limit_per_query)
            total_scanned += len(raw_results)
            
            for item in raw_results:
                title = item.get("title", "")
                company = item.get("company", "")
                url = item.get("url", "")
                if not title or not company:
                    continue
                
                key = make_key(company, title, url)
                existing = applybot_db.get_job(key)
                if existing:
                    continue
                
                # Fetch full detail if available
                detail = fetch_linkedin_detail(item.get("id")) if item.get("id") else None
                desc = detail.get("description", "") if detail else item.get("snippet", "")
                
                job_record = {
                    "job_key": key,
                    "title": title,
                    "company": company,
                    "location": item.get("location", loc),
                    "url": url,
                    "portal": "linkedin",
                    "date_posted": item.get("date"),
                    "deadline": None,
                    "description": desc,
                    "raw": item,
                    "first_seen": datetime.now().isoformat(),
                    "status": "discovered"
                }
                applybot_db.upsert_job(job_record)
                
                # Verify authenticity immediately
                verif = authenticity_engine.verify_job(job_record)
                verif["job_key"] = key
                applybot_db.upsert_verification(verif)
                
                if verif["status"] == "VERIFIED":
                    verified_count += 1
                elif verif["status"] == "SUSPICIOUS":
                    suspicious_count += 1
                elif verif["status"] == "EXPIRED":
                    expired_count += 1

                new_jobs_count += 1
                job_record["verification"] = verif
                discovered_jobs.append(job_record)

    # 2. Search FreeHire ATS Aggregator
    for role in target_roles[:2]:
        raw_results = search_freehire(role, remote_only=True, limit=limit_per_query)
        total_scanned += len(raw_results)
        
        for item in raw_results:
            title = item.get("title", "")
            company = item.get("company", "")
            url = item.get("url", "")
            if not title or not company:
                continue
            
            key = make_key(company, title, url)
            existing = applybot_db.get_job(key)
            if existing:
                continue
            
            job_record = {
                "job_key": key,
                "title": title,
                "company": company,
                "location": item.get("location") or "Remote",
                "url": url,
                "portal": "freehire",
                "date_posted": item.get("date"),
                "deadline": None,
                "description": item.get("description", ""),
                "raw": item,
                "first_seen": datetime.now().isoformat(),
                "status": "discovered"
            }
            applybot_db.upsert_job(job_record)
            
            # Verify authenticity
            verif = authenticity_engine.verify_job(job_record)
            verif["job_key"] = key
            applybot_db.upsert_verification(verif)
            
            if verif["status"] == "VERIFIED":
                verified_count += 1
            elif verif["status"] == "SUSPICIOUS":
                suspicious_count += 1
            elif verif["status"] == "EXPIRED":
                expired_count += 1

            new_jobs_count += 1
            job_record["verification"] = verif
            discovered_jobs.append(job_record)

    summary = {
        "timestamp": datetime.now().isoformat(),
        "total_scanned": total_scanned,
        "new_discovered": new_jobs_count,
        "verified_count": verified_count,
        "suspicious_count": suspicious_count,
        "expired_count": expired_count,
        "jobs": discovered_jobs
    }

    applybot_db.log_agent_event(
        "discovery", 
        f"Discovery cycle completed: {new_jobs_count} new jobs added ({verified_count} verified, {suspicious_count} suspicious)",
        "success" if new_jobs_count > 0 else "info",
        details={"scanned": total_scanned, "new": new_jobs_count, "verified": verified_count}
    )
    
    return summary
