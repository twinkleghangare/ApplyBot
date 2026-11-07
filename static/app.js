/**
 * ApplyBot — Autonomous AI Career Agent
 * Object-Oriented Architecture (ES6 Classes)
 * Candidate: Twinkle Ghangare · B.Tech AI & Data Science (KDK College, CGPA: 8.19)
 */

const CANDIDATE_PROFILE = {
  name: "Twinkle Ghangare",
  email: "twinkle.ghangare@gmail.com",
  phone: "+91 98765 43210",
  college: "KDK College of Engineering, Nagpur",
  degree: "B.Tech AI & Data Science",
  cgpa: "8.19",
  linkedin: "linkedin.com/in/twinkle-ghangare",
  projects: ["FraudLens (UPI Anomaly Detection)", "MedVerify (CNN + OCR Medicine Auth)", "HSI Spectral Classification"],
  skills: ["Python", "PyTorch", "FastAPI", "Docker", "SQL", "OpenCV", "Scikit-Learn", "NLP", "Git"],
  targetRoles: ["AI/ML Engineer Intern", "Machine Learning Intern", "Data Science Intern", "Python Developer Intern"],
  locations: ["Remote", "Bengaluru", "Nagpur (Home City)", "Pune", "Hybrid"]
};

const INITIAL_JOBS = [
  {
    company: "Sprinto",
    role: "AI/ML Engineer Intern",
    location: "Remote",
    type: "Startup",
    salary: "₹25k/mo",
    match: 94,
    verified: "VERIFIED",
    portal: "Wellfound",
    url: "https://wellfound.com/jobs",
    reason: "Direct match with FraudLens UPI anomaly heuristics & FastAPI microservices"
  },
  {
    company: "Observe.AI",
    role: "Machine Learning Intern (NLP)",
    location: "Remote",
    type: "Startup",
    salary: "₹30k/mo",
    match: 91,
    verified: "VERIFIED",
    portal: "Wellfound",
    url: "https://wellfound.com/jobs",
    reason: "NLP pipeline alignment; PyTorch transformer fine-tuning for speech analytics"
  },
  {
    company: "Sarvam AI",
    role: "ML Research Intern (Indic LLMs)",
    location: "Bengaluru",
    type: "Startup",
    salary: "₹40k/mo",
    match: 89,
    verified: "VERIFIED",
    portal: "Internshala",
    url: "https://internshala.com/internships/machine-learning-internship/",
    reason: "Dedicated Indian language foundation models; PyTorch & data curation match"
  },
  {
    company: "Krutrim",
    role: "GenAI Data Science Intern",
    location: "Bengaluru",
    type: "Startup",
    salary: "₹35k/mo",
    match: 87,
    verified: "VERIFIED",
    portal: "Saarthi",
    url: "https://joinsaarthi.com/",
    reason: "Saarthi verified Gen Z fresher role; high Job Fit Score for B.Tech AI graduates"
  },
  {
    company: "Persistent Systems",
    role: "Associate Software Engineer (AI/ML)",
    location: "Nagpur",
    type: "MNC",
    salary: "₹4.5L/yr",
    match: 96,
    verified: "VERIFIED",
    portal: "Freshersworld",
    url: "https://www.freshersworld.com/",
    reason: "Campus & regional tech opening; home city MIHAN Nagpur development center"
  },
  {
    company: "Tata Elxsi",
    role: "AI Vision Engineer Intern",
    location: "Pune",
    type: "MNC",
    salary: "₹28k/mo",
    match: 88,
    verified: "VERIFIED",
    portal: "Naukri",
    url: "https://www.naukri.com/campus-fresher-jobs",
    reason: "Computer vision alignment with MedVerify CNN image classification pipeline"
  },
  {
    company: "Postman",
    role: "AI Developer Intern",
    location: "Remote",
    type: "Startup",
    salary: "₹35k/mo",
    match: 84,
    verified: "NEEDS REVIEW",
    portal: "LinkedIn",
    url: "https://www.linkedin.com/jobs/",
    reason: "API ecosystem tooling with FastAPI; recruiter connection available"
  },
  {
    company: "Razorpay",
    role: "Data Science Intern (Risk & Fraud)",
    location: "Bengaluru",
    type: "Startup",
    salary: "₹45k/mo",
    match: 95,
    verified: "VERIFIED",
    portal: "Indeed",
    url: "https://in.indeed.com/",
    reason: "Direct algorithmic alignment with FraudLens UPI scam detection model"
  },
  {
    company: "FinTech Solutions",
    role: "Data Analyst Intern",
    location: "Hybrid",
    type: "MNC",
    salary: "₹20k/mo",
    match: 78,
    verified: "SUSPICIOUS",
    portal: "foundit",
    url: "https://www.foundit.in/",
    reason: "Suspicious third-party placement agency fee flagged by anti-scam guard"
  },
  {
    company: "Fyno",
    role: "Python AI Intern",
    location: "Remote",
    type: "Startup",
    salary: "₹25k/mo",
    match: 86,
    verified: "VERIFIED",
    portal: "Cutshort",
    url: "https://cutshort.io/",
    reason: "Direct messaging with Engineering Manager; FastAPI + Docker requirement"
  },
  {
    company: "NIC (National Informatics Centre)",
    role: "Data Science Research Trainee",
    location: "Nagpur",
    type: "Government",
    salary: "₹18k/mo",
    match: 83,
    verified: "VERIFIED",
    portal: "NCS",
    url: "https://www.ncs.gov.in/",
    reason: "National Career Service official government technical trainee role in Nagpur"
  },
  {
    company: "Tech Mahindra",
    role: "Associate AI Support Trainee",
    location: "Pune",
    type: "MNC",
    salary: "₹22k/mo",
    match: 81,
    verified: "VERIFIED",
    portal: "WorkIndia",
    url: "https://www.workindia.in/",
    reason: "Local corporate technical support; model monitoring & SQL reporting"
  }
];

const INITIAL_APPLICATIONS = [
  { company: "Sprinto", role: "AI/ML Engineer Intern", portal: "Wellfound", status: "Pending", date: "Today" },
  { company: "Observe.AI", role: "ML Intern (NLP)", portal: "Wellfound", status: "Pending", date: "Today" },
  { company: "Persistent Systems", role: "Associate Software Engineer", portal: "Freshersworld", status: "Applied", date: "Today" },
  { company: "Sarvam AI", role: "ML Research Intern", portal: "Internshala", status: "Applied", date: "Yesterday" },
  { company: "Krutrim", role: "GenAI Data Associate", portal: "Saarthi", status: "Applied", date: "Nov 06" },
  { company: "Razorpay", role: "Fraud Analytics Intern", portal: "Indeed", status: "Applied", date: "Nov 05" },
  { company: "Fyno", role: "Python AI Intern", portal: "Cutshort", status: "Applied", date: "Nov 04" },
  { company: "Postman", role: "AI Engineer Intern", portal: "LinkedIn", status: "Applied", date: "Nov 03" },
  { company: "NIC", role: "Data Research Trainee", portal: "NCS", status: "Applied", date: "Nov 02" },
  { company: "Tata Elxsi", role: "AI Vision Engineer", portal: "Naukri", status: "Applied", date: "Nov 01" },
  { company: "TechCorp Labs", role: "AI Engineer Intern", portal: "LinkedIn", status: "Interview", date: "Nov 06" },
  { company: "FinTech India", role: "Junior Python Dev", portal: "WorkIndia", status: "Rejected", date: "Oct 28" },
  { company: "CloudScale", role: "MLOps Intern", portal: "foundit", status: "Rejected", date: "Oct 26" },
  { company: "DataForge", role: "Data Intern", portal: "Indeed", status: "Rejected", date: "Oct 24" }
];

const INITIAL_HR_CONTACTS = [
  { name: "Tanvi Patel", company: "Sprinto", portal: "Wellfound", email: "talent@sprinto.com", status: "Draft Ready" },
  { name: "Arjun Nair", company: "Sarvam AI", portal: "Internshala", email: "careers@sarvam.ai", status: "Not Sent" },
  { name: "Nikita Sharma", company: "Krutrim", portal: "Saarthi", email: "hr@krutrim.com", status: "Sent" },
  { name: "Anand Joshi", company: "Persistent Systems", portal: "Freshersworld", email: "campus@persistent.com", status: "Draft Ready" },
  { name: "Rahul Verma", company: "Razorpay", portal: "Indeed", email: "recruiting@razorpay.com", status: "Replied" },
  { name: "Pooja Hegde", company: "Fyno", portal: "Cutshort", email: "em-hiring@fyno.io", status: "Draft Ready" }
];

/**
 * Domain Service: Job Engine
 */
class JobEngine {
  constructor(jobs) {
    this.jobs = [...jobs];
    this.typeFilter = "all";
    this.portalFilter = "all";
    this.searchQuery = "";
  }

  setTypeFilter(type) {
    this.typeFilter = type;
  }

  setPortalFilter(portal) {
    this.portalFilter = portal;
  }

  setSearchQuery(q) {
    this.searchQuery = (q || "").trim().toLowerCase();
  }

  getFiltered() {
    return this.jobs.filter((j) => {
      const matchSearch =
        !this.searchQuery ||
        j.company.toLowerCase().includes(this.searchQuery) ||
        j.role.toLowerCase().includes(this.searchQuery) ||
        j.location.toLowerCase().includes(this.searchQuery) ||
        j.portal.toLowerCase().includes(this.searchQuery) ||
        j.reason.toLowerCase().includes(this.searchQuery);

      const matchType =
        this.typeFilter === "all" ||
        j.location.toLowerCase().includes(this.typeFilter.toLowerCase()) ||
        j.type.toLowerCase().includes(this.typeFilter.toLowerCase());

      const matchPortal =
        this.portalFilter === "all" ||
        j.portal.toLowerCase() === this.portalFilter.toLowerCase();

      return matchSearch && matchType && matchPortal;
    });
  }

  getStats() {
    const discovered = this.jobs.length;
    const verified = this.jobs.filter((j) => j.verified === "VERIFIED").length;
    const matches = this.jobs.map((j) => j.match);
    const maxMatch = matches.length ? Math.max(...matches) : 0;
    const pending = INITIAL_APPLICATIONS.filter((a) => a.status === "Pending").length;
    return { discovered, verified, maxMatch, pending };
  }

  skip(company) {
    const idx = this.jobs.findIndex((j) => j.company.toLowerCase() === company.toLowerCase());
    if (idx !== -1) {
      return this.jobs.splice(idx, 1)[0];
    }
    return null;
  }

  findByCompany(company) {
    return this.jobs.find((j) => j.company.toLowerCase() === company.toLowerCase()) || this.jobs[0];
  }
}

/**
 * Domain Service: Application Tracker
 */
class ApplicationTracker {
  constructor(applications) {
    this.applications = [...applications];
    this.activeTab = "Pending";
  }

  setTab(tab) {
    this.activeTab = tab;
  }

  getByTab(tab = this.activeTab) {
    return this.applications.filter((a) => a.status.toLowerCase() === tab.toLowerCase());
  }

  getCount(status) {
    return this.applications.filter((a) => a.status.toLowerCase() === status.toLowerCase()).length;
  }

  submit(company) {
    const item = this.applications.find((a) => a.company.toLowerCase() === company.toLowerCase());
    if (item) {
      item.status = "Applied";
      item.date = "Just now";
    } else {
      this.applications.unshift({
        company,
        role: "AI/ML Engineer Intern",
        portal: "Wellfound",
        status: "Applied",
        date: "Just now"
      });
    }
  }
}

/**
 * Domain Service: HR Outreach Manager
 */
class OutreachManager {
  constructor(contacts) {
    this.contacts = [...contacts];
    this.selected = this.contacts[0];
  }

  select(email) {
    const c = this.contacts.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (c) this.selected = c;
    return this.selected;
  }

  markSent(email) {
    const c = this.contacts.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (c) c.status = "Sent";
  }

  generateDraft(contact, candidate = CANDIDATE_PROFILE) {
    const target = contact || this.selected;
    return `Subject: Application: AI/ML Engineering Intern — ${candidate.name}

Dear ${target.name},

I am writing to express my strong interest in AI/ML internship opportunities at ${target.company}. As a final-year B.Tech student in Artificial Intelligence & Data Science at ${candidate.college} (CGPA: ${candidate.cgpa}), I specialize in building deterministic, production-grade machine learning pipelines.

Key Technical Projects:
• FraudLens: Engineered an end-to-end UPI anomaly detection engine processing real-time transactions with 94.2% precision and sub-50ms inference using XGBoost and FastAPI.
• MedVerify: Developed a spectral medicine authentication model combining PyTorch CNNs with PaddleOCR for automated packaging verification (98.1% accuracy).

My toolkit includes Python, PyTorch, FastAPI, Docker, and SQL. I have reviewed ${target.company}'s recent technical trajectory and would welcome the opportunity to discuss how my practical machine learning skills can support your engineering deliverables.

Resume & GitHub: ${candidate.linkedin}

Sincerely,
${candidate.name}
${candidate.phone} | ${candidate.email}`;
  }
}

/**
 * Domain Service: Profile & Auth Manager
 */
class ProfileManager {
  constructor(profile = CANDIDATE_PROFILE) {
    this.profile = { ...profile };
    this.dailyTarget = 25;
    this.dailyApplied = 3;
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem("applybot_candidate");
      if (saved) Object.assign(this.profile, JSON.parse(saved));
      const target = localStorage.getItem("applybot_daily_target");
      if (target) this.dailyTarget = parseInt(target, 10);
      const applied = localStorage.getItem("applybot_daily_applied");
      if (applied) this.dailyApplied = parseInt(applied, 10);
    } catch (e) {}
  }

  save(data) {
    Object.assign(this.profile, data);
    try {
      localStorage.setItem("applybot_candidate", JSON.stringify(this.profile));
    } catch (e) {}
  }

  setDailyLimit(limit) {
    this.dailyTarget = limit;
    try {
      localStorage.setItem("applybot_daily_target", limit.toString());
    } catch (e) {}
  }

  incrementApplied() {
    this.dailyApplied += 1;
    try {
      localStorage.setItem("applybot_daily_applied", this.dailyApplied.toString());
    } catch (e) {}
    return this.dailyApplied;
  }
}

/**
 * Master UI Controller (OOP Orchestrator)
 */
class ApplyBotApp {
  constructor() {
    this.jobs = new JobEngine(INITIAL_JOBS);
    this.apps = new ApplicationTracker(INITIAL_APPLICATIONS);
    this.outreach = new OutreachManager(INITIAL_HR_CONTACTS);
    this.profile = new ProfileManager(CANDIDATE_PROFILE);
    this.currentTheme = "dark";
    this.currentInspectingJob = INITIAL_JOBS[0];
    this.isPaused = false;
  }

  init() {
    this.initTheme();
    this.initAuthNavbar();
    this.renderAll();
    this.initGSAP();
    this.bindEvents();
  }

  initTheme() {
    try {
      const saved = localStorage.getItem("applybot_theme") || "dark";
      this.setTheme(saved);
    } catch (e) {
      this.setTheme("dark");
    }
  }

  setTheme(mode) {
    this.currentTheme = mode;
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem("applybot_theme", mode);
    } catch (e) {}

    const lightBtn = document.getElementById("mode-btn-light");
    const darkBtn = document.getElementById("mode-btn-dark");
    if (lightBtn && darkBtn) {
      if (mode === "light") {
        lightBtn.classList.add("active");
        darkBtn.classList.remove("active");
      } else {
        darkBtn.classList.add("active");
        lightBtn.classList.remove("active");
      }
    }
  }

  toggleTheme() {
    const next = this.currentTheme === "dark" ? "light" : "dark";
    this.setTheme(next);
    this.showToast(`Switched to ${next.toUpperCase()} mode`);
  }

  initAuthNavbar() {
    const nameEl = document.getElementById("nav-user-name");
    const avatarEl = document.getElementById("nav-avatar-initials");
    if (nameEl) nameEl.textContent = this.profile.profile.name.split(" ")[0];
    if (avatarEl) avatarEl.textContent = "TG";
  }

  renderAll() {
    this.renderStats();
    this.renderGauge();
    this.renderJobs();
    this.renderApplications();
    this.renderOutreach();
  }

  renderStats() {
    const stats = this.jobs.getStats();
    const dis = document.getElementById("stat-discovered");
    const ver = document.getElementById("stat-verified");
    const mat = document.getElementById("stat-match");
    const pen = document.getElementById("stat-pending");

    if (dis) dis.textContent = stats.discovered;
    if (ver) ver.textContent = stats.verified;
    if (mat) mat.textContent = `${stats.maxMatch}%`;
    if (pen) pen.textContent = stats.pending;
  }

  renderGauge() {
    const scoreText = document.getElementById("gauge-score-text");
    const pctText = document.getElementById("gauge-pct-text");
    const subText = document.getElementById("target-gauge-sub");
    const bar = document.getElementById("target-progress-bar");
    const circle = document.getElementById("gauge-circle");

    const applied = this.profile.dailyApplied;
    const target = this.profile.dailyTarget;
    const pct = Math.min(100, Math.round((applied / target) * 100));

    if (scoreText) scoreText.textContent = `${applied} / ${target} applied today`;
    if (pctText) pctText.textContent = `${pct}%`;
    if (subText) subText.textContent = `${pct}% completed towards daily target`;
    if (bar) bar.style.width = `${pct}%`;

    if (circle) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (pct / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }
  }

  renderJobs() {
    const grid = document.getElementById("jobs-grid-container");
    if (!grid) return;

    const filtered = this.jobs.getFiltered();
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-card-msg mono">No jobs matching criteria. Try adjusting filters.</div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((job) => {
        const badgeClass =
          job.verified === "VERIFIED"
            ? "badge-verified"
            : job.verified === "NEEDS REVIEW"
            ? "badge-review"
            : "badge-suspicious";

        const badgeIcon =
          job.verified === "VERIFIED" ? "✓" : job.verified === "NEEDS REVIEW" ? "⚠" : "✗";

        return `
        <article class="card job-card" id="card-${job.company.replace(/[^a-zA-Z0-9]/g, "")}">
          <div class="job-card-header">
            <div class="company-brand-wrap">
              <span class="company-avatar mono">${job.company.slice(0, 2).toUpperCase()}</span>
              <div>
                <span class="company-name">${job.company}</span>
                <span class="portal-source-tag mono">via ${job.portal}</span>
              </div>
            </div>
            <span class="badge ${badgeClass} mono">${badgeIcon} ${job.verified}</span>
          </div>

          <h3 class="role-title">${job.role}</h3>

          <div class="job-tags-row mono">
            <span class="tag-chip mono">📍 ${job.location}</span>
            <span class="tag-chip mono">🏢 ${job.type}</span>
            <span class="tag-chip mono">💰 ${job.salary}</span>
          </div>

          <div class="match-bar-block">
            <div class="match-label-row">
              <span class="input-label mono">Match Alignment</span>
              <span class="match-score-val mono">${job.match}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${job.match}%;"></div>
            </div>
          </div>

          <div class="match-reason-box">
            <span class="mono match-reason-italic">"Why matched: ${job.reason}"</span>
          </div>

          <div class="job-card-actions">
            <button class="btn btn-violet btn-sm" onclick="app.reviewJob('${job.company}')">Review & Apply</button>
            <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm btn-redirect" title="Open official job posting">
              <span>Visit Portal</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
            <button class="btn btn-ghost btn-sm" onclick="app.skipJob('${job.company}')">Skip</button>
            <button class="btn btn-ghost btn-sm" onclick="app.emailHRForJob('${job.company}')">Email HR</button>
          </div>
        </article>
      `;
      })
      .join("");
  }

  renderApplications() {
    const tbody = document.getElementById("applications-table-body");
    if (!tbody) return;

    this.updateTabCounters();
    const rows = this.apps.getByTab();

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-table-msg mono">No applications under ${this.apps.activeTab} status.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map(
        (appItem) => `
      <tr onclick="app.reviewJob('${appItem.company}')" title="Click to inspect application package">
        <td class="text-bold">${appItem.company}</td>
        <td>${appItem.role}</td>
        <td><span class="tag-chip mono">${appItem.portal}</span></td>
        <td><span class="badge badge-verified mono">${appItem.status}</span></td>
        <td class="mono text-secondary">${appItem.date}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); app.reviewJob('${appItem.company}')">Inspect →</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  updateTabCounters() {
    const pEl = document.getElementById("tab-count-pending");
    const aEl = document.getElementById("tab-count-applied");
    const iEl = document.getElementById("tab-count-interview");
    const rEl = document.getElementById("tab-count-rejected");

    if (pEl) pEl.textContent = this.apps.getCount("Pending");
    if (aEl) aEl.textContent = this.apps.getCount("Applied");
    if (iEl) iEl.textContent = this.apps.getCount("Interview");
    if (rEl) rEl.textContent = this.apps.getCount("Rejected");
  }

  renderOutreach() {
    const tbody = document.getElementById("outreach-table-body");
    if (!tbody) return;

    tbody.innerHTML = this.outreach.contacts
      .map(
        (c) => `
      <tr onclick="app.selectOutreach('${c.email}')" title="Click to load cold email draft">
        <td class="text-bold">${c.name}</td>
        <td>${c.company}</td>
        <td><span class="tag-chip mono">${c.portal}</span></td>
        <td class="mono text-secondary">${c.email}</td>
        <td><span class="badge badge-review mono">${c.status}</span></td>
        <td>
          <div class="actions-flex" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" onclick="app.copyOutreach('${c.email}')">Copy</button>
            <button class="btn btn-ghost btn-sm" onclick="app.openGmail('${c.email}')">Gmail</button>
            <button class="btn btn-ghost btn-sm" onclick="app.markOutreachSent('${c.email}')">Sent</button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");

    this.updateDraftBox();
  }

  selectOutreach(email) {
    this.outreach.select(email);
    this.updateDraftBox();
    this.showToast(`Loaded outreach draft for ${this.outreach.selected.name}`);
  }

  updateDraftBox() {
    const draftBox = document.getElementById("outreach-draft-body");
    const recEl = document.getElementById("draft-recipient-name");
    if (recEl) recEl.textContent = `${this.outreach.selected.name} (${this.outreach.selected.company})`;
    if (draftBox) draftBox.textContent = this.outreach.generateDraft(this.outreach.selected);
  }

  copyOutreach(email) {
    this.outreach.select(email);
    const text = this.outreach.generateDraft(this.outreach.selected);
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`✓ Email draft copied to clipboard`);
    });
  }

  openGmail(email) {
    this.outreach.select(email);
    const draft = this.outreach.generateDraft(this.outreach.selected);
    const subject = encodeURIComponent(`Application: AI/ML Engineering Intern — ${CANDIDATE_PROFILE.name}`);
    const body = encodeURIComponent(draft);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`, "_blank");
  }

  markOutreachSent(email) {
    this.outreach.markSent(email);
    this.renderOutreach();
    this.showToast(`✓ Marked outreach to ${email} as Sent`);
  }

  reviewJob(company) {
    const job = this.jobs.findByCompany(company);
    this.currentInspectingJob = job;

    const rTitle = document.getElementById("panel-role-title");
    const cName = document.getElementById("panel-company-name");
    const link = document.getElementById("panel-redirect-link");
    const bullets = document.getElementById("panel-cv-bullets");
    const letter = document.getElementById("panel-cover-letter");

    if (rTitle) rTitle.textContent = job.role;
    if (cName) cName.textContent = `${job.company} (${job.portal})`;
    if (link) link.href = job.url;

    if (bullets) {
      bullets.innerHTML = `
        <li>Engineered real-time UPI anomaly detection pipeline (FraudLens) achieving 94.2% precision on 120,000 transaction records with sub-50ms inference.</li>
        <li>Developed deep learning pharmaceutical classifier (MedVerify) combining PyTorch CNNs with PaddleOCR for 98.1% verification accuracy.</li>
        <li>Containerized modular FastAPI microservices with Docker, implementing structured logging, ONNX runtime acceleration, and PostgreSQL persistence.</li>
      `;
    }

    if (letter) {
      letter.textContent = `Dear Hiring Team at ${job.company},

I am excited to apply for the ${job.role} position found via ${job.portal}. As a final-year AI & Data Science undergraduate at ${CANDIDATE_PROFILE.college} with an 8.19 CGPA, I bring demonstrated expertise in algorithmic anomaly detection and deep learning systems.

In my project FraudLens, I designed automated scoring pipelines in Python and Scikit-Learn that match the core engineering requirements of ${job.company}. I look forward to contributing to your team's mission.

Best regards,
${CANDIDATE_PROFILE.name}`;
    }

    this.openSidePanel();
  }

  openSidePanel() {
    const panel = document.getElementById("slide-panel");
    const backdrop = document.getElementById("side-panel-backdrop");
    if (!panel || !backdrop) return;

    backdrop.classList.add("open");
    if (typeof gsap !== "undefined") {
      gsap.fromTo(panel, { x: 400 }, { x: 0, duration: 0.3, ease: "power3.out" });
    } else {
      panel.style.transform = "translateX(0)";
    }
  }

  closeSidePanel() {
    const panel = document.getElementById("slide-panel");
    const backdrop = document.getElementById("side-panel-backdrop");
    if (!panel || !backdrop) return;

    if (typeof gsap !== "undefined") {
      gsap.to(panel, {
        x: 400,
        duration: 0.25,
        ease: "power3.in",
        onComplete: () => backdrop.classList.remove("open")
      });
    } else {
      backdrop.classList.remove("open");
    }
  }

  submitCurrentApplication() {
    if (!this.currentInspectingJob) return;
    this.apps.submit(this.currentInspectingJob.company);
    this.profile.incrementApplied();
    this.renderGauge();
    this.renderApplications();
    this.renderStats();
    this.closeSidePanel();
    this.showToast(`✓ Application approved & submitted to ${this.currentInspectingJob.company}!`);
  }

  skipJob(company) {
    const card = document.getElementById(`card-${company.replace(/[^a-zA-Z0-9]/g, "")}`);
    if (card && typeof gsap !== "undefined") {
      gsap.to(card, {
        x: 40,
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          this.jobs.skip(company);
          this.renderJobs();
          this.renderStats();
        }
      });
    } else {
      this.jobs.skip(company);
      this.renderJobs();
      this.renderStats();
    }
    this.showToast(`Skipped ${company}`);
  }

  skipTopJob() {
    const card = document.getElementById("top-pending-card");
    if (card && typeof gsap !== "undefined") {
      gsap.to(card, {
        x: 40,
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          card.style.display = "none";
        }
      });
    } else if (card) {
      card.style.display = "none";
    }
    this.showToast("Skipped top pending job");
  }

  allowRun() {
    this.isPaused = false;
    const btn = document.getElementById("btn-allow-run");
    if (btn) btn.innerHTML = `<span>✓ Run Triggered</span>`;
    setTimeout(() => {
      if (btn) btn.innerHTML = `<span>▶ Allow Today's Run</span>`;
    }, 2000);
    this.showToast("▶ Today's autonomous run dispatched across 11 portals");
  }

  pauseAgent() {
    this.isPaused = !this.isPaused;
    const label = document.getElementById("agent-status-label");
    const btn = document.getElementById("btn-pause-agent");
    if (this.isPaused) {
      if (label) label.textContent = "Agent Paused · Standby";
      if (btn) btn.innerHTML = `<span>▶ Resume</span>`;
      this.showToast("⏸ Agent paused");
    } else {
      if (label) label.textContent = "Agent Online · 11 Portals Scanned";
      if (btn) btn.innerHTML = `<span>⏸ Pause</span>`;
      this.showToast("▶ Agent resumed");
    }
  }

  navigateTo(sectionId) {
    const sections = ["auth", "dashboard", "jobs", "applications", "outreach", "profile"];
    sections.forEach((s) => {
      const el = document.getElementById(`section-${s}`);
      const btn = document.getElementById(`nav-${s}`);
      if (el) el.classList.toggle("active", s === sectionId);
      if (btn) btn.classList.toggle("active", s === sectionId);
    });

    const menu = document.getElementById("nav-menu");
    if (menu) menu.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setFilter(kind, val, btnEl) {
    if (kind === "type") {
      this.jobs.setTypeFilter(val);
      const row = document.getElementById("type-pills-row");
      if (row) row.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    } else if (kind === "portal") {
      this.jobs.setPortalFilter(val);
      const row = document.getElementById("portal-pills-row");
      if (row) row.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    }
    if (btnEl) {
      btnEl.classList.add("active");
      if (typeof gsap !== "undefined") {
        gsap.fromTo(btnEl, { scale: 0.95 }, { scale: 1, duration: 0.15 });
      }
    }
    this.renderJobs();
  }

  searchJobs(query) {
    this.jobs.setSearchQuery(query);
    this.renderJobs();
  }

  handleCopilotSubmit() {
    const input = document.getElementById("copilot-input");
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    this.jobs.setSearchQuery(query);
    this.renderJobs();
    this.navigateTo("jobs");
    this.showToast(`Copilot filtered jobs for: "${query}"`);
    input.value = "";
  }

  saveProfileForm() {
    const name = document.getElementById("prof-name")?.value;
    const email = document.getElementById("prof-email")?.value;
    const college = document.getElementById("prof-college")?.value;
    const degree = document.getElementById("prof-degree")?.value;
    const cgpa = document.getElementById("prof-cgpa")?.value;

    this.profile.save({ name, email, college, degree, cgpa });
    this.initAuthNavbar();
    this.showToast("✓ Profile saved successfully");
  }

  initGSAP() {
    if (typeof gsap === "undefined") return;

    gsap.from(".hero-anim-item", {
      opacity: 0,
      y: 16,
      stagger: 0.1,
      duration: 0.4,
      ease: "power2.out"
    });

    const statNums = document.querySelectorAll(".stat-number");
    statNums.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-target") || "0");
      const suffix = el.getAttribute("data-suffix") || "";
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.2,
        ease: "power1.out",
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + suffix;
        }
      });
    });
  }

  showToast(message) {
    const shelf = document.getElementById("toast-shelf");
    if (!shelf) return;
    const toast = document.createElement("div");
    toast.className = "toast mono";
    toast.textContent = message;
    shelf.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 200ms ease";
      setTimeout(() => toast.remove(), 200);
    }, 2400);
  }

  bindEvents() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeSidePanel();
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        const searchInput = document.getElementById("jobs-search-input");
        if (searchInput) {
          this.navigateTo("jobs");
          searchInput.focus();
        }
      }
    });

    const dropzone = document.getElementById("resume-dropzone");
    const fileInput = document.getElementById("resume-file-input");
    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
          this.showToast(`✓ Uploaded resume: ${e.target.files[0].name}`);
        }
      });
    }
  }
}

// Global Application Instance
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new ApplyBotApp();
  app.init();
});

// Bridge functions for HTML onclick attributes
function navigateTo(section) { app.navigateTo(section); }
function setThemeMode(mode) { app.setTheme(mode); }
function toggleTheme() { app.toggleTheme(); }
function setFilter(kind, val, el) { app.setFilter(kind, val, el); }
function filterJobs() {
  const input = document.getElementById("jobs-search-input");
  if (input) app.searchJobs(input.value);
}
function reviewJob(company) { app.reviewJob(company); }
function skipJob(company) { app.skipJob(company); }
function skipTopJob() { app.skipTopJob(); }
function allowTodaysRun() { app.allowRun(); }
function pauseAgent() { app.pauseAgent(); }
function closeSidePanel() { app.closeSidePanel(); }
function closeSidePanelOnBackdrop(e) { if (e.target.id === "side-panel-backdrop") app.closeSidePanel(); }
function submitCurrentApplication() { app.submitCurrentApplication(); }
function switchPanelTab(tab) {
  ["cv", "letter", "qa"].forEach((t) => {
    document.getElementById(`ptab-${t}`)?.classList.toggle("active", t === tab);
    document.getElementById(`pane-${t}`)?.classList.toggle("active", t === tab);
  });
}
function copyOutreachEmail() { app.copyOutreach(app.outreach.selected.email); }
function openOutreachGmail() { app.openGmail(app.outreach.selected.email); }
function markOutreachSent() { app.markOutreachSent(app.outreach.selected.email); }
function saveProfile() { app.saveProfileForm(); }
function handleBellClick() { app.showToast("🔔 12 verified openings detected today across 11 portals"); }
function toggleMobileMenu() {
  const menu = document.getElementById("nav-menu");
  if (menu) menu.classList.toggle("open");
}
function handleCopilotKey(e) { if (e.key === "Enter") app.handleCopilotSubmit(); }
function handleCopilotSubmit() { app.handleCopilotSubmit(); }
function setAppTab(tab, btn) {
  app.apps.setTab(tab);
  document.querySelectorAll(".status-tab-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  app.renderApplications();
}
function setAuthTab(mode) {
  const tabIn = document.getElementById("auth-tab-signin");
  const tabReg = document.getElementById("auth-tab-register");
  const regFields = document.getElementById("auth-register-fields");
  const subBtn = document.getElementById("auth-submit-btn");

  if (mode === "signin") {
    tabIn?.classList.add("active");
    tabReg?.classList.remove("active");
    regFields?.classList.add("auth-register-hidden");
    if (subBtn) subBtn.textContent = "Authenticate & Enter ApplyBot →";
  } else {
    tabReg?.classList.add("active");
    tabIn?.classList.remove("active");
    regFields?.classList.remove("auth-register-hidden");
    if (subBtn) subBtn.textContent = "Register & Connect Portals →";
  }
}
function quickFillCandidate(type) {
  const emailInput = document.getElementById("auth-email");
  const nameInput = document.getElementById("auth-name");
  const instInput = document.getElementById("auth-institution");
  if (type === "twinkle") {
    if (emailInput) emailInput.value = "twinkle.ghangare@gmail.com";
    if (nameInput) nameInput.value = "Twinkle Ghangare";
    if (instInput) instInput.value = "KDK College of Engineering, Nagpur";
    app.showToast("Loaded Twinkle Ghangare (KDK College, CGPA 8.19)");
  } else {
    if (emailInput) emailInput.value = "guest.candidate@applybot.ai";
    if (nameInput) nameInput.value = "Guest Candidate";
    if (instInput) instInput.value = "Open Academic Sandbox";
    app.showToast("Loaded Guest candidate profile");
  }
}
function handleAuthSubmit() {
  const name = document.getElementById("auth-name")?.value || "Twinkle Ghangare";
  const email = document.getElementById("auth-email")?.value || "twinkle.ghangare@gmail.com";
  app.profile.save({ name, email });
  app.initAuthNavbar();
  app.showToast(`✓ Authenticated as ${name}`);
  app.navigateTo("dashboard");
}
