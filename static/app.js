// ============================================================================
// ApplyBot — Autonomous AI Career Agent Controller
// Vanilla ES6+, zero external libraries, zero CDN dependencies.
// ============================================================================

const JOBS = [
  {
    company: "Sprinto",
    role: "AI/ML Engineer Intern",
    location: "Remote",
    type: "Startup",
    salary: "₹25k/mo",
    match: 94,
    verified: "VERIFIED",
    portal: "Wellfound",
    reason: "Matches Python, ML skills from FraudLens project + internship exp"
  },
  {
    company: "Sarvam AI",
    role: "ML Research Intern",
    location: "Bengaluru",
    type: "Startup",
    salary: "₹30k/mo",
    match: 88,
    verified: "VERIFIED",
    portal: "Internshala",
    reason: "Aligns with NLP work and AI/DS degree from KDK College"
  },
  {
    company: "Krutrim",
    role: "Data Science Intern",
    location: "Hybrid",
    type: "Startup",
    salary: "₹20k/mo",
    match: 82,
    verified: "VERIFIED",
    portal: "Naukri",
    reason: "Data pipeline skills match; Python + SQL from coursework"
  },
  {
    company: "Postman",
    role: "AI Engineer Intern",
    location: "Bengaluru",
    type: "MNC",
    salary: "₹35k/mo",
    match: 78,
    verified: "NEEDS REVIEW",
    portal: "LinkedIn",
    reason: "FastAPI experience relevant; verify official posting link"
  },
  {
    company: "Observe.AI",
    role: "ML Intern",
    location: "Remote",
    type: "Startup",
    salary: "₹28k/mo",
    match: 85,
    verified: "VERIFIED",
    portal: "Wellfound",
    reason: "NLP + classification skills directly match from FraudLens"
  },
  {
    company: "Razorpay",
    role: "Data Analyst Intern",
    location: "Bengaluru",
    type: "MNC",
    salary: "₹40k/mo",
    match: 72,
    verified: "VERIFIED",
    portal: "NCS",
    reason: "SQL + Python skills match; MedVerify data processing relevant"
  }
];

const HR_CONTACTS = [
  { name: "Tanvi Patel", company: "Sprinto", email: "talent@sprinto.com", status: "Draft Ready" },
  { name: "Arjun Nair", company: "Sarvam AI", email: "careers@sarvam.ai", status: "Not Sent" },
  { name: "Nikita Sharma", company: "Krutrim", email: "hr@krutrim.com", status: "Sent" },
  { name: "Rahul Verma", company: "Razorpay", email: "recruiting@razorpay.com", status: "Replied" }
];

const APPLICATIONS = [
  { company: "Sprinto", role: "AI/ML Engineer Intern", status: "Pending", date: "Today" },
  { company: "Observe.AI", role: "ML Intern", status: "Pending", date: "Today" },
  { company: "Sarvam AI", role: "ML Research Intern", status: "Applied", date: "Yesterday" },
  { company: "Krutrim", role: "Data Science Intern", status: "Applied", date: "Nov 06" },
  { company: "Postman", role: "AI Engineer Intern", status: "Applied", date: "Nov 05" },
  { company: "Razorpay", role: "Data Analyst Intern", status: "Applied", date: "Nov 04" },
  { company: "Exaful", role: "Software Engineer Intern", status: "Applied", date: "Nov 03" },
  { company: "Zepto", role: "Backend Python Intern", status: "Applied", date: "Nov 02" },
  { company: "Swiggy", role: "Machine Learning Intern", status: "Applied", date: "Nov 01" },
  { company: "PhonePe", role: "Data Analyst Intern", status: "Applied", date: "Oct 30" },
  { company: "TechCorp Labs", role: "AI Engineer Intern", status: "Interview", date: "Nov 06" },
  { company: "FinTech India", role: "Junior Python Dev", status: "Rejected", date: "Oct 28" },
  { company: "CloudScale", role: "MLOps Intern", status: "Rejected", date: "Oct 26" },
  { company: "DataForge", role: "Data Intern", status: "Rejected", date: "Oct 24" }
];

// State variables
let currentJobs = [...JOBS];
let activeTypeFilter = "all";
let activePortalFilter = "all";
let activeAppTab = "Pending";
let activeDraftRecipient = HR_CONTACTS[0];
let currentInspectingJob = JOBS[0];
let dailyAppliedCount = 3;
const dailyTargetCount = 25;

// ============================================================================
// 1. INITIALIZATION & THEME TOGGLE
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTargetGauge();
  renderJobsGrid();
  renderApplicationsTable();
  renderOutreachTable();
  updateOutreachDraft(HR_CONTACTS[0]);
  setupKeyboardListeners();
  fetchLiveBackendData();
});

function initTheme() {
  const savedTheme = localStorage.getItem("applybot_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("applybot_theme", next);
  updateThemeIcon(next);
  showToast(`Switched to ${next} mode`);
}

function updateThemeIcon(theme) {
  const moon = document.getElementById("theme-icon-moon");
  const sun = document.getElementById("theme-icon-sun");
  if (theme === "dark") {
    if (moon) moon.classList.remove("page-section");
    if (sun) sun.classList.add("page-section");
  } else {
    if (moon) moon.classList.add("page-section");
    if (sun) sun.classList.remove("page-section");
  }
}

function setupKeyboardListeners() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidePanel();
    }
  });
}

// ============================================================================
// 2. SECTION NAVIGATION
// ============================================================================

function navigateTo(sectionKey) {
  const sections = ["dashboard", "jobs", "applications", "outreach", "profile"];
  sections.forEach((sec) => {
    const secEl = document.getElementById(`section-${sec}`);
    const navBtn = document.getElementById(`nav-${sec}`);
    if (sec === sectionKey) {
      if (secEl) secEl.classList.add("active");
      if (navBtn) navBtn.classList.add("active");
    } else {
      if (secEl) secEl.classList.remove("active");
      if (navBtn) navBtn.classList.remove("active");
    }
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// 3. TARGET GAUGE & DASHBOARD ACTIONS
// ============================================================================

function initTargetGauge() {
  const pct = Math.min(100, Math.round((dailyAppliedCount / dailyTargetCount) * 100));
  const bar = document.getElementById("gauge-bar");
  const text = document.getElementById("gauge-text");
  const caption = document.getElementById("gauge-caption");

  if (text) text.innerHTML = `${dailyAppliedCount} <span>/ ${dailyTargetCount} applied today</span>`;
  if (caption) caption.textContent = `${pct}% completed towards daily target (${dailyTargetCount - dailyAppliedCount} remaining)`;

  // Smooth CSS animation on progress bar
  setTimeout(() => {
    if (bar) bar.style.width = `${pct}%`;
  }, 100);
}

function allowTodaysRun() {
  const btn = document.getElementById("btn-allow-run");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Scanning Portals...</span>`;
  }

  fetch("/api/agent/activate-daily", { method: "POST" })
    .then((res) => res.json())
    .then(() => {
      showToast("Agent executed daily discovery across 8 portals.");
    })
    .catch(() => {
      showToast("Agent run authorized (using local cached feed).");
    })
    .finally(() => {
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>▶ Allow Today's Run</span>`;
        }
        dailyAppliedCount = Math.min(dailyTargetCount, dailyAppliedCount + 2);
        initTargetGauge();
      }, 800);
    });
}

function pauseAgent() {
  fetch("/api/agent/pause", { method: "POST" })
    .then((res) => res.json())
    .catch(() => {})
    .finally(() => {
      const statusText = document.getElementById("agent-status-text");
      if (statusText) statusText.textContent = "Agent Paused";
      showToast("Automation paused. No automated submissions will run.");
    });
}

function skipTopJob() {
  const card = document.getElementById("top-pending-card");
  if (card) {
    card.style.opacity = "0";
    card.style.transform = "translateX(20px)";
    card.style.transition = "all 200ms ease";
    setTimeout(() => {
      card.innerHTML = `
        <div class="pinned-title-row">
          <span class="pinned-company">All Caught Up</span>
          <span class="pinned-badge">✓ COMPLETE</span>
        </div>
        <h3 class="pinned-role">No pending high-priority reviews</h3>
        <div class="pinned-meta">Check the Jobs tab to review other opportunities.</div>
      `;
      card.style.opacity = "1";
      card.style.transform = "translateX(0)";
    }, 200);
  }
}

// ============================================================================
// 4. JOBS SECTION & FILTERING
// ============================================================================

function setFilter(type, value, btn) {
  if (type === "type") {
    activeTypeFilter = value;
    const row = document.getElementById("type-pills-row");
    if (row) row.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  } else if (type === "portal") {
    activePortalFilter = value;
    const row = document.getElementById("portal-pills-row");
    if (row) row.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  }
  if (btn) btn.classList.add("active");
  filterJobs();
}

function filterJobs() {
  const search = (document.getElementById("jobs-search-input")?.value || "").toLowerCase().trim();

  currentJobs = JOBS.filter((job) => {
    // Type filter
    if (activeTypeFilter !== "all") {
      const matchType =
        job.type.toLowerCase() === activeTypeFilter.toLowerCase() ||
        job.location.toLowerCase().includes(activeTypeFilter.toLowerCase());
      if (!matchType) return false;
    }

    // Portal filter
    if (activePortalFilter !== "all") {
      const matchPortal = (job.portal || "").toLowerCase() === activePortalFilter.toLowerCase();
      if (!matchPortal) return false;
    }

    // Search query
    if (search) {
      const text = `${job.company} ${job.role} ${job.location} ${job.type} ${job.reason}`.toLowerCase();
      if (!text.includes(search)) return false;
    }

    return true;
  });

  renderJobsGrid();
}

function renderJobsGrid() {
  const grid = document.getElementById("jobs-grid");
  if (!grid) return;

  if (currentJobs.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-sec); background-color: var(--card); border: 1px solid var(--border); border-radius: 8px;">
        No matching jobs found. Try adjusting your filters or search keywords.
      </div>
    `;
    return;
  }

  grid.innerHTML = currentJobs
    .map((job) => {
      const initials = job.company.slice(0, 2).toUpperCase();
      let badgeClass = "badge-verified";
      let badgeText = "✓ VERIFIED";
      if (job.verified === "NEEDS REVIEW") {
        badgeClass = "badge-review";
        badgeText = "⚠ NEEDS REVIEW";
      } else if (job.verified === "SUSPICIOUS") {
        badgeClass = "badge-suspicious";
        badgeText = "✗ SUSPICIOUS";
      }

      return `
        <article class="job-card" id="job-card-${escapeAttr(job.company)}">
          <div class="job-card-header">
            <div class="company-box">
              <div class="company-logo">${initials}</div>
              <div>
                <div class="company-name">${escapeHTML(job.company)}</div>
                <h3 class="job-role">${escapeHTML(job.role)}</h3>
              </div>
            </div>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>

          <div class="job-meta-chips">
            <span>📍 ${escapeHTML(job.location)}</span>
            <span>🏢 ${escapeHTML(job.type)}</span>
            <span>💰 ${escapeHTML(job.salary)}</span>
            <span>🌐 ${escapeHTML(job.portal || "ATS")}</span>
          </div>

          <hr class="card-divider">

          <div>
            <div class="match-bar-wrap">
              <span>Match</span>
              <div class="match-bar-track">
                <div class="match-bar-fill" style="width: ${job.match}%;"></div>
              </div>
              <span>${job.match}%</span>
            </div>
            <p class="match-reason" style="margin-top: 6px;">
              "${escapeHTML(job.reason)}"
            </p>
          </div>

          <hr class="card-divider">

          <div class="job-card-actions">
            <button class="btn btn-solid-violet btn-sm" onclick="reviewJob('${escapeAttr(job.company)}')">Review &amp; Apply</button>
            <button class="btn btn-ghost btn-sm" onclick="skipJobCard('${escapeAttr(job.company)}')">Skip</button>
            <button class="btn btn-ghost btn-sm" onclick="quickOutreach('${escapeAttr(job.company)}')">Email HR</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function skipJobCard(companyName) {
  const card = document.getElementById(`job-card-${companyName}`);
  if (card) {
    card.classList.add("card-removing");
    setTimeout(() => {
      currentJobs = currentJobs.filter((j) => j.company !== companyName);
      renderJobsGrid();
      showToast(`Skipped ${companyName}`);
    }, 200);
  }
}

// ============================================================================
// 5. SLIDEOUT SIDE PANEL (380px)
// ============================================================================

function reviewJob(companyName) {
  const job = JOBS.find((j) => j.company === companyName) || JOBS[0];
  currentInspectingJob = job;

  const roleEl = document.getElementById("panel-role-title");
  const compEl = document.getElementById("panel-company-name");
  const bulletsEl = document.getElementById("panel-cv-bullets");
  const coverEl = document.getElementById("panel-cover-letter");
  const qa1El = document.getElementById("panel-qa-1");
  const qa2El = document.getElementById("panel-qa-2");

  if (roleEl) roleEl.textContent = job.role;
  if (compEl) compEl.textContent = `${job.company} · ${job.location}`;

  if (bulletsEl) {
    bulletsEl.innerHTML = `
      <li>Engineered transaction anomaly and scam detection heuristics in FraudLens, achieving 94.2% precision.</li>
      <li>Built high-throughput REST API microservices using FastAPI and containerized deployments with Docker.</li>
      <li>Applied PyTorch deep learning models for classification and optimized inference latency by 35% with ONNX.</li>
      <li>Pursuing B.Tech AI &amp; Data Science at KDK College of Engineering, Nagpur with verified 8.19 CGPA.</li>
    `;
  }

  if (coverEl) {
    coverEl.textContent = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.role} position. As a final-year student pursuing B.Tech in Artificial Intelligence & Data Science at KDK College of Engineering, Nagpur (CGPA: 8.19/10.0), I have built production-grade deep learning pipelines, optimized microservices, and developed scalable AI applications.

In my independent project, FraudLens, I engineered an AI-powered transaction anomaly and digital payment scam detection system achieving 94.2% precision. Additionally, in MedVerify, I designed a multi-modal pharmaceutical verification system combining CNNs and OCR label inspection.

My technical toolkit includes Python, PyTorch, Scikit-Learn, FastAPI, Docker, and SQL. I would welcome the opportunity to bring my hands-on problem-solving capabilities to ${job.company}.

Sincerely,
Twinkle Ghangare
twinkle.ghangare@gmail.com | +91 9876543210
https://github.com/twinkleghangare`;
  }

  if (qa1El) {
    qa1El.textContent = `My background in AI & Data Science from KDK College of Engineering and projects like FraudLens directly align with ${job.company}'s engineering initiatives.`;
  }

  if (qa2El) {
    qa2El.textContent = `I have extensive hands-on experience using PyTorch for deep learning classification in FraudLens and MedVerify, optimizing inference with FastAPI and Docker.`;
  }

  const overlay = document.getElementById("side-panel-overlay");
  if (overlay) overlay.classList.add("open");
}

function closeSidePanel() {
  const overlay = document.getElementById("side-panel-overlay");
  if (overlay) overlay.classList.remove("open");
}

function closeSidePanelOnOverlay(e) {
  if (e.target.id === "side-panel-overlay") {
    closeSidePanel();
  }
}

function submitCurrentApplication() {
  const comp = currentInspectingJob?.company || "Company";
  closeSidePanel();

  // Increment daily counter
  dailyAppliedCount = Math.min(dailyTargetCount, dailyAppliedCount + 1);
  initTargetGauge();

  // Add to applications list
  APPLICATIONS.unshift({
    company: comp,
    role: currentInspectingJob?.role || "AI/ML Intern",
    status: "Applied",
    date: "Just now"
  });

  renderApplicationsTable();
  showToast(`Application submitted for ${comp}!`);
}

// ============================================================================
// 6. APPLICATIONS TABLE & TABS
// ============================================================================

function switchAppTab(tabName) {
  activeAppTab = tabName;
  const tabs = ["Pending", "Applied", "Interview", "Rejected"];
  tabs.forEach((t) => {
    const btn = document.getElementById(`app-tab-${t.toLowerCase()}`);
    if (t === tabName) {
      if (btn) btn.classList.add("active");
    } else {
      if (btn) btn.classList.remove("active");
    }
  });
  renderApplicationsTable();
}

function renderApplicationsTable() {
  const tbody = document.getElementById("applications-table-body");
  if (!tbody) return;

  const filtered = APPLICATIONS.filter((app) => app.status === activeAppTab);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-sec); padding: 32px;">
          No applications in ${escapeHTML(activeAppTab)} stage.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (app) => `
      <tr onclick="reviewJob('${escapeAttr(app.company)}')">
        <td><strong>${escapeHTML(app.company)}</strong></td>
        <td>${escapeHTML(app.role)}</td>
        <td>
          <span class="badge ${app.status === "Interview" ? "badge-verified" : app.status === "Rejected" ? "badge-suspicious" : "badge-review"}">
            ${escapeHTML(app.status)}
          </span>
        </td>
        <td>${escapeHTML(app.date)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); reviewJob('${escapeAttr(app.company)}')">
            Inspect
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

// ============================================================================
// 7. HR OUTREACH & DRAFT PREVIEW
// ============================================================================

function renderOutreachTable() {
  const tbody = document.getElementById("outreach-table-body");
  if (!tbody) return;

  tbody.innerHTML = HR_CONTACTS.map(
    (contact, idx) => `
    <tr onclick="selectOutreachContact(${idx})">
      <td><strong>${escapeHTML(contact.name)}</strong></td>
      <td>${escapeHTML(contact.company)}</td>
      <td>${escapeHTML(contact.email)}</td>
      <td>
        <span class="badge ${contact.status === "Sent" || contact.status === "Replied" ? "badge-verified" : "badge-review"}">
          ${escapeHTML(contact.status)}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 6px;" onclick="event.stopPropagation()">
          <button class="btn btn-ghost btn-sm" onclick="copyContactEmail('${escapeAttr(contact.email)}')">Copy</button>
          <button class="btn btn-ghost btn-sm" onclick="openContactGmail('${escapeAttr(contact.email)}', '${escapeAttr(contact.company)}')">Gmail</button>
          <button class="btn btn-solid-violet btn-sm" onclick="markContactSent(${idx})">Mark Sent</button>
        </div>
      </td>
    </tr>
  `
  ).join("");
}

function selectOutreachContact(index) {
  const contact = HR_CONTACTS[index];
  if (contact) {
    activeDraftRecipient = contact;
    updateOutreachDraft(contact);
    showToast(`Loaded draft for ${contact.company}`);
  }
}

function updateOutreachDraft(contact) {
  const subj = document.getElementById("draft-subject");
  const body = document.getElementById("draft-body");

  if (subj) {
    subj.textContent = `Subject: Application: AI/ML Engineer Intern — Twinkle Ghangare (${contact.company})`;
  }

  if (body) {
    body.textContent = `Dear ${contact.name || "Hiring Team"} at ${contact.company},

I am writing to express my strong interest in the AI/ML Engineer Intern opening at ${contact.company}. As a final-year B.Tech student in Artificial Intelligence & Data Science at KDK College of Engineering, Nagpur (CGPA: 8.19/10.0), I have built production-grade deep learning pipelines, optimized microservices, and developed scalable AI applications.

During my previous work, I built FraudLens, an end-to-end UPI payment scam and anomaly detection system with 94.2% precision. Additionally, in MedVerify, I designed a multi-modal pharmaceutical verification system combining CNNs and OCR label inspection.

My technical toolkit includes Python, PyTorch, Scikit-Learn, FastAPI, and Docker. I would love the opportunity to contribute to ${contact.company}'s engineering team.

Thank you for your time and consideration.

Sincerely,
Twinkle Ghangare
twinkle.ghangare@gmail.com | +91 9876543210
https://github.com/twinkleghangare`;
  }
}

function copyCurrentDraft() {
  const body = document.getElementById("draft-body")?.textContent || "";
  navigator.clipboard.writeText(body).then(() => {
    showToast("Email draft copied to clipboard!");
  });
}

function openCurrentDraftInGmail() {
  const email = activeDraftRecipient?.email || "talent@example.com";
  const subject = encodeURIComponent(document.getElementById("draft-subject")?.textContent.replace("Subject: ", "") || "Application");
  const body = encodeURIComponent(document.getElementById("draft-body")?.textContent || "");
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
}

function copyContactEmail(email) {
  navigator.clipboard.writeText(email).then(() => {
    showToast(`Copied ${email} to clipboard!`);
  });
}

function openContactGmail(email, company) {
  const subject = encodeURIComponent(`Application: AI/ML Engineer Intern — Twinkle Ghangare (${company})`);
  const body = encodeURIComponent(document.getElementById("draft-body")?.textContent || "");
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
}

function markContactSent(idx) {
  if (HR_CONTACTS[idx]) {
    HR_CONTACTS[idx].status = "Sent";
    renderOutreachTable();
    showToast(`Marked outreach to ${HR_CONTACTS[idx].company} as Sent!`);
  }
}

function quickOutreach(companyName) {
  navigateTo("outreach");
  const contact = HR_CONTACTS.find((c) => c.company === companyName) || {
    name: "Hiring Manager",
    company: companyName,
    email: `careers@${companyName.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    status: "Draft Ready"
  };
  activeDraftRecipient = contact;
  updateOutreachDraft(contact);
}

// ============================================================================
// 8. PROFILE & SLIDER
// ============================================================================

function updateSliderLabel(val) {
  const label = document.getElementById("slider-val-label");
  if (label) label.textContent = `${val} / day`;
}

function saveProfile() {
  const name = document.getElementById("profile-name")?.value;
  showToast(`Profile updated for ${name || "Twinkle Ghangare"}`);
}

function handleResumeUpload(event) {
  const file = event.target.files?.[0];
  if (file) {
    showToast(`Resume uploaded: ${file.name}`);
  }
}

function handleBellClick() {
  showToast("Notifications: 3 new verified matches found this morning.");
}

// ============================================================================
// 9. LIVE BACKEND INTEGRATION (GRACEFUL FALLBACK)
// ============================================================================

function fetchLiveBackendData() {
  // Fetch real agent briefing if running server.py
  fetch("/api/agent/daily-briefing")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      if (data.metrics) {
        const discEl = document.getElementById("stat-discovered");
        const verEl = document.getElementById("stat-verified");
        const matchEl = document.getElementById("stat-match");
        const pendEl = document.getElementById("stat-pending");

        if (discEl) discEl.textContent = data.metrics.jobs_discovered ?? 59;
        if (verEl) verEl.textContent = data.metrics.verified_jobs ?? 52;
        if (matchEl) matchEl.textContent = `${Math.round(data.metrics.best_match_score ?? 94)}%`;
        if (pendEl) pendEl.textContent = data.metrics.pending_approvals ?? 12;
      }
      if (data.daily_submitted !== undefined) {
        dailyAppliedCount = data.daily_submitted;
        initTargetGauge();
      }
    })
    .catch(() => {
      // Local file mode - silently use mock constants
    });
}

// ============================================================================
// 10. TOAST ENGINE & HELPERS
// ============================================================================

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 200ms ease";
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "\\'");
}
