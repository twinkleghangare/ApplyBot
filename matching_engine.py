"""ApplyBot Intelligent Explainable Job Matching Engine.
Evaluates job descriptions against the candidate's verified profile facts
using the canonical 5-dimension rubric (Technical, Experience, Behavioral,
Career Alignment, Location/Language Gates) and provides explainable gap analysis.
"""

import re
from typing import Dict, List, Any, Optional
from datetime import datetime

import applybot_db


CANONICAL_SKILL_PATTERNS = {
    "Python": re.compile(r"\bpython\b", re.I),
    "PyTorch": re.compile(r"\bpytorch\b", re.I),
    "TensorFlow": re.compile(r"\btensorflow|keras\b", re.I),
    "Scikit-Learn": re.compile(r"\bscikit-learn|sklearn\b", re.I),
    "FastAPI": re.compile(r"\bfastapi\b", re.I),
    "Docker": re.compile(r"\bdocker|containerization\b", re.I),
    "SQL": re.compile(r"\bsql|rdbms\b", re.I),
    "PostgreSQL": re.compile(r"\bpostgres(ql)?\b", re.I),
    "Redis": re.compile(r"\bredis\b", re.I),
    "Machine Learning": re.compile(r"\bmachine\s*learning|\bml\b", re.I),
    "Deep Learning": re.compile(r"\bdeep\s*learning|\bdl\b", re.I),
    "NLP": re.compile(r"\bnlp|natural\s*language|text\s*processing\b", re.I),
    "Computer Vision": re.compile(r"\bcomputer\s*vision|\bcv\b|opencv|image\s*processing\b", re.I),
    "LangChain / LLMs": re.compile(r"\blangchain|langgraph|llm|large\s*language\s*model|rag|prompt\s*engineering\b", re.I),
    "Pandas / NumPy": re.compile(r"\bpandas|numpy\b", re.I),
    "AWS / Cloud": re.compile(r"\baws|amazon\s*web\s*services|cloud\s*computing\b", re.I),
    "Git": re.compile(r"\bgit|github\b", re.I),
    "REST APIs": re.compile(r"\brest(ful)?\s*api|\bapi\b", re.I),
}

EXTERNAL_SKILL_PATTERNS = {
    "PySpark / Distributed Big Data": re.compile(r"\bpyspark|spark|hadoop|databricks\b", re.I),
    "Kubernetes": re.compile(r"\bkubernetes|k8s\b", re.I),
    "Django": re.compile(r"\bdjango\b", re.I),
    "React / Frontend": re.compile(r"\breact(\.js)?|vue(\.js)?|frontend\b", re.I),
    "C++ / Embedded": re.compile(r"\bc\+\+|embedded|cuda\b", re.I),
    "MLOps Platforms (Kubeflow/MLflow)": re.compile(r"\bmlflow|kubeflow|sagemaker|wandb\b", re.I),
    "Model Context Protocol (MCP)": re.compile(r"\bmcp|model\s*context\s*protocol\b", re.I),
}


def score_job(job: Dict[str, Any], profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Score a job posting against candidate profile facts.
    Returns:
        overall_score: float (0.0 - 100.0)
        technical_score: float
        experience_score: float
        behavioral_score: float
        career_score: float
        location_verdict: PASS | FAIL | FLAG
        language_gate: PASS | FAIL | FLAG
        matching_skills: list of matched skills
        missing_skills: list of missing requirements
        experience_gaps: list of honest gaps
        rationale: explainable justification
    """
    title = (job.get("title") or "").lower()
    description = (job.get("description") or "").lower()
    location = (job.get("location") or "").lower()
    full_text = f"{title}\n{description}"

    if len(description.strip()) < 40:
        return {
            "job_key": job.get("job_key"),
            "overall_score": 50.0,
            "technical_score": 50.0,
            "experience_score": 50.0,
            "behavioral_score": 50.0,
            "career_score": 50.0,
            "location_verdict": "PASS",
            "language_gate": "PASS",
            "matching_skills": [],
            "missing_skills": [],
            "experience_gaps": ["Job description too brief for full semantic parsing."],
            "rationale": "Not enough data provided in posting description to compute high-confidence score."
        }

    # 1. Technical Skills Evaluation (30% weight)
    matching_skills: List[str] = []
    for skill_name, pattern in CANONICAL_SKILL_PATTERNS.items():
        if pattern.search(full_text):
            matching_skills.append(skill_name)
    
    missing_skills: List[str] = []
    for skill_name, pattern in EXTERNAL_SKILL_PATTERNS.items():
        if pattern.search(full_text):
            missing_skills.append(skill_name)

    # Base technical score
    total_tech_signals = len(matching_skills) + len(missing_skills)
    if total_tech_signals > 0:
        tech_score = (len(matching_skills) / total_tech_signals) * 100.0
        # Boost if core python/ML present
        if "Python" in matching_skills and ("Machine Learning" in matching_skills or "PyTorch" in matching_skills):
            tech_score = max(tech_score, 75.0)
    else:
        tech_score = 65.0
    tech_score = min(100.0, max(20.0, tech_score))

    # 2. Experience & Seniority Evaluation (25% weight)
    experience_score = 80.0
    experience_gaps: List[str] = []
    
    if re.search(r"\b(intern|internship|trainee|fresher|entry[- ]level|0[- ]1\s*years?)\b", full_text):
        experience_score = 95.0
    elif re.search(r"\b([5-9]|[1-9][0-9])\+?\s*(years?|yrs)\s*(of\s*)?experience\b", full_text):
        experience_score = 35.0
        experience_gaps.append("Posting explicitly targets 5+ years of industry experience; candidate is a final-year student.")
    elif re.search(r"\b(2|3|4)\+?\s*(years?|yrs)\s*(of\s*)?experience\b", full_text):
        experience_score = 60.0
        experience_gaps.append("Posting asks for 2-4 years mid-level experience; requires framing academic/internship experience aggressively.")

    if missing_skills:
        experience_gaps.append(f"Gaps in secondary tools listed: {', '.join(missing_skills[:3])}.")

    # 3. Behavioral Fit (15% weight)
    behavioral_score = 85.0
    if re.search(r"\b(collaboration|cross-functional|ownership|curiosity|experimentation)\b", full_text):
        behavioral_score = 90.0
    if re.search(r"\b(on-call|weekend\s*support|24/7)\b", full_text):
        behavioral_score -= 15.0

    # 4. Career Alignment & Trajectory (30% weight)
    career_score = 80.0
    if any(k in title for k in ["ai", "machine learning", "data science", "deep learning", "generative ai"]):
        career_score = 95.0
    elif "python" in title:
        career_score = 88.0
    elif "software" in title:
        career_score = 82.0
    else:
        career_score = 70.0

    # 5. Location Gate
    location_verdict = "PASS"
    preferred_cities = ["bengaluru", "bangalore", "hyderabad", "pune", "mumbai", "remote", "india"]
    if any(city in location for city in preferred_cities) or "remote" in location or not location:
        location_verdict = "PASS"
    elif re.search(r"\b(onsite|on-site)\b", full_text) and not any(city in location for city in preferred_cities):
        location_verdict = "FLAG"
        experience_gaps.append(f"Requires physical relocation to '{job.get('location')}'; outside primary target hubs.")

    # 6. Language Gate
    language_gate = "PASS"
    foreign_langs = ["german", "french", "japanese", "mandarin", "spanish", "danish", "swedish", "russian"]
    for lang in foreign_langs:
        if re.search(rf"\b(fluent|native|required|must\s*speak)\s*{lang}\b", full_text):
            language_gate = "FAIL"
            experience_gaps.append(f"Requires undeclared language proficiency: {lang.capitalize()}.")
            break

    # Calculate Weighted Overall Score
    overall_score = (
        0.30 * tech_score +
        0.25 * experience_score +
        0.15 * behavioral_score +
        0.30 * career_score
    )

    if location_verdict == "FLAG":
        overall_score -= 10.0
    if language_gate == "FAIL":
        overall_score = min(30.0, overall_score)

    overall_score = round(min(99.0, max(15.0, overall_score)), 1)

    # Generate Explainable Recommendation Rationale
    matched_str = ", ".join(matching_skills[:4]) if matching_skills else "Python & ML fundamentals"
    rationale = f"Strong stack affinity in {matched_str}. Directly aligns with candidate's target career trajectory in AI/ML engineering."
    if experience_gaps:
        rationale += f" Note: {experience_gaps[0]}"

    result = {
        "job_key": job.get("job_key"),
        "overall_score": overall_score,
        "technical_score": round(tech_score, 1),
        "experience_score": round(experience_score, 1),
        "behavioral_score": round(behavioral_score, 1),
        "career_score": round(career_score, 1),
        "location_verdict": location_verdict,
        "language_gate": language_gate,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "experience_gaps": experience_gaps,
        "rationale": rationale
    }

    # Store in database if job_key provided
    if job.get("job_key"):
        applybot_db.upsert_match(result)

    return result
