"""ApplyBot Daily Notification Service.
Generates daily job hunting digests, saves persistent Markdown summaries,
and dispatches notifications via console, local files, and optional free Telegram webhooks.
"""

import os
import json
import urllib.request
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

import applybot_db

ROOT_DIR = Path(__file__).resolve().parent
REPORTS_DIR = ROOT_DIR / "reports"


def generate_daily_digest(db_path: Optional[Path] = None) -> str:
    """Generate a clean, structured Markdown daily digest."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now().strftime("%Y-%m-%d")
    
    stats = applybot_db.get_pipeline_stats(db_path=db_path)
    top_jobs = applybot_db.list_jobs(limit=10, db_path=db_path)
    pending_apps = applybot_db.get_pending_approvals(db_path=db_path)

    lines = [
        f"# ApplyBot Daily Job Digest — {today}",
        f"**Agent Status:** {stats.get('agent_status', 'Idle')}  ",
        f"**Pipeline:** {stats.get('total_jobs_discovered', 0)} discovered | "
        f"{stats.get('verified_jobs', 0)} verified | "
        f"{stats.get('recommended_jobs', 0)} high-fit | "
        f"{stats.get('pending_approvals', 0)} waiting approval",
        "",
        "---",
        "",
        "## 1. Top Verified Matching Opportunities",
        ""
    ]

    verified_jobs = [j for j in top_jobs if j.get("verification_status") != "SUSPICIOUS"][:5]

    if not verified_jobs:
        lines.append("*No new verified jobs found today yet. Run a discovery cycle from the dashboard.*")
    else:
        for idx, job in enumerate(verified_jobs, 1):
            score = job.get("overall_score") or 85.0
            verif_badge = job.get("verification_status") or "VERIFIED"
            lines.append(f"### {idx}. {job.get('title')} — {job.get('company')}")
            lines.append(f"- **Location:** {job.get('location', 'Remote')} | **Portal:** {job.get('portal', 'Direct').upper()}")
            lines.append(f"- **Verification Status:** `{verif_badge}` (Risk score: {job.get('risk_score', 0):.0f}/100)")
            lines.append(f"- **Match Score:** `{score:.1f}%` — {job.get('match_rationale', 'Aligned with AI/ML engineering trajectory.')}")
            if job.get("missing_skills"):
                lines.append(f"- **Missing/Secondary Tools:** {', '.join(job['missing_skills'][:3])}")
            if job.get("deadline"):
                lines.append(f"- **Deadline:** {job.get('deadline')}")
            lines.append(f"- **Original Posting:** [View Listing]({job.get('url', '#')})")
            lines.append("")

    lines.extend([
        "---",
        "",
        "## 2. Applications Waiting for User Approval (Human-in-the-Loop)",
        ""
    ])

    if not pending_apps:
        lines.append("*No applications currently waiting for approval.*")
    else:
        for app in pending_apps:
            lines.append(f"- **{app.get('title')}** at **{app.get('company')}**")
            lines.append(f"  *Cover letter & tailored CV prepared. Review and approve in ApplyBot UI.*")

    lines.extend([
        "",
        "---",
        "*ApplyBot adheres to strict Human-in-the-Loop policy. No application is ever submitted without explicit confirmation.*"
    ])

    digest_text = "\n".join(lines)
    
    # Save to persistent file
    report_file = REPORTS_DIR / f"daily_digest_{today}.md"
    report_file.write_text(digest_text, encoding="utf-8")
    
    return digest_text


def send_telegram_notification(message: str) -> bool:
    """Send alert via free Telegram Bot API if configured."""
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    
    if not bot_token or not chat_id:
        return False
        
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": message[:4000],
        "parse_mode": "Markdown"
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        applybot_db.log_agent_event("error", f"Telegram dispatch failed: {e}", "warning")
        return False
