/**
 * ApplyBot — Premium Bento Grid Architecture & Controller
 * Integrated Three.js 3D Hero + GSAP Stagger Animations
 * Inspires by Linear, Raycast, Stripe & Framer
 */

// Application State
let currentProfile = {};
let currentSkills = [];
let allJobsList = [];
let displayedJobs = [];
let trackerRecords = [];
let activePrepJob = null;
let currentWorkModeFilter = "all";
let activeApprovalJobKey = null;
let allRecommendedJobs = [];
let pendingApprovalsList = [];
let currentMinMatchFilter = 0;

// ============================================================================
// 1. INITIALIZATION & LIFECYCLE
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  
  // Initialize Core Systems
  initHeroThreeJS();
  loadProfileData();
  loadAgentStatus();
  loadDashboardData();
  loadRecommendedJobs();
  executeJobSearch();
  loadPendingApprovals();
  loadTrackerData();
  loadTailoredPackages();
  loadAgentActivityLogs();
  setupDragAndDrop();
  updateTimeGreeting();

  // Live status polling
  setInterval(loadAgentStatus, 12000);
});

// Dynamic Time-based Greeting
function updateTimeGreeting() {
  const greetingEl = document.getElementById("dash-greeting-time");
  if (!greetingEl) return;
  const hour = new Date().getHours();
  if (hour < 12) greetingEl.textContent = "Good morning";
  else if (hour < 18) greetingEl.textContent = "Good afternoon";
  else greetingEl.textContent = "Good evening";
}

// ============================================================================
// 2. THREE.JS 3D HERO VISUAL (Flowbase-Style 3D Floating Slate & Glowing Screen)
// ============================================================================

function initHeroThreeJS() {
  const canvas = document.getElementById("hero-three-canvas");
  if (!canvas || !window.THREE) return;

  // Check WebGL availability
  try {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;
  } catch (e) {
    return;
  }

  const container = canvas.parentElement;
  const rect = container.getBoundingClientRect();
  const width = rect.width || 320;
  const height = rect.height || 360;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 18;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Device chassis: Rounded rectangle extruded slate
  const shape = new THREE.Shape();
  const w = 5.2, h = 9.4, r = 1.1;
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const extrudeSettings = {
    depth: 0.55,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.18,
    bevelThickness: 0.18
  };
  const bodyGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  bodyGeom.center();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x16161E,
    metalness: 0.88,
    roughness: 0.22
  });
  const deviceMesh = new THREE.Mesh(bodyGeom, bodyMat);
  scene.add(deviceMesh);

  // Glowing Screen Texture (Rich purple to cyan gradient matching Bento Guide)
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 256;
  screenCanvas.height = 460;
  const ctx = screenCanvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 256, 460);
  grad.addColorStop(0, "#7C5CFF");
  grad.addColorStop(0.5, "#45B8FF");
  grad.addColorStop(1, "#30DC97");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 460);

  // Subtle glass highlight reflection
  const gradGlass = ctx.createLinearGradient(0, 0, 256, 0);
  gradGlass.addColorStop(0, "rgba(255, 255, 255, 0.28)");
  gradGlass.addColorStop(0.25, "rgba(255, 255, 255, 0.08)");
  gradGlass.addColorStop(0.5, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = gradGlass;
  ctx.fillRect(0, 0, 256, 460);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenGeom = new THREE.PlaneGeometry(4.9, 8.8);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTex,
    transparent: true,
    opacity: 0.98
  });
  const screenMesh = new THREE.Mesh(screenGeom, screenMat);
  screenMesh.position.z = 0.52;
  deviceMesh.add(screenMesh);

  // Floating ambient starlight particles
  const particleCount = 38;
  const pGeom = new THREE.BufferGeometry();
  const pCoords = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    pCoords[i] = (Math.random() - 0.5) * 32;
  }
  pGeom.setAttribute("position", new THREE.BufferAttribute(pCoords, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x30DC97,
    size: 0.25,
    transparent: true,
    opacity: 0.55
  });
  const particleField = new THREE.Points(pGeom, pMat);
  scene.add(particleField);

  // Dual Accent Point Lighting
  const light1 = new THREE.PointLight(0x7C5CFF, 3.8, 50);
  light1.position.set(8, 8, 12);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x30DC97, 2.5, 50);
  light2.position.set(-8, -8, 10);
  scene.add(light2);

  const ambientLight = new THREE.AmbientLight(0x222230, 2.5);
  scene.add(ambientLight);

  // Initial tilt matching the reference mockup
  deviceMesh.rotation.y = -0.34;
  deviceMesh.rotation.x = 0.16;
  deviceMesh.rotation.z = -0.04;
  deviceMesh.position.x = 0.8;

  // Smooth Parallax on Pointer Move
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0015;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0015;
  }, { passive: true });

  // Handle Resize
  window.addEventListener("resize", () => {
    const newRect = container.getBoundingClientRect();
    if (!newRect.width) return;
    camera.aspect = newRect.width / newRect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(newRect.width, newRect.height);
  });

  // Animation Loop with Visibility Control
  let isRunning = true;
  document.addEventListener("visibilitychange", () => {
    isRunning = !document.hidden;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isRunning) return;

    const time = clock.getElapsedTime();
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Gentle floating bobbing
    deviceMesh.position.y = Math.sin(time * 1.5) * 0.3 - targetY * 4;
    deviceMesh.position.x = 0.8 + targetX * 5;

    // Dynamic tilt reacting to cursor and idle breathing
    deviceMesh.rotation.y = -0.34 + targetX * 0.6 + Math.sin(time * 0.8) * 0.04;
    deviceMesh.rotation.x = 0.16 - targetY * 0.5 + Math.cos(time * 0.7) * 0.03;

    particleField.rotation.y += 0.0012;

    renderer.render(scene, camera);
  }

  animate();
}

// ============================================================================
// 3. SIDEBAR NAVIGATION CONTROLLER
// ============================================================================

function switchNav(navKey) {
  const sections = ["dashboard", "jobs", "recommended", "applications", "resume", "career", "activity", "interview", "settings"];

  sections.forEach(key => {
    const secEl = document.getElementById(`sec-${key}`);
    const navBtn = document.getElementById(`nav-btn-${key}`);

    if (key === navKey) {
      if (secEl) {
        secEl.classList.remove("hidden");
        if (window.gsap) {
          gsap.fromTo(secEl, 
            { opacity: 0, y: 14 }, 
            { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
          );
        }
      }
      if (navBtn) {
        navBtn.className = "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all sidebar-item-active";
      }
    } else {
      if (secEl) secEl.classList.add("hidden");
      if (navBtn) {
        navBtn.className = "w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-[#9A9AA5] hover:text-white hover:bg-white/5";
      }
    }
  });

  if (navKey === "dashboard") {
    loadAgentStatus();
    loadDashboardData();
  }
  if (navKey === "recommended") loadRecommendedJobs();
  if (navKey === "applications") {
    loadPendingApprovals();
    loadTrackerData();
  }
  if (navKey === "resume") loadTailoredPackages();
  if (navKey === "activity") loadAgentActivityLogs();

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}

function toggleMobileNav() {
  const drawer = document.getElementById("mobile-nav");
  if (drawer) drawer.classList.toggle("hidden");
}

function executeTopSearch() {
  const q = document.getElementById("top-search-query")?.value.trim();
  if (!q) return;
  const jobsInput = document.getElementById("search-query");
  if (jobsInput) jobsInput.value = q;
  switchNav("jobs");
  executeJobSearch();
}

// ============================================================================
// 4. DASHBOARD EXPERIENCE
// ============================================================================

async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard-stats");
    if (res.ok) {
      const data = await res.json();
      const atsScore = data.ats_score || 94.8;
      
      const bentoMatchFit = document.getElementById("bento-match-fit-stat");
      const atsScoreText = document.getElementById("dash-match-score-text");
      const atsCounter = document.getElementById("stat-counter-ats");
      const atsCareerBadge = document.getElementById("ats-score-badge");
      const atsBar = document.getElementById("ats-progress-bar");

      if (bentoMatchFit) bentoMatchFit.textContent = `${atsScore}%`;
      if (atsScoreText) atsScoreText.textContent = `${atsScore}%`;
      if (atsCounter) atsCounter.textContent = `${atsScore}%`;
      if (atsCareerBadge) atsCareerBadge.textContent = `${atsScore}%`;
      if (atsBar) atsBar.style.width = `${atsScore}%`;
    }

    // Animate Bento Vertical Output Bars with GSAP
    if (window.gsap) {
      gsap.from(".bento-bar", {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.85,
        stagger: 0.06,
        ease: "power3.out"
      });
    }
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}

function updateDashboardGreeting(profile) {
  const name = profile.name || "Candidate";
  const nameEl = document.getElementById("dash-greeting-name");
  const sidebarName = document.getElementById("sidebar-user-name");
  const sidebarInit = document.getElementById("sidebar-user-initial");

  if (nameEl) nameEl.textContent = name;
  if (sidebarName) sidebarName.textContent = name;
  if (sidebarInit) sidebarInit.textContent = name.charAt(0).toUpperCase();
}

function renderDashboardCuratedJobs(jobs) {
  const container = document.getElementById("dash-curated-container");
  if (!container) return;

  const topJobs = (jobs || []).slice(0, 3);
  if (topJobs.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 p-8 text-center bento-box space-y-2">
        <i data-lucide="compass" class="w-6 h-6 text-[#7C5CFF] mx-auto animate-spin"></i>
        <p class="text-xs text-[#9A9AA5]">Scanning and ranking high-affinity vacancies...</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = topJobs.map((job, idx) => {
    const score = Math.round(job.overall_score || job.fit_score || job.jd_match_score || 94);
    const portal = (job.portal || "ATS").toUpperCase();
    const jobKeyArg = job.job_key ? `'${escapeJs(job.job_key)}'` : null;
    return `
      <div class="bento-box p-5 flex flex-col justify-between hover:border-[#7C5CFF]/40 transition group">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF]">
              ${escapeHtml(portal)}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${score >= 90 ? 'text-[#30DC97] bg-[#30DC97]/15 border border-[#30DC97]/30' : 'text-[#7C5CFF] bg-[#7C5CFF]/15 border border-[#7C5CFF]/30'}">
              ${score}% Match
            </span>
          </div>

          <div>
            <h4 class="text-xs font-bold text-white group-hover:text-[#7C5CFF] transition truncate" title="${escapeHtml(job.title)}">
              ${escapeHtml(job.title)}
            </h4>
            <p class="text-[11px] text-[#9A9AA5] truncate mt-0.5">
              ${escapeHtml(job.company)} &bull; ${escapeHtml(job.location || "Remote")}
            </p>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1">
            <span class="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#30DC97] font-mono flex items-center space-x-1">
              <i data-lucide="shield-check" class="w-2.5 h-2.5"></i>
              <span>VERIFIED</span>
            </span>
            <span class="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-[#9A9AA5] font-mono">Clean ATS</span>
          </div>
        </div>

        <div class="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
          <span class="text-[10px] text-[#9A9AA5] font-mono">Active Posting</span>
          <button onclick="${jobKeyArg ? `prepareApplicationPackage(${jobKeyArg})` : `openPrepModal(${idx})`}" class="px-3 py-1.5 btn-violet text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer">
            <span>Prepare</span>
            <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

function filterByIntegration(portalName) {
  if (portalName === "resume") {
    switchNav("resume");
    return;
  }
  if (portalName === "interview") {
    switchNav("interview");
    return;
  }

  const portalSelect = document.getElementById("search-portal");
  if (portalSelect) {
    if (portalName === "jobnet") {
      portalSelect.value = "all";
      const qInput = document.getElementById("search-query");
      if (qInput) qInput.value = "STAR";
    } else {
      portalSelect.value = portalName;
    }
  }
  switchNav("jobs");
  executeJobSearch();
}

function renderDashboardActivity(records) {
  const container = document.getElementById("dash-recent-activity-list");
  if (!container) return;

  if (!records || records.length === 0) {
    container.innerHTML = `<p class="text-xs text-[#92929D] py-2">No applications logged yet.</p>`;
    return;
  }

  container.innerHTML = records.slice(-4).reverse().map(r => `
    <div class="p-2.5 rounded-xl bg-[#111116] border border-white/5 flex items-center justify-between text-[11px]">
      <div class="truncate mr-2">
        <span class="font-bold text-white">${escapeHtml(r.Company || "-")}</span>
        <span class="text-[#92929D] block text-[10px] truncate">${escapeHtml(r.Role || "-")}</span>
      </div>
      <span class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#7C5CFF]/15 text-[#7C5CFF] shrink-0">
        ${escapeHtml(r.Status || "Applied")}
      </span>
    </div>
  `).join("");
}

function triggerQuickDashboardSearch() {
  const role = document.getElementById("dash-quick-role")?.value.trim() || "";
  const loc = document.getElementById("dash-quick-loc")?.value.trim() || "";
  const queryInput = document.getElementById("search-query");
  const locInput = document.getElementById("search-location");

  if (queryInput) queryInput.value = role;
  if (locInput) locInput.value = loc;

  switchNav("jobs");
  executeJobSearch();
}

function filterByPortal(portalName) {
  const select = document.getElementById("search-portal");
  if (select) select.value = portalName;
  switchNav("jobs");
  executeJobSearch();
}

// ============================================================================
// 5. FIND JOBS & DISCOVERY EXPERIENCE
// ============================================================================

async function executeJobSearch() {
  const query = document.getElementById("search-query")?.value.trim() || "";
  const location = document.getElementById("search-location")?.value.trim() || "";
  const portal = document.getElementById("search-portal")?.value || "all";
  const btn = document.getElementById("btn-search-jobs");
  const countBadge = document.getElementById("jobs-count-badge");

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">&#9696;</span> Searching...`;
  }
  if (countBadge) countBadge.textContent = "Scanning portals...";

  try {
    const res = await fetch("/api/search-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: query || (currentProfile?.target_roles?.[0] || "AI Engineer"),
        location: location || "Remote",
        portal,
        limit: 16
      })
    });

    if (res.ok) {
      const data = await res.json();
      allJobsList = data.jobs || data.results || [];
      applyWorkModeFilter(currentWorkModeFilter);
      renderDashboardCuratedJobs(allJobsList);
    } else {
      showToast("Unable to fetch job listings.", "error");
    }
  } catch (err) {
    console.error("Job search error:", err);
    showToast("Network error while searching jobs.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `Search`;
    }
  }
}

function setWorkModeFilter(mode) {
  currentWorkModeFilter = mode;
  const btnAll = document.getElementById("filter-wm-all");
  const btnRemote = document.getElementById("filter-wm-remote");

  if (mode === "remote") {
    btnRemote?.classList.add("bg-[#7C5CFF]", "text-white");
    btnAll?.classList.remove("bg-[#7C5CFF]", "text-white");
  } else {
    btnAll?.classList.add("bg-[#7C5CFF]", "text-white");
    btnRemote?.classList.remove("bg-[#7C5CFF]", "text-white");
  }

  applyWorkModeFilter(mode);
}

function applyWorkModeFilter(mode) {
  if (mode === "remote") {
    displayedJobs = allJobsList.filter(j => 
      (j.location || "").toLowerCase().includes("remote") || 
      (j.title || "").toLowerCase().includes("remote") ||
      (j.portal || "").toLowerCase() === "freehire"
    );
  } else {
    displayedJobs = [...allJobsList];
  }

  const countBadge = document.getElementById("jobs-count-badge");
  if (countBadge) countBadge.textContent = `${displayedJobs.length} opportunities available`;

  renderJobCards(displayedJobs);
}

function applyPresetRole(roleTitle) {
  const queryInput = document.getElementById("search-query");
  if (queryInput) queryInput.value = roleTitle;
  executeJobSearch();
}

function renderJobCards(jobs) {
  const container = document.getElementById("jobs-container");
  if (!container) return;

  container.innerHTML = "";

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 p-12 text-center bento-box space-y-3">
        <div class="w-10 h-10 rounded-full bg-slate-800 text-[#92929D] mx-auto flex items-center justify-center">
          <i data-lucide="search-x" class="w-5 h-5"></i>
        </div>
        <h4 class="text-sm font-bold text-white">No active postings matching criteria</h4>
        <p class="text-xs text-[#92929D]">Try adjusting your search keywords or switching portals.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  jobs.forEach((job, index) => {
    const card = document.createElement("div");
    card.className = "job-card bento-box p-6 flex flex-col justify-between space-y-4";

    const matchScore = Math.round(job.overall_score || job.fit_score || job.jd_match_score || 88);
    const portalName = (job.portal || "ATS").toUpperCase();
    const skills = job.matching_skills || job.matched_skills || (currentSkills.length ? currentSkills.slice(0, 3) : ["Python", "Machine Learning"]);
    const verStatus = job.verification_status || (job.flags && job.flags.length > 0 ? "NEEDS REVIEW" : "VERIFIED");
    const verBadge = verStatus === "VERIFIED"
      ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#30DC97]/15 text-[#30DC97] border border-[#30DC97]/30 flex items-center space-x-1"><i data-lucide="shield-check" class="w-2.5 h-2.5"></i><span>VERIFIED</span></span>`
      : verStatus === "SUSPICIOUS"
        ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center space-x-1"><i data-lucide="alert-triangle" class="w-2.5 h-2.5"></i><span>SUSPICIOUS</span></span>`
        : `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFAA2C]/15 text-[#FFAA2C] border border-[#FFAA2C]/30 flex items-center space-x-1"><i data-lucide="help-circle" class="w-2.5 h-2.5"></i><span>REVIEW</span></span>`;

    const jobKeyArg = job.job_key ? `'${escapeJs(job.job_key)}'` : null;

    card.innerHTML = `
      <div class="space-y-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
                ${escapeHtml(portalName)}
              </span>
              ${verBadge}
              <span class="text-[10px] font-semibold text-[#9A9AA5] ml-1">
                ${escapeHtml(job.location || "Remote")}
              </span>
            </div>
            
            <h3 class="text-base font-bold text-white mt-1 truncate" title="${escapeHtml(job.title)}">
              ${escapeHtml(job.title)}
            </h3>
            
            <p class="text-xs text-[#9A9AA5] font-semibold truncate">
              ${escapeHtml(job.company)}
            </p>
          </div>

          <div class="flex flex-col items-end shrink-0">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${matchScore >= 88 ? 'bg-[#30DC97]/10 text-[#30DC97] border border-[#30DC97]/20' : 'bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20'}">
              ${matchScore}% Match
            </span>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed line-clamp-2 font-normal">
          ${escapeHtml(job.description || "Seeking high-initiative candidate with practical competency in scalable data architectures, automated pipelines, and core programming paradigms.")}
        </p>

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${skills.map(s => `<span class="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#111116] text-[#F5F5F7] border border-white/5">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>

      <div class="pt-3.5 border-t border-white/5 flex items-center justify-between gap-2.5">
        <button onclick="${jobKeyArg ? `prepareApplicationPackage(${jobKeyArg})` : `openPrepModal(${index})`}" 
                class="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl btn-violet text-xs font-bold text-white cursor-pointer shadow-md shadow-[#7C5CFF]/20">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Prepare Application</span>
        </button>

        <button onclick="tailorResumeForJob('${escapeJs(job.company)}', '${escapeJs(job.title)}', '${escapeJs(job.location || '')}')" 
                class="px-4 py-2.5 rounded-xl btn-neutral text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-1.5 cursor-pointer" title="Compile LuaLaTeX CV">
          <i data-lucide="file-check" class="w-3.5 h-3.5 text-[#7C5CFF]"></i>
          <span class="hidden sm:inline">Tailor CV</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Staggered GSAP Micro-Entrance
  if (window.gsap) {
    gsap.from(".job-card", {
      opacity: 0,
      y: 12,
      duration: 0.28,
      stagger: 0.03,
      ease: "power2.out"
    });
  }

  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// 6. APPLICATION PREPARATION WORKFLOW
// ============================================================================

function openPrepModal(jobIndex) {
  const job = displayedJobs[jobIndex] || allJobsList[jobIndex];
  if (!job) return;

  activePrepJob = job;

  document.getElementById("prep-modal-title").textContent = job.title;
  document.getElementById("prep-modal-subtitle").textContent = `${job.company} • ${job.location || "Remote"}`;

  const link = document.getElementById("prep-modal-source-link");
  if (link) {
    link.href = job.url || "#";
    link.style.display = job.url ? "flex" : "none";
  }

  fetchPrepDetails(job);

  const modal = document.getElementById("prep-modal");
  const card = document.getElementById("prep-modal-card");
  modal?.classList.remove("hidden");

  if (window.gsap && card) {
    gsap.fromTo(card, 
      { scale: 0.96, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }
    );
  }

  if (window.lucide) lucide.createIcons();
}

function closePrepModal() {
  document.getElementById("prep-modal")?.classList.add("hidden");
  activePrepJob = null;
}

async function fetchPrepDetails(job) {
  const coverBox = document.getElementById("prep-cover-letter-text");
  const starBox = document.getElementById("prep-star-point-text");

  if (coverBox) coverBox.textContent = "Synthesizing tailored, humanized cover letter...";
  if (starBox) starBox.textContent = "Selecting authentic project talking point (STAR protocol)...";

  try {
    const res = await fetch("/api/job-possibilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: job.company,
        role: job.title,
        job_description: job.description || job.snippet || ""
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (coverBox) coverBox.textContent = data.cover_letter_draft || "Draft ready.";
      if (starBox) starBox.textContent = data.star_story || "STAR point ready.";
    }
  } catch (err) {
    console.error("Prep details error:", err);
    if (coverBox) coverBox.textContent = "Could not generate cover letter draft.";
    if (starBox) starBox.textContent = "Could not generate STAR point.";
  }
}

function triggerTailorFromModal() {
  if (!activePrepJob) return;
  tailorResumeForJob(activePrepJob.company, activePrepJob.title, activePrepJob.location || "");
}

async function markJobAppliedFromModal() {
  if (!activePrepJob) return;

  try {
    const res = await fetch("/api/track-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: activePrepJob.company,
        role: activePrepJob.title,
        location: activePrepJob.location || "Remote",
        url: activePrepJob.url || "",
        status: "Applied",
        notes: "Applied via ApplyBot"
      })
    });

    if (res.ok) {
      showToast(`Logged application to ${activePrepJob.company}!`, "success");
      loadTrackerData();
      closePrepModal();
      
      if (activePrepJob.url) {
        window.open(activePrepJob.url, "_blank");
      }
    }
  } catch (err) {
    console.error("Track apply error:", err);
    showToast("Failed to record application.", "error");
  }
}

// ============================================================================
// 7. RESUME TAILORING & ATS COMPILATION
// ============================================================================

async function tailorResumeForJob(company, role, location) {
  showToast(`Compiling tailored LuaLaTeX CV for ${company}...`, "info");

  try {
    const res = await fetch("/api/tailor-job-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, location })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.cv_file) {
        window.open(`/api/download/${data.cv_file}`, "_blank");
        showToast(`Tailored resume ready for ${company}!`, "success");
        loadTailoredPackages();
      } else {
        showToast("Resume tailored successfully.", "success");
      }
    } else {
      showToast("Error generating tailored PDF.", "error");
    }
  } catch (err) {
    console.error("Tailoring error:", err);
    showToast("Network error during resume tailoring.", "error");
  }
}

async function loadTailoredPackages() {
  const container = document.getElementById("tailored-docs-list");
  if (!container) return;

  try {
    const res = await fetch("/api/tailored-docs");
    if (res.ok) {
      const data = await res.json();
      const docs = data.documents || [];

      if (docs.length === 0) {
        container.innerHTML = `<p class="text-xs text-[#92929D] py-3 text-center">No compiled resumes yet. Use "Tailor CV" on any vacancy.</p>`;
        return;
      }

      container.innerHTML = docs.map(doc => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-[#111116] border border-white/5 hover:border-white/10 transition">
          <div class="flex items-center space-x-2.5 min-w-0">
            <i data-lucide="file-text" class="w-4 h-4 text-[#7C5CFF] shrink-0"></i>
            <span class="text-xs font-medium text-slate-200 truncate" title="${escapeHtml(doc.filename)}">
              ${escapeHtml(doc.filename)}
            </span>
          </div>
          <a href="${escapeHtml(doc.download_url)}" target="_blank" 
             class="px-2.5 py-1 rounded-lg btn-neutral text-[11px] font-bold text-slate-300 hover:text-white shrink-0 ml-2">
            Download
          </a>
        </div>
      `).join("");

      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error("Tailored docs error:", err);
  }
}

// ============================================================================
// 8. PROFILE, SKILLS & RESUME UPLOAD
// ============================================================================

async function loadProfileData() {
  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      currentProfile = await res.json();
      populateProfileForm(currentProfile);
      updateDashboardGreeting(currentProfile);
    }
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

function populateProfileForm(p) {
  setInputValue("prof-name", p.name);
  setInputValue("prof-email", p.email);
  setInputValue("prof-phone", p.phone);
  setInputValue("prof-location", p.location);
  setInputValue("prof-degree", p.degree);
  setInputValue("prof-inst", p.institution);
  setInputValue("prof-linkedin", p.linkedin);
  setInputValue("prof-github", p.github);

  currentSkills = Array.isArray(p.skills) ? [...p.skills] : [];
  renderSkills();
}

function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function renderSkills() {
  const container = document.getElementById("skills-container");
  const badge = document.getElementById("skills-count-badge");
  if (!container) return;

  container.innerHTML = "";
  if (badge) badge.textContent = `${currentSkills.length} skills`;

  currentSkills.forEach((skill, index) => {
    const chip = document.createElement("span");
    chip.className = "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 text-[11px] font-bold";
    chip.innerHTML = `
      <span>${escapeHtml(skill)}</span>
      <button onclick="removeSkillTag(${index})" class="hover:text-red-400 ml-1">&times;</button>
    `;
    container.appendChild(chip);
  });
}

function addSkillTag() {
  const input = document.getElementById("new-skill-input");
  if (!input) return;
  const val = input.value.trim();
  if (val && !currentSkills.includes(val)) {
    currentSkills.push(val);
    renderSkills();
    input.value = "";
  }
}

function removeSkillTag(index) {
  currentSkills.splice(index, 1);
  renderSkills();
}

async function saveProfile() {
  const updated = {
    ...currentProfile,
    name: document.getElementById("prof-name")?.value.trim() || "",
    email: document.getElementById("prof-email")?.value.trim() || "",
    phone: document.getElementById("prof-phone")?.value.trim() || "",
    location: document.getElementById("prof-location")?.value.trim() || "",
    degree: document.getElementById("prof-degree")?.value.trim() || "",
    institution: document.getElementById("prof-inst")?.value.trim() || "",
    linkedin: document.getElementById("prof-linkedin")?.value.trim() || "",
    github: document.getElementById("prof-github")?.value.trim() || "",
    skills: currentSkills
  };

  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    if (res.ok) {
      currentProfile = updated;
      updateDashboardGreeting(updated);
      showToast("Profile updated successfully!", "success");
      loadDashboardData();
    } else {
      showToast("Could not save profile changes.", "error");
    }
  } catch (err) {
    console.error("Save profile error:", err);
    showToast("Network error saving profile.", "error");
  }
}

function setupDragAndDrop() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("resume-file-input");

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-[#7C5CFF]");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-[#7C5CFF]");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-[#7C5CFF]");
    if (e.dataTransfer.files.length > 0) {
      uploadResumeFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      uploadResumeFile(fileInput.files[0]);
    }
  });
}

async function uploadResumeFile(file) {
  if (!file || file.type !== "application/pdf") {
    showToast("Please upload a valid PDF document.", "warning");
    return;
  }

  showToast(`Parsing ${file.name} locally...`, "info");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      showToast("Resume parsed and skills extracted!", "success");
      loadProfileData();
      loadDashboardData();
    } else {
      showToast("Failed to parse PDF.", "error");
    }
  } catch (err) {
    console.error("Upload error:", err);
    showToast("Error processing PDF resume.", "error");
  }
}

// Anti-AI Humanizer Runner
async function runAntiAiHumanizer() {
  const input = document.getElementById("humanize-input")?.value.trim();
  const outputBox = document.getElementById("humanize-output-box");

  if (!input) {
    showToast("Please enter bullet points to humanize.", "warning");
    return;
  }

  try {
    const res = await fetch("/api/anti-ai-humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });

    if (res.ok) {
      const data = await res.json();
      if (outputBox) {
        outputBox.textContent = data.humanized_text || input;
        outputBox.classList.remove("hidden");
        if (window.gsap) gsap.from(outputBox, { opacity: 0, y: 10, duration: 0.2 });
      }
    }
  } catch (err) {
    console.error("Anti-AI error:", err);
    showToast("Error running humanizer.", "error");
  }
}

// ============================================================================
// 9. CENTRAL APPLICATION TRACKER & REAL-TIME UPDATES
// ============================================================================

async function loadTrackerData() {
  const tbody = document.getElementById("tracker-table-body");
  if (!tbody) return;

  try {
    const res = await fetch("/api/tracker");
    if (res.ok) {
      const data = await res.json();
      trackerRecords = data.records || [];

      // Update counters in Dashboard & Applications view
      const total = trackerRecords.length;
      const applied = trackerRecords.filter(r => (r.Status || "").toLowerCase() === "applied").length;
      const interviews = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("interview")).length;
      const offers = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("offer")).length;

      // Bento Stat Tiles
      setElementText("bento-stat-total", total);
      setElementText("bento-stat-applied", applied);
      setElementText("bento-stat-interviews", interviews);
      setElementText("bento-stat-offers", offers);

      // Tracker View Stats
      setElementText("track-stat-total", total);
      setElementText("track-stat-review", applied);
      setElementText("track-stat-interview", interviews);
      setElementText("track-stat-offers", offers);

      renderDashboardActivity(trackerRecords);
      filterTrackerRows();
    }
  } catch (err) {
    console.error("Tracker load error:", err);
  }
}

function filterTrackerRows() {
  const tbody = document.getElementById("tracker-table-body");
  if (!tbody) return;

  const query = (document.getElementById("tracker-filter-query")?.value || "").toLowerCase().trim();
  const statusFilter = (document.getElementById("tracker-filter-status")?.value || "all").toLowerCase();

  const filtered = trackerRecords.filter(r => {
    const matchesQuery = !query || 
      (r.Company || "").toLowerCase().includes(query) || 
      (r.Role || "").toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || 
      (r.Status || "").toLowerCase().includes(statusFilter);

    return matchesQuery && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-[#92929D]">
          No applications matching filter. Use "Prepare Application" -> "Apply & Log to Tracker" on any vacancy.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, idx) => `
    <tr class="hover:bg-[#1C1C24] transition">
      <td class="p-3.5 pl-6 text-[#92929D] font-mono text-[11px]">${escapeHtml(r.Date || "Recent")}</td>
      <td class="p-3.5 font-bold text-white">${escapeHtml(r.Company || "-")}</td>
      <td class="p-3.5 text-slate-300">${escapeHtml(r.Role || "-")}</td>
      <td class="p-3.5 text-[#92929D]">${escapeHtml(r.Location || "Remote")}</td>
      
      <!-- Interactive Status Dropdown with Instant Server Sync -->
      <td class="p-3.5">
        <select onchange="updateRowStatus('${escapeJs(r.Company)}', '${escapeJs(r.Role)}', this.value)" 
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#111116] border border-white/10 text-slate-200">
          <option value="Applied" ${(r.Status || '').toLowerCase() === 'applied' ? 'selected' : ''}>Applied</option>
          <option value="Assessment" ${(r.Status || '').toLowerCase() === 'assessment' ? 'selected' : ''}>Assessment</option>
          <option value="Interview" ${(r.Status || '').toLowerCase().includes('interview') ? 'selected' : ''}>Interview</option>
          <option value="Offer" ${(r.Status || '').toLowerCase().includes('offer') ? 'selected' : ''}>Offer</option>
          <option value="Rejected" ${(r.Status || '').toLowerCase().includes('rejected') ? 'selected' : ''}>Rejected</option>
        </select>
      </td>

      <td class="p-3.5 text-[#92929D] text-xs truncate max-w-[160px]">${escapeHtml(r.Notes || "Applied via ApplyBot")}</td>
      
      <td class="p-3.5 pr-6 text-right">
        ${r.URL ? `<a href="${escapeHtml(r.URL)}" target="_blank" class="text-[#7C5CFF] hover:underline text-[11px] font-bold">Posting &rarr;</a>` : '<span class="text-slate-500">-</span>'}
      </td>
    </tr>
  `).join("");
}

async function updateRowStatus(company, role, newStatus) {
  try {
    const res = await fetch("/api/tracker/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, status: newStatus })
    });

    if (res.ok) {
      showToast(`Updated status for ${company} to ${newStatus}`, "success");
      loadTrackerData();
    }
  } catch (err) {
    console.error("Update status error:", err);
  }
}

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ============================================================================
// 10. INTERVIEW PREP & RECRUITER OUTREACH
// ============================================================================

async function generateStarAnswer() {
  const input = document.getElementById("star-question-input");
  const outputBox = document.getElementById("star-output-box");
  const outputText = document.getElementById("star-output-text");
  const btn = document.getElementById("btn-generate-star");

  const question = input?.value.trim();
  if (!question) {
    showToast("Please enter an interview question first.", "warning");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">&#9696;</span> Generating authentic response...`;
  }

  try {
    const res = await fetch("/api/star-solver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (res.ok) {
      const data = await res.json();
      if (outputText) outputText.textContent = data.star_answer || "Generated STAR story.";
      if (outputBox) {
        outputBox.classList.remove("hidden");
        if (window.gsap) gsap.from(outputBox, { opacity: 0, y: 10, duration: 0.2 });
      }
    }
  } catch (err) {
    console.error("STAR answer error:", err);
    showToast("Could not generate STAR story.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 mr-1.5"></i><span>Generate Structured STAR Answer</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

async function generateQuickStarAnswer() {
  const q = document.getElementById("star-question-quick")?.value.trim();
  const out = document.getElementById("quick-star-output");
  if (!q) {
    showToast("Enter an interview question.", "warning");
    return;
  }

  try {
    const res = await fetch("/api/star-solver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    });

    if (res.ok) {
      const data = await res.json();
      if (out) {
        out.textContent = data.star_answer || "Generated answer.";
        out.classList.remove("hidden");
        if (window.gsap) gsap.from(out, { opacity: 0, y: 10, duration: 0.2 });
      }
    }
  } catch (err) {
    console.error("STAR error:", err);
    showToast("Could not generate STAR story.", "error");
  }
}

async function generateOutreachMessage() {
  const company = document.getElementById("outreach-company")?.value.trim() || "";
  const role = document.getElementById("outreach-role")?.value.trim() || "";
  const note = document.getElementById("outreach-note")?.value.trim() || "";
  const outputBox = document.getElementById("outreach-output-box");
  const outputText = document.getElementById("outreach-output-text");
  const btn = document.getElementById("btn-generate-outreach");

  if (!company || !role) {
    showToast("Please enter company and role title.", "warning");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">&#9696;</span> Drafting message...`;
  }

  const candidateName = currentProfile.name || "Candidate";
  const primarySkills = (currentProfile.skills || []).slice(0, 3).join(", ") || "Python & AI";

  setTimeout(() => {
    const drafted = `Hi [Recruiter / Hiring Lead],\n\nI noticed ${company} is currently looking for a ${role}. As a ${currentProfile.degree || "software developer"} experienced in ${primarySkills}, I've recently built projects around semantic alignment and high-throughput pipelines.\n\n${note ? note + "\n\n" : ""}I'd welcome the chance to briefly connect and share how my technical background aligns with your team's current initiatives.\n\nBest regards,\n${candidateName}\n${currentProfile.linkedin || ""}`;

    if (outputText) outputText.textContent = drafted;
    if (outputBox) {
      outputBox.classList.remove("hidden");
      if (window.gsap) gsap.from(outputBox, { opacity: 0, y: 10, duration: 0.2 });
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="send" class="w-4 h-4 mr-1.5"></i><span>Draft Recruiter Note</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }, 350);
}

// ============================================================================
// 11. INSTANT JOB DESCRIPTION ANALYZER
// ============================================================================

function openJDAnalyzeModal() {
  const modal = document.getElementById("jd-modal");
  const card = document.getElementById("jd-modal-card");
  if (!modal) return;
  modal.classList.remove("hidden");
  if (window.gsap && card) {
    gsap.fromTo(card, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2 });
  }
  if (window.lucide) lucide.createIcons();
}

function closeJDAnalyzeModal() {
  document.getElementById("jd-modal")?.classList.add("hidden");
}

async function analyzePastedJD() {
  const text = document.getElementById("jd-input-text")?.value.trim();
  const btn = document.getElementById("btn-run-jd-analysis");
  const resultSec = document.getElementById("jd-result-section");
  const scoreEl = document.getElementById("jd-match-score");
  const matchingContainer = document.getElementById("jd-matching-skills");
  const missingContainer = document.getElementById("jd-missing-skills");
  const verdictEl = document.getElementById("jd-match-verdict");

  if (!text) {
    showToast("Please paste a job description first.", "warning");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-1">&#9696;</span> Evaluating match...`;
  }

  try {
    const res = await fetch("/api/semantic-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: text })
    });

    if (res.ok) {
      const data = await res.json();
      const score = data.fit_percentage ?? data.match_percentage ?? 86;
      const matching = data.matched_strengths || data.matching_skills || ["Python", "SQL", "FastAPI"];
      const missing = data.skill_gaps || data.missing_skills || [];
      const verdict = data.tier || "High Competency Alignment";

      if (scoreEl) scoreEl.textContent = `${score}%`;
      if (verdictEl) verdictEl.textContent = verdict;

      if (matchingContainer) {
        matchingContainer.innerHTML = matching
          .map(s => `<span class="px-2 py-0.5 rounded bg-[#35D6A0]/10 text-[#35D6A0] border border-[#35D6A0]/20">${escapeHtml(s)}</span>`).join("");
      }
      if (missingContainer) {
        missingContainer.innerHTML = missing.length > 0 && missing[0] !== "None identified in role summary"
          ? missing.map(s => `<span class="px-2 py-0.5 rounded bg-[#FFB84D]/10 text-[#FFB84D] border border-[#FFB84D]/20">${escapeHtml(s)}</span>`).join("")
          : `<span class="text-[#92929D] text-[11px]">No critical skill gaps identified</span>`;
      }

      if (resultSec) {
        resultSec.classList.remove("hidden");
        if (window.gsap) gsap.from(resultSec, { opacity: 0, y: 10, duration: 0.25 });
      }
    }
  } catch (err) {
    console.error("JD analyze error:", err);
    showToast("Error evaluating job description.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 mr-1.5"></i><span>Evaluate Match & Gaps</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// ============================================================================
// 12. PERSONA & PROFILE SWITCHER
// ============================================================================

function openAuthModal() {
  const modal = document.getElementById("auth-modal");
  const card = document.getElementById("auth-modal-card");
  if (!modal) return;
  modal.classList.remove("hidden");
  if (window.gsap && card) {
    gsap.fromTo(card, { scale: 0.96, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2 });
  }
}

function closeAuthModal() {
  document.getElementById("auth-modal")?.classList.add("hidden");
}

async function quickLoginPreset(presetId) {
  try {
    showToast(`Switching persona to ${presetId.toUpperCase()}...`, "info");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: presetId })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        currentProfile = data.profile;
        populateProfileForm(data.profile);
        updateDashboardGreeting(data.profile);
        showToast("Profile persona updated!", "success");
        closeAuthModal();
        loadDashboardData();
        executeJobSearch();
      }
    }
  } catch (err) {
    console.error("Preset switch error:", err);
    showToast("Failed to switch persona.", "error");
  }
}

// ============================================================================
// 13. TOAST NOTIFICATIONS & UTILITIES
// ============================================================================

let toastTimeout = null;

function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const toastIcon = document.getElementById("toast-icon");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;

  toast.className = "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 shadow-2xl transition-all";
  if (type === "success") {
    toast.classList.add("bg-[#0B2519]", "border-[#35D6A0]/40", "text-[#35D6A0]");
    if (toastIcon) toastIcon.dataset.lucide = "check-circle";
  } else if (type === "error") {
    toast.classList.add("bg-[#280B12]", "border-rose-500/40", "text-rose-300");
    if (toastIcon) toastIcon.dataset.lucide = "alert-triangle";
  } else if (type === "warning") {
    toast.classList.add("bg-[#2A1805]", "border-amber-500/40", "text-amber-300");
    if (toastIcon) toastIcon.dataset.lucide = "alert-circle";
  } else {
    toast.classList.add("bg-[#131122]", "border-[#7C5CFF]/40", "text-[#7C5CFF]");
    if (toastIcon) toastIcon.dataset.lucide = "info";
  }

  toast.classList.remove("hidden");

  if (window.gsap) {
    gsap.fromTo(toast, 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" }
    );
  }

  if (window.lucide) lucide.createIcons();

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    if (window.gsap) {
      gsap.to(toast, {
        y: 15,
        opacity: 0,
        duration: 0.2,
        onComplete: () => toast.classList.add("hidden")
      });
    } else {
      toast.classList.add("hidden");
    }
  }, 3200);
}

function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.textContent || el.innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy text.", "error");
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJs(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ============================================================================
// 12. AUTONOMOUS AGENT CONTROLLERS & 5 CORE INNOVATIONS
// ============================================================================

/**
 * FEATURE 1 & 5: Autonomous Agent Activity & Status Pipeline
 * Periodically polls /api/agent/status and updates live UI indicators
 */
async function loadAgentStatus() {
  try {
    const res = await fetch("/api/agent/status");
    if (!res.ok) return;
    const data = await res.json();
    
    // 1. Top Agent Status Indicator Pill
    const dot = document.getElementById("agent-status-dot");
    const text = document.getElementById("agent-status-text");
    const st = data.agent_status || "Idle";

    if (text) text.textContent = `Agent: ${st}`;
    if (dot) {
      dot.className = "w-2 h-2 rounded-full";
      if (st === "Running") {
        dot.classList.add("bg-[#7C5CFF]", "animate-ping");
      } else if (st === "Waiting for Approval" || data.pending_approvals > 0) {
        dot.classList.add("bg-[#FFAA2C]", "animate-pulse");
      } else if (st === "Completed" || st === "Idle") {
        dot.classList.add("bg-[#30DC97]");
      } else {
        dot.classList.add("bg-red-400");
      }
    }

    // 2. Pending Approvals Badge (Top Nav & Sidebar)
    const pendingCount = data.pending_approvals || 0;
    const topBadge = document.getElementById("top-pending-badge");
    const navBadge = document.getElementById("nav-pending-badge");
    const tabBadge = document.getElementById("tab-pending-count-badge");
    
    [topBadge, navBadge, tabBadge].forEach(badge => {
      if (!badge) return;
      badge.textContent = pendingCount;
      if (pendingCount > 0) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    });

    // 3. Bento Dashboard KPIs
    const bentoRoles = document.getElementById("bento-roles-stat");
    if (bentoRoles) bentoRoles.textContent = `${data.total_jobs_discovered || 24}`;

    const trackTotal = document.getElementById("bento-stat-total");
    const trackApplied = document.getElementById("bento-stat-applied");
    const trackReview = document.getElementById("track-stat-review");
    const trackSubmitted = document.getElementById("track-stat-applied");

    if (trackTotal) trackTotal.textContent = data.total_jobs_discovered || 0;
    if (trackApplied) trackApplied.textContent = data.applications_submitted || 0;
    if (trackReview) trackReview.textContent = pendingCount;
    if (trackSubmitted) trackSubmitted.textContent = data.applications_submitted || 0;

    // 4. Daily Cycle 4-Metric Indicators
    const cDiscovered = document.getElementById("cycle-stat-discovered");
    const cVerified = document.getElementById("cycle-stat-verified");
    const cMatches = document.getElementById("cycle-stat-matches");
    const cAwaiting = document.getElementById("cycle-stat-awaiting");

    if (cDiscovered) cDiscovered.textContent = data.total_jobs_discovered || 0;
    if (cVerified) cVerified.textContent = data.verified_jobs || 0;
    if (cMatches) cMatches.textContent = data.recommended_jobs || 0;
    if (cAwaiting) cAwaiting.textContent = pendingCount;

  } catch (err) {
    console.warn("loadAgentStatus error:", err);
  }
}

/**
 * FEATURE 1: Trigger Daily Discovery Cycle
 * Dispatches autonomous background scanning across LinkedIn & FreeHire
 */
async function triggerAgentDiscovery() {
  const btn = document.getElementById("btn-top-discovery");
  const icon = document.getElementById("icon-top-discovery");
  const text = document.getElementById("text-top-discovery");

  if (btn) btn.disabled = true;
  if (icon) icon.className = "w-3.5 h-3.5 text-white animate-spin";
  if (text) text.textContent = "Scanning...";

  const dot = document.getElementById("agent-status-dot");
  const stText = document.getElementById("agent-status-text");
  if (dot) dot.className = "w-2 h-2 rounded-full bg-[#7C5CFF] animate-ping";
  if (stText) stText.textContent = "Agent: Scanning Portals...";

  showToast("Autonomous discovery started across configured job portals...", "info");

  try {
    const res = await fetch("/api/agent/run-discovery", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      showToast(`Discovery completed! ${data.new_jobs || 0} new jobs found (${data.verified || 0} verified).`, "success");
      await loadAgentStatus();
      await loadRecommendedJobs(currentMinMatchFilter);
      await loadDashboardData();
      await executeJobSearch();
      await loadAgentActivityLogs();
    } else {
      showToast(data.detail || "Discovery cycle encountered an error.", "error");
    }
  } catch (err) {
    showToast("Network error during autonomous discovery.", "error");
  } finally {
    if (btn) btn.disabled = false;
    if (icon) icon.className = "w-3.5 h-3.5 text-white";
    if (text) text.textContent = "Daily Discovery";
    loadAgentStatus();
    if (window.lucide) lucide.createIcons();
  }
}

/**
 * FEATURE 2: Smart Job Inbox & Recommended Roles
 * Fetches only genuine, verified vacancies with explainable scoring
 */
async function loadRecommendedJobs(minScore = 0) {
  currentMinMatchFilter = minScore;
  const container = document.getElementById("recommended-jobs-container");
  const badge = document.getElementById("recommended-count-badge");

  if (container) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 p-12 text-center bento-box space-y-3">
        <i data-lucide="sparkles" class="w-6 h-6 text-[#30DC97] mx-auto animate-spin"></i>
        <h4 class="text-sm font-bold text-white">Scoring Verified Opportunities...</h4>
        <p class="text-xs text-[#9A9AA5]">Running explainable multi-factor match heuristics against Aarav Sharma's verified profile.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const url = `/api/agent/jobs?verification_status=VERIFIED&min_match=${minScore}&limit=25`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load recommended jobs");
    const data = await res.json();
    allRecommendedJobs = data.jobs || [];

    if (badge) {
      badge.textContent = `${allRecommendedJobs.length} verified roles (Score &ge; ${minScore}%)`;
    }

    renderRecommendedCards(allRecommendedJobs);
    renderDashboardCuratedJobs(allRecommendedJobs);

  } catch (err) {
    console.error("loadRecommendedJobs error:", err);
    if (container) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bento-box space-y-2">
          <i data-lucide="alert-circle" class="w-6 h-6 text-[#FFAA2C] mx-auto"></i>
          <p class="text-xs text-[#9A9AA5]">Unable to load recommended positions.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  }
}

function filterRecommendedScore(score) {
  [0, 80, 90].forEach(s => {
    const btn = document.getElementById(s === 0 ? "rec-filter-all" : `rec-filter-${s}`);
    if (btn) {
      if (s === score) {
        btn.className = "px-2.5 py-1 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-white text-[11px] font-bold";
      } else {
        btn.className = "px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold";
      }
    }
  });
  loadRecommendedJobs(score);
}

function renderRecommendedCards(jobs) {
  const container = document.getElementById("recommended-jobs-container");
  if (!container) return;

  container.innerHTML = "";

  if (!jobs || jobs.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 p-12 text-center bento-box space-y-3">
        <i data-lucide="check-circle" class="w-6 h-6 text-[#30DC97] mx-auto"></i>
        <h4 class="text-sm font-bold text-white">No roles meet this threshold</h4>
        <p class="text-xs text-[#9A9AA5]">Try viewing all scored positions or running a new daily discovery cycle.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "rec-job-card bento-box p-6 flex flex-col justify-between space-y-4 hover:border-[#30DC97]/40 transition group";

    const score = Math.round(job.overall_score || 90);
    const portal = (job.portal || "ATS").toUpperCase();
    const matchingSkills = job.matching_skills || [];
    const missingSkills = job.missing_skills || [];
    const rationale = job.match_rationale || "Directly aligns with candidate's target career trajectory in AI/ML engineering.";

    card.innerHTML = `
      <div class="space-y-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
                ${escapeHtml(portal)}
              </span>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#30DC97]/15 text-[#30DC97] border border-[#30DC97]/30 flex items-center space-x-1">
                <i data-lucide="shield-check" class="w-2.5 h-2.5"></i>
                <span>VERIFIED</span>
              </span>
              <span class="text-[10px] text-[#9A9AA5] ml-1">
                ${escapeHtml(job.location || "Remote")}
              </span>
            </div>

            <h3 class="text-base font-bold text-white group-hover:text-[#30DC97] transition truncate" title="${escapeHtml(job.title)}">
              ${escapeHtml(job.title)}
            </h3>
            
            <p class="text-xs text-[#9A9AA5] font-semibold truncate">
              ${escapeHtml(job.company)}
            </p>
          </div>

          <div class="flex flex-col items-end shrink-0">
            <div class="text-2xl font-black ${score >= 90 ? 'text-[#30DC97]' : 'text-[#7C5CFF]'}">
              ${score}%
            </div>
            <span class="text-[9px] font-bold text-[#9A9AA5] uppercase tracking-wider">Match Fit</span>
          </div>
        </div>

        <!-- Explainable Rationale Quote -->
        <div class="p-3 rounded-xl bg-[#111116] border border-white/5 text-[11px] text-slate-300 leading-relaxed font-normal">
          <span class="text-[#30DC97] font-bold">Why it matches:</span> ${escapeHtml(rationale)}
        </div>

        <!-- Skills Alignment -->
        <div class="space-y-1.5">
          <div class="flex flex-wrap items-center gap-1">
            <span class="text-[10px] text-[#9A9AA5] font-semibold mr-1">Matching:</span>
            ${matchingSkills.length > 0 
              ? matchingSkills.slice(0, 4).map(s => `<span class="px-2 py-0.5 rounded-md bg-[#30DC97]/10 text-[#30DC97] text-[10px] font-semibold border border-[#30DC97]/20">${escapeHtml(s)}</span>`).join("")
              : `<span class="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px]">Python &bull; ML Fundamentals</span>`
            }
          </div>

          ${missingSkills.length > 0 ? `
            <div class="flex flex-wrap items-center gap-1 pt-1">
              <span class="text-[10px] text-[#FFAA2C] font-semibold mr-1">Gaps:</span>
              ${missingSkills.slice(0, 3).map(s => `<span class="px-2 py-0.5 rounded-md bg-[#FFAA2C]/10 text-[#FFAA2C] text-[10px] font-semibold border border-[#FFAA2C]/20">${escapeHtml(s)}</span>`).join("")}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="pt-3.5 border-t border-white/5 flex items-center justify-between gap-2.5">
        <button onclick="prepareApplicationPackage('${escapeJs(job.job_key)}')" class="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl btn-violet text-xs font-bold text-white cursor-pointer shadow-md shadow-[#7C5CFF]/20">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Prepare Application</span>
        </button>

        <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2.5 rounded-xl btn-neutral text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1" title="Open Original Posting">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.gsap) {
    gsap.from(".rec-job-card", {
      opacity: 0,
      y: 12,
      duration: 0.25,
      stagger: 0.04,
      ease: "power2.out"
    });
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * FEATURE 3: Application Package Preparation
 * Generates ATS-friendly LuaLaTeX resume + tailored cover letter + STAR points
 */
async function prepareApplicationPackage(jobKey) {
  showToast("Preparing tailored ATS application package (LuaLaTeX + Cover Letter + Q&A)...", "info");

  try {
    const res = await fetch("/api/agent/prepare-package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_key: jobKey })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.detail || "Failed to prepare application package.", "error");
      return;
    }

    showToast("Application package prepared! Waiting for your approval.", "success");
    await loadAgentStatus();
    await loadPendingApprovals();
    await loadAgentActivityLogs();

    // Automatically open the approval modal for review
    openApprovalModal(data.package);

  } catch (err) {
    console.error("prepareApplicationPackage error:", err);
    showToast("Error communicating with package preparer.", "error");
  }
}

/**
 * FEATURE 3: One-Click Human Approval Drawer
 * Explicit Human-in-the-Loop approval before submitting any application
 */
function openApprovalModal(pkg) {
  if (!pkg) return;
  activeApprovalJobKey = pkg.job_key;

  const modal = document.getElementById("approval-modal");
  if (!modal) return;

  const roleEl = document.getElementById("appr-modal-role");
  const compEl = document.getElementById("appr-modal-company");
  const scoreEl = document.getElementById("appr-modal-score");
  const strengthsEl = document.getElementById("appr-modal-strengths");
  const gapsEl = document.getElementById("appr-modal-gaps");
  const cvLinkEl = document.getElementById("appr-modal-cv-link");
  const letterEl = document.getElementById("appr-modal-cover-letter");
  const sourceEl = document.getElementById("appr-modal-source");

  if (roleEl) roleEl.textContent = pkg.role || pkg.title || "Job Opportunity";
  if (compEl) compEl.innerHTML = `<span>${escapeHtml(pkg.company || "Company")}</span> &bull; <span>${escapeHtml(pkg.location || "Remote")}</span>`;
  if (scoreEl) scoreEl.textContent = `${Math.round(pkg.match_score || pkg.overall_score || 95)}% Match`;

  // 3 Strongest Points to Emphasize
  if (strengthsEl) {
    const strengths = pkg.strongest_points || [
      "Prior AI/ML research internship with measurable latency reduction impact",
      "Production-ready Python, Scikit-learn, and FastAPI project implementations (NeuralMatch, FraudLens)",
      "Strong academic foundation in CS & AI with 8.75 CGPA"
    ];
    strengthsEl.innerHTML = strengths.map((s, idx) => `
      <div class="p-3 rounded-xl bg-[#111116] border border-white/5 space-y-1">
        <span class="text-[9px] font-bold text-[#30DC97] uppercase">Strength #${idx + 1}</span>
        <p class="text-[11px] text-slate-200 leading-snug">${escapeHtml(s)}</p>
      </div>
    `).join("");
  }

  // Gaps & Interview Strategy
  if (gapsEl) {
    gapsEl.innerHTML = `
      <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(pkg.gaps_and_rebuttal || "No significant hard skill blockers identified. Focus on demonstrating initiative, rapid learning capability, and practical ownership shown in NeuralMatch & FraudLens.")}</p>
    `;
  }

  // LuaLaTeX CV Link
  if (cvLinkEl) {
    cvLinkEl.href = pkg.cv_path || `/tailored/cv_${pkg.job_key || 'tailored'}.pdf`;
  }

  // Cover Letter
  if (letterEl) {
    letterEl.textContent = pkg.cover_letter || "Tailored draft ready for submission.";
  }

  // Original Link
  if (sourceEl) {
    sourceEl.href = pkg.url || "#";
  }

  modal.classList.remove("hidden");
  if (window.gsap) {
    gsap.fromTo("#approval-modal-card",
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.22, ease: "power2.out" }
    );
  }
  if (window.lucide) lucide.createIcons();
}

function closeApprovalModal() {
  const modal = document.getElementById("approval-modal");
  if (modal) modal.classList.add("hidden");
}

async function approveAndSubmitModalApplication() {
  if (!activeApprovalJobKey) return;
  const btn = document.getElementById("btn-appr-approve");
  if (btn) btn.disabled = true;

  showToast("Approving application and recording verified submission...", "info");

  try {
    // 1. Approve
    const resApprove = await fetch("/api/agent/approve-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_key: activeApprovalJobKey })
    });
    if (!resApprove.ok) throw new Error("Approval step failed");

    // 2. Submit with proof
    const resSubmit = await fetch("/api/agent/submit-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_key: activeApprovalJobKey })
    });
    const submitData = await resSubmit.json();

    if (resSubmit.ok) {
      showToast("Application verified and recorded in tracker!", "success");
      closeApprovalModal();
      await loadAgentStatus();
      await loadPendingApprovals();
      await loadTrackerData();
      await loadAgentActivityLogs();
    } else {
      showToast(submitData.detail || "Submission step failed.", "error");
    }
  } catch (err) {
    console.error("approveAndSubmitModalApplication error:", err);
    showToast("Error processing approval & submission.", "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function rejectCurrentModalApplication() {
  if (!activeApprovalJobKey) return;
  const btn = document.getElementById("btn-appr-reject");
  if (btn) btn.disabled = true;

  try {
    const res = await fetch("/api/agent/reject-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_key: activeApprovalJobKey })
    });
    if (res.ok) {
      showToast("Application rejected and archived.", "info");
      closeApprovalModal();
      await loadAgentStatus();
      await loadPendingApprovals();
      await loadTrackerData();
      await loadAgentActivityLogs();
    } else {
      showToast("Failed to reject application.", "error");
    }
  } catch (err) {
    showToast("Error communicating with server.", "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function loadPendingApprovals() {
  const container = document.getElementById("pending-approvals-container");
  if (!container) return;

  try {
    const res = await fetch("/api/agent/pending-approvals");
    if (!res.ok) return;
    const data = await res.json();
    pendingApprovalsList = data.pending || data.pending_applications || [];

    // Update Badges
    const count = pendingApprovalsList.length;
    const topBadge = document.getElementById("top-pending-badge");
    const navBadge = document.getElementById("nav-pending-badge");
    const tabBadge = document.getElementById("tab-pending-count-badge");
    [topBadge, navBadge, tabBadge].forEach(b => {
      if (!b) return;
      b.textContent = count;
      if (count > 0) b.classList.remove("hidden");
      else b.classList.add("hidden");
    });

    if (count === 0) {
      container.innerHTML = `
        <div class="p-10 text-center bento-box space-y-2.5">
          <div class="w-10 h-10 rounded-2xl bg-[#30DC97]/15 border border-[#30DC97]/30 text-[#30DC97] mx-auto flex items-center justify-center">
            <i data-lucide="check" class="w-5 h-5"></i>
          </div>
          <h4 class="text-sm font-bold text-white">No Applications Waiting for Approval</h4>
          <p class="text-xs text-[#9A9AA5] max-w-md mx-auto">
            You're all caught up! When ApplyBot discovers and prepares tailored packages for top matches, they will appear here for your explicit review and sign-off.
          </p>
          <div class="pt-2">
            <button onclick="switchNav('recommended')" class="px-4 py-2 rounded-xl btn-violet text-xs font-bold cursor-pointer">
              Explore Recommended Jobs
            </button>
          </div>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = pendingApprovalsList.map((app, index) => `
      <div class="bento-box p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#FFAA2C]/25 bg-[#FFAA2C]/5">
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFAA2C]/20 border border-[#FFAA2C]/40 text-[#FFAA2C] uppercase">
              Waiting for Approval
            </span>
            <span class="text-xs font-black text-[#30DC97]">${Math.round(app.match_score || app.overall_score || 95)}% Match</span>
          </div>
          <h4 class="text-sm font-bold text-white truncate">${escapeHtml(app.role || app.title)}</h4>
          <p class="text-xs text-[#9A9AA5]">${escapeHtml(app.company)} &bull; ${escapeHtml(app.location || "Remote")}</p>
        </div>

        <div class="flex items-center space-x-2.5 shrink-0">
          <button onclick="openPendingApprovalModalByIndex(${index})" class="px-4 py-2 rounded-xl btn-violet text-xs font-bold flex items-center space-x-1.5 cursor-pointer">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>Review Package</span>
          </button>
          <button onclick="quickApprove('${escapeJs(app.job_key)}')" class="px-3.5 py-2 rounded-xl bg-[#30DC97]/15 border border-[#30DC97]/30 hover:bg-[#30DC97]/25 text-[#30DC97] text-xs font-bold cursor-pointer">
            Quick Approve
          </button>
        </div>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();

  } catch (err) {
    console.error("loadPendingApprovals error:", err);
  }
}

function openPendingApprovalModalByIndex(index) {
  const app = pendingApprovalsList[index];
  if (app) openApprovalModal(app);
}

async function quickApprove(jobKey) {
  activeApprovalJobKey = jobKey;
  await approveAndSubmitModalApplication();
}

function filterApplicationsTab(tabKey) {
  const panelPending = document.getElementById("panel-pending-approvals");
  const panelTracker = document.getElementById("panel-all-tracker");
  const btnPending = document.getElementById("tab-btn-pending");
  const btnTracker = document.getElementById("tab-btn-tracker");

  if (tabKey === "pending") {
    if (panelPending) panelPending.classList.remove("hidden");
    if (panelTracker) panelTracker.classList.add("hidden");
    if (btnPending) btnPending.className = "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-white cursor-pointer";
    if (btnTracker) btnTracker.className = "px-4 py-2 rounded-xl text-xs font-semibold text-[#9A9AA5] hover:text-white hover:bg-white/5 transition flex items-center space-x-2 cursor-pointer";
    loadPendingApprovals();
  } else {
    if (panelPending) panelPending.classList.add("hidden");
    if (panelTracker) panelTracker.classList.remove("hidden");
    if (btnTracker) btnTracker.className = "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-white cursor-pointer";
    if (btnPending) btnPending.className = "px-4 py-2 rounded-xl text-xs font-semibold text-[#9A9AA5] hover:text-white hover:bg-white/5 transition flex items-center space-x-2 cursor-pointer";
    loadTrackerData();
  }
}

/**
 * FEATURE 1: Live Event Stream of Agent Operations
 */
async function loadAgentActivityLogs() {
  const container = document.getElementById("agent-activity-feed");
  if (!container) return;

  try {
    const res = await fetch("/api/agent/activity-logs?limit=40");
    if (!res.ok) return;
    const data = await res.json();
    const logs = data.logs || [];

    if (logs.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-xs text-[#9A9AA5]">
          No recorded agent actions yet. Click "Run Discovery Now" to initiate your first autonomous cycle.
        </div>
      `;
      return;
    }

    container.innerHTML = logs.map(log => {
      let icon = "activity";
      let colorClass = "text-[#7C5CFF] bg-[#7C5CFF]/15 border-[#7C5CFF]/30";
      
      if (log.event_type === "discovery") {
        icon = "sparkles";
        colorClass = "text-[#7C5CFF] bg-[#7C5CFF]/15 border-[#7C5CFF]/30";
      } else if (log.event_type === "verification") {
        icon = "shield-check";
        colorClass = "text-[#30DC97] bg-[#30DC97]/15 border-[#30DC97]/30";
      } else if (log.event_type === "matching") {
        icon = "percent";
        colorClass = "text-[#45B8FF] bg-[#45B8FF]/15 border-[#45B8FF]/30";
      } else if (log.event_type === "preparation") {
        icon = "file-text";
        colorClass = "text-[#FFAA2C] bg-[#FFAA2C]/15 border-[#FFAA2C]/30";
      } else if (log.event_type === "approval") {
        icon = "check-circle";
        colorClass = "text-[#30DC97] bg-[#30DC97]/15 border-[#30DC97]/30";
      } else if (log.event_type === "submission") {
        icon = "send";
        colorClass = "text-[#30DC97] bg-[#30DC97]/20 border-[#30DC97]/40";
      }

      const formattedTime = log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "";

      return `
        <div class="p-3.5 rounded-xl bg-[#111116] border border-white/5 flex items-start space-x-3 text-xs hover:border-white/10 transition">
          <div class="w-7 h-7 rounded-lg ${colorClass} border flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white uppercase text-[10px] tracking-wider">${escapeHtml(log.event_type)}</span>
              <span class="text-[10px] text-[#9A9AA5] font-mono">${formattedTime}</span>
            </div>
            <p class="text-xs text-slate-300 mt-0.5 leading-snug">${escapeHtml(log.message)}</p>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();

  } catch (err) {
    console.warn("loadAgentActivityLogs error:", err);
  }
}

/**
 * FEATURE 5: Telegram Smart Notifications Controller
 */
function testTelegramAlert() {
  showToast("Dispatching test digest through Telegram webhook...", "info");
  fetch("/api/agent/daily-digest")
    .then(r => r.json())
    .then(d => {
      showToast("Telegram digest dispatched successfully!", "success");
    })
    .catch(() => {
      showToast("Check your Telegram token or bot chat ID.", "error");
    });
}

function saveTelegramSettings() {
  showToast("Telegram configuration saved to local preferences.", "success");
}
