"""
ApplyBot - Real-World User Journey Automated End-to-End Test Suite
Simulates an authentic job seeker navigating the complete application workflow:
1. Candidate Registration / Login
2. Multi-Portal Genuine Job Search
3. JD Matcher Dynamic Alignment
4. Anti-AI Humanizer (Bypassing Recruiter AI Filters)
5. STAR Zero-Hallucination Form Question Solver
6. Semantic Skill Gap Audit
7. ATS LaTeX moderncv PDF Generation & Verification
8. 1-Click Direct Apply & Application Tracker Logging
9. Profile Preset Switcher
"""

import sys
import json
import urllib.request
import urllib.error
import os
import socket
import subprocess
import tempfile
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"
ROOT_DIR = Path(__file__).resolve().parents[1]

def api_call(endpoint: str, method: str = "GET", payload: dict = None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"} if payload else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=35) as resp:
            content_type = resp.headers.get("Content-Type", "")
            raw = resp.read()
            if "application/json" in content_type:
                return resp.status, json.loads(raw.decode("utf-8"))
            return resp.status, raw
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return e.code, {"error": err_body}
    except Exception as e:
        return 500, {"error": str(e)}

def run_real_world_tests():
    global BASE_URL
    with tempfile.TemporaryDirectory(prefix="jobready-journey-") as data_dir:
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            port = sock.getsockname()[1]
        BASE_URL = f"http://127.0.0.1:{port}"
        env = os.environ.copy()
        env["TRACKER_CSV"] = str(Path(data_dir) / "job_search_tracker.csv")
        env["PROFILE_JSON"] = str(Path(data_dir) / "candidate_profile.json")
        server_process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "server:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(port),
            ],
            cwd=ROOT_DIR,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        try:
            for _ in range(75):
                if server_process.poll() is not None:
                    print("  [FAIL] Isolated test server exited before becoming ready.")
                    return False
                status, _ = api_call("/api/profile")
                if status == 200:
                    break
                time.sleep(0.2)
            else:
                print("  [FAIL] Isolated test server did not become ready.")
                return False
            return _run_real_world_tests()
        finally:
            server_process.terminate()
            try:
                server_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server_process.kill()
                server_process.wait()


def _run_real_world_tests():
    print("=" * 70)
    print("   APPLYBOT — REAL-WORLD USER JOURNEY VERIFICATION SUITE")
    print("=" * 70)
    passed_steps = 0
    total_steps = 9

    # -------------------------------------------------------------
    # Step 1: Candidate Registration / Login with Custom Credentials
    # -------------------------------------------------------------
    print("\n[Step 1] Real-World Candidate Registration / Custom Login...")
    candidate_data = {
        "custom_name": "Rohit Verma",
        "email": "rohit.verma@example.com",
        "profile_id": "guest"
    }
    status, res = api_call("/api/auth/login", method="POST", payload=candidate_data)
    if status == 200 and res.get("profile", {}).get("name") == "Rohit Verma":
        print(f"  [PASS] Candidate registered successfully: {res['profile']['name']} ({res['profile']['email']})")
        passed_steps += 1
    else:
        print(f"  [FAIL] Login returned status {status}: {res}")

    # Add custom candidate skills and experience
    profile_update = {
        "name": "Rohit Verma",
        "email": "rohit.verma@example.com",
        "phone": "+91 9876543210",
        "location": "Bengaluru, Karnataka, India",
        "degree": "BTech in Computer Science & Engineering",
        "institution": "VTU Bengaluru (CGPA: 8.4)",
        "skills": ["Python", "SQL", "Machine Learning", "PyTorch", "FastAPI", "NLP", "Docker"],
        "projects": [
            "FraudLens - AI Transaction Fraud Detection Pipeline",
            "DocuChat - Real-time RAG Engine with PyTorch & FastAPI"
        ]
    }
    status, res = api_call("/api/profile", method="POST", payload=profile_update)
    assert status == 200, "Failed to persist profile"
    print("  [INFO] Candidate profile populated with 7 technical skills & 2 real-world projects.")

    # -------------------------------------------------------------
    # Step 2: Multi-Portal Genuine Job Search
    # -------------------------------------------------------------
    print("\n[Step 2] Live Multi-Portal Job Search (LinkedIn, Indeed, Naukri, Wellfound, Internshala, Freehire)...")
    search_payload = {
        "role": "Data Science Intern",
        "location": "Bengaluru, Karnataka, India",
        "portal": "all",
        "limit": 10
    }
    status, res = api_call("/api/search-jobs", method="POST", payload=search_payload)
    if status == 200 and res.get("count", 0) > 0:
        jobs = res.get("jobs", [])
        portals_found = list(set(j.get("portal") for j in jobs))
        print(f"  [PASS] Found {res.get('count')} genuine vacancies across {len(portals_found)} portals: {portals_found}")
        top_job = jobs[0]
        print(f"  [SAMPLE] {top_job['title']} at {top_job['company']} ({top_job['portal']}) - Fit: {top_job['fit_score']}%")
        passed_steps += 1
    else:
        print(f"  [FAIL] Job search returned status {status}: {res}")

    # -------------------------------------------------------------
    # Step 3: Real-World JD Matcher Filtering
    # -------------------------------------------------------------
    print("\n[Step 3] Target Job Description (JD Matcher) Semantic Filtering...")
    real_jd = """
    We are looking for a Data Science / Machine Learning Intern proficient in Python, SQL,
    PyTorch, Natural Language Processing (NLP), and building APIs with FastAPI.
    Candidate must be comfortable with Docker containerization and exploratory data analysis.
    """
    jd_search_payload = {
        "role": "Data Science Intern",
        "location": "Bengaluru, Karnataka, India",
        "portal": "all",
        "job_description": real_jd,
        "min_match_percentage": 50
    }
    status, res = api_call("/api/search-jobs", method="POST", payload=jd_search_payload)
    if status == 200 and res.get("count", 0) > 0:
        top_matches = res.get("jobs", [])
        print(f"  [PASS] JD Matcher filtered down to {len(top_matches)} vacancies meeting >= 50% JD alignment.")
        for idx, j in enumerate(top_matches[:3], 1):
            print(f"    {idx}. [{j['portal']}] {j['title']} @ {j['company']} | JD Alignment: {j['jd_match_score']}% | Resume Fit: {j['fit_score']}%")
            if j.get("matched_jd_skills"):
                print(f"       -> Matching JD Skills: {', '.join(j['matched_jd_skills'])}")
        passed_steps += 1
    else:
        print(f"  [FAIL] JD search failed with status {status}: {res}")

    # -------------------------------------------------------------
    # Step 4: Anti-AI Humanizer (Bypassing Recruiter AI Filters)
    # -------------------------------------------------------------
    print("\n[Step 4] Anti-AI Humanizer (Detecting & Stripping ChatGPT Clichés)...")
    ai_cliche_text = (
        "Spearheaded and orchestrated meticulous machine learning pipelines, leveraging state-of-the-art "
        "methodologies to champion mission-critical paradigms."
    )
    status, res = api_call("/api/anti-ai-humanize", method="POST", payload={"text": ai_cliche_text})
    if status == 200 and res.get("buzzwords_detected", 0) > 0:
        print(f"  [PASS] AI Fingerprints Detected: {res.get('buzzwords_detected')} clichés ({', '.join(res.get('buzzwords_list', []))})")
        print(f"  [HUMAN REFINEMENT] Status: '{res.get('tone_status')}'")
        print(f"  [ORIGINAL] {res.get('original_text')[:65]}...")
        print(f"  [HUMANIZED] {res.get('humanized_text')[:65]}...")
        passed_steps += 1
    else:
        print(f"  [FAIL] Humanizer failed with status {status}: {res}")

    # -------------------------------------------------------------
    # Step 5: STAR Zero-Hallucination Form Question Solver
    # -------------------------------------------------------------
    print("\n[Step 5] STAR Behavioral Question Engine (Zero-Hallucination)...")
    portal_question = "Tell me about a challenging technical bug you encountered in a machine learning model and how you resolved it?"
    status, res = api_call("/api/star-solver", method="POST", payload={"question": portal_question, "company": "Fractal Analytics"})
    story = res.get("story", {})
    if status == 200 and "FraudLens" in story.get("project", ""):
        print(f"  [PASS] Zero-Hallucination answer anchored to real project: {story.get('project')}")
        print(f"  [TITLE] {story.get('title')}")
        print(f"  [SITUATION] {story.get('situation')[:75]}...")
        print(f"  [ACTION] {story.get('action')[:75]}...")
        print(f"  [RESULT] {story.get('result')[:75]}...")
        passed_steps += 1
    else:
        print(f"  [FAIL] STAR solver returned status {status}: {res}")

    # -------------------------------------------------------------
    # Step 6: Semantic Skill Gap Audit
    # -------------------------------------------------------------
    print("\n[Step 6] Semantic Skill Gap Audit (Preventing Blind Mass Applying)...")
    gap_payload = {
        "role": "Senior Computer Vision Engineer",
        "job_description": "10+ years experience, CUDA, SLAM, C++, TensorRT, Autonomous Driving Systems"
    }
    status, res = api_call("/api/semantic-gap", method="POST", payload=gap_payload)
    if status == 200 and res.get("tier") in ["Stretch Role (Moderate Relevance)", "Low Relevance (Avoid Blind Apply)"]:
        print(f"  [PASS] Honest Gap Assessment: Tier = '{res.get('tier')}' (Fit: {res.get('fit_percentage')}%)")
        print(f"  [MISSING PREREQUISITES] {res.get('skill_gaps')}")
        print(f"  [RECOMMENDATION] {res.get('recommendation')}")
        passed_steps += 1
    else:
        print(f"  [FAIL] Gap audit returned status {status}: {res}")

    # -------------------------------------------------------------
    # Step 7: ATS LaTeX moderncv PDF Generation & Download
    # -------------------------------------------------------------
    print("\n[Step 7] 1-Click Tailored ATS moderncv LaTeX Compilation & PDF Verification...")
    tailor_payload = {
        "company": "Fractal Analytics",
        "role": "Data Science Intern",
        "location": "Bengaluru, Karnataka, India",
        "keywords": ["Python", "PyTorch", "SQL", "FastAPI", "NLP"]
    }
    status, res = api_call("/api/tailor-job-pdf", method="POST", payload=tailor_payload)
    if status == 200 and res.get("status") in ["success", "tailored", "master_only", "ready"]:
        cv_file = res.get("cv_file")
        if cv_file:
            print(f"  [PASS] CV file available: {cv_file} ({res.get('status')})")
            dl_status, dl_bytes = api_call(f"/api/download/{cv_file}")
            if dl_status == 200 and isinstance(dl_bytes, bytes) and dl_bytes.startswith(b"%PDF-"):
                print(f"  [PASS] PDF downloaded successfully: {len(dl_bytes):,} bytes, valid %PDF- header.")
                passed_steps += 1
            else:
                print(f"  [FAIL] PDF download failed: status={dl_status}")
        elif res.get("status") == "master_only":
            print("  [PASS] No tailored CV exists; server correctly returned master_only without a file path.")
            passed_steps += 1
        else:
            print(f"  [FAIL] CV response omitted a file for status {res.get('status')}.")
    else:
        print(f"  [FAIL] LaTeX tailoring returned status {status}: {res}")

    # -------------------------------------------------------------
    # Step 8: 1-Click Direct Apply & Tracker Logging
    # -------------------------------------------------------------
    print("\n[Step 8] 1-Click Direct Apply & Job Application Tracker Verification...")
    apply_payload = {
        "company": "Fractal Analytics",
        "role": "Data Science Intern",
        "location": "Bengaluru, Karnataka, India",
        "url": "https://www.naukri.com/job-listings-fractal-analytics"
    }
    status, res = api_call("/api/track-apply", method="POST", payload=apply_payload)
    assert status == 200, "Track apply failed"
    
    # Check tracker records
    t_status, t_res = api_call("/api/tracker")
    tracker_records = t_res.get("records", [])
    fractal_entries = [r for r in tracker_records if r.get("Company") == "Fractal Analytics"]
    if t_status == 200 and len(fractal_entries) > 0:
        latest = fractal_entries[-1]
        print(f"  [PASS] Application successfully tracked: {latest.get('Company')} - {latest.get('Role')} [{latest.get('Status')}]")
        passed_steps += 1
    else:
        print(f"  [FAIL] Tracker verification failed: status={t_status}, records={len(tracker_records)}")

    # -------------------------------------------------------------
    # Step 9: Multi-Profile Switcher Verification
    # -------------------------------------------------------------
    print("\n[Step 9] Preset Profile Switching (Switching to default Candidate profile)...")
    switch_payload = {"profile_id": "candidate"}
    status, res = api_call("/api/auth/login", method="POST", payload=switch_payload)
    if status == 200 and res.get("profile", {}).get("id") == "candidate":
        p = res["profile"]
        print(f"  [PASS] Workspace switched to: {p['name']} ({p['degree']})")
        print(f"  [PROJECTS] {', '.join(p.get('projects', []))}")
        passed_steps += 1
    else:
        print(f"  [FAIL] Preset switcher failed: {res}")

    # -------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------
    print("\n" + "=" * 70)
    print(f"   TEST SUITE EXECUTION SUMMARY: {passed_steps}/{total_steps} STEPS PASSED")
    print("=" * 70)
    return passed_steps == total_steps

if __name__ == "__main__":
    success = run_real_world_tests()
    sys.exit(0 if success else 1)
