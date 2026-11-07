// ============================================================================
// ApplyBot — Autonomous AI Career Agent Controller
// Candidate: Twinkle Ghangare (B.Tech AI & Data Science, KDK College Nagpur, CGPA 8.19)
// Three.js (300 particles with mouse repulsion) + GSAP Smooth Motion Suite
// Inspired by Haris Hamza Ali (particle physics + typewriter) & Cosmic Dark SaaS
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

let currentJobs = [...JOBS];
let activeTypeFilter = "all";
let activePortalFilter = "all";
let activeAppTab = "Pending";
let activeDraftRecipient = HR_CONTACTS[0];
let currentInspectingJob = JOBS[0];
let dailyAppliedCount = 3;
const dailyTargetCount = 25;
let lastScrollY = 0;

// Three.js State
let threeScene, threeCamera, threeRenderer, starGeometry;
let starfieldAnimId = null;
let isStarfieldActive = true;
let particleBases = [];
let particleCurrents = [];
let mouse = { x: -9999, y: -9999, active: false };

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initGSAPNavbar();
  initThreeInteractiveStarfield();
  initTypewriterTagline();
  renderJobsGrid();
  renderApplicationsTable();
  renderOutreachTable();
  updateOutreachDraft(HR_CONTACTS[0]);
  setupKeyboardListeners();
  setupDropzone();
  fetchLiveBackendData();

  triggerDashboardGSAP();
});

// ============================================================================
// 1. THREE.JS: 300-PARTICLE STAR FIELD WITH MOUSE REPULSION PHYSICS
// ============================================================================

function initThreeInteractiveStarfield() {
  const container = document.getElementById("hero-canvas-container");
  const heroWrapper = document.getElementById("hero-wrapper");
  if (!container || !heroWrapper || window.innerWidth < 768 || typeof THREE === "undefined") {
    return;
  }

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 450;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  threeCamera.position.z = 240;

  threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(threeRenderer.domElement);

  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x7C5CFF); // Violet
  const color2 = new THREE.Color(0x30DC97); // Mint
  const color3 = new THREE.Color(0x9A9AA5); // Silver

  particleBases = [];
  particleCurrents = [];

  for (let i = 0; i < particleCount; i++) {
    const bx = (Math.random() - 0.5) * 580;
    const by = (Math.random() - 0.5) * 360;
    const bz = (Math.random() - 0.5) * 180;

    particleBases.push({ x: bx, y: by, z: bz, seed: Math.random() * 10 });
    particleCurrents.push({ x: bx, y: by, z: bz });

    positions[i * 3] = bx;
    positions[i * 3 + 1] = by;
    positions[i * 3 + 2] = bz;

    const r = Math.random();
    const c = r < 0.4 ? color1 : r < 0.7 ? color2 : color3;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.65
  });

  const starPoints = new THREE.Points(starGeometry, material);
  threeScene.add(starPoints);

  // Mouse hover tracking over hero container (repels particles)
  heroWrapper.addEventListener("pointermove", (e) => {
    const rect = heroWrapper.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left - rect.width / 2);
    mouse.y = -(e.clientY - rect.top - rect.height / 2);
    mouse.active = true;
  });

  heroWrapper.addEventListener("pointerleave", () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let clock = 0;
  function animateStars() {
    if (!isStarfieldActive) return;
    starfieldAnimId = requestAnimationFrame(animateStars);
    clock += 0.015;

    const posAttr = starGeometry.attributes.position;
    const arr = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const base = particleBases[i];
      const cur = particleCurrents[i];

      // Gentle ambient drift
      const targetX = base.x + Math.sin(clock + base.seed) * 5;
      const targetY = base.y + Math.cos(clock * 0.8 + base.seed) * 5;

      // Mouse repulsion physics
      if (mouse.active) {
        const dx = cur.x - mouse.x;
        const dy = cur.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist > 0.1) {
          const force = (1 - dist / 110) * 18;
          cur.x += (dx / dist) * force;
          cur.y += (dy / dist) * force;
        }
      }

      // Spring return to base
      cur.x += (targetX - cur.x) * 0.06;
      cur.y += (targetY - cur.y) * 0.06;

      arr[i * 3] = cur.x;
      arr[i * 3 + 1] = cur.y;
    }

    posAttr.needsUpdate = true;
    starPoints.rotation.z += 0.0002;
    threeRenderer.render(threeScene, threeCamera);
  }
  animateStars();

  // Pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    isStarfieldActive = !document.hidden;
    if (isStarfieldActive) {
      cancelAnimationFrame(starfieldAnimId);
      animateStars();
    }
  });

  // Resize listener
  window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
      if (threeRenderer && threeRenderer.domElement) {
        threeRenderer.domElement.style.display = "none";
      }
      isStarfieldActive = false;
      return;
    }
    if (threeRenderer && threeRenderer.domElement) {
      threeRenderer.domElement.style.display = "block";
    }
    isStarfieldActive = true;
    const nw = container.clientWidth || 800;
    const nh = container.clientHeight || 450;
    threeCamera.aspect = nw / nh;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(nw, nh);
  });
}

// ============================================================================
// 2. GSAP TYPEWRITER TAGLINE CYCLE (Haris Hamza Ali + Space Reference)
// ============================================================================

function initTypewriterTagline() {
  const el = document.getElementById("hero-typed-text");
  if (!el || typeof gsap === "undefined") return;

  const taglines = [
    "scanning 8 portals for ML intern opportunities",
    "evaluating FraudLens scam heuristics & 94.2% precision",
    "auto-generating tailored cover letters in real-time",
    "24 verified tech opportunities queued for review"
  ];
  let idx = 0;

  function cycle() {
    gsap.delayedCall(2.8, () => {
      const cur = taglines[idx];
      idx = (idx + 1) % taglines.length;
      const nxt = taglines[idx];
      const tracker = { n: cur.length };

      gsap.timeline({ onComplete: cycle })
        // Backspace
        .to(tracker, {
          n: 0,
          duration: cur.length * 0.02,
          ease: "none",
          onUpdate: () => {
            el.innerText = cur.slice(0, Math.round(tracker.n)) || "\u200B";
          }
        })
        // Type forward
        .to(tracker, {
          n: nxt.length,
          duration: nxt.length * 0.035,
          ease: "none",
          onUpdate: () => {
            el.innerText = nxt.slice(0, Math.round(tracker.n)) || "\u200B";
          }
        });
    });
  }
  cycle();
}

// ============================================================================
// 3. GSAP MOTION SUITE (Exact Specs)
// ============================================================================

function triggerDashboardGSAP() {
  if (typeof gsap === "undefined") return;

  // 1. Hero — gsap.from title/subtitle/buttons stagger 0.2s
  gsap.from(".hero-anim-item", {
    opacity: 0,
    y: 18,
    stagger: 0.2,
    duration: 0.55,
    ease: "power2.out"
  });

  // 2. Stats — stagger 0.1s scale+fade on load
  gsap.from(".stat-card", {
    opacity: 0,
    scale: 0.95,
    stagger: 0.1,
    duration: 0.5,
    ease: "back.out(1.5)"
  });

  // 3. Counters — gsap count-up 1.5s
  animateCountersGSAP();

  // 4. Progress — gsap.to width 1.2s ease-out
  updateTargetProgressGSAP(dailyAppliedCount, dailyTargetCount);
}

function animateCountersGSAP() {
  if (typeof gsap === "undefined") return;

  document.querySelectorAll(".stat-number[data-target]").forEach((el) => {
    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const counterObj = { val: 0 };

    gsap.to(counterObj, {
      val: target,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        el.innerText = Math.round(counterObj.val) + suffix;
      }
    });
  });
}

function updateTargetProgressGSAP(count, target) {
  const pct = Math.round((count / target) * 100);
  const scoreText = document.getElementById("gauge-score-text");
  const sub = document.getElementById("target-gauge-sub");
  if (scoreText) scoreText.innerText = `${count} / ${target} applied today`;
  if (sub) sub.innerText = `${pct}% completed towards daily target`;

  if (typeof gsap !== "undefined") {
    // Progress — gsap.to width 1.2s ease-out
    gsap.to("#target-progress-bar", {
      width: pct + "%",
      duration: 1.2,
      ease: "power2.out"
    });
  } else {
    const bar = document.getElementById("target-progress-bar");
    if (bar) bar.style.width = pct + "%";
  }
}

// 5. Navbar — ScrollTrigger hide/show y:-56px 0.3s
function initGSAPNavbar() {
  window.addEventListener("scroll", () => {
    const cur = window.scrollY;
    if (typeof gsap !== "undefined") {
      if (cur > 65 && cur > lastScrollY) {
        gsap.to("#main-navbar", { y: -56, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to("#main-navbar", { y: 0, duration: 0.3, ease: "power2.out" });
      }
    }
    lastScrollY = cur;
  });
}

// 6. Jobs — ScrollTrigger fade-up stagger 0.08s
function animateJobsGSAP() {
  if (typeof gsap === "undefined") return;

  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".job-card", {
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#jobs-grid",
        start: "top 85%"
      }
    });
  } else {
    gsap.from(".job-card", {
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.4,
      ease: "power2.out"
    });
  }
}

// ============================================================================
// 4. THEME TOGGLE (0.2s CSS transition, localStorage)
// ============================================================================

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

function toggleMobileMenu() {
  const m = document.getElementById("nav-menu");
  if (m) m.classList.toggle("open");
}

// ============================================================================
// 5. NAVIGATION (5 Numbered Screens)
// ============================================================================

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
  }
  if (targetNav) targetNav.classList.add("active");

  const m = document.getElementById("nav-menu");
  if (m) m.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "dashboard") {
    triggerDashboardGSAP();
  } else if (id === "jobs") {
    animateJobsGSAP();
  }
}

// ============================================================================
// 6. AGENT CONTROLS
// ============================================================================

function allowTodaysRun() {
  const btn = document.getElementById("btn-allow-run");
  if (!btn) return;
  btn.innerText = "⏳ Running Agent...";
  btn.style.opacity = "0.7";
  showToast("Autonomous Agent running: Evaluating 24 opportunities...");

  setTimeout(() => {
    dailyAppliedCount = Math.min(dailyTargetCount, dailyAppliedCount + 1);
    updateTargetProgressGSAP(dailyAppliedCount, dailyTargetCount);
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
    if (typeof gsap !== "undefined") {
      gsap.to(card, {
        x: 40,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          card.innerHTML = `
            <div class="top-card-header">
              <span class="top-company-name">Queue Clear</span>
              <span class="badge badge-verified mono">✓ COMPLETE</span>
            </div>
            <h3 class="top-role-title">All high-priority jobs reviewed</h3>
            <div class="top-card-tags mono">Visit the Jobs section to discover new matches.</div>
          `;
          gsap.fromTo(card, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.25 });
        }
      });
    } else {
      card.innerHTML = `
        <div class="top-card-header">
          <span class="top-company-name">Queue Clear</span>
          <span class="badge badge-verified mono">✓ COMPLETE</span>
        </div>
        <h3 class="top-role-title">All high-priority jobs reviewed</h3>
        <div class="top-card-tags mono">Visit the Jobs section to discover new matches.</div>
      `;
    }
  }
  showToast("Skipped top priority pending job.");
}

// ============================================================================
// 7. SCREEN 2: JOBS (Filter Scale Bounce & OpenTrain Grid)
// ============================================================================

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
  // Filter pill — scale bounce 0.08s on click
  if (typeof gsap !== "undefined" && btn) {
    gsap.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.12, ease: "back.out(2)" });
  }

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

// Skip card — x:40 opacity:0 0.25s then remove
function skipJob(company) {
  const cardId = `card-${company.replace(/\\s+/g, "")}`;
  const el = document.getElementById(cardId);
  if (el) {
    if (typeof gsap !== "undefined") {
      gsap.to(el, {
        x: 40,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          currentJobs = currentJobs.filter((j) => j.company !== company);
          renderJobsGrid();
        }
      });
    } else {
      currentJobs = currentJobs.filter((j) => j.company !== company);
      renderJobsGrid();
    }
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

// ============================================================================
// 8. SCREEN 3: APPLICATIONS & SLIDE PANEL (fromTo x:400->0 0.3s power3.out)
// ============================================================================

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
  const panel = document.getElementById("slide-panel");
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

  // Panel open — fromTo x:400->0 0.3s power3.out
  if (typeof gsap !== "undefined" && panel) {
    gsap.fromTo(panel, { x: 400 }, { x: 0, duration: 0.3, ease: "power3.out" });
  }
}

function closeSidePanel() {
  const backdrop = document.getElementById("side-panel-backdrop");
  const panel = document.getElementById("slide-panel");
  if (typeof gsap !== "undefined" && panel) {
    gsap.to(panel, {
      x: 400,
      duration: 0.25,
      ease: "power3.in",
      onComplete: () => {
        if (backdrop) backdrop.classList.remove("open");
      }
    });
  } else {
    if (backdrop) backdrop.classList.remove("open");
  }
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
  updateTargetProgressGSAP(dailyAppliedCount, dailyTargetCount);

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

// ============================================================================
// 9. SCREEN 4: HR OUTREACH
// ============================================================================

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

// ============================================================================
// 10. SCREEN 5: PROFILE & DROPZONE
// ============================================================================

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

// ============================================================================
// 11. TOAST & KEYBOARD LISTENERS
// ============================================================================

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

// ============================================================================
// 12. LIVE BACKEND SYNC
// ============================================================================

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
        }
        if (verEl && stats.verified_jobs) {
          verEl.setAttribute("data-target", stats.verified_jobs);
        }
        if (pendEl && stats.pending_approvals) {
          pendEl.setAttribute("data-target", stats.pending_approvals);
        }
        animateCountersGSAP();
      }
    }
  } catch (e) {}
}
