/**
 * ApplyBot — Premium AI Job Automation Platform
 * Frontend Architecture & State Controller
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
let isLandingViewActive = false;

// ============================================================================
// 1. INITIALIZATION & LIFECYCLE
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  
  // Initialize Core Systems
  loadProfileData();
  loadDashboardData();
  executeJobSearch();
  loadTrackerData();
  loadTailoredPackages();
  setupDragAndDrop();
  updateTimeGreeting();
});

// Dynamic Time-based Greeting
function updateTimeGreeting() {
  const greetingEl = document.getElementById("dashboard-greeting");
  if (!greetingEl) return;
  const hour = new Date().getHours();
  if (hour < 12) greetingEl.textContent = "Good morning";
  else if (hour < 18) greetingEl.textContent = "Good afternoon";
  else greetingEl.textContent = "Good evening";
}

// ============================================================================
// 2. SIMPLIFIED NAVIGATION (4 Primary Core Sections + Landing Mode)
// ============================================================================

function switchNav(sectionKey) {
  // If landing page was open, hide it
  if (isLandingViewActive) {
    toggleLandingView(false);
  }

  const sections = ["dashboard", "jobs", "career", "applications"];
  
  sections.forEach(key => {
    const secEl = document.getElementById(`sec-${key}`);
    const navBtn = document.getElementById(`nav-btn-${key}`);

    if (key === sectionKey) {
      if (secEl) {
        secEl.classList.remove("hidden");
        if (window.gsap) {
          gsap.fromTo(secEl, 
            { opacity: 0, y: 12 }, 
            { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
          );
        }
      }
      if (navBtn) {
        navBtn.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all nav-tab-active";
      }
    } else {
      if (secEl) secEl.classList.add("hidden");
      if (navBtn) {
        navBtn.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white";
      }
    }
  });

  if (sectionKey === "applications") loadTrackerData();
  if (sectionKey === "career") loadTailoredPackages();

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}

function toggleLandingView(forceState) {
  const landingSec = document.getElementById("view-landing");
  const mainSec = document.querySelector("main");
  const toggleText = document.getElementById("landing-toggle-text");

  if (typeof forceState === "boolean") {
    isLandingViewActive = forceState;
  } else {
    isLandingViewActive = !isLandingViewActive;
  }

  if (isLandingViewActive) {
    landingSec?.classList.remove("hidden");
    mainSec?.classList.add("hidden");
    if (toggleText) toggleText.textContent = "Open Cockpit";
    if (window.gsap && landingSec) {
      gsap.fromTo(landingSec, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.25 });
    }
  } else {
    landingSec?.classList.add("hidden");
    mainSec?.classList.remove("hidden");
    if (toggleText) toggleText.textContent = "Product Overview";
    switchNav("dashboard");
  }

  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// 3. DASHBOARD EXPERIENCE
// ============================================================================

async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard-stats");
    if (res.ok) {
      const data = await res.json();
      const atsScore = data.ats_score || 94;
      
      const atsBadge = document.getElementById("dash-stat-ats");
      const atsCareerBadge = document.getElementById("ats-score-badge");
      const atsBar = document.getElementById("ats-progress-bar");

      if (atsBadge) atsBadge.textContent = `${atsScore}%`;
      if (atsCareerBadge) atsCareerBadge.textContent = `${atsScore}%`;
      if (atsBar) atsBar.style.width = `${atsScore}%`;
    }
  } catch (err) {
    console.error("Dashboard stats error:", err);
  }
}

function updateDashboardGreeting(profile) {
  const name = profile.name || "Candidate";
  const nameEl = document.getElementById("dash-user-name");
  if (nameEl) nameEl.textContent = name;

  // Prominent Recommended Next Action
  const nextActionEl = document.getElementById("dashboard-next-action-text");
  if (nextActionEl) {
    const skillsCount = (profile.skills || []).length;
    if (skillsCount < 5) {
      nextActionEl.textContent = "Your profile is missing technical stacks. Add your core languages and frameworks in 'My Career' to unlock high-accuracy job matches.";
    } else {
      nextActionEl.textContent = `You have 16 high-compatibility vacancies matching your verified ${profile.degree || "technical"} background. Prepare your tailored application to maximize recruiter response.`;
    }
  }
}

function renderDashboardCuratedJobs(jobs) {
  const container = document.getElementById("dash-curated-container");
  if (!container) return;

  const topJobs = (jobs || []).slice(0, 4);
  if (topJobs.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 p-8 text-center app-card space-y-2">
        <p class="text-xs text-slate-400">Loading your personalized opportunities...</p>
      </div>
    `;
    return;
  }

  container.innerHTML = topJobs.map((job, idx) => {
    const score = job.fit_score || job.jd_match_score || 92;
    return `
      <div class="app-card p-5 flex flex-col justify-between space-y-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              ${escapeHtml(job.portal || "DIRECT ATS")}
            </span>
            <h3 class="text-sm font-bold text-white mt-1 truncate" title="${escapeHtml(job.title)}">
              ${escapeHtml(job.title)}
            </h3>
            <p class="text-xs text-slate-400 font-medium truncate">
              ${escapeHtml(job.company)} &bull; ${escapeHtml(job.location || "Remote")}
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${score >= 88 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'}">
            ${score}% Match
          </span>
        </div>

        <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
          ${escapeHtml(job.description || "Verified industrial opportunity seeking candidate with strong analytical and programming proficiency.")}
        </p>

        <div class="flex items-center space-x-2 pt-2 border-t border-white/5">
          <button onclick="openPrepModal(${idx})" class="flex-1 py-2 rounded-xl btn-brand-primary text-xs font-semibold flex items-center justify-center space-x-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Prepare Application</span>
          </button>
          <button onclick="tailorResumeForJob('${escapeJs(job.company)}', '${escapeJs(job.title)}', '${escapeJs(job.location || '')}')" 
                  class="px-3.5 py-2 rounded-xl btn-subtle text-xs font-semibold text-slate-300 hover:text-white" title="Compile LuaLaTeX CV">
            <i data-lucide="file-check" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

// ============================================================================
// 4. FIND JOBS & DISCOVERY EXPERIENCE
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
  if (countBadge) countBadge.textContent = "Scanning active portals...";

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
    btnRemote?.classList.add("bg-indigo-600", "text-white");
    btnAll?.classList.remove("bg-indigo-600", "text-white");
  } else {
    btnAll?.classList.add("bg-indigo-600", "text-white");
    btnRemote?.classList.remove("bg-indigo-600", "text-white");
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
      <div class="col-span-1 md:col-span-2 p-12 text-center app-panel space-y-3">
        <div class="w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <i data-lucide="search-x" class="w-5 h-5"></i>
        </div>
        <h4 class="text-sm font-bold text-white">No active postings matching criteria</h4>
        <p class="text-xs text-slate-400">Try adjusting your keywords, clearing filters, or choosing 'All Portals'.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  jobs.forEach((job, index) => {
    const card = document.createElement("div");
    card.className = "job-card app-card p-6 flex flex-col justify-between space-y-4";

    const matchScore = job.fit_score || job.jd_match_score || 88;
    const portalName = (job.portal || "ATS").toUpperCase();
    const skills = job.matched_skills || (currentSkills.length ? currentSkills.slice(0, 3) : ["Python", "Machine Learning"]);

    card.innerHTML = `
      <div class="space-y-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ${escapeHtml(portalName)}
              </span>
              <span class="text-[10px] font-semibold text-slate-400">
                ${escapeHtml(job.location || "Remote")}
              </span>
            </div>
            
            <h3 class="text-base font-bold text-white mt-1.5 truncate" title="${escapeHtml(job.title)}">
              ${escapeHtml(job.title)}
            </h3>
            
            <p class="text-xs text-slate-400 font-medium truncate">
              ${escapeHtml(job.company)}
            </p>
          </div>

          <div class="flex flex-col items-end shrink-0">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${matchScore >= 88 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'}">
              ${matchScore}% Match
            </span>
          </div>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed line-clamp-2 font-normal">
          ${escapeHtml(job.description || "Seeking high-initiative candidate with practical competency in scalable data architectures, automated pipelines, and core programming paradigms.")}
        </p>

        <div class="flex flex-wrap gap-1.5 pt-1">
          ${skills.map(s => `<span class="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-white/5">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>

      <div class="pt-3.5 border-t border-white/5 flex items-center justify-between gap-2.5">
        <button onclick="openPrepModal(${index})" 
                class="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl btn-brand-primary text-xs font-semibold text-white">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Prepare Application</span>
        </button>

        <button onclick="tailorResumeForJob('${escapeJs(job.company)}', '${escapeJs(job.title)}', '${escapeJs(job.location || '')}')" 
                class="px-4 py-2.5 rounded-xl btn-subtle text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5" title="Compile LuaLaTeX CV">
          <i data-lucide="file-check" class="w-3.5 h-3.5 text-indigo-400"></i>
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
// 5. APPLICATION PREPARATION WORKFLOW (Section 7)
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
      
      // If job has a live URL, open it in browser to apply
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
// 6. RESUME TAILORING (LuaLaTeX Pipeline)
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
        container.innerHTML = `<p class="text-xs text-slate-400 py-3 text-center">No compiled resumes yet. Use "Tailor CV" on any vacancy.</p>`;
        return;
      }

      container.innerHTML = docs.map(doc => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-white/5 hover:border-white/10 transition">
          <div class="flex items-center space-x-2.5 min-w-0">
            <i data-lucide="file-text" class="w-4 h-4 text-indigo-400 shrink-0"></i>
            <span class="text-xs font-medium text-slate-200 truncate" title="${escapeHtml(doc.filename)}">
              ${escapeHtml(doc.filename)}
            </span>
          </div>
          <a href="${escapeHtml(doc.download_url)}" target="_blank" 
             class="px-2.5 py-1 rounded-lg btn-subtle text-[11px] font-semibold text-slate-300 hover:text-white shrink-0 ml-2">
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
// 7. MY CAREER: MASTER PROFILE, ANTI-AI & STAR SOLVER
// ============================================================================

async function loadProfileData() {
  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      currentProfile = await res.json();
      populateProfileForm(currentProfile);
      updateNavUserProfile(currentProfile);
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

function updateNavUserProfile(p) {
  const nameEl = document.getElementById("nav-user-name");
  const initEl = document.getElementById("nav-user-initial");
  if (nameEl) nameEl.textContent = p.name || "Candidate";
  if (initEl) initEl.textContent = (p.name || "C").charAt(0).toUpperCase();
}

function renderSkills() {
  const container = document.getElementById("skills-container");
  const badge = document.getElementById("skills-count-badge");
  if (!container) return;

  container.innerHTML = "";
  if (badge) badge.textContent = `${currentSkills.length} skills`;

  currentSkills.forEach((skill, index) => {
    const chip = document.createElement("span");
    chip.className = "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium";
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
      updateNavUserProfile(updated);
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

// Drag and drop resume upload
function setupDragAndDrop() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("resume-file-input");

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-indigo-500");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-indigo-500");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-indigo-500");
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

// Quick STAR Answer in Career Studio
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

// ============================================================================
// 8. APPLICATION TRACKING & MANAGEMENT (Section 8)
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

      // Dashboard stats
      setElementText("dash-stat-total", total);
      setElementText("dash-stat-applied", applied);
      setElementText("dash-stat-interviews", interviews);

      // Tracker stats
      setElementText("track-stat-total", total);
      setElementText("track-stat-review", applied);
      setElementText("track-stat-interview", interviews);
      setElementText("track-stat-offers", offers);

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
        <td colspan="7" class="p-8 text-center text-slate-400">
          No applications matching filter. Use "Prepare Application" -> "Apply & Log to Tracker" on any vacancy.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((r, idx) => `
    <tr class="hover:bg-[#151824] transition">
      <td class="p-3.5 pl-6 text-slate-400 font-mono text-[11px]">${escapeHtml(r.Date || "Recent")}</td>
      <td class="p-3.5 font-bold text-white">${escapeHtml(r.Company || "-")}</td>
      <td class="p-3.5 text-slate-300">${escapeHtml(r.Role || "-")}</td>
      <td class="p-3.5 text-slate-400">${escapeHtml(r.Location || "Remote")}</td>
      
      <!-- Interactive Status Dropdown -->
      <td class="p-3.5">
        <select onchange="updateRowStatus('${escapeJs(r.Company)}', '${escapeJs(r.Role)}', this.value)" 
                class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0B0E14] border border-white/10 text-slate-200">
          <option value="Applied" ${(r.Status || '').toLowerCase() === 'applied' ? 'selected' : ''}>Applied</option>
          <option value="Assessment" ${(r.Status || '').toLowerCase() === 'assessment' ? 'selected' : ''}>Assessment</option>
          <option value="Interview" ${(r.Status || '').toLowerCase().includes('interview') ? 'selected' : ''}>Interview</option>
          <option value="Offer" ${(r.Status || '').toLowerCase().includes('offer') ? 'selected' : ''}>Offer</option>
          <option value="Rejected" ${(r.Status || '').toLowerCase().includes('rejected') ? 'selected' : ''}>Rejected</option>
        </select>
      </td>

      <td class="p-3.5 text-slate-400 text-xs truncate max-w-[160px]">${escapeHtml(r.Notes || "Applied via ApplyBot")}</td>
      
      <td class="p-3.5 pr-6 text-right">
        ${r.URL ? `<a href="${escapeHtml(r.URL)}" target="_blank" class="text-indigo-400 hover:underline text-[11px] font-medium">Posting &rarr;</a>` : '<span class="text-slate-500">-</span>'}
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
// 9. INSTANT JOB DESCRIPTION ANALYZER
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
          .map(s => `<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${escapeHtml(s)}</span>`).join("");
      }
      if (missingContainer) {
        missingContainer.innerHTML = missing.length > 0 && missing[0] !== "None identified in role summary"
          ? missing.map(s => `<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">${escapeHtml(s)}</span>`).join("")
          : `<span class="text-slate-400 text-[11px]">No critical skill gaps identified</span>`;
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
// 10. PERSONA & PROFILE SWITCHER
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
        updateNavUserProfile(data.profile);
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
// 11. TOAST NOTIFICATIONS & UTILITIES
// ============================================================================

let toastTimeout = null;

function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  const toastIcon = document.getElementById("toast-icon");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;

  toast.className = "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center space-x-2.5 shadow-2xl transition-all";
  if (type === "success") {
    toast.classList.add("bg-[#062419]", "border-emerald-500/40", "text-emerald-300");
    if (toastIcon) toastIcon.dataset.lucide = "check-circle";
  } else if (type === "error") {
    toast.classList.add("bg-[#280B12]", "border-rose-500/40", "text-rose-300");
    if (toastIcon) toastIcon.dataset.lucide = "alert-triangle";
  } else if (type === "warning") {
    toast.classList.add("bg-[#2A1805]", "border-amber-500/40", "text-amber-300");
    if (toastIcon) toastIcon.dataset.lucide = "alert-circle";
  } else {
    toast.classList.add("bg-[#0E1322]", "border-indigo-500/40", "text-indigo-300");
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
