// ApplyBot — AI Job Agent & Career OS Engine
// Hunting Jobs & Guiding Applications with All Possibilities

let currentProfile = {};
let currentSkills = [];
let currentPossibilityData = null;
let currentStarFullAnswer = "";

function safeHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function createElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function createIcon(name, className = "") {
  const icon = document.createElement("i");
  icon.dataset.lucide = name;
  icon.className = className;
  return icon;
}

function openSafeUrl(value) {
  const url = safeHttpUrl(value);
  if (!url) {
    showToast("This link is invalid or uses an unsupported protocol.", "error");
    return false;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  loadProfileData();
  loadDashboardData();
  loadTailoredPackages();
  setupDragAndDrop();
  init3DTilt();
  executeJobSearch(); // Pre-load live opportunities
});

// Tab Switching System (4 Tabs)
function switchTab(tabId) {
  const tabs = ["tab-dashboard", "tab-profile", "tab-jobs", "tab-lab"];
  const btnMap = {
    "tab-dashboard": "nav-btn-dashboard",
    "tab-profile": "nav-btn-profile",
    "tab-jobs": "nav-btn-jobs",
    "tab-lab": "nav-btn-lab"
  };

  tabs.forEach(t => {
    const el = document.getElementById(t);
    const btn = document.getElementById(btnMap[t]);
    if (t === tabId) {
      el.classList.remove("hidden");
      btn.className = "flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all sc-nav-pill-active";
    } else {
      el.classList.add("hidden");
      btn.className = "flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all text-sc-muted hover:text-white";
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
  setTimeout(init3DTilt, 80);
}

// Quick Preset Trigger from Dashboard
function runQuickSearch(role, location, portal) {
  document.getElementById("search-role-custom").value = role;
  document.getElementById("search-location-custom").value = location;
  document.getElementById("search-portal").value = portal;
  switchTab("tab-jobs");
  executeJobSearch();
}

// Load Profile Data from Backend
async function loadProfileData() {
  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      currentProfile = await res.json();
      populateProfileForm(currentProfile);
      updateNavUserProfile(currentProfile);
    }
  } catch (err) {
    console.error("Profile load error:", err);
  }
}

function populateProfileForm(p) {
  document.getElementById("prof-name").value = p.name || "";
  document.getElementById("prof-email").value = p.email || "";
  document.getElementById("prof-phone").value = p.phone || "";
  document.getElementById("prof-location").value = p.location || "";
  document.getElementById("prof-degree").value = p.degree || "";
  document.getElementById("prof-inst").value = p.institution || "";
  document.getElementById("prof-linkedin").value = p.linkedin || "";
  document.getElementById("prof-github").value = p.github || "";

  currentSkills = p.skills || [];
  renderSkills();
  updateCopilotProfile(p);
}

function renderSkills() {
  const container = document.getElementById("skills-container");
  container.innerHTML = "";
  currentSkills.forEach((skill, index) => {
    const chip = document.createElement("span");
    chip.className = "inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sc-purple/15 border border-sc-purple/30 text-sc-purple rounded-xl text-xs font-semibold";
    chip.appendChild(createElement("span", "", skill));
    const removeButton = createElement("button", "text-sc-muted hover:text-white ml-1 font-bold", "×");
    removeButton.type = "button";
    removeButton.addEventListener("click", () => removeSkill(index));
    chip.appendChild(removeButton);
    container.appendChild(chip);
  });
}

function addSkill() {
  const input = document.getElementById("new-skill-input");
  const val = input.value.trim();
  if (val && !currentSkills.includes(val)) {
    currentSkills.push(val);
    renderSkills();
    input.value = "";
  }
}

function removeSkill(index) {
  currentSkills.splice(index, 1);
  renderSkills();
}

// Reset or Restore Candidate Profile
async function resetCandidateProfile(mode) {
  try {
    const res = await fetch(`/api/profile/reset?mode=${mode}`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      currentProfile = data.profile;
      populateProfileForm(currentProfile);
      loadDashboardData();
      showToast(mode === 'blank' ? "Ready for new candidate details / resume upload!" : `${data.profile.name}'s profile restored successfully!`, "success");
    }
  } catch (e) {
    showToast("Error resetting profile: " + e, "error");
  }
}

// Save Candidate Profile
async function saveProfile() {
  const payload = {
    ...currentProfile,
    name: document.getElementById("prof-name").value,
    email: document.getElementById("prof-email").value,
    phone: document.getElementById("prof-phone").value,
    location: document.getElementById("prof-location").value,
    degree: document.getElementById("prof-degree").value,
    institution: document.getElementById("prof-inst").value,
    linkedin: document.getElementById("prof-linkedin").value,
    github: document.getElementById("prof-github").value,
    skills: currentSkills
  };

  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      currentProfile = payload;
      populateProfileForm(currentProfile);
      updateNavUserProfile(currentProfile);
      showToast("Profile saved! Launching live discovery...", "success");
      loadDashboardData();
      setTimeout(() => switchTab("tab-jobs"), 500);
    }
  } catch (err) {
    showToast("Failed to save profile.", "error");
  }
}

// Setup Drag & Drop File Upload
function setupDragAndDrop() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("resume-file-input");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-sc-purple", "bg-sc-purple/20");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-sc-purple", "bg-sc-purple/20");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-sc-purple", "bg-sc-purple/20");
    if (e.dataTransfer.files.length) {
      uploadResumeFile(e.dataTransfer.files[0]);
    }
  });
}

function handleFileSelected(event) {
  if (event.target.files.length) {
    uploadResumeFile(event.target.files[0]);
  }
}

// Upload & Extract Resume PDF with Python PyPDF
async function uploadResumeFile(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    showToast("Please upload a valid PDF file.", "error");
    return;
  }

  showToast(`Parsing & extracting signals from ${file.name}...`, "info");
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      const statusBox = document.getElementById("upload-status");
      statusBox.classList.remove("hidden");
      document.getElementById("upload-status-text").textContent = `Parsed: ${file.name} (${data.parsed.skills.length} skills extracted)`;

      populateProfileForm(data.updated_profile);
      loadDashboardData();
      showToast("Resume parsed & skills auto-extracted by Python PyPDF!", "success");
    } else {
      showToast("Failed to parse resume.", "error");
    }
  } catch (err) {
    showToast("Upload error: " + err, "error");
  }
}

// Load Dashboard Metrics & Radial Ring
async function loadDashboardData() {
  try {
    const res = await fetch("/api/dashboard-stats");
    if (res.ok) {
      const stats = await res.json();
      
      const score = stats.ats_score || 96;
      document.getElementById("ats-score-display").textContent = `${score}%`;
      const circle = document.getElementById("ats-gauge-circle");
      if (circle) {
        const offset = 408.4 - (408.4 * score) / 100;
        circle.style.strokeDashoffset = offset;
      }

      if (stats.funnel) {
        const appliedEl = document.getElementById("funnel-applied-count");
        if (appliedEl) appliedEl.textContent = stats.funnel.applied || 0;
        const badge = document.getElementById("tracker-counter-badge");
        if (badge) badge.textContent = `${stats.funnel.applied || 0} Logged`;
      }
    }
  } catch (e) {
    console.error("Dashboard stats error:", e);
  }
}

// Load 5 Tailored Packages into Dashboard
async function loadTailoredPackages() {
  const container = document.getElementById("dashboard-tailored-grid");
  if (!container) return;

  try {
    const res = await fetch("/api/tailored-docs");
    if (res.ok) {
      const data = await res.json();
      container.innerHTML = "";
      
      data.tailored.forEach(pkg => {
        const card = document.createElement("div");
        card.className = "p-5 sc-card rounded-2xl border border-white/5 flex flex-col justify-between";
        const details = createElement("div");
        const badges = createElement("div", "flex items-center justify-between mb-2");
        badges.append(
          createElement("span", "text-[10px] font-extrabold uppercase tracking-wider text-sc-emerald px-2 py-0.5 rounded bg-sc-emerald/10 border border-sc-emerald/20", "Verified"),
          createElement("span", "text-xs font-bold text-sc-purple", "Tailored moderncv")
        );
        details.append(
          badges,
          createElement("h4", "text-sm font-extrabold text-white", pkg.company),
          createElement("p", "text-xs text-sc-muted mt-0.5", pkg.role),
          createElement("p", "text-[11px] text-sc-cyan mt-1", `📍 ${pkg.location}`)
        );

        const actions = createElement("div", "mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2");
        const guideButton = createElement("button", "btn-glass px-3 py-1.5 rounded-xl text-slate-200 text-xs font-bold flex items-center space-x-1");
        guideButton.type = "button";
        guideButton.title = "Guide Me With All Possibilities";
        guideButton.append(createIcon("compass", "w-3.5 h-3.5 text-sc-purple"), createElement("span", "", "Guide Me"));
        guideButton.addEventListener("click", () => openPossibilitiesGuide(pkg.company, pkg.role, pkg.location, pkg.url));

        const applyButton = createElement("button", "btn-superconscious px-3.5 py-1.5 rounded-xl text-white text-xs font-extrabold flex items-center space-x-1");
        applyButton.type = "button";
        applyButton.append(createElement("span", "", "Apply"), createIcon("external-link", "w-3 h-3"));
        applyButton.addEventListener("click", () => triggerDirectApply(pkg.company, pkg.role, pkg.location, pkg.url));
        actions.append(guideButton, applyButton);
        card.append(details, actions);
        container.appendChild(card);
      });
      lucide.createIcons();
    }
  } catch (err) {
    console.error("Failed to load tailored packages:", err);
  }
}

// Portal Badge Generator with Vibrant Portal Branding
function getPortalBadge(portal) {
  const p = (portal || "").toLowerCase();
  let classes;
  let label;
  if (p.includes("linkedin")) {
    classes = "bg-blue-500/15 text-blue-400 border-blue-500/30";
    label = "LinkedIn";
  } else if (p.includes("indeed")) {
    classes = "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
    label = "Indeed";
  } else if (p.includes("naukri")) {
    classes = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    label = "Naukri";
  } else if (p.includes("wellfound") || p.includes("angel")) {
    classes = "bg-rose-500/15 text-rose-300 border-rose-500/30";
    label = "Wellfound";
  } else if (p.includes("internshala")) {
    classes = "bg-sky-500/15 text-sky-300 border-sky-500/30";
    label = "Internshala";
  } else {
    classes = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    label = "Freehire Remote";
  }
  const badge = createElement("span", `px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${classes} flex items-center space-x-1.5`);
  badge.append(
    createElement("span", `w-1.5 h-1.5 rounded-full ${classes.split(" ")[0].replace("/15", "")} ${label === "Freehire Remote" ? "animate-pulse" : ""}`),
    createElement("span", "", label)
  );
  return badge;
}

// Execute Live Job Search across Multiple Genuine Portals & JD Filter
async function executeJobSearch() {
  const roleInput = document.getElementById("search-role-custom");
  const locInput = document.getElementById("search-location-custom");
  const portalInput = document.getElementById("search-portal");
  const jdInput = document.getElementById("search-jd-input");
  const jdMinInput = document.getElementById("search-jd-min");

  const role = roleInput ? roleInput.value : "Data Science Intern";
  const location = locInput ? locInput.value : "Bengaluru, Karnataka, India";
  const portal = portalInput ? portalInput.value : "all";
  const job_description = jdInput ? jdInput.value.trim() : "";
  const min_match_percentage = jdMinInput ? parseInt(jdMinInput.value) || 0 : 0;

  // Toggle JD Active Indicator Pill
  const jdIndicator = document.getElementById("jd-active-indicator");
  if (jdIndicator) {
    if (job_description.length > 0) {
      jdIndicator.classList.remove("hidden");
      jdIndicator.textContent = `🎯 JD Match Active (${job_description.split(/\s+/).filter(Boolean).length} words)`;
    } else {
      jdIndicator.classList.add("hidden");
    }
  }

  const btn = document.getElementById("search-btn");
  const loading = document.getElementById("loading-state");
  const container = document.getElementById("jobs-container");

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Hunting...</span>`;
  }
  if (loading) loading.classList.remove("hidden");
  if (container) container.innerHTML = "";
  lucide.createIcons();

  try {
    const res = await fetch("/api/search-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        location,
        portal,
        limit: 16,
        job_description,
        min_match_percentage
      })
    });
    const data = await res.json();
    
    const countEl = document.getElementById("stat-count");
    if (countEl) countEl.textContent = data.count || (data.jobs ? data.jobs.length : 0);
    renderJobCards(data.jobs || []);
  } catch (err) {
    if (container) container.innerHTML = `<div class="col-span-2 p-8 text-center text-rose-400 font-semibold">Search failed. Ensure backend server is active.</div>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="zap" class="w-4 h-4"></i><span>Hunt Jobs</span>`;
    }
    if (loading) loading.classList.add("hidden");
    lucide.createIcons();
    init3DTilt();
  }
}

// Render 3D Perspective Job Cards with Dual Alignment & All Possibilities Actions
function renderJobCards(jobs) {
  const container = document.getElementById("jobs-container");
  if (!container) return;
  container.innerHTML = "";

  if (jobs.length === 0) {
    const emptyState = createElement("div", "col-span-2 p-12 text-center sc-glass rounded-3xl border border-white/10");
    const iconBox = createElement("div", "w-12 h-12 bg-sc-bg border border-white/5 text-sc-muted rounded-2xl mx-auto flex items-center justify-center mb-3");
    iconBox.appendChild(createIcon("search-x", "w-6 h-6"));
    emptyState.append(
      iconBox,
      createElement("h4", "text-sm font-bold text-white", "No active vacancies found for this filter"),
      createElement("p", "text-xs text-sc-muted mt-1", 'Try lowering the minimum JD alignment threshold, clearing the JD filter, or selecting "All Genuine Portals".')
    );
    container.appendChild(emptyState);
    lucide.createIcons();
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "card-3d p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 border border-white/10 hover:border-sc-purple/40";

    const content = createElement("div");
    const header = createElement("div", "flex items-start justify-between gap-3");
    const info = createElement("div");
    const badges = createElement("div", "flex items-center space-x-2 mb-2");
    badges.appendChild(getPortalBadge(job.portal));
    if (job.jd_match_score !== undefined && job.jd_match_score !== null) {
      badges.appendChild(createElement("span", "px-2.5 py-0.5 bg-sc-purple/15 border border-sc-purple/30 text-sc-purple rounded-lg text-[10px] font-black", `🎯 ${job.jd_match_score}% JD Alignment`));
    }
    info.appendChild(badges);
    const jobUrl = safeHttpUrl(job.url);
    const title = createElement("h3", "text-base font-extrabold text-white leading-snug tracking-tight hover:text-sc-purple transition");
    if (jobUrl) {
      const titleLink = createElement("a", "cursor-pointer", job.title);
      titleLink.href = jobUrl;
      titleLink.target = "_blank";
      titleLink.rel = "noopener noreferrer";
      title.appendChild(titleLink);
    } else {
      title.appendChild(createElement("span", "", job.title));
    }
    info.append(title, createElement("p", "text-xs font-semibold text-sc-purple mt-1", `🏢 ${job.company}`));

    const fit = createElement("div", "flex-shrink-0 text-right");
    fit.appendChild(createElement("span", "px-3 py-1 bg-gradient-to-r from-sc-emerald/15 to-sc-cyan/15 border border-sc-emerald/30 text-sc-emerald rounded-xl text-xs font-black shadow-sm", `${job.fit_score}% Resume Fit`));
    header.append(info, fit);

    const metadata = createElement("div", "flex items-center space-x-3 text-xs text-sc-muted mt-3.5");
    const location = createElement("span", "flex items-center space-x-1");
    location.append(createIcon("map-pin", "w-3.5 h-3.5 text-sc-cyan"), createElement("span", "truncate max-w-[170px]", job.location));
    const date = createElement("span", "flex items-center space-x-1");
    date.append(createIcon("calendar", "w-3.5 h-3.5 text-slate-500"), createElement("span", "", job.date));
    metadata.append(location, createElement("span", "", "•"), date);

    const skillBadges = createElement("div", "mt-4 flex flex-wrap gap-1.5");
    (job.matched_skills || []).forEach(skill => {
      skillBadges.appendChild(createElement("span", "px-2.5 py-1 bg-sc-bg/90 border border-white/5 text-slate-300 rounded-lg text-[10px] font-semibold", skill));
    });
    content.append(header, metadata, skillBadges);

    if (job.matched_jd_skills && job.matched_jd_skills.length > 0) {
      const matched = createElement("div", "mt-2 text-[10px] text-sc-muted flex flex-wrap items-center gap-1.5");
      matched.append(
        createElement("span", "text-sc-purple font-bold", "Matches JD:"),
        createElement("span", "text-slate-300 font-semibold", job.matched_jd_skills.join(", "))
      );
      content.appendChild(matched);
    }

    const actions = createElement("div", "mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2");
    const guideButton = createElement("button", "btn-glass inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-200 hover:text-white");
    guideButton.type = "button";
    guideButton.append(createIcon("compass", "w-3.5 h-3.5 text-sc-purple"), createElement("span", "", "Guide Me (All Possibilities)"));
    guideButton.addEventListener("click", () => openPossibilitiesGuide(job.company, job.title, job.location, job.url));

    const rightActions = createElement("div", "flex items-center space-x-2");
    const resumeButton = createElement("button", "text-xs font-bold text-sc-muted hover:text-white flex items-center space-x-1 py-2 px-2.5 rounded-xl hover:bg-white/5 transition");
    resumeButton.type = "button";
    resumeButton.title = "Compile Tailored moderncv";
    resumeButton.append(createIcon("sparkles", "w-3.5 h-3.5 text-sc-cyan"), createElement("span", "", "LaTeX CV"));
    resumeButton.addEventListener("click", () => generateTailoredResume(job.company, job.title, job.location));

    const applyButton = createElement("button", "btn-superconscious inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-extrabold uppercase tracking-wider transition");
    applyButton.type = "button";
    applyButton.append(createIcon("send", "w-3 h-3"), createElement("span", "", "Apply ➔"));
    applyButton.addEventListener("click", () => triggerDirectApply(job.company, job.title, job.location, job.url));
    rightActions.append(resumeButton, applyButton);
    actions.append(guideButton, rightActions);
    card.append(content, actions);
    container.appendChild(card);
  });

  lucide.createIcons();
  init3DTilt();
}

// 1-CLICK DYNAMIC RESUME TAILORING
async function generateTailoredResume(company, role, location) {

  showToast(`⚡ Compiling tailored moderncv for ${company}...`, "info");

  try {
    const res = await fetch("/api/tailor-job-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, location })
    });
    const data = await res.json();
    if (data.cv_file) {
      openSafeUrl(`/api/download/${data.cv_file}`);
      showToast(data.status === "master_only"
        ? `📄 No tailored CV is available; opening the master CV for ${company}.`
        : `📄 Tailored ATS Resume ready for ${company}!`, "success");
    } else {
      showToast(`No CV file is available for ${company}.`, "error");
    }
  } catch (err) {
    showToast("Resume tailoring failed: " + err, "error");
  }
}

// ==============================================================
// ALL POSSIBILITIES APPLICATION GUIDANCE COPILOT
// ==============================================================
async function openPossibilitiesGuide(company, role, location, rawUrl) {
  const url = safeHttpUrl(rawUrl);

  showToast(`🧭 Generating All Possibilities guidance for ${company}...`, "info");

  try {
    const res = await fetch("/api/job-possibilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, location })
    });
    const data = await res.json();
    currentPossibilityData = { ...data, url };

    // Set Header
    document.getElementById("pos-modal-title").textContent = company;
    document.getElementById("pos-modal-role").textContent = `${role} • ${location}`;
    const openJobButton = document.getElementById("pos-open-job-btn");
    if (url) {
      openJobButton.href = url;
      openJobButton.classList.remove("hidden");
    } else {
      openJobButton.removeAttribute("href");
      openJobButton.classList.add("hidden");
    }

    // Set Pitch & Recruiter Text
    document.getElementById("pos-pitch-text").value = data.cover_pitch || "";
    document.getElementById("pos-recruiter-text").value = data.recruiter_msg || "";

    // Set Quick Answers Grid
    const answersGrid = document.getElementById("pos-quick-answers-grid");
    answersGrid.innerHTML = "";
    (data.quick_answers || []).forEach(item => {
      const box = document.createElement("div");
      box.className = "p-2.5 bg-sc-bg rounded-xl border border-white/5 flex flex-col justify-between cursor-pointer hover:border-sc-purple/50 transition group";
      box.addEventListener("click", () => copyText(item.value));
      const answer = createElement("div", "flex items-center justify-between mt-1");
      answer.append(
        createElement("span", "font-semibold text-slate-200 truncate pr-2", item.value),
        createIcon("copy", "w-3 h-3 text-sc-muted group-hover:text-sc-purple flex-shrink-0")
      );
      box.append(createElement("span", "text-[10px] text-sc-muted font-bold", `${item.label}:`), answer);
      answersGrid.appendChild(box);
    });

    // Set Interview Guide
    const talkingList = document.getElementById("pos-talking-points");
    talkingList.innerHTML = "";
    (data.interview_guide?.key_talking_points || []).forEach(pt => {
      const li = document.createElement("li");
      li.textContent = pt;
      talkingList.appendChild(li);
    });

    const questionsContainer = document.getElementById("pos-questions-container");
    questionsContainer.innerHTML = "";
    (data.interview_guide?.anticipated_questions || []).forEach(qItem => {
      const qBox = document.createElement("div");
      qBox.className = "p-3 bg-sc-bg/70 rounded-xl border border-white/5 space-y-1";
      qBox.append(
        createElement("p", "font-bold text-sc-cyan", `Q: ${qItem.q}`),
        createElement("p", "text-slate-300", `A: ${qItem.a}`)
      );
      questionsContainer.appendChild(qBox);
    });

    // Set LaTeX CV & Cover links
    const cvDownload = document.getElementById("pos-download-cv-btn");
    const cvUrl = data.cv_file ? safeHttpUrl(`/api/download/${data.cv_file}`) : null;
    if (cvUrl) {
      cvDownload.href = cvUrl;
      cvDownload.classList.remove("hidden");
    } else {
      cvDownload.removeAttribute("href");
      cvDownload.classList.add("hidden");
    }
    const coverDownload = document.getElementById("pos-download-cover-btn");
    const coverUrl = data.cover_file ? safeHttpUrl(`/api/download/${data.cover_file}`) : null;
    if (coverUrl) {
      coverDownload.href = coverUrl;
      coverDownload.classList.remove("hidden");
    } else {
      coverDownload.removeAttribute("href");
      coverDownload.classList.add("hidden");
    }

    // Show Modal & set default tab
    switchPosTab('pitch');
    document.getElementById("possibilities-modal").classList.remove("hidden");
    lucide.createIcons();
  } catch (err) {
    showToast("Failed to generate guidance: " + err, "error");
  }
}

function closePossibilitiesModal() {
  document.getElementById("possibilities-modal").classList.add("hidden");
}

function switchPosTab(subTab) {
  const tabs = ["pitch", "recruiter", "form", "interview", "cv"];
  tabs.forEach(t => {
    const view = document.getElementById(`pos-view-${t}`);
    const btn = document.getElementById(`pos-tab-${t}-btn`);
    if (t === subTab) {
      view.classList.remove("hidden");
      btn.className = "px-4 py-2 text-xs font-bold border-b-2 border-sc-purple text-white transition";
    } else {
      view.classList.add("hidden");
      btn.className = "px-4 py-2 text-xs font-bold border-b-2 border-transparent text-sc-muted hover:text-white transition";
    }
  });
  lucide.createIcons();
}

function copyPosPitch() {
  const pitch = document.getElementById("pos-pitch-text").value;
  navigator.clipboard.writeText(pitch);
  showToast("Tailored Cover Pitch copied to clipboard!", "success");
}

function copyPosRecruiter() {
  const msg = document.getElementById("pos-recruiter-text").value;
  navigator.clipboard.writeText(msg);
  showToast("Recruiter Outreach Message copied to clipboard!", "success");
}

// ==============================================================
// TAB 4: ANTI-AI HUMANIZER & BEHAVIORAL COPILOT LAB
// ==============================================================

// Load Sample AI text for testing
function loadSampleAiText() {
  const sample = "As an ambitious engineer, I orchestrated a cutting-edge machine learning framework, leveraging neural networks to meticulously optimize transaction data as a testament to our team's innovation in today's rapidly evolving landscape.";
  document.getElementById("humanize-input").value = sample;
  showToast("Loaded sample with ChatGPT buzzwords!", "info");
}

// Run Anti-AI Humanizer
async function runHumanizer() {
  const input = document.getElementById("humanize-input").value.trim();
  if (!input) {
    showToast("Please enter text to humanize.", "error");
    return;
  }

  showToast("Scanning for AI detection buzzwords...", "info");

  try {
    const res = await fetch("/api/anti-ai-humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    });
    const data = await res.json();

    document.getElementById("humanize-output").value = data.humanized_text;
    document.getElementById("human-score-badge").textContent = `${data.human_authenticity_score}% Human Score`;

    // Show buzzwords
    const buzzBox = document.getElementById("buzzwords-detected-box");
    const countEl = document.getElementById("buzzwords-count");
    const listEl = document.getElementById("buzzwords-list");

    if (data.buzzwords_detected > 0) {
      buzzBox.classList.remove("hidden");
      countEl.textContent = `${data.buzzwords_detected} Replaced`;
      listEl.innerHTML = "";
      data.buzzwords_list.forEach(w => {
        const badge = document.createElement("span");
        badge.className = "px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-mono";
        badge.textContent = `🚫 ${w}`;
        listEl.appendChild(badge);
      });
    } else {
      buzzBox.classList.remove("hidden");
      countEl.textContent = "0 AI Clichés (Already Clean!)";
      listEl.innerHTML = `<span class="text-sc-emerald text-[11px] font-bold">Passed all AI recruiter keyword filters!</span>`;
    }

    showToast(`✨ Humanized with ${data.human_authenticity_score}% Authenticity Score!`, "success");
  } catch (err) {
    showToast("Humanizer error: " + err, "error");
  }
}

function copyHumanized() {
  const text = document.getElementById("humanize-output").value;
  if (!text) return;
  navigator.clipboard.writeText(text);
  showToast("Human-cleaned text copied to clipboard!", "success");
}

// STAR Solver Presets
function setStarQuestion(type) {
  const input = document.getElementById("star-question-input");
  if (type === "bug") {
    input.value = "Describe a challenging bug or class imbalance problem you solved.";
  } else if (type === "deadline") {
    input.value = "Describe a high-pressure deadline or hackathon delivery challenge.";
  } else {
    input.value = "Walk through how you built and deployed a computer vision deep learning model.";
  }
  runStarSolver();
}

// Run Grounded STAR Solver
async function runStarSolver() {
  const question = document.getElementById("star-question-input").value.trim();
  if (!question) return;

  showToast("Retrieving grounded project evidence...", "info");

  try {
    const res = await fetch("/api/star-solver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    const s = data.story;

    document.getElementById("star-story-title").textContent = `${s.project} — ${s.title}`;
    document.getElementById("star-sit").textContent = s.situation;
    document.getElementById("star-task").textContent = s.task;
    document.getElementById("star-action").textContent = s.action;
    document.getElementById("star-res").textContent = s.result;

    currentStarFullAnswer = s.full_answer;
    showToast("Grounded STAR answer ready!", "success");
  } catch (err) {
    showToast("STAR Solver error: " + err, "error");
  }
}

function copyStarAnswer() {
  if (!currentStarFullAnswer) {
    const sit = document.getElementById("star-sit").textContent;
    const task = document.getElementById("star-task").textContent;
    const act = document.getElementById("star-action").textContent;
    const res = document.getElementById("star-res").textContent;
    currentStarFullAnswer = `Situation: ${sit}\nTask: ${task}\nAction: ${act}\nResult: ${res}`;
  }
  navigator.clipboard.writeText(currentStarFullAnswer);
  showToast("STAR answer copied to clipboard!", "success");
}

// Run Semantic Gap Audit
async function runSemanticGapAudit() {
  const text = document.getElementById("gap-role-input").value.trim();
  if (!text) return;

  showToast("Auditing semantic skill fit vs gaps...", "info");

  try {
    const res = await fetch("/api/semantic-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: text, job_description: text })
    });
    const data = await res.json();

    const badge = document.getElementById("gap-tier-badge");
    badge.textContent = `${data.tier} (${data.fit_percentage}%)`;

    if (data.fit_percentage >= 80) {
      badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sc-emerald/15 text-sc-emerald border border-sc-emerald/30";
    } else if (data.fit_percentage >= 60) {
      badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sc-cyan/15 text-sc-cyan border border-sc-cyan/30";
    } else {
      badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30";
    }

    document.getElementById("gap-recommendation").textContent = data.recommendation;
    document.getElementById("gap-strengths").textContent = data.matched_strengths.join(", ");
    document.getElementById("gap-missing").textContent = data.skill_gaps.join(", ");

    showToast(`Audit complete: ${data.fit_percentage}% Semantic Fit!`, "success");
  } catch (err) {
    showToast("Audit error: " + err, "error");
  }
}

// DIRECT APPLY TRIGGER: Opens Link, logs to Tracker, and opens Guidance Modal
async function triggerDirectApply(company, title, location, rawUrl) {
  const url = safeHttpUrl(rawUrl);
  if (!url) {
    showToast("This job link is invalid or uses an unsupported protocol.", "error");
    return;
  }

  openSafeUrl(url);

  try {
    await fetch("/api/track-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role: title, location, url })
    });
    loadDashboardData();
  } catch (e) {
    console.error("Tracking log error:", e);
  }

  showToast(`🚀 Direct Apply launched for ${company}! Saved to tracker.`, "success");
}

// Tracker Modal
async function openTrackerModal() {
  const modal = document.getElementById("tracker-modal");
  modal.classList.remove("hidden");

  const trackerBody = document.getElementById("tracker-table-body");
  trackerBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-sc-muted">Loading history...</td></tr>`;

  try {
    const trackRes = await fetch("/api/tracker");
    const trackData = await trackRes.json();
    trackerBody.innerHTML = "";

    if (trackData.records.length === 0) {
      trackerBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-sc-muted">No applications recorded yet.</td></tr>`;
    } else {
      trackData.records.reverse().forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-white/5 transition";
        [
          ["p-3 text-sc-muted font-mono", row.Date || "-"],
          ["p-3 font-bold text-white", row.Company || "-"],
          ["p-3 text-slate-300", row.Role || "-"],
          ["p-3 text-sc-muted", row.Location || "-"]
        ].forEach(([className, value]) => {
          tr.appendChild(createElement("td", className, value));
        });
        const statusCell = createElement("td", "p-3");
        statusCell.appendChild(createElement("span", "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sc-emerald/15 text-sc-emerald border border-sc-emerald/30", row.Status || "Applied"));
        tr.appendChild(statusCell);

        const linkCell = createElement("td", "p-3 text-right");
        const rowUrl = safeHttpUrl(row.URL);
        if (rowUrl) {
          const link = createElement("a", "text-sc-cyan hover:underline inline-flex items-center space-x-1 font-semibold");
          link.href = rowUrl;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.append(createElement("span", "", "View"), createIcon("external-link", "w-3 h-3"));
          linkCell.appendChild(link);
        } else {
          linkCell.appendChild(createElement("span", "text-sc-muted", "Unavailable"));
        }
        tr.appendChild(linkCell);
        trackerBody.appendChild(tr);
      });
    }
    lucide.createIcons();
  } catch (err) {
    trackerBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-rose-400">Failed to load tracker records.</td></tr>`;
  }
}

function closeTrackerModal() {
  document.getElementById("tracker-modal").classList.add("hidden");
}

function copyText(txt) {
  navigator.clipboard.writeText(txt);
  showToast(`Copied: "${txt}"`, "info");
}

// Toast Notifications
function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  const icon = document.getElementById("toast-icon");

  msgEl.textContent = msg;

  if (type === "success") {
    toast.className = "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 shadow-2xl bg-sc-card border-sc-emerald/40 text-sc-emerald animate-in fade-in slide-in-from-bottom-4 duration-200";
    icon.setAttribute("data-lucide", "check-circle");
  } else if (type === "error") {
    toast.className = "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 shadow-2xl bg-sc-card border-rose-500/40 text-rose-400 animate-in fade-in slide-in-from-bottom-4 duration-200";
    icon.setAttribute("data-lucide", "alert-circle");
  } else {
    toast.className = "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 shadow-2xl bg-sc-card border-sc-purple/40 text-sc-purple animate-in fade-in slide-in-from-bottom-4 duration-200";
    icon.setAttribute("data-lucide", "info");
  }

  lucide.createIcons();
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
}

// ============================================================
// JOB DESCRIPTION (JD MATCHER) DRAWER CONTROLS
// ============================================================
function toggleJdDrawer() {
  const drawer = document.getElementById("jd-drawer");
  const arrow = document.getElementById("jd-toggle-arrow");
  if (!drawer) return;

  if (drawer.classList.contains("hidden")) {
    drawer.classList.remove("hidden");
    if (arrow) arrow.textContent = "▲";
    const input = document.getElementById("search-jd-input");
    if (input) input.focus();
  } else {
    drawer.classList.add("hidden");
    if (arrow) arrow.textContent = "▼";
  }
}

function clearJdFilter() {
  const input = document.getElementById("search-jd-input");
  const minInput = document.getElementById("search-jd-min");
  const ind = document.getElementById("jd-active-indicator");
  if (input) input.value = "";
  if (minInput) minInput.value = "0";
  if (ind) ind.classList.add("hidden");
  showToast("Job Description filter cleared", "info");
  executeJobSearch();
}

// ============================================================
// AUTHENTICATION & MULTI-CANDIDATE CREDENTIAL SWITCHER
// ============================================================
function openAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("hidden");
    init3DTilt();
  }
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.add("hidden");
}

async function quickLoginPreset(presetId) {
  try {
    showToast(`Switching profile to ${presetId.toUpperCase()}...`, "info");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_id: presetId })
    });
    const data = await res.json();
    if (data.profile) {
      currentProfile = data.profile;
      populateProfileForm(data.profile);
      updateNavUserProfile(data.profile);
      closeAuthModal();
      showToast(`Welcome ${data.profile.name}! Workspace synchronized.`, "success");
      executeJobSearch();
    }
  } catch (err) {
    showToast("Profile switch failed: " + err, "error");
  }
}

async function submitCustomAuth() {
  const nameInput = document.getElementById("auth-name-input");
  const emailInput = document.getElementById("auth-email-input");

  const customName = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";

  if (!customName && !email) {
    showToast("Please enter your name or email address", "error");
    return;
  }

  try {
    showToast("Authenticating & personalizing candidate profile...", "info");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custom_name: customName,
        email: email,
        profile_id: "guest"
      })
    });
    const data = await res.json();
    if (data.profile) {
      currentProfile = data.profile;
      populateProfileForm(data.profile);
      updateNavUserProfile(data.profile);
      closeAuthModal();
      showToast(`Logged in as ${data.profile.name}!`, "success");
      executeJobSearch();
    }
  } catch (err) {
    showToast("Authentication error: " + err, "error");
  }
}

function updateNavUserProfile(p) {
  if (!p) return;
  const nameEl = document.getElementById("nav-user-name");
  const initEl = document.getElementById("nav-user-initial");

  const parts = (p.name || "Candidate").trim().split(/\s+/);
  const shortName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : (parts[0] || "Candidate");

  if (nameEl) nameEl.textContent = shortName;
  if (initEl) initEl.textContent = (p.name || "C").charAt(0).toUpperCase();
}

function updateCopilotProfile(profile) {
  const fields = {
    "copilot-name": ["name", "copilot-name-chip"],
    "copilot-email": ["email", "copilot-email-chip"],
    "copilot-phone": ["phone", "copilot-phone-chip"],
    "copilot-degree": ["degree", "copilot-degree-chip"],
    "copilot-github": ["github", "copilot-github-chip"],
    "copilot-linkedin": ["linkedin", "copilot-linkedin-chip"]
  };
  Object.entries(fields).forEach(([valueId, [field, chipId]]) => {
    const valueElement = document.getElementById(valueId);
    const chip = document.getElementById(chipId);
    if (!valueElement) return;
    if (valueId === "copilot-degree") {
      valueElement.textContent = [profile.degree, profile.institution].filter(Boolean).join(" — ");
    } else {
      valueElement.textContent = profile[field] || "";
    }
    if (chip && chip.dataset.copyHandlerAdded !== "true") {
      chip.addEventListener("click", () => {
        const copyValue = field === "degree"
          ? [currentProfile.degree, currentProfile.institution].filter(Boolean).join(" — ")
          : currentProfile[field] || "";
        copyText(copyValue);
      });
      chip.dataset.copyHandlerAdded = "true";
    }
  });
}

// ============================================================
// 3D PERSPECTIVE PARALLAX TILT ENGINE (Tactile Glass Effect)
// ============================================================
function init3DTilt() {
  const cards = document.querySelectorAll(".card-3d");
  cards.forEach(card => {
    if (card._hasTilt) return;
    card._hasTilt = true;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Soft dynamic tilt angle between -7deg and +7deg
      const rotateX = ((y - centerY) / centerY) * -6.5;
      const rotateY = ((x - centerX) / centerX) * 6.5;

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) translateZ(6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)";
    });
  });
}
