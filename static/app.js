// ApplyBot — Autonomous AI Career Agent Controller
// Candidate: Twinkle Ghangare (B.Tech AI & Data Science, KDK College Nagpur, CGPA 8.19)

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

let currentJobs = [...JOBS];
let activeTypeFilter = "all";
let activePortalFilter = "all";
let activeAppTab = "Pending";
let activeDraftRecipient = HR_CONTACTS[0];
let currentInspectingJob = JOBS[0];
let dailyAppliedCount = 3;
const dailyTargetCount = 25;
let lastScrollY = 0;

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbarScroll();
  animateStatCounters();
  initTargetProgressBar();
  renderJobsGrid();
  renderApplicationsTable();
  renderOutreachTable();
  updateOutreachDraft(HR_CONTACTS[0]);
  setupKeyboardListeners();
  setupDropzone();
  fetchLiveBackendData();
});

// 1. THEME TOGGLE (200ms Transition, localStorage)
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
    if (moon) moon.classList.remove("theme-icon-hidden");
    if (sun) sun.classList.add("theme-icon-hidden");
  } else {
    if (moon) moon.classList.add("theme-icon-hidden");
    if (sun) sun.classList.remove("theme-icon-hidden");
  }
}

// 2. NAVBAR SCROLL & MOBILE MENU
function initNavbarScroll() {
  const navbar = document.getElementById("main-navbar");
  window.addEventListener("scroll", () => {
    const cur = window.scrollY;
    if (cur > 70 && cur > lastScrollY) {
      navbar.classList.add("navbar-hidden");
    } else {
      navbar.classList.remove("navbar-hidden");
    }
    lastScrollY = cur;
  });
}

function toggleMobileMenu() {
  const m = document.getElementById("nav-menu");
  if (m) m.classList.toggle("open");
}

// 3. NAVIGATION (Numbered Sections)
function navigateTo(id) {
  ["dashboard", "jobs", "applications", "outreach", "profile"].forEach((s) => {
    const sec = document.getElementById(`section-${s}`);
    const nav = document.getElementById(`nav-${s}`);
    if (sec) sec.classList.remove("active");
    if (nav) nav.classList.remove("active");
  });

  const target = document.getElementById(`section-${id}`);
  const targetNav = document.getElementById(`nav-${id}`);

  if (target) {
    target.classList.add("active");
    target.classList.remove("animate-hero");
    void target.offsetWidth;
    target.classList.add("animate-hero");
  }
  if (targetNav) targetNav.classList.add("active");

  const m = document.getElementById("nav-menu");
  if (m) m.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "dashboard") {
    animateStatCounters();
    initTargetProgressBar();
  }
}

// 4. STAT COUNTERS & TARGET GAUGE
function animateStatCounters() {
  document.querySelectorAll(".stat-number[data-target]").forEach((el) => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    let start = 0;
    const steps = 40;
    const inc = target / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) {
        el.innerText = target + suffix;
        clearInterval(timer);
      } else {
        el.innerText = Math.round(start) + suffix;
      }
    }, 20);
  });
}

function initTargetProgressBar() {
  updateTargetProgress(dailyAppliedCount, dailyTargetCount);
}

function updateTargetProgress(count, target) {
  const pct = Math.round((count / target) * 100);
  const scoreText = document.getElementById("gauge-score-text");
  const bar = document.getElementById("target-progress-bar");
  const sub = document.getElementById("target-gauge-sub");

  if (scoreText) scoreText.innerText = `${count} / ${target} applied today`;
  if (sub) sub.innerText = `${pct}% completed towards daily target`;
  if (bar) {
    bar.style.width = "0%";
    setTimeout(() => {
      bar.style.width = `${pct}%`;
    }, 50);
  }
}

// 5. AGENT CONTROLS
function allowTodaysRun() {
  const btn = document.getElementById("btn-allow-run");
  if (!btn) return;
  btn.innerText = "⏳ Running Agent...";
  btn.style.opacity = "0.7";
  showToast("Autonomous Agent running: Evaluating 24 opportunities...");

  setTimeout(() => {
    dailyAppliedCount = Math.min(dailyTargetCount, dailyAppliedCount + 1);
    updateTargetProgress(dailyAppliedCount, dailyTargetCount);
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>▶ Allow Today's Run</span>
    `;
    btn.style.opacity = "1";
    showToast(`✓ Auto-applied to Sprinto! Daily total: ${dailyAppliedCount}/${dailyTargetCount}`);
  }, 1000);
}

function pauseAgent() {
  const label = document.getElementById("agent-status-label");
  if (label) label.innerText = "Agent Paused · Execution Halted";
  showToast("Agent paused. No applications will be sent.");
}

function skipTopJob() {
  const card = document.getElementById("top-pending-card");
  if (card) {
    card.classList.add("skipping");
    setTimeout(() => {
      card.innerHTML = `
        <div class="top-card-header">
          <span class="top-company-name">Queue Clear</span>
          <span class="badge badge-verified mono">✓ COMPLETE</span>
        </div>
        <h3 class="top-role-title">All high-priority jobs reviewed</h3>
        <div class="top-card-tags mono">Visit the Jobs section to discover new matches.</div>
      `;
      card.classList.remove("skipping");
    }, 200);
  }
  showToast("Skipped top priority pending job.");
}

// 6. JOBS (OpenTrain Layout)
function filterJobs() {
  const search = (document.getElementById("jobs-search-input")?.value || "").toLowerCase();

  currentJobs = JOBS.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search) ||
      job.role.toLowerCase().includes(search) ||
      job.reason.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search);

    const matchesType =
      activeTypeFilter === "all" ||
      job.location.toLowerCase() === activeTypeFilter.toLowerCase() ||
      job.type.toLowerCase() === activeTypeFilter.toLowerCase();

    const matchesPortal =
      activePortalFilter === "all" ||
      job.portal.toLowerCase() === activePortalFilter.toLowerCase();

    return matchesSearch && matchesType && matchesPortal;
  });

  renderJobsGrid();
}

function setFilter(cat, val, btn) {
  if (cat === "type") {
    activeTypeFilter = val;
    document.querySelectorAll("#type-pills-row .filter-pill").forEach((b) => b.classList.remove("active"));
  } else {
    activePortalFilter = val;
    document.querySelectorAll("#portal-pills-row .filter-pill").forEach((b) => b.classList.remove("active"));
  }
  btn.classList.add("active");
  filterJobs();
}

function renderJobsGrid() {
  const grid = document.getElementById("jobs-grid");
  if (!grid) return;

  if (currentJobs.length === 0) {
    grid.innerHTML = `
      <div class="card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-2);">
        No matching positions found. Adjust filter pills or search terms.
      </div>
    `;
    return;
  }

  grid.innerHTML = currentJobs
    .map((job) => {
      const badgeClass =
        job.verified === "VERIFIED"
          ? "badge-verified"
          : job.verified === "NEEDS REVIEW"
          ? "badge-review"
          : "badge-suspicious";

      const badgeText =
        job.verified === "VERIFIED"
          ? "✓ VERIFIED"
          : job.verified === "NEEDS REVIEW"
          ? "⚠ NEEDS REVIEW"
          : "✗ SUSPICIOUS";

      const initials = job.company.substring(0, 2).toUpperCase();

      return `
        <div class="card job-card" id="card-${job.company.replace(/\\s+/g, "")}">
          <div>
            <div class="job-card-top">
              <div class="job-avatar-group">
                <div class="job-avatar">${initials}</div>
                <div class="job-company-title">${job.company}</div>
              </div>
              <span class="badge ${badgeClass} mono">${badgeText}</span>
            </div>

            <h3 class="job-role-heading" style="margin-top: 10px;">${job.role}</h3>

            <div class="job-tags-row mono">
              <span class="job-tag">📍 ${job.location}</span>
              <span class="job-tag">🏢 ${job.type}</span>
              <span class="job-tag">💰 ${job.salary}</span>
              <span class="job-tag">🌐 ${job.portal}</span>
            </div>
          </div>

          <hr class="card-rule">

          <div>
            <div class="match-bar-label mono">
              <span>Match Confidence</span>
              <span class="match-bar-pct">${job.match}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${job.match}%;"></div>
            </div>
            <div class="why-matched-text">"${job.reason}"</div>
          </div>

          <hr class="card-rule">

          <div class="job-card-actions">
            <button class="btn btn-violet btn-sm" onclick="reviewJob('${job.company}')">Review &amp; Apply</button>
            <button class="btn btn-ghost btn-sm" onclick="skipJob('${job.company}')">Skip</button>
            <button class="btn btn-ghost btn-sm" onclick="emailHRForJob('${job.company}')">Email HR</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function skipJob(company) {
  const cardId = `card-${company.replace(/\\s+/g, "")}`;
  const el = document.getElementById(cardId);
  if (el) {
    el.classList.add("skipping");
    setTimeout(() => {
      currentJobs = currentJobs.filter((j) => j.company !== company);
      renderJobsGrid();
    }, 200);
  }
  showToast(`Skipped ${company}`);
}

function emailHRForJob(company) {
  const contact = HR_CONTACTS.find((c) => c.company.toLowerCase() === company.toLowerCase()) || {
    name: "Hiring Lead",
    company: company,
    email: `careers@${company.toLowerCase().replace(/\\s+/g, "")}.com`,
    status: "Draft Ready"
  };
  navigateTo("outreach");
  updateOutreachDraft(contact);
  showToast(`Drafted outreach email for ${company}`);
}

// 7. APPLICATIONS & 380px SLIDE PANEL
function switchAppTab(status) {
  activeAppTab = status;
  ["Pending", "Applied", "Interview", "Rejected"].forEach((t) => {
    const btn = document.getElementById(`tab-${t.toLowerCase()}`);
    if (btn) btn.classList.remove("active");
  });
  const activeBtn = document.getElementById(`tab-${status.toLowerCase()}`);
  if (activeBtn) activeBtn.classList.add("active");
  renderApplicationsTable();
}

function renderApplicationsTable() {
  const tbody = document.getElementById("applications-table-body");
  if (!tbody) return;

  const filtered = APPLICATIONS.filter((a) => a.status === activeAppTab);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-2); padding: 32px;">No applications in "${activeAppTab}" queue.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (app) => `
      <tr class="row-interactive" onclick="openSidePanel('${app.company}', '${app.role}')">
        <td style="font-weight: 700;">${app.company}</td>
        <td>${app.role}</td>
        <td><span class="badge ${getAppBadgeClass(app.status)} mono">${app.status}</span></td>
        <td class="mono" style="color: var(--text-2);">${app.date}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openSidePanel('${app.company}', '${app.role}')">Inspect</button></td>
      </tr>
    `
    )
    .join("");
}

function getAppBadgeClass(status) {
  switch (status) {
    case "Pending":
      return "badge-review";
    case "Applied":
    case "Interview":
      return "badge-verified";
    case "Rejected":
      return "badge-suspicious";
    default:
      return "badge-review";
  }
}

function reviewJob(company) {
  const job = JOBS.find((j) => j.company.toLowerCase() === company.toLowerCase()) || JOBS[0];
  openSidePanel(job.company, job.role);
}

function openSidePanel(company, role) {
  currentInspectingJob = JOBS.find((j) => j.company.toLowerCase() === company.toLowerCase()) || {
    company,
    role,
    reason: "Direct candidate profile alignment"
  };

  const backdrop = document.getElementById("side-panel-backdrop");
  const roleEl = document.getElementById("panel-role-title");
  const compEl = document.getElementById("panel-company-name");
  const bulletsEl = document.getElementById("panel-cv-bullets");
  const coverEl = document.getElementById("panel-cover-letter");

  if (roleEl) roleEl.innerText = role;
  if (compEl) compEl.innerText = company;

  if (bulletsEl) {
    bulletsEl.innerHTML = `
      <li>Engineered transaction anomaly heuristic detection in FraudLens UPI scam classifier (94.2% precision).</li>
      <li>Architected modular FastAPI microservices containerized with Docker for sub-50ms inference.</li>
      <li>Trained deep learning pipelines in PyTorch with ONNX quantization reducing model footprint by 35%.</li>
      <li>Processed multi-spectral datasets for HSI land-cover classification and automated label verification.</li>
    `;
  }

  if (coverEl) {
    coverEl.innerText = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${role} position. As a final-year B.Tech student in Artificial Intelligence & Data Science at KDK College of Engineering, Nagpur (CGPA: 8.19), I have hands-on experience engineering production-ready machine learning models and microservices.

In my project FraudLens, I engineered end-to-end UPI fraud detection pipelines achieving 94.2% precision. Similarly, in MedVerify, I combined CNN classification with automated OCR inspection. My core engineering toolkit includes Python, PyTorch, FastAPI, Docker, and SQL.

I am eager to contribute to ${company}'s high-impact initiatives and look forward to discussing how my technical background aligns with your engineering standards.

Sincerely,
Twinkle Ghangare
twinkle.ghangare@gmail.com | +91 9876543210
GitHub: https://github.com/twinkleghangare
LinkedIn: https://www.linkedin.com/in/twinkleghangare`;
  }

  switchPanelTab("cv");
  if (backdrop) backdrop.classList.add("open");
}

function closeSidePanel() {
  const b = document.getElementById("side-panel-backdrop");
  if (b) b.classList.remove("open");
}

function closeSidePanelOnBackdrop(e) {
  if (e.target.id === "side-panel-backdrop") closeSidePanel();
}

function switchPanelTab(tabName) {
  ["cv", "letter", "qa"].forEach((t) => {
    const btn = document.getElementById(`ptab-${t}`);
    const pane = document.getElementById(`pane-${t}`);
    if (btn) btn.classList.remove("active");
    if (pane) pane.classList.remove("active");
  });

  const activeBtn = document.getElementById(`ptab-${tabName}`);
  const activePane = document.getElementById(`pane-${tabName}`);
  if (activeBtn) activeBtn.classList.add("active");
  if (activePane) activePane.classList.add("active");
}

function submitCurrentApplication() {
  closeSidePanel();
  dailyAppliedCount = Math.min(dailyTargetCount, dailyAppliedCount + 1);
  updateTargetProgress(dailyAppliedCount, dailyTargetCount);

  if (currentInspectingJob) {
    const existing = APPLICATIONS.find((a) => a.company === currentInspectingJob.company);
    if (existing) {
      existing.status = "Applied";
      existing.date = "Just now";
    } else {
      APPLICATIONS.unshift({
        company: currentInspectingJob.company,
        role: currentInspectingJob.role,
        status: "Applied",
        date: "Just now"
      });
    }
  }

  renderApplicationsTable();
  showToast(`✓ Applied to ${currentInspectingJob.company}! Daily total: ${dailyAppliedCount}/${dailyTargetCount}`);
}

// 8. HR OUTREACH
function renderOutreachTable() {
  const tbody = document.getElementById("outreach-table-body");
  if (!tbody) return;

  tbody.innerHTML = HR_CONTACTS.map(
    (c) => `
    <tr class="row-interactive" onclick="selectOutreachContact('${c.company}')">
      <td style="font-weight: 700;">${c.name}</td>
      <td>${c.company}</td>
      <td class="mono" style="color: var(--violet);">${c.email}</td>
      <td><span class="badge ${c.status === "Sent" ? "badge-verified" : "badge-review"} mono">${c.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); copyDirectEmail('${c.company}')">Copy</button>
          <button class="btn btn-violet btn-sm" onclick="event.stopPropagation(); openDirectGmail('${c.company}')">Gmail</button>
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); markOutreachSent('${c.company}')">Mark Sent</button>
        </div>
      </td>
    </tr>
  `
  ).join("");
}

function selectOutreachContact(company) {
  const contact = HR_CONTACTS.find((c) => c.company === company) || HR_CONTACTS[0];
  updateOutreachDraft(contact);
  showToast(`Loaded draft for ${contact.name} (${contact.company})`);
}

function updateOutreachDraft(contact) {
  activeDraftRecipient = contact;
  const subj = document.getElementById("draft-subject");
  const body = document.getElementById("draft-body");

  if (subj) {
    subj.innerText = `Subject: Application: AI/ML Engineer Intern — Twinkle Ghangare (${contact.company})`;
  }

  if (body) {
    body.innerText = `Dear ${contact.name} and the Hiring Team at ${contact.company},

I am writing to express my interest in AI/ML engineering opportunities at ${contact.company}. As a final-year B.Tech student in Artificial Intelligence & Data Science at KDK College of Engineering, Nagpur (CGPA: 8.19), I have focused on production-grade machine learning pipelines and microservices.

In my FraudLens project, I developed real-time transaction anomaly detection pipelines achieving 94.2% precision. In MedVerify, I implemented multi-modal CNN label classification and verification. My core toolkit includes Python, PyTorch, Scikit-Learn, FastAPI, and Docker.

I would be thrilled to contribute to ${contact.company}'s engineering objectives. My resume is attached for your review.

Sincerely,
Twinkle Ghangare
twinkle.ghangare@gmail.com | +91 9876543210
Portfolio: https://github.com/twinkleghangare
LinkedIn: https://www.linkedin.com/in/twinkleghangare`;
  }
}

function copyCurrentDraft() {
  const body = document.getElementById("draft-body")?.innerText || "";
  navigator.clipboard.writeText(body).then(() => {
    showToast("Email draft copied to clipboard!");
  });
}

function copyDirectEmail(company) {
  selectOutreachContact(company);
  copyCurrentDraft();
}

function openCurrentDraftInGmail() {
  if (!activeDraftRecipient) return;
  const email = activeDraftRecipient.email;
  const subj = encodeURIComponent(`Application: AI/ML Engineer Intern — Twinkle Ghangare (${activeDraftRecipient.company})`);
  const body = encodeURIComponent(document.getElementById("draft-body")?.innerText || "");
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subj}&body=${body}`;
  window.open(url, "_blank");
}

function openDirectGmail(company) {
  selectOutreachContact(company);
  openCurrentDraftInGmail();
}

function markSelectedOutreachSent() {
  if (activeDraftRecipient) {
    markOutreachSent(activeDraftRecipient.company);
  }
}

function markOutreachSent(company) {
  const contact = HR_CONTACTS.find((c) => c.company === company);
  if (contact) {
    contact.status = "Sent";
    renderOutreachTable();
    showToast(`Marked outreach to ${company} as Sent!`);
  }
}

// 9. PROFILE & DROPZONE
function updateSliderLabel(val) {
  const lbl = document.getElementById("slider-count-label");
  if (lbl) lbl.innerText = `${val} / day`;
}

function saveProfile() {
  showToast("Profile settings saved successfully!");
}

function handleResumeUpload(event) {
  const file = event.target.files?.[0];
  if (file) {
    const label = document.getElementById("dropzone-label");
    if (label) label.innerText = `Uploaded: ${file.name}`;
    showToast(`Resume uploaded: ${file.name}`);
  }
}

function setupDropzone() {
  const dropzone = document.getElementById("resume-dropzone");
  if (!dropzone) return;

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--violet)";
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--border)";
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (file) {
      const label = document.getElementById("dropzone-label");
      if (label) label.innerText = `Uploaded: ${file.name}`;
      showToast(`Resume uploaded: ${file.name}`);
    }
  });
}

function handleBellClick() {
  showToast("Notifications: 3 verified opportunities ready for review.");
}

// 10. TOAST & KEYBOARD LISTENERS
function showToast(msg) {
  const shelf = document.getElementById("toast-shelf");
  if (!shelf) return;
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  shelf.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(8px)";
    t.style.transition = "all 200ms ease";
    setTimeout(() => t.remove(), 200);
  }, 2600);
}

function setupKeyboardListeners() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidePanel();
  });
}

// 11. LIVE BACKEND SYNC
async function fetchLiveBackendData() {
  try {
    const res = await fetch("/api/dashboard-stats");
    if (res.ok) {
      const data = await res.json();
      if (data && data.agent_stats) {
        const stats = data.agent_stats;
        const discEl = document.getElementById("stat-discovered");
        const verEl = document.getElementById("stat-verified");
        const pendEl = document.getElementById("stat-pending");
        if (discEl && stats.total_jobs_discovered) {
          discEl.setAttribute("data-target", stats.total_jobs_discovered);
          discEl.innerText = stats.total_jobs_discovered;
        }
        if (verEl && stats.verified_jobs) {
          verEl.setAttribute("data-target", stats.verified_jobs);
          verEl.innerText = stats.verified_jobs;
        }
        if (pendEl && stats.pending_approvals) {
          pendEl.setAttribute("data-target", stats.pending_approvals);
          pendEl.innerText = stats.pending_approvals;
        }
      }
    }
  } catch (e) {}
}
