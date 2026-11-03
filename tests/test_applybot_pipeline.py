"""
Unit test suite for ApplyBot Personal AI Career Agent pipeline modules:
- applybot_db: relational database operations and state transitions
- authenticity_engine: posting guard & scam detection
- matching_engine: explainable 4-factor scoring
- application_preparer: tailored CV, cover letter & STAR talking points
- notifier: daily markdown digest generation
"""

import os
import tempfile
from pathlib import Path
import pytest
import applybot_db
from authenticity_engine import verify_job
from matching_engine import score_job
from application_preparer import prepare_application_package
from notifier import generate_daily_digest


@pytest.fixture
def temp_db(monkeypatch):
    temp_dir = tempfile.mkdtemp()
    db_path = Path(temp_dir) / "test_applybot.db"
    tracker_path = Path(temp_dir) / "test_tracker.csv"
    monkeypatch.setattr(applybot_db, "DEFAULT_DB_PATH", db_path)
    monkeypatch.setattr(applybot_db, "DEFAULT_TRACKER_PATH", tracker_path)
    applybot_db.init_db(db_path)
    yield db_path


def test_db_upsert_and_state_transitions(temp_db):
    job_key = "google_ai-intern"
    applybot_db.upsert_job({
        "job_key": job_key,
        "title": "AI Research Intern",
        "company": "Google",
        "location": "Bengaluru, Karnataka, India",
        "url": "https://careers.google.com/jobs/123",
        "portal": "google",
        "date_posted": "2026-11-01",
        "description": "Looking for an intern skilled in Python and PyTorch.",
        "raw_json": "{}"
    }, db_path=temp_db)

    # Upsert verification
    applybot_db.upsert_verification({
        "job_key": job_key,
        "status": "VERIFIED",
        "risk_score": 0.0,
        "flags": [],
        "evidence": "Clean corporate ATS"
    }, db_path=temp_db)

    # Upsert match
    applybot_db.upsert_match({
        "job_key": job_key,
        "overall_score": 94.5,
        "technical_score": 95.0,
        "matching_skills": ["Python", "PyTorch"],
        "missing_skills": [],
        "rationale": "Strong match with AI trajectory"
    }, db_path=temp_db)

    # State transitions: discovered -> pending_approval -> approved -> submitted
    applybot_db.create_or_update_application({
        "job_key": job_key,
        "approval_status": "pending_approval",
        "cv_path": "/tailored/cv_test.pdf",
        "cover_letter": "Cover letter text"
    }, db_path=temp_db)
    pending = applybot_db.get_pending_approvals(db_path=temp_db)
    assert len(pending) == 1
    assert pending[0]["job_key"] == job_key

    # Approve
    applybot_db.approve_application(job_key=job_key, db_path=temp_db)
    stats = applybot_db.get_pipeline_stats(db_path=temp_db)
    assert stats["pending_approvals"] == 0

    # Submit
    applybot_db.mark_submitted(job_key=job_key, evidence="Manual submission via portal with confirmation #ABC1234", db_path=temp_db)
    stats = applybot_db.get_pipeline_stats(db_path=temp_db)
    assert stats["applications_submitted"] == 1


def test_authenticity_engine_legitimate():
    res = verify_job({
        "title": "AI Engineer",
        "company": "Stripe",
        "description": "We are hiring a Machine Learning Engineer to build models in Python. Work on-site in Bengaluru or remote.",
        "url": "https://stripe.lever.co/jobs/12345"
    })
    assert res["status"] == "VERIFIED"
    assert res["risk_score"] == 0.0


def test_authenticity_engine_scam():
    scam_desc = "Earn $500/day! Pay a registration fee of $50 via Telegram @scam_agent to start training."
    res = verify_job({
        "title": "Data Entry Intern",
        "company": "QuickMoney Ltd",
        "description": scam_desc,
        "url": "http://bit.ly/fakejob"
    })
    assert res["status"] in ["SUSPICIOUS", "NEEDS REVIEW"]
    assert res["risk_score"] > 20


def test_matching_engine_evaluation():
    job_desc = "Seeking an AI/ML intern with experience in Python, PyTorch, Pandas, and Data Analysis for building anomaly detection models."
    match_res = score_job({
        "title": "AI/ML Intern",
        "company": "TechCorp",
        "description": job_desc,
        "location": "Bengaluru, India"
    })
    assert match_res["overall_score"] >= 80
    assert "Python" in match_res["matching_skills"]
    assert match_res["location_verdict"] == "PASS"


def test_application_preparer_zero_hallucination():
    job_key = "sprinto_ai-implementation-intern"
    pkg = prepare_application_package(job_key)
    assert "Sprinto" in pkg["company"]
    assert "NeuralMatch" in pkg["cover_letter"] or "Tech Innovations Lab" in pkg["cover_letter"]
    assert "factual_grounding" in pkg
    assert "star_story" in pkg


def test_notifier_digest():
    digest_text = generate_daily_digest()
    assert "ApplyBot Daily Job Digest" in digest_text
    assert "Top Verified Matching Opportunities" in digest_text

