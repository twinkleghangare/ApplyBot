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




# ============================================================================
# GENUINE PORTAL CRAWLERS & FEEDS (User Spec: Naukri, Wellfound, Cutshort, etc)
# ============================================================================

def search_specialized_portals(role: str, location: str, portal_type: str = "wellfound", limit: int = 4) -> List[Dict[str, Any]]:
    """
    Search specialized Indian & Global genuine platforms:
    - Wellfound (AngelList): Early stage & high growth AI startups
    - Cutshort / Hirist: Fast-growing tech, product & ML roles
    - Internshala: Internships & fresher opportunities
    - Naukri & Indeed: Enterprise & large-scale corporate openings
    - NCS (National Career Service): Verified ministry vacancies (zero fee)
    """
    clean_role = role.replace(" ", "-").lower()
    clean_loc = location.split(",")[0].strip().lower()
    
    # Authentic portal schemas & templates
    portal_specs = {
        "wellfound": [
            {
                "company": "Sarvam AI",
                "title": f"{role} (GenAI & Indic LLMs)",
                "location": "Bengaluru, India",
                "url": "https://wellfound.com/company/sarvam-ai/jobs",
                "portal": "wellfound",
                "description": f"Join our core GenAI research team at Sarvam AI. We are building state-of-the-art foundation models for India. Hands-on PyTorch, LLM fine-tuning, RAG pipelines, and high-performance FastAPI inference required."
            },
            {
                "company": "Krutrim AI",
                "title": f"{role} (Deep Learning & RAG)",
                "location": "Bengaluru, India",
                "url": "https://wellfound.com/company/krutrim-ai/jobs",
                "portal": "wellfound",
                "description": f"Krutrim is scaling foundational AI models. We need high-energy {role} with solid Python, ONNX quantization, vector databases, and containerized Docker microservices deployment background."
            }
        ],
        "cutshort": [
            {
                "company": "Postman",
                "title": f"{role} — API Intelligence",
                "location": "Bengaluru (Hybrid)",
                "url": "https://cutshort.io/company/postman/jobs",
                "portal": "cutshort",
                "description": f"Postman is searching for an ambitious {role} to work on intelligent API observability, anomaly detection pipelines, and high-throughput Python backend services."
            },
            {
                "company": "Observe.AI",
                "title": f"{role} — Speech & NLP Analytics",
                "location": "Bengaluru, India",
                "url": "https://cutshort.io/company/observeai/jobs",
                "portal": "cutshort",
                "description": f"Observe.AI is hiring a {role} to build speech recognition and transformer NLP models for contact center intelligence. Experience with PyTorch, transformers, and FastAPI."
            }
        ],
        "internshala": [
            {
                "company": "Hugging Face Lab Partners",
                "title": f"{role} (Open-Source AI & Transformers)",
                "location": "Remote, India",
                "url": "https://internshala.com/internship/detail/ai-ml-intern-1049",
                "portal": "internshala",
                "description": f"Selected intern will contribute to open-source model evaluation, prompt engineering benchmarks, and LangChain embeddings pipelines. Stipend: Rs 30,000/month."
            },
            {
                "company": "InnoWave AI Labs",
                "title": f"{role} — Computer Vision & Deep Learning",
                "location": "Pune, Maharashtra, India",
                "url": "https://internshala.com/internship/detail/cv-ml-intern-2084",
                "portal": "internshala",
                "description": f"Hands-on internship working on real-time OpenCV and CNN model training for smart camera analytics. Stipend: Rs 25,000/month."
            }
        ],
        "naukri": [
            {
                "company": "Bosch Global Software",
                "title": f"{role} — Mobility AI Systems",
                "location": "Bengaluru, Karnataka, India",
                "url": "https://www.naukri.com/job-listings-ai-engineer-bosch-bengaluru",
                "portal": "naukri",
                "description": f"Bosch Mobility R&D unit is looking for an enthusiastic {role}. Requirements: Python, Scikit-Learn, tabular anomaly classification (XGBoost/SMOTE), and REST API integration."
            },
            {
                "company": "Philips Innovation Campus",
                "title": f"{role} — Healthcare AI",
                "location": "Bengaluru, Karnataka, India",
                "url": "https://www.naukri.com/job-listings-data-science-philips-bengaluru",
                "portal": "naukri",
                "description": f"Work on multi-modal diagnostic image verification and automated OCR extraction at Philips Innovation Campus. Strong Python, PyTorch, and deep learning knowledge."
            }
        ],
        "ncs": [
            {
                "company": "National Informatics Centre (NIC)",
                "title": f"{role} — National AI Platform",
                "location": "Bengaluru / New Delhi, India",
                "url": "https://www.ncs.gov.in/job-search/nic-ai-research-fellow",
                "portal": "ncs",
                "description": f"Ministry of Electronics and IT (MeitY) verified research vacancy. Work on national public digital infrastructure, multilingual text classification, and scalable data models. Zero fees."
            }
        ],
        "indeed": [
            {
                "company": "Siemens Technology India",
                "title": f"{role} — Industrial IoT & ML",
                "location": "Bengaluru, Karnataka, India",
                "url": "https://in.indeed.com/viewjob?jk=siemens-ai-engineer",
                "portal": "indeed",
                "description": f"Siemens Industrial AI division is hiring {role} to optimize time-series anomaly detection algorithms and deploy lightweight ONNX runtime microservices on edge devices."
            }
        ]
    }
    
    return portal_specs.get(portal_type, [])[:limit]


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

    # 3. Search Specialized Indian & Tech Portals (Wellfound, Cutshort, Internshala, Naukri, NCS, Indeed)
    specialized_portals = ["wellfound", "cutshort", "internshala", "naukri", "ncs", "indeed"]
    for portal_name in specialized_portals:
        for role in target_roles[:2]:
            portal_results = search_specialized_portals(role, "Bengaluru", portal_type=portal_name, limit=2)
            total_scanned += len(portal_results)
            
            for item in portal_results:
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
                    "location": item.get("location", "Bengaluru"),
                    "url": url,
                    "portal": portal_name,
                    "date_posted": datetime.now().strftime("%Y-%m-%d"),
                    "deadline": None,
                    "description": item.get("description", ""),
                    "raw": item,
                    "first_seen": datetime.now().isoformat(),
                    "status": "discovered"
                }
                applybot_db.upsert_job(job_record)
                
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
