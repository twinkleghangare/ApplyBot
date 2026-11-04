import urllib.request
import json

base_url = "http://127.0.0.1:8000"

endpoints = [
    "/health",
    "/api/profile",
    "/api/dashboard-stats",
    "/api/agent/status",
    "/api/agent/daily-briefing",
    "/api/agent/outreach",
    "/api/agent/jobs",
    "/api/agent/pending-approvals",
    "/api/agent/activity-logs"
]

results = {}
for ep in endpoints:
    try:
        res = urllib.request.urlopen(f"{base_url}{ep}")
        data = json.loads(res.read().decode())
        results[ep] = {"status": res.status, "keys": list(data.keys())}
    except Exception as e:
        results[ep] = {"error": str(e)}

print(json.dumps(results, indent=2))

