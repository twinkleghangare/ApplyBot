"""ApplyBot Free-First SQLite Database & State Engine.
Standard library sqlite3 with zero external dependencies, ACID transactions,
and two-way synchronization with job_search_tracker.csv.
"""

import sqlite3
import json
import csv
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = ROOT_DIR / "data" / "applybot.db"
DEFAULT_TRACKER_PATH = ROOT_DIR / "job_search_tracker.csv"


def get_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    path = db_path or DEFAULT_DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(db_path: Optional[Path] = None) -> None:
    """Initialize database tables and indexes."""
    conn = get_connection(db_path)
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS jobs (
            job_key TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT,
            url TEXT,
            portal TEXT,
            date_posted TEXT,
            deadline TEXT,
            description TEXT,
            raw_json TEXT,
            first_seen TEXT NOT NULL,
            status TEXT DEFAULT 'discovered'
        );

        CREATE TABLE IF NOT EXISTS verifications (
            job_key TEXT PRIMARY KEY,
            status TEXT NOT NULL, -- VERIFIED, NEEDS REVIEW, SUSPICIOUS, EXPIRED
            risk_score REAL DEFAULT 0.0,
            flags_json TEXT,
            evidence TEXT,
            verified_at TEXT NOT NULL,
            FOREIGN KEY (job_key) REFERENCES jobs(job_key) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS matches (
            job_key TEXT PRIMARY KEY,
            overall_score REAL NOT NULL,
            technical_score REAL,
            experience_score REAL,
            behavioral_score REAL,
            career_score REAL,
            location_verdict TEXT, -- PASS, FAIL, FLAG
            language_gate TEXT,    -- PASS, FAIL, FLAG
            matching_skills_json TEXT,
            missing_skills_json TEXT,
            experience_gaps_json TEXT,
            rationale TEXT,
            matched_at TEXT NOT NULL,
            FOREIGN KEY (job_key) REFERENCES jobs(job_key) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_key TEXT UNIQUE NOT NULL,
            approval_status TEXT DEFAULT 'pending_approval', -- pending_approval, approved, rejected, submitted
            cv_path TEXT,
            cover_letter TEXT,
            star_story TEXT,
            created_at TEXT NOT NULL,
            approved_at TEXT,
            submitted_at TEXT,
            submission_evidence TEXT,
            notes TEXT,
            FOREIGN KEY (job_key) REFERENCES jobs(job_key) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS agent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL, -- discovery, verification, matching, preparation, approval, submission, error
            status TEXT NOT NULL,     -- info, warning, error, success
            message TEXT NOT NULL,
            details_json TEXT,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
        CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
        CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(overall_score DESC);
        CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(approval_status);
        CREATE INDEX IF NOT EXISTS idx_agent_logs_created ON agent_logs(created_at DESC);
        """)
    conn.close()


# ============================================================================
# JOB REPOSITORY
# ============================================================================

def upsert_job(job: Dict[str, Any], db_path: Optional[Path] = None) -> str:
    """Insert or update a job record."""
    conn = get_connection(db_path)
    now = datetime.now().isoformat()
    raw = json.dumps(job.get("raw", {})) if isinstance(job.get("raw"), dict) else job.get("raw_json", "{}")
    
    with conn:
        conn.execute("""
        INSERT INTO jobs (job_key, title, company, location, url, portal, date_posted, deadline, description, raw_json, first_seen, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_key) DO UPDATE SET
            title = excluded.title,
            company = excluded.company,
            location = COALESCE(excluded.location, jobs.location),
            url = COALESCE(excluded.url, jobs.url),
            portal = COALESCE(excluded.portal, jobs.portal),
            date_posted = COALESCE(excluded.date_posted, jobs.date_posted),
            deadline = COALESCE(excluded.deadline, jobs.deadline),
            description = COALESCE(excluded.description, jobs.description),
            raw_json = COALESCE(excluded.raw_json, jobs.raw_json),
            status = COALESCE(jobs.status, excluded.status);
        """, (
            job["job_key"],
            job["title"],
            job["company"],
            job.get("location"),
            job.get("url"),
            job.get("portal", "direct"),
            job.get("date_posted"),
            job.get("deadline"),
            job.get("description", ""),
            raw,
            job.get("first_seen", now),
            job.get("status", "discovered")
        ))
    conn.close()
    return job["job_key"]


def get_job(job_key: str, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Retrieve full job details including verification, match, and application state."""
    conn = get_connection(db_path)
    row = conn.execute("""
    SELECT 
        j.*,
        v.status AS verification_status,
        v.risk_score,
        v.flags_json,
        v.evidence AS verification_evidence,
        m.overall_score,
        m.technical_score,
        m.experience_score,
        m.behavioral_score,
        m.career_score,
        m.location_verdict,
        m.language_gate,
        m.matching_skills_json,
        m.missing_skills_json,
        m.rationale AS match_rationale,
        a.approval_status,
        a.cv_path,
        a.cover_letter,
        a.star_story,
        a.submitted_at,
        a.submission_evidence
    FROM jobs j
    LEFT JOIN verifications v ON j.job_key = v.job_key
    LEFT JOIN matches m ON j.job_key = m.job_key
    LEFT JOIN applications a ON j.job_key = a.job_key
    WHERE j.job_key = ?;
    """, (job_key,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    if d.get("flags_json"):
        d["flags"] = json.loads(d["flags_json"])
    if d.get("matching_skills_json"):
        d["matching_skills"] = json.loads(d["matching_skills_json"])
    if d.get("missing_skills_json"):
        d["missing_skills"] = json.loads(d["missing_skills_json"])
    return d


def list_jobs(status: Optional[str] = None, verification_status: Optional[str] = None, 
              limit: int = 50, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """List jobs with optional filtering."""
    conn = get_connection(db_path)
    query = """
    SELECT 
        j.*,
        v.status AS verification_status,
        v.risk_score,
        v.flags_json,
        v.evidence AS verification_evidence,
        m.overall_score,
        m.technical_score,
        m.matching_skills_json,
        m.missing_skills_json,
        m.rationale AS match_rationale,
        a.approval_status,
        a.cv_path
    FROM jobs j
    LEFT JOIN verifications v ON j.job_key = v.job_key
    LEFT JOIN matches m ON j.job_key = m.job_key
    LEFT JOIN applications a ON j.job_key = a.job_key
    WHERE 1=1
    """
    params: List[Any] = []
    if status:
        query += " AND j.status = ?"
        params.append(status)
    if verification_status:
        query += " AND v.status = ?"
        params.append(verification_status)
    
    query += " ORDER BY COALESCE(m.overall_score, 0) DESC, j.first_seen DESC LIMIT ?"
    params.append(limit)

    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        if d.get("flags_json"):
            d["flags"] = json.loads(d["flags_json"])
        if d.get("matching_skills_json"):
            d["matching_skills"] = json.loads(d["matching_skills_json"])
        if d.get("missing_skills_json"):
            d["missing_skills"] = json.loads(d["missing_skills_json"])
        results.append(d)
    return results


# ============================================================================
# VERIFICATION REPOSITORY
# ============================================================================

def upsert_verification(verif: Dict[str, Any], db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    flags = json.dumps(verif.get("flags", [])) if isinstance(verif.get("flags"), list) else verif.get("flags_json", "[]")
    now = datetime.now().isoformat()
    with conn:
        conn.execute("""
        INSERT INTO verifications (job_key, status, risk_score, flags_json, evidence, verified_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_key) DO UPDATE SET
            status = excluded.status,
            risk_score = excluded.risk_score,
            flags_json = excluded.flags_json,
            evidence = excluded.evidence,
            verified_at = excluded.verified_at;
        """, (
            verif["job_key"],
            verif["status"],
            float(verif.get("risk_score", 0.0)),
            flags,
            verif.get("evidence", ""),
            verif.get("verified_at", now)
        ))
    conn.close()


# ============================================================================
# MATCHING REPOSITORY
# ============================================================================

def upsert_match(match_data: Dict[str, Any], db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    matching = json.dumps(match_data.get("matching_skills", []))
    missing = json.dumps(match_data.get("missing_skills", []))
    gaps = json.dumps(match_data.get("experience_gaps", []))
    now = datetime.now().isoformat()

    with conn:
        conn.execute("""
        INSERT INTO matches (
            job_key, overall_score, technical_score, experience_score,
            behavioral_score, career_score, location_verdict, language_gate,
            matching_skills_json, missing_skills_json, experience_gaps_json,
            rationale, matched_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_key) DO UPDATE SET
            overall_score = excluded.overall_score,
            technical_score = excluded.technical_score,
            experience_score = excluded.experience_score,
            behavioral_score = excluded.behavioral_score,
            career_score = excluded.career_score,
            location_verdict = excluded.location_verdict,
            language_gate = excluded.language_gate,
            matching_skills_json = excluded.matching_skills_json,
            missing_skills_json = excluded.missing_skills_json,
            experience_gaps_json = excluded.experience_gaps_json,
            rationale = excluded.rationale,
            matched_at = excluded.matched_at;
        """, (
            match_data["job_key"],
            float(match_data["overall_score"]),
            float(match_data.get("technical_score", 0.0)),
            float(match_data.get("experience_score", 0.0)),
            float(match_data.get("behavioral_score", 0.0)),
            float(match_data.get("career_score", 0.0)),
            match_data.get("location_verdict", "PASS"),
            match_data.get("language_gate", "PASS"),
            matching,
            missing,
            gaps,
            match_data.get("rationale", ""),
            match_data.get("matched_at", now)
        ))
    conn.close()


# ============================================================================
# HUMAN-IN-THE-LOOP APPLICATION WORKFLOW REPOSITORY
# ============================================================================

def create_or_update_application(app_data: Dict[str, Any], db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    now = datetime.now().isoformat()
    with conn:
        conn.execute("""
        INSERT INTO applications (job_key, approval_status, cv_path, cover_letter, star_story, created_at, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_key) DO UPDATE SET
            approval_status = COALESCE(excluded.approval_status, applications.approval_status),
            cv_path = COALESCE(excluded.cv_path, applications.cv_path),
            cover_letter = COALESCE(excluded.cover_letter, applications.cover_letter),
            star_story = COALESCE(excluded.star_story, applications.star_story),
            notes = COALESCE(excluded.notes, applications.notes);
        """, (
            app_data["job_key"],
            app_data.get("approval_status", "pending_approval"),
            app_data.get("cv_path"),
            app_data.get("cover_letter"),
            app_data.get("star_story"),
            app_data.get("created_at", now),
            app_data.get("notes")
        ))
    conn.close()


def approve_application(job_key: str, notes: Optional[str] = None, db_path: Optional[Path] = None) -> bool:
    """Explicit user authorization for a specific job."""
    conn = get_connection(db_path)
    now = datetime.now().isoformat()
    with conn:
        cur = conn.execute("""
        UPDATE applications 
        SET approval_status = 'approved', approved_at = ?, notes = COALESCE(?, notes)
        WHERE job_key = ?;
        """, (now, notes, job_key))
        updated = cur.rowcount > 0
    conn.close()
    if updated:
        log_agent_event("approval", f"User explicitly approved application for {job_key}", "success", db_path=db_path)
    return updated


def reject_application(job_key: str, reason: Optional[str] = None, db_path: Optional[Path] = None) -> bool:
    """User rejection of an application."""
    conn = get_connection(db_path)
    with conn:
        cur = conn.execute("""
        UPDATE applications 
        SET approval_status = 'rejected', notes = COALESCE(?, notes)
        WHERE job_key = ?;
        """, (reason, job_key))
        updated = cur.rowcount > 0
    conn.close()
    if updated:
        log_agent_event("approval", f"User rejected application for {job_key}: {reason}", "info", db_path=db_path)
    return updated


def mark_submitted(job_key: str, evidence: str, db_path: Optional[Path] = None) -> bool:
    """Record verified submission after approval."""
    conn = get_connection(db_path)
    now = datetime.now().isoformat()
    with conn:
        cur = conn.execute("""
        UPDATE applications 
        SET approval_status = 'submitted', submitted_at = ?, submission_evidence = ?
        WHERE job_key = ? AND approval_status = 'approved';
        """, (now, evidence, job_key))
        updated = cur.rowcount > 0
        if updated:
            conn.execute("UPDATE jobs SET status = 'applied' WHERE job_key = ?;", (job_key,))
    conn.close()
    if updated:
        log_agent_event("submission", f"Application submitted with evidence for {job_key}", "success", db_path=db_path)
        sync_job_to_tracker(job_key, db_path=db_path)
    return updated


def get_pending_approvals(db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """List applications waiting for user review and approval."""
    conn = get_connection(db_path)
    rows = conn.execute("""
    SELECT 
        j.job_key, j.title, j.company, j.location, j.url, j.portal, j.deadline,
        v.status AS verification_status, v.risk_score, v.evidence AS verification_evidence,
        m.overall_score, m.matching_skills_json, m.missing_skills_json, m.rationale,
        a.id AS application_id, a.approval_status, a.cv_path, a.cover_letter, a.star_story, a.created_at
    FROM applications a
    JOIN jobs j ON a.job_key = j.job_key
    LEFT JOIN verifications v ON j.job_key = v.job_key
    LEFT JOIN matches m ON j.job_key = m.job_key
    WHERE a.approval_status = 'pending_approval'
    ORDER BY m.overall_score DESC;
    """).fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        if d.get("matching_skills_json"):
            d["matching_skills"] = json.loads(d["matching_skills_json"])
        if d.get("missing_skills_json"):
            d["missing_skills"] = json.loads(d["missing_skills_json"])
        results.append(d)
    return results


# ============================================================================
# AGENT LOGGING & METRICS
# ============================================================================

def log_agent_event(event_type: str, message: str, status: str = "info", 
                    details: Optional[Dict[str, Any]] = None, db_path: Optional[Path] = None) -> None:
    conn = get_connection(db_path)
    details_str = json.dumps(details or {})
    now = datetime.now().isoformat()
    with conn:
        conn.execute("""
        INSERT INTO agent_logs (event_type, status, message, details_json, created_at)
        VALUES (?, ?, ?, ?, ?);
        """, (event_type, status, message, details_str, now))
    conn.close()


def get_agent_logs(limit: int = 50, db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    conn = get_connection(db_path)
    rows = conn.execute("""
    SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT ?;
    """, (limit,)).fetchall()
    conn.close()
    res = []
    for r in rows:
        d = dict(r)
        if d.get("details_json"):
            try:
                d["details"] = json.loads(d["details_json"])
            except Exception:
                d["details"] = {}
        res.append(d)
    return res


def get_pipeline_stats(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Return aggregated real metrics for the dashboard."""
    conn = get_connection(db_path)
    total_jobs = conn.execute("SELECT COUNT(*) FROM jobs;").fetchone()[0]
    verified_jobs = conn.execute("SELECT COUNT(*) FROM verifications WHERE status = 'VERIFIED';").fetchone()[0]
    suspicious_jobs = conn.execute("SELECT COUNT(*) FROM verifications WHERE status = 'SUSPICIOUS';").fetchone()[0]
    recommended_jobs = conn.execute("SELECT COUNT(*) FROM matches WHERE overall_score >= 75.0;").fetchone()[0]
    pending_approvals = conn.execute("SELECT COUNT(*) FROM applications WHERE approval_status = 'pending_approval';").fetchone()[0]
    submitted_apps = conn.execute("SELECT COUNT(*) FROM applications WHERE approval_status = 'submitted';").fetchone()[0]
    
    # Active agent status heuristic
    latest_log = conn.execute("SELECT status, event_type, created_at FROM agent_logs ORDER BY id DESC LIMIT 1;").fetchone()
    agent_status = "Idle"
    if pending_approvals > 0:
        agent_status = "Waiting for Approval"
    elif latest_log and (datetime.now() - datetime.fromisoformat(latest_log["created_at"])).total_seconds() < 120:
        if latest_log["status"] == "error":
            agent_status = "Error"
        else:
            agent_status = "Running"
    else:
        agent_status = "Idle"

    conn.close()
    return {
        "total_jobs_discovered": total_jobs,
        "verified_jobs": verified_jobs,
        "suspicious_jobs": suspicious_jobs,
        "recommended_jobs": recommended_jobs,
        "pending_approvals": pending_approvals,
        "applications_submitted": submitted_apps,
        "agent_status": agent_status
    }


# ============================================================================
# TWO-WAY CSV SYNC (Backward Compatibility)
# ============================================================================

def sync_job_to_tracker(job_key: str, tracker_path: Optional[Path] = None, db_path: Optional[Path] = None) -> None:
    job = get_job(job_key, db_path=db_path)
    if not job:
        return
    path = tracker_path or DEFAULT_TRACKER_PATH
    fieldnames = ["Date", "Company", "Role", "Location", "Status", "URL", "Notes"]
    
    file_exists = path.exists() and path.stat().st_size > 0
    today = datetime.now().strftime("%Y-%m-%d")
    
    with open(path, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            "Date": today,
            "Company": job.get("company", ""),
            "Role": job.get("title", ""),
            "Location": job.get("location", "Remote"),
            "Status": "Applied",
            "URL": job.get("url", ""),
            "Notes": f"Verified Submission: {job.get('submission_evidence', 'Logged via ApplyBot')}"
        })


# Initialize automatically on module load
init_db()
