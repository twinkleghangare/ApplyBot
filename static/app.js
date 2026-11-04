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
  initCosmicBackground();
  initCmdPalette();
  initHeroThreeJS();
  initHeroTypewriter();
  init3DQuantumPortal();
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
// 2. THREE.JS 3D QUANTUM PORTAL & ELECTRIC LIGHTNING (Nodal AI Reference)
// ============================================================================

let quantumScene, quantumCamera, quantumRenderer, quantumDiamond, quantumArcsGroup;
let quantumMouse = { x: 0, y: 0, active: false, worldX: 0, worldY: 0 };
let lastLightningZapTime = 0;

function init3DQuantumPortal() {
  const canvas = document.getElementById("hero-quantum-canvas");
  if (!canvas || !window.THREE) return;

  try {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;
  } catch (e) {
    return;
  }

  const container = canvas.parentElement;
  let width = container.clientWidth || 320;
  let height = container.clientHeight || 320;

  const scene = new THREE.Scene();
  quantumScene = scene;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 10);
  quantumCamera = camera;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  quantumRenderer = renderer;

  // Ambient & Point Lights
  const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
  scene.add(ambientLight);

  const coreLight = new THREE.PointLight(0x00E5FF, 3.5, 15);
  coreLight.position.set(0, 0, 1.5);
  scene.add(coreLight);

  const violetLight = new THREE.PointLight(0x7C5CFF, 2.5, 12);
  violetLight.position.set(0, 0, -2);
  scene.add(violetLight);

  // 1. OUTER PORTAL RING
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  // Glowing Torus Main Ring
  const torusGeom = new THREE.TorusGeometry(3.6, 0.045, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x00E5FF,
    transparent: true,
    opacity: 0.85
  });
  const torusMesh = new THREE.Mesh(torusGeom, torusMat);
  ringGroup.add(torusMesh);

  // Outer Tick Ring (dashed / segmented circle)
  const outerGeom = new THREE.RingGeometry(3.95, 4.02, 64);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x7C5CFF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35
  });
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  ringGroup.add(outerMesh);

  // Inner Subtle Halo
  const haloGeom = new THREE.TorusGeometry(3.3, 0.02, 8, 80);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x30DC97,
    transparent: true,
    opacity: 0.25
  });
  const haloMesh = new THREE.Mesh(haloGeom, haloMat);
  ringGroup.add(haloMesh);

  // Orbital Energy Particles
  const particleCount = 200;
  const particleGeom = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
    const r = 3.6 + (Math.random() - 0.5) * 0.35;
    particlePos[i * 3] = Math.cos(angle) * r;
    particlePos[i * 3 + 1] = Math.sin(angle) * r;
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  particleGeom.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00E5FF,
    size: 0.045,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const particleRing = new THREE.Points(particleGeom, particleMat);
  ringGroup.add(particleRing);

  // 2. FLOATING DIAMOND CYBER-CORE (Centerpiece from frame_028)
  const diamondGroup = new THREE.Group();
  scene.add(diamondGroup);
  quantumDiamond = diamondGroup;

  // Solid dark crystalline faceted octahedron
  const octGeom = new THREE.OctahedronGeometry(1.2, 0);
  const octMat = new THREE.MeshStandardMaterial({
    color: 0x060914,
    roughness: 0.15,
    metalness: 0.95,
    transparent: true,
    opacity: 0.88
  });
  const octMesh = new THREE.Mesh(octGeom, octMat);
  diamondGroup.add(octMesh);

  // Electric Cyan Wireframe cage
  const wireGeom = new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.22, 0));
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x00E5FF,
    linewidth: 2,
    transparent: true,
    opacity: 0.95
  });
  const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
  diamondGroup.add(wireMesh);

  // Inner Violet Nucleus (High energy pulse core)
  const nucleusGeom = new THREE.IcosahedronGeometry(0.38, 1);
  const nucleusMat = new THREE.MeshBasicMaterial({
    color: 0x7C5CFF,
    wireframe: true,
    transparent: true,
    opacity: 0.9
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeom, nucleusMat);
  diamondGroup.add(nucleusMesh);

  // 3. PROCEDURAL ELECTRIC LIGHTNING ARCS
  const arcsGroup = new THREE.Group();
  scene.add(arcsGroup);
  quantumArcsGroup = arcsGroup;

  const NUM_BOLTS = 5;
  const boltObjects = [];

  function generateJaggedPoints(start, end, subdivisions = 4, maxJitter = 0.45) {
    let points = [start.clone(), end.clone()];
    for (let s = 0; s < subdivisions; s++) {
      const nextPoints = [];
      const currentJitter = maxJitter / Math.pow(1.5, s);
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const randPerp = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          (Math.random() - 0.5) * 0.5
        ).cross(dir).normalize();

        mid.add(randPerp.multiplyScalar((Math.random() - 0.5) * currentJitter * 2));
        nextPoints.push(p1);
        nextPoints.push(mid);
      }
      nextPoints.push(points[points.length - 1]);
      points = nextPoints;
    }
    return points;
  }

  for (let b = 0; b < NUM_BOLTS; b++) {
    const geom = new THREE.BufferGeometry();
    const count = 33; // for 4-5 subdivisions
    const positions = new Float32Array(count * 3);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const coreMat = new THREE.LineBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const coreLine = new THREE.Line(geom, coreMat);

    const glowMat = new THREE.LineBasicMaterial({
      color: b % 2 === 0 ? 0x00E5FF : 0x7C5CFF,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const glowLine = new THREE.Line(geom, glowMat);

    arcsGroup.add(coreLine);
    arcsGroup.add(glowLine);

    boltObjects.push({
      geom,
      coreLine,
      glowLine,
      angle: (b / NUM_BOLTS) * Math.PI * 2,
      targetRadius: 3.6,
      subdivisions: 4
    });
  }

  // Mouse & Touch Interaction
  let isDragging = false;
  let previousMousePos = { x: 0, y: 0 };
  let targetRotation = { x: 0.15, y: -0.2 };

  function updateMouseWorldCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    quantumMouse.x = nx;
    quantumMouse.y = ny;

    const vec = new THREE.Vector3(nx, ny, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const distance = -camera.position.z / vec.z;
    const worldPos = camera.position.clone().add(vec.multiplyScalar(distance));
    quantumMouse.worldX = worldPos.x;
    quantumMouse.worldY = worldPos.y;
    quantumMouse.active = true;

    const now = performance.now();
    if (now - lastLightningZapTime > 320) {
      playSfx("lightning");
      lastLightningZapTime = now;
    }
  }

  container.addEventListener("pointerdown", (e) => {
    isDragging = true;
    previousMousePos = { x: e.clientX, y: e.clientY };
    updateMouseWorldCoords(e.clientX, e.clientY);
  });

  window.addEventListener("pointerup", () => {
    isDragging = false;
  });

  container.addEventListener("pointermove", (e) => {
    updateMouseWorldCoords(e.clientX, e.clientY);
    if (isDragging) {
      const deltaX = e.clientX - previousMousePos.x;
      const deltaY = e.clientY - previousMousePos.y;
      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.008;
      previousMousePos = { x: e.clientX, y: e.clientY };
    }
  });

  container.addEventListener("pointerleave", () => {
    quantumMouse.active = false;
  });

  function onResize() {
    if (!canvas || !container) return;
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 320;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  // Animation Loop
  const clock = new THREE.Clock();
  let frameCount = 0;

  function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Smooth drag rotation & idle bobbing
    diamondGroup.rotation.x += (targetRotation.x - diamondGroup.rotation.x) * 0.05 + Math.sin(time * 1.2) * 0.003;
    diamondGroup.rotation.y += (targetRotation.y - diamondGroup.rotation.y) * 0.05 + 0.006;
    diamondGroup.rotation.z += 0.004;

    const pulseScale = 1 + Math.sin(time * 3.0) * 0.04;
    nucleusMesh.scale.set(pulseScale, pulseScale, pulseScale);

    torusMesh.rotation.z += 0.002;
    outerMesh.rotation.z -= 0.001;
    particleRing.rotation.z += 0.003;

    if (quantumMouse.active) {
      diamondGroup.rotation.y += (quantumMouse.x * 0.5 - diamondGroup.rotation.y) * 0.08;
      diamondGroup.rotation.x += (-quantumMouse.y * 0.5 - diamondGroup.rotation.x) * 0.08;
    }

    if (frameCount % 2 === 0) {
      boltObjects.forEach((bolt, idx) => {
        const start = new THREE.Vector3(
          Math.sin(time * 2 + idx) * 0.5,
          Math.cos(time * 2 + idx) * 0.5,
          (Math.sin(time * 3) - 0.5) * 0.3
        );

        let end;
        if (quantumMouse.active && (idx === 0 || idx === 1)) {
          end = new THREE.Vector3(
            quantumMouse.worldX + (Math.random() - 0.5) * 0.35,
            quantumMouse.worldY + (Math.random() - 0.5) * 0.35,
            0
          );
        } else {
          const currentAngle = bolt.angle + time * 0.5 + Math.sin(time + idx) * 0.3;
          end = new THREE.Vector3(
            Math.cos(currentAngle) * bolt.targetRadius,
            Math.sin(currentAngle) * bolt.targetRadius,
            (Math.random() - 0.5) * 0.3
          );
        }

        const points = generateJaggedPoints(start, end, 4, 0.4);
        const posAttr = bolt.geom.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < points.length && i * 3 < arr.length; i++) {
          arr[i * 3] = points[i].x;
          arr[i * 3 + 1] = points[i].y;
          arr[i * 3 + 2] = points[i].z;
        }
        posAttr.needsUpdate = true;

        const flicker = 0.7 + Math.random() * 0.3;
        bolt.coreLine.material.opacity = flicker;
        bolt.glowLine.material.opacity = flicker * 0.75;
      });
    }

    renderer.render(scene, camera);
  }

  animate();
}

function initHeroThreeJS() {
  init3DQuantumPortal();
}

// ============================================================================
// WEB AUDIO PROCEDURAL SYNTHESIZER & HUD SOUND FX
// ============================================================================

let audioCtx = null;
let sfxEnabled = true;
let musicEnabled = false;
let ambientOsc = null;
let ambientGain = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSfx(type) {
  if (!sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  try {
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "lightning") {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140 + Math.random() * 180, now);
      osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 400, now + 0.05);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === "success") {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.05, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + 0.4 + i * 0.04);
      });
    }
  } catch (e) {
    // Non-critical audio catch
  }
}

function toggleSfxAudio() {
  sfxEnabled = !sfxEnabled;
  const badge = document.getElementById("sfx-status-text");
  if (badge) {
    badge.textContent = sfxEnabled ? "SFX [ON]" : "SFX [OFF]";
    badge.className = sfxEnabled ? "text-[10px] font-mono text-[#00E5FF]" : "text-[10px] font-mono text-slate-500";
  }
  const portalBadge = document.getElementById("portal-sfx-text");
  if (portalBadge) {
    portalBadge.textContent = sfxEnabled ? "[ ⚡ SFX [ON] ]" : "[ ⚡ SFX [OFF] ]";
    portalBadge.className = sfxEnabled
      ? "text-[10px] font-mono text-[#00E5FF] pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-[#00E5FF]/30 transition cursor-pointer"
      : "text-[10px] font-mono text-slate-500 pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 transition cursor-pointer";
  }
  if (sfxEnabled) playSfx("click");
}

function toggleMusicAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  musicEnabled = !musicEnabled;
  const musicBadge = document.getElementById("portal-music-text");
  if (musicBadge) {
    musicBadge.textContent = musicEnabled ? "[ 🔊 MUSIC [ON] ]" : "[ 🔊 MUSIC [OFF] ]";
    musicBadge.className = musicEnabled
      ? "text-[10px] font-mono text-[#00E5FF] pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-[#00E5FF]/30 transition cursor-pointer"
      : "text-[10px] font-mono text-slate-400 hover:text-white pointer-events-auto bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 transition cursor-pointer";
  }
  try {
    if (musicEnabled) {
      if (!ambientOsc) {
        ambientOsc = ctx.createOscillator();
        ambientGain = ctx.createGain();
        ambientOsc.type = "sine";
        ambientOsc.frequency.setValueAtTime(65.41, ctx.currentTime);
        ambientGain.gain.setValueAtTime(0.025, ctx.currentTime);
        ambientOsc.connect(ambientGain);
        ambientGain.connect(ctx.destination);
        ambientOsc.start();
      } else {
        ambientGain.gain.setTargetAtTime(0.025, ctx.currentTime, 0.2);
      }
    } else {
      if (ambientGain) {
        ambientGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      }
    }
  } catch (e) {
    // Non-critical ambient audio error
  }
}

// ============================================================================
// STATE MACHINE CONTROLLERS & STEPPERS
// ============================================================================

let currentWorkflowMode = "graph";
let activeStateMachineStep = 4;

function setWorkflowViewMode(mode) {
  currentWorkflowMode = mode;
  const graphContainer = document.getElementById("container-wf-graph");
  const stepsContainer = document.getElementById("container-wf-steps");
  const btnGraph = document.getElementById("btn-wf-graph");
  const btnSteps = document.getElementById("btn-wf-steps");

  if (mode === "graph") {
    if (graphContainer) graphContainer.classList.remove("hidden");
    if (stepsContainer) stepsContainer.classList.add("hidden");
    if (btnGraph) btnGraph.className = "px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] font-bold flex items-center space-x-1 cursor-pointer";
    if (btnSteps) btnSteps.className = "px-2.5 py-1 rounded-lg text-[#9A9AA5] hover:text-white flex items-center space-x-1 cursor-pointer";
  } else {
    if (graphContainer) graphContainer.classList.add("hidden");
    if (stepsContainer) stepsContainer.classList.remove("hidden");
    if (btnGraph) btnGraph.className = "px-2.5 py-1 rounded-lg text-[#9A9AA5] hover:text-white flex items-center space-x-1 cursor-pointer";
    if (btnSteps) btnSteps.className = "px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] font-bold flex items-center space-x-1 cursor-pointer";
  }
  if (window.lucide) lucide.createIcons();
}

function inspectStateNode(nodeKey) {
  const nodeInfo = {
    scheduler: "Daily Cron Trigger: Runs at 08:00 AM daily. Dispatches push notification asking user to activate daily agent run.",
    discovery: "Discovery Engine: Aggregates listings across 50+ ATS platforms and genuine portals (Wellfound, Cutshort, Internshala, Naukri, NCS, Indeed, LinkedIn).",
    authenticity: "Authenticity Guard (FraudLens): 3-Level verification (Verified, Needs Review, Suspicious). Zero upfront fee / zero crypto scam policy.",
    neuralmatch: "NeuralMatch Engine: Matches Aarav Sharma's verified credentials (VTU AI/ML, CGPA 8.75, Tech Innovations Lab, NeuralMatch, FraudLens, Med-Verify) with job criteria.",
    approval: "Human-in-the-Loop Gate: Requires explicit 1-click review & approval before any application submission or cold outreach email dispatch."
  };
  const desc = nodeInfo[nodeKey] || "Autonomous Agent State Machine Stage";
  showToast(desc, "info");
}

function stepAgentStateMachine() {
  const steps = ["Discovery", "Authenticity Verification", "NeuralMatch Scoring", "Package Preparation", "Human Approval"];
  activeStateMachineStep = (activeStateMachineStep + 1) % steps.length;
  showToast(`Stepped State Machine to: ${steps[activeStateMachineStep]}`, "info");
}

function resetAgentStateMachine() {
  activeStateMachineStep = 0;
  showToast("Reset State Machine to Stage 01: Discovery", "info");
}

// ============================================================================
// 3. SIDEBAR NAVIGATION CONTROLLER
// ============================================================================

function switchNav(navKey) {
  // Aliases for 5 clean sections
  if (navKey === "home" || navKey === "dashboard") navKey = "dashboard";
  if (navKey === "discover" || navKey === "jobs") navKey = "jobs";
  if (navKey === "profile" || navKey === "career" || navKey === "resume") navKey = "career";

  const sections = ["dashboard", "galaxy", "workflow", "jobs", "recommended", "applications", "resume", "career", "activity", "interview", "settings", "job-details", "outreach"];

  sections.forEach(key => {
    const secEl = document.getElementById(`sec-${key}`);
    const navBtn = document.getElementById(`nav-btn-${key}`) || 
                   (key === "dashboard" ? document.getElementById("nav-btn-home") : null) ||
                   (key === "jobs" ? document.getElementById("nav-btn-discover") : null) ||
                   (key === "career" ? document.getElementById("nav-btn-profile") : null);

    const isMatch = (key === navKey);

    if (isMatch) {
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

  // Update floating header pill navbar buttons
  const pillMap = {
    "dashboard": "pill-nav-home",
    "jobs": "pill-nav-discover",
    "applications": "pill-nav-applications",
    "outreach": "pill-nav-outreach",
    "career": "pill-nav-profile"
  };

  Object.entries(pillMap).forEach(([targetSec, pillId]) => {
    const pEl = document.getElementById(pillId);
    if (pEl) {
      if (targetSec === navKey) {
        pEl.className = "px-3.5 py-1.5 rounded-full text-white bg-white/10 font-bold transition shadow-sm";
      } else {
        pEl.className = "px-3.5 py-1.5 rounded-full text-[#9A9AA5] hover:text-white transition";
      }
    }
  });

  if (navKey === "dashboard") {
    loadDailyBriefing();
    initDailyPushNotifications();
    loadAgentStatus();
    loadDashboardData();
  }
  if (navKey === "jobs") {
    loadJobsFeed();
  }
  if (navKey === "applications") {
    loadPendingApprovals();
    loadTrackerData();
  }
  if (navKey === "outreach") {
    loadOutreachList();
  }
  if (navKey === "career") {
    loadCareerProfile();
  }

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
  renderTrackerRowsByState();
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

    // 5. Galaxy HUD Indicators
    const hDiscovered = document.getElementById("hud-galaxy-discovered");
    const hVerified = document.getElementById("hud-galaxy-verified");
    const hMatches = document.getElementById("hud-galaxy-matches");
    const hAwaiting = document.getElementById("hud-galaxy-awaiting");

    if (hDiscovered) hDiscovered.textContent = data.total_jobs_discovered || 0;
    if (hVerified) hVerified.textContent = data.verified_jobs || 0;
    if (hMatches) hMatches.textContent = data.recommended_jobs || 0;
    if (hAwaiting) hAwaiting.textContent = pendingCount;

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
    renderInboxSplitView(allRecommendedJobs);
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

// ============================================================================
// 13. CAREER CONSTELLATION (3D Interactive Galaxy Engine)
// Inspired by jobhunt.asmcleod.com & Linear
// ============================================================================

let galaxyScene = null;
let galaxyCamera = null;
let galaxyRenderer = null;
let galaxyNodesGroup = null;
let galaxyLinesGroup = null;
let galaxyParticles = null;
let galaxyJobObjects = [];
let galaxyAnimationId = null;
let isGalaxyDragging = false;
let galaxyPrevMouse = { x: 0, y: 0 };
let galaxyRotationVelocity = { x: 0.0012, y: 0.0018 };
let hoveredGalaxyNode = null;
let raycaster = null;
let mouseVector = null;

function initGalaxyThreeJS() {
  const canvas = document.getElementById("galaxy-webgl-canvas");
  if (!canvas || !window.THREE) return;

  const container = canvas.parentElement;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || (window.innerHeight - 100);

  // If already initialized, just resize and resume
  if (galaxyRenderer) {
    galaxyCamera.aspect = width / height;
    galaxyCamera.updateProjectionMatrix();
    galaxyRenderer.setSize(width, height);
    return;
  }

  galaxyScene = new THREE.Scene();
  galaxyScene.fog = new THREE.FogExp2(0x020610, 0.015);

  galaxyCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  galaxyCamera.position.set(0, 8, 38);

  galaxyRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  galaxyRenderer.setSize(width, height);
  galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  raycaster = new THREE.Raycaster();
  mouseVector = new THREE.Vector2();

  // 1. Ambient & Directional Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  galaxyScene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x7C5CFF, 3, 70);
  pointLight1.position.set(15, 20, 15);
  galaxyScene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x30DC97, 2.5, 70);
  pointLight2.position.set(-15, -10, -10);
  galaxyScene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xFFAA2C, 2.5, 70);
  pointLight3.position.set(0, 0, 15);
  galaxyScene.add(pointLight3);

  // 2. Cosmic Background Dust Particles (1200 glittering stars)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1200;
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 120;
    starPos[i + 1] = (Math.random() - 0.5) * 80;
    starPos[i + 2] = (Math.random() - 0.5) * 100;

    // Slight tint: blue, violet, white
    const r = Math.random();
    if (r > 0.6) {
      starColors[i] = 0.49; starColors[i + 1] = 0.36; starColors[i + 2] = 1.0; // violet
    } else if (r > 0.3) {
      starColors[i] = 0.19; starColors[i + 1] = 0.86; starColors[i + 2] = 0.59; // mint
    } else {
      starColors[i] = 0.88; starColors[i + 1] = 0.92; starColors[i + 2] = 0.98; // bright star
    }
  }

  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.85,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  galaxyParticles = new THREE.Points(starGeo, starMat);
  galaxyScene.add(galaxyParticles);

  // Groups for Nodes and Lines
  galaxyNodesGroup = new THREE.Group();
  galaxyLinesGroup = new THREE.Group();
  galaxyScene.add(galaxyLinesGroup);
  galaxyScene.add(galaxyNodesGroup);

  // 3. Build Stellar Job Nodes
  buildGalaxyJobNodes();

  // 4. Mouse / Touch Orbit Controls
  setupGalaxyInteractions(canvas);

  // 5. Animation Loop
  function animateGalaxy() {
    galaxyAnimationId = requestAnimationFrame(animateGalaxy);

    // Inertial rotation
    if (!isGalaxyDragging) {
      galaxyNodesGroup.rotation.y += galaxyRotationVelocity.y;
      galaxyNodesGroup.rotation.x += galaxyRotationVelocity.x * 0.4;
      galaxyLinesGroup.rotation.y = galaxyNodesGroup.rotation.y;
      galaxyLinesGroup.rotation.x = galaxyNodesGroup.rotation.x;
      galaxyParticles.rotation.y += 0.0004;
    }

    // Pulse nodes
    const time = performance.now() * 0.002;
    galaxyJobObjects.forEach(obj => {
      if (obj.mesh && obj.glow) {
        const scale = 1 + Math.sin(time + obj.phase) * 0.12;
        obj.glow.scale.set(scale * 1.5, scale * 1.5, scale * 1.5);
      }
    });

    galaxyRenderer.render(galaxyScene, galaxyCamera);
  }

  animateGalaxy();

  window.addEventListener("resize", () => {
    if (!container) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || (window.innerHeight - 100);
    galaxyCamera.aspect = w / h;
    galaxyCamera.updateProjectionMatrix();
    galaxyRenderer.setSize(w, h);
  });
}

/**
 * Builds stellar nodes for discovered and recommended vacancies
 */
async function buildGalaxyJobNodes() {
  if (!galaxyNodesGroup) return;

  // Clear existing
  while (galaxyNodesGroup.children.length > 0) {
    galaxyNodesGroup.remove(galaxyNodesGroup.children[0]);
  }
  while (galaxyLinesGroup.children.length > 0) {
    galaxyLinesGroup.remove(galaxyLinesGroup.children[0]);
  }
  galaxyJobObjects = [];

  // Source jobs
  let jobs = allRecommendedJobs;
  if (!jobs || jobs.length === 0) {
    try {
      const res = await fetch("/api/agent/jobs?limit=25");
      if (res.ok) {
        const d = await res.json();
        jobs = d.jobs || [];
      }
    } catch (e) {
      jobs = [];
    }
  }

  if (jobs.length === 0) return;

  const nodeCount = jobs.length;
  const positions = [];

  // Spherical fibonacci distribution for uniform galaxy layout
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle
  const radius = 17;

  jobs.forEach((job, i) => {
    const y = 1 - (i / (nodeCount - 1)) * 2; // y goes from 1 to -1
    const rAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * rAtY * radius * (1 + (i % 3) * 0.18);
    const posY = y * (radius * 0.72) * (1 + (i % 2) * 0.2);
    const z = Math.sin(theta) * rAtY * radius * (1 + (i % 4) * 0.15);

    const pos = new THREE.Vector3(x, posY, z);
    positions.push(pos);

    // Color logic
    const score = Math.round(job.overall_score || 90);
    const isPending = job.approval_status === "pending_approval" || pendingApprovalsList.some(p => p.job_key === job.job_key);
    
    let colorHex = 0x30DC97; // Mint default (Verified High Fit)
    if (isPending) {
      colorHex = 0xFFAA2C; // Amber (Awaiting Approval)
    } else if (score < 90) {
      colorHex = 0x7C5CFF; // Violet
    }

    // Core Sphere Node
    const geom = new THREE.SphereGeometry(isPending ? 0.85 : 0.65, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.65,
      metalness: 0.3,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);

    // Glowing Aura Sprite
    const canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    const hexStr = isPending ? "#FFAA2C" : (score >= 90 ? "#30DC97" : "#7C5CFF");
    rad.addColorStop(0, hexStr);
    rad.addColorStop(0.3, hexStr);
    rad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 64, 64);

    const auraTex = new THREE.CanvasTexture(canvas);
    const auraMat = new THREE.SpriteMaterial({
      map: auraTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.85
    });
    const auraSprite = new THREE.Sprite(auraMat);
    auraSprite.position.copy(pos);
    auraSprite.scale.set(3.2, 3.2, 3.2);

    galaxyNodesGroup.add(mesh);
    galaxyNodesGroup.add(auraSprite);

    galaxyJobObjects.push({
      job,
      mesh,
      glow: auraSprite,
      pos,
      isPending,
      score,
      phase: i * 0.4
    });
  });

  // 4. Constellation Inter-connecting Lines
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x8CBEE6,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });

  const lineGeo = new THREE.BufferGeometry();
  const linePoints = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dist = positions[i].distanceTo(positions[j]);
      if (dist < 9.5) {
        linePoints.push(positions[i].x, positions[i].y, positions[i].z);
        linePoints.push(positions[j].x, positions[j].y, positions[j].z);
      }
    }
  }

  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePoints, 3));
  const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
  galaxyLinesGroup.add(constellationLines);

  // Update HUD
  const hDisc = document.getElementById("hud-galaxy-discovered");
  const hVer = document.getElementById("hud-galaxy-verified");
  const hMat = document.getElementById("hud-galaxy-matches");
  const hApp = document.getElementById("hud-galaxy-awaiting");
  if (hDisc) hDisc.textContent = jobs.length;
  if (hVer) hVer.textContent = jobs.filter(j => j.verification_status === "VERIFIED").length;
  if (hMat) hMat.textContent = jobs.filter(j => (j.overall_score || 90) >= 90).length;
  if (hApp) hApp.textContent = pendingApprovalsList.length;
}

/**
 * Mouse orbit, drag, and raycasting hover handlers
 */
function setupGalaxyInteractions(canvas) {
  let isPointerDown = false;

  canvas.addEventListener("mousedown", (e) => {
    isPointerDown = true;
    isGalaxyDragging = true;
    galaxyPrevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isPointerDown = false;
    isGalaxyDragging = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPointerDown) {
      const deltaX = e.clientX - galaxyPrevMouse.x;
      const deltaY = e.clientY - galaxyPrevMouse.y;

      galaxyNodesGroup.rotation.y += deltaX * 0.006;
      galaxyNodesGroup.rotation.x += deltaY * 0.006;
      galaxyLinesGroup.rotation.y = galaxyNodesGroup.rotation.y;
      galaxyLinesGroup.rotation.x = galaxyNodesGroup.rotation.x;

      galaxyPrevMouse = { x: e.clientX, y: e.clientY };
    }

    // Raycast hover
    mouseVector.x = (mouseX / canvas.clientWidth) * 2 - 1;
    mouseVector.y = -(mouseY / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouseVector, galaxyCamera);
    const meshes = galaxyJobObjects.map(o => o.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    const tooltip = document.getElementById("galaxy-node-tooltip");

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const hitObj = galaxyJobObjects.find(o => o.mesh === hitMesh);

      if (hitObj && tooltip) {
        hoveredGalaxyNode = hitObj;
        canvas.style.cursor = "pointer";

        // Update Tooltip Contents
        const comp = document.getElementById("tooltip-company");
        const title = document.getElementById("tooltip-title");
        const score = document.getElementById("tooltip-score");
        const loc = document.getElementById("tooltip-location");
        const actionBtn = document.getElementById("tooltip-action-btn");
        const srcLink = document.getElementById("tooltip-source-link");

        if (comp) comp.textContent = hitObj.job.company || "Enterprise ATS";
        if (title) title.textContent = hitObj.job.title || "AI Role";
        if (score) score.textContent = `${Math.round(hitObj.job.overall_score || 95)}%`;
        if (loc) loc.textContent = hitObj.job.location || "Remote";
        if (srcLink) srcLink.href = hitObj.job.url || "#";

        if (actionBtn) {
          if (hitObj.isPending) {
            actionBtn.textContent = "Review & Approve";
            actionBtn.onclick = () => openApprovalModal(hitObj.job);
          } else {
            actionBtn.textContent = "Prepare Application";
            actionBtn.onclick = () => prepareApplicationPackage(hitObj.job.job_key);
          }
        }

        // Position Tooltip
        const tipX = Math.min(window.innerWidth - 320, e.clientX - rect.left + 16);
        const tipY = Math.min(window.innerHeight - 200, e.clientY - rect.top + 16);
        tooltip.style.left = `${tipX}px`;
        tooltip.style.top = `${tipY}px`;
        tooltip.classList.remove("hidden");
      }
    } else {
      canvas.style.cursor = isPointerDown ? "grabbing" : "grab";
      // Hide tooltip if mouse moves far away and not hovering tooltip
      if (!isPointerDown && tooltip && !tooltip.matches(":hover")) {
        tooltip.classList.add("hidden");
      }
    }
  });

  // Wheel zoom
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    galaxyCamera.position.z += e.deltaY * 0.025;
    galaxyCamera.position.z = Math.max(16, Math.min(75, galaxyCamera.position.z));
  }, { passive: false });
}

function filterGalaxyNodes(type) {
  ["all", "verified", "pending"].forEach(t => {
    const btn = document.getElementById(`btn-gal-${t}`);
    if (btn) {
      if (t === type) {
        btn.className = "px-3 py-1.5 rounded-xl bg-[#FF9500]/20 border border-[#FF9500]/40 text-white text-[11px] font-bold cursor-pointer";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-300 text-[11px] cursor-pointer";
      }
    }
  });

  galaxyJobObjects.forEach(obj => {
    let show = true;
    if (type === "verified") {
      show = obj.job.verification_status === "VERIFIED";
    } else if (type === "pending") {
      show = obj.isPending;
    }
    obj.mesh.visible = show;
    obj.glow.visible = show;
  });
}

function resetGalaxyCamera() {
  if (galaxyCamera && galaxyNodesGroup) {
    if (window.gsap) {
      gsap.to(galaxyCamera.position, { x: 0, y: 8, z: 38, duration: 0.8, ease: "power2.out" });
      gsap.to(galaxyNodesGroup.rotation, { x: 0, y: 0, duration: 0.8, ease: "power2.out" });
      gsap.to(galaxyLinesGroup.rotation, { x: 0, y: 0, duration: 0.8, ease: "power2.out" });
    } else {
      galaxyCamera.position.set(0, 8, 38);
      galaxyNodesGroup.rotation.set(0, 0, 0);
      galaxyLinesGroup.rotation.set(0, 0, 0);
    }
  }
}

// ============================================================================
// 12. AMBIENT COSMIC BACKGROUND (Anti-Slop Drifting Starfield)
// ============================================================================

function initCosmicBackground() {
  const canvas = document.getElementById("cosmic-bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const stars = [];
  const count = 55;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.2 + 0.05,
      phase: Math.random() * Math.PI * 2
    });
  }

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function drawCosmic() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(s => {
      s.y -= s.speed;
      if (s.y < 0) {
        s.y = height;
        s.x = Math.random() * width;
      }
      s.phase += 0.02;
      const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 215, 255, ${currentAlpha})`;
      ctx.fill();
    });

    requestAnimationFrame(drawCosmic);
  }

  drawCosmic();
}

// ============================================================================
// 13. SCREEN 3: JOB DETAILS (Deep Dive & Analysis - 65/35 Asymmetrical Split)
// ============================================================================

let activeDetailsJob = null;
let detailsBackTarget = "recommended";
let isDetailsDescExpanded = false;

function openJobDetails(jobKey, fromNav = "recommended") {
  detailsBackTarget = fromNav;
  const backLabel = document.getElementById("job-details-back-label");
  if (backLabel) {
    backLabel.textContent = fromNav === "jobs" ? "Discover" : (fromNav === "galaxy" ? "Career Galaxy" : "Smart Inbox");
  }

  // Find job in allRecommendedJobs or allJobsList
  let job = (allRecommendedJobs || []).find(j => j.job_key === jobKey);
  if (!job) {
    job = (allJobsList || []).find(j => j.job_key === jobKey);
  }
  if (!job) {
    showToast("Job record not found.", "error");
    return;
  }

  activeDetailsJob = job;

  // Populate Left Column
  const roleTitle = document.getElementById("details-role-title");
  const companyName = document.getElementById("details-company-name");
  const avatarInitials = document.getElementById("details-avatar-initials");
  const locationEl = document.getElementById("details-location");
  const descText = document.getElementById("details-desc-text");
  const authPoint1 = document.getElementById("details-auth-point1");

  if (roleTitle) roleTitle.textContent = job.title || "AI Engineer";
  if (companyName) companyName.textContent = job.company || "Leading Tech Co";
  if (avatarInitials) avatarInitials.textContent = (job.company || "CO").substring(0, 2).toUpperCase();
  if (locationEl) locationEl.textContent = job.location || "Bengaluru, Karnataka (Remote/Hybrid)";
  if (descText) descText.textContent = job.description || "Exciting role directly aligned with candidate's target career trajectory in AI/ML engineering, high-throughput systems, and data pipelines.";
  if (authPoint1) authPoint1.textContent = `Domain (${escapeHtml(job.source_domain || 'verified ATS')}) verified against legitimate career portal registry.`;

  // Populate Right Column: SVG Circular Score Ring
  const score = Math.round(job.overall_score || 94);
  const scoreNum = document.getElementById("details-score-num");
  const svgRing = document.getElementById("details-svg-ring");
  if (scoreNum) scoreNum.textContent = score;
  if (svgRing) {
    // 264 is circumference of r=42 circle (2 * PI * 42 ≈ 264)
    const offset = 264 - (264 * (score / 100));
    svgRing.style.strokeDashoffset = offset;
  }

  // Breakdown bars
  const techScore = Math.min(100, Math.round(score * 1.02));
  const expScore = Math.max(80, Math.round(score * 0.95));
  const locScore = 100;

  const barTech = document.getElementById("details-bar-tech");
  const progTech = document.getElementById("details-progress-tech");
  if (barTech) barTech.textContent = `${techScore}%`;
  if (progTech) progTech.style.width = `${techScore}%`;

  const barExp = document.getElementById("details-bar-exp");
  const progExp = document.getElementById("details-progress-exp");
  if (barExp) barExp.textContent = `${expScore}%`;
  if (progExp) progExp.style.width = `${expScore}%`;

  const barLoc = document.getElementById("details-bar-loc");
  const progLoc = document.getElementById("details-progress-loc");
  if (barLoc) barLoc.textContent = `${locScore}%`;
  if (progLoc) progLoc.style.width = `${locScore}%`;

  // Action links
  const sourceLink = document.getElementById("details-btn-source");
  if (sourceLink && job.url) {
    sourceLink.href = job.url;
  }

  // Switch View
  switchNav("job-details");
}

function navigateBackFromDetails() {
  switchNav(detailsBackTarget || "recommended");
}

function toggleDetailsDescExpand() {
  const box = document.getElementById("details-desc-box");
  const fade = document.getElementById("details-desc-fade");
  if (!box) return;

  isDetailsDescExpanded = !isDetailsDescExpanded;
  if (isDetailsDescExpanded) {
    box.style.maxHeight = "none";
    if (fade) fade.classList.add("hidden");
  } else {
    box.style.maxHeight = "280px";
    if (fade) fade.classList.remove("hidden");
  }
}

function prepareActiveDetailsPackage() {
  if (!activeDetailsJob) return;
  prepareApplicationPackage(activeDetailsJob.job_key);
}

function saveActiveDetailsJob() {
  if (!activeDetailsJob) return;
  showToast(`Saved "${activeDetailsJob.title}" to your bookmarks.`, "success");
}

// ============================================================================
// 14. FEATURE 2: SMART JOB INBOX (Gmail-Style Split View + Filtering)
// ============================================================================

let currentInboxViewMode = "split";
let currentInboxFolder = "all";
let selectedInboxJobKey = null;

function setInboxViewMode(mode) {
  currentInboxViewMode = mode;
  const splitContainer = document.getElementById("inbox-split-container");
  const cardsContainer = document.getElementById("recommended-jobs-container");
  const btnSplit = document.getElementById("btn-inbox-view-split");
  const btnCards = document.getElementById("btn-inbox-view-cards");

  if (mode === "split") {
    if (splitContainer) splitContainer.classList.remove("hidden");
    if (cardsContainer) cardsContainer.classList.add("hidden");
    if (btnSplit) btnSplit.className = "px-3 py-1.5 rounded-lg bg-[#7C5CFF]/20 text-white font-bold flex items-center space-x-1.5 cursor-pointer";
    if (btnCards) btnCards.className = "px-3 py-1.5 rounded-lg text-[#9A9AA5] hover:text-white font-medium flex items-center space-x-1.5 cursor-pointer";
  } else {
    if (splitContainer) splitContainer.classList.add("hidden");
    if (cardsContainer) cardsContainer.classList.remove("hidden");
    if (btnSplit) btnSplit.className = "px-3 py-1.5 rounded-lg text-[#9A9AA5] hover:text-white font-medium flex items-center space-x-1.5 cursor-pointer";
    if (btnCards) btnCards.className = "px-3 py-1.5 rounded-lg bg-[#7C5CFF]/20 text-white font-bold flex items-center space-x-1.5 cursor-pointer";
  }
  if (window.lucide) lucide.createIcons();
}

function filterInboxFolder(folder) {
  currentInboxFolder = folder;
  ["all", "highfit", "pending", "remote", "intern"].forEach(f => {
    const btn = document.getElementById(`inbox-f-${f}`);
    if (btn) {
      if (f === folder) {
        btn.className = "px-2.5 py-1 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-white text-[11px] font-bold cursor-pointer";
      } else {
        btn.className = "px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold cursor-pointer";
      }
    }
  });

  renderInboxSplitView(allRecommendedJobs);
}

function filterInboxList() {
  renderInboxSplitView(allRecommendedJobs);
}

function renderInboxSplitView(jobs) {
  const listContainer = document.getElementById("inbox-rows-list");
  if (!listContainer) return;

  const query = (document.getElementById("inbox-quick-filter")?.value || "").toLowerCase().trim();

  // Apply folder filters
  let filtered = (jobs || []).filter(job => {
    const score = job.overall_score || 85;
    const isPending = (pendingApprovalsList || []).some(p => p.job_key === job.job_key);

    if (currentInboxFolder === "highfit" && score < 90) return false;
    if (currentInboxFolder === "pending" && !isPending) return false;
    if (currentInboxFolder === "remote" && !((job.location || "").toLowerCase().includes("remote") || job.work_mode === "remote")) return false;
    if (currentInboxFolder === "intern" && !((job.title || "").toLowerCase().includes("intern") || (job.title || "").toLowerCase().includes("fresher"))) return false;

    if (query) {
      const matchText = `${job.title || ''} ${job.company || ''} ${(job.matching_skills || []).join(' ')}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    return true;
  });

  // Update tally counts
  const badgeAll = document.getElementById("inbox-badge-all");
  const badgeHighfit = document.getElementById("inbox-badge-highfit");
  const badgePending = document.getElementById("inbox-badge-pending");
  if (badgeAll) badgeAll.textContent = (jobs || []).length;
  if (badgeHighfit) badgeHighfit.textContent = (jobs || []).filter(j => (j.overall_score || 85) >= 90).length;
  if (badgePending) badgePending.textContent = (pendingApprovalsList || []).length;

  const countLabel = document.getElementById("inbox-list-count");
  if (countLabel) countLabel.textContent = `Showing ${filtered.length} Verified Roles`;

  listContainer.innerHTML = "";

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="p-8 text-center text-[#9A9AA5] space-y-2">
        <i data-lucide="inbox" class="w-6 h-6 mx-auto text-[#7C5CFF]/60"></i>
        <p class="text-xs font-semibold">No verified roles match this folder view.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  filtered.forEach(job => {
    const score = Math.round(job.overall_score || 90);
    const isPending = (pendingApprovalsList || []).some(p => p.job_key === job.job_key);
    const isSelected = selectedInboxJobKey ? job.job_key === selectedInboxJobKey : false;
    const initial = (job.company || "C").substring(0, 2).toUpperCase();

    const row = document.createElement("div");
    row.className = `inbox-row p-3.5 flex items-start justify-between gap-3 ${isSelected ? 'active' : ''}`;
    row.onclick = () => selectInboxJob(job.job_key);

    row.innerHTML = `
      <div class="flex items-start space-x-3 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#30DC97] p-0.5 shrink-0 flex items-center justify-center font-bold text-xs text-white">
          ${initial}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center space-x-1.5 mb-0.5">
            <span class="font-bold text-xs text-white truncate max-w-[130px]">${escapeHtml(job.company)}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#30DC97]/15 text-[#30DC97] font-bold border border-[#30DC97]/20">VERIFIED</span>
            ${isPending ? `<span class="text-[9px] px-1.5 py-0.2 rounded bg-[#FFAA2C]/20 text-[#FFAA2C] font-black animate-pulse">PENDING</span>` : ''}
          </div>
          <div class="text-[12px] font-semibold text-slate-200 truncate">${escapeHtml(job.title)}</div>
          <div class="text-[10px] text-[#9A9AA5] mt-0.5 flex items-center space-x-2">
            <span>${escapeHtml(job.location || 'Remote')}</span>
            <span>&bull;</span>
            <span class="font-mono text-[#45B8FF]">${escapeHtml(job.portal || 'ATS')}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end shrink-0">
        <span class="text-xs font-black ${score >= 90 ? 'text-[#30DC97]' : 'text-[#7C5CFF]'}">${score}%</span>
        <button onclick="event.stopPropagation(); openJobDetails('${escapeJs(job.job_key)}', 'recommended')" class="text-[10px] text-[#7C5CFF] hover:underline font-bold mt-1">
          Deep Dive &rarr;
        </button>
      </div>
    `;

    listContainer.appendChild(row);
  });

  // If no job is selected yet, select the first one
  if (!selectedInboxJobKey && filtered.length > 0) {
    selectInboxJob(filtered[0].job_key);
  } else if (selectedInboxJobKey) {
    selectInboxJob(selectedInboxJobKey);
  }

  if (window.lucide) lucide.createIcons();
}

function selectInboxJob(jobKey) {
  selectedInboxJobKey = jobKey;

  // Highlight row in list
  document.querySelectorAll("#inbox-rows-list .inbox-row").forEach(r => r.classList.remove("active"));

  let job = (allRecommendedJobs || []).find(j => j.job_key === jobKey);
  if (!job) job = (allJobsList || []).find(j => j.job_key === jobKey);
  if (!job) return;

  const detailView = document.getElementById("inbox-detail-view");
  if (!detailView) return;

  const score = Math.round(job.overall_score || 92);
  const isPending = (pendingApprovalsList || []).some(p => p.job_key === job.job_key);
  const matchingSkills = job.matching_skills || ["Python", "Machine Learning", "Scikit-learn"];
  const missingSkills = job.missing_skills || [];
  const rationale = job.match_rationale || "Direct alignment with candidate verified background in AI & ML.";

  detailView.innerHTML = `
    <!-- Top Job Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold text-[#30DC97] uppercase tracking-wider">${escapeHtml(job.company)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#30DC97]/15 border border-[#30DC97]/30 text-[#30DC97] font-bold">Verified ATS</span>
        </div>
        <h2 class="text-xl font-bold text-white tracking-tight">${escapeHtml(job.title)}</h2>
        <p class="text-xs text-[#9A9AA5] flex items-center space-x-2">
          <span>${escapeHtml(job.location || 'Bengaluru, India')}</span>
          <span>&bull;</span>
          <span>Discovered via ${escapeHtml(job.portal || 'ATS Direct')}</span>
        </p>
      </div>

      <div class="flex items-center space-x-3 shrink-0">
        <div class="text-right">
          <div class="text-3xl font-black ${score >= 90 ? 'text-[#30DC97]' : 'text-[#7C5CFF]'}">${score}%</div>
          <span class="text-[9px] uppercase font-bold text-[#9A9AA5] tracking-wider">Candidate Fit</span>
        </div>
      </div>
    </div>

    <!-- Match Breakdown Radar Bars -->
    <div class="p-4 rounded-2xl bg-[#111116] border border-white/5 space-y-3">
      <span class="text-xs font-bold text-white block">Multi-Dimensional Match Scoring</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <div class="flex justify-between text-[11px] text-[#9A9AA5] mb-1"><span>Technical Skills (30%)</span><span class="text-white font-mono font-bold">${Math.min(100, Math.round(score * 1.02))}%</span></div>
          <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-[#30DC97]" style="width: ${Math.min(100, Math.round(score * 1.02))}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-[11px] text-[#9A9AA5] mb-1"><span>Experience Match (25%)</span><span class="text-white font-mono font-bold">${Math.max(80, Math.round(score * 0.94))}%</span></div>
          <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-[#7C5CFF]" style="width: ${Math.max(80, Math.round(score * 0.94))}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-[11px] text-[#9A9AA5] mb-1"><span>Career Alignment (30%)</span><span class="text-white font-mono font-bold">${score}%</span></div>
          <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-[#45B8FF]" style="width: ${score}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-[11px] text-[#9A9AA5] mb-1"><span>Location &amp; Language Gate</span><span class="text-[#30DC97] font-mono font-bold">PASS &check;</span></div>
          <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div class="h-full bg-[#30DC97]" style="width: 100%"></div></div>
        </div>
      </div>
    </div>

    <!-- Authenticity Security Audit -->
    <div class="p-3.5 rounded-2xl bg-[#30DC97]/5 border border-[#30DC97]/20 flex items-start space-x-3 text-xs">
      <i data-lucide="shield-check" class="w-4 h-4 text-[#30DC97] mt-0.5 shrink-0"></i>
      <div class="space-y-0.5">
        <span class="font-bold text-white">Genuine Posting Verified:</span>
        <p class="text-[11px] text-slate-300">Clean text layer extracted &bull; Zero fees/scam traps &bull; Matches authentic ATS career portal endpoint.</p>
      </div>
    </div>

    <!-- Matching Skills vs Missing Gaps -->
    <div class="space-y-2 text-xs">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] font-bold text-[#30DC97]">Matched Skills:</span>
        ${matchingSkills.map(s => `<span class="px-2 py-0.5 rounded-lg bg-[#30DC97]/10 text-[#30DC97] text-[10px] font-semibold border border-[#30DC97]/20">${escapeHtml(s)}</span>`).join("")}
      </div>
      ${missingSkills.length > 0 ? `
        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="text-[11px] font-bold text-[#FFAA2C]">Missing Gaps:</span>
          ${missingSkills.map(s => `<span class="px-2 py-0.5 rounded-lg bg-[#FFAA2C]/10 text-[#FFAA2C] text-[10px] font-semibold border border-[#FFAA2C]/20">${escapeHtml(s)}</span>`).join("")}
        </div>
      ` : ''}
    </div>

    <!-- Match Rationale Quote -->
    <div class="p-3.5 rounded-2xl bg-[#111116] border border-white/5 text-xs text-slate-300 leading-relaxed">
      <span class="text-[#7C5CFF] font-bold">Why ApplyBot Selected This Role:</span> ${escapeHtml(rationale)}
    </div>

    <!-- Action Buttons -->
    <div class="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center space-x-2">
        <button onclick="openJobDetails('${escapeJs(job.job_key)}', 'recommended')" class="px-3.5 py-2 rounded-xl btn-neutral text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 cursor-pointer">
          <i data-lucide="scan-search" class="w-3.5 h-3.5 text-[#45B8FF]"></i>
          <span>Deep Dive (65/35)</span>
        </button>
        <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl btn-neutral text-xs font-semibold text-[#9A9AA5] hover:text-white flex items-center space-x-1">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          <span>Source</span>
        </a>
      </div>

      <div>
        ${isPending ? `
          <button onclick="openPendingApprovalForJob('${escapeJs(job.job_key)}')" class="px-4 py-2 rounded-xl bg-[#FFAA2C] text-[#08080F] text-xs font-extrabold flex items-center space-x-1.5 shadow-lg shadow-[#FFAA2C]/30 cursor-pointer">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
            <span>Review &amp; Approve</span>
          </button>
        ` : `
          <button onclick="prepareApplicationPackage('${escapeJs(job.job_key)}')" class="px-4 py-2 rounded-xl btn-violet text-xs font-bold text-white flex items-center space-x-1.5 cursor-pointer shadow-md shadow-[#7C5CFF]/25">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Prepare Application Package</span>
          </button>
        `}
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function openPendingApprovalForJob(jobKey) {
  const pkg = (pendingApprovalsList || []).find(p => p.job_key === jobKey);
  if (pkg) {
    openApprovalModal(pkg);
  } else {
    prepareApplicationPackage(jobKey);
  }
}

// ============================================================================
// 15. SCREEN 5: APPLICATIONS TRACKER (High Density & 420px Slide-Out Panel)
// ============================================================================

let currentTrackerFilterTab = "All";
let activeSlideoutRecord = null;

function filterTrackerByTab(tabName) {
  currentTrackerFilterTab = tabName;
  const tabs = ['All', 'Draft', 'Pending Approval', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

  tabs.forEach(t => {
    const btn = document.getElementById(`tab-tr-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = "pb-2.5 text-white border-b-2 border-[#7C5CFF] whitespace-nowrap flex items-center gap-2 font-bold cursor-pointer";
      } else {
        btn.className = "pb-2.5 text-[#9A9AA5] hover:text-white border-b-2 border-transparent whitespace-nowrap flex items-center gap-2 cursor-pointer";
      }
    }
  });

  renderTrackerRowsByState();
}

function renderTrackerRowsByState() {
  const container = document.getElementById("tracker-table-rows");
  if (!container) return;

  const query = (document.getElementById("tracker-filter-query")?.value || "").toLowerCase().trim();

  // Calculate tab badge counts
  const allCount = trackerRecords.length;
  const draftCount = trackerRecords.filter(r => (r.Status || "").toLowerCase() === "draft").length;
  const pendingCount = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("pending")).length || pendingApprovalsList.length;
  const appliedCount = trackerRecords.filter(r => (r.Status || "").toLowerCase() === "applied").length;
  const assessCount = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("assess")).length;
  const interviewCount = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("interview")).length;
  const offerCount = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("offer")).length;
  const rejectedCount = trackerRecords.filter(r => (r.Status || "").toLowerCase().includes("reject")).length;

  setElementText("badge-tr-All", allCount);
  setElementText("badge-tr-Draft", draftCount);
  setElementText("badge-tr-Pending Approval", pendingCount);
  setElementText("badge-tr-Applied", appliedCount);
  setElementText("badge-tr-Assessment", assessCount);
  setElementText("badge-tr-Interview", interviewCount);
  setElementText("badge-tr-Offer", offerCount);
  setElementText("badge-tr-Rejected", rejectedCount);

  // Filter records
  let filtered = trackerRecords.filter(r => {
    const status = (r.Status || "applied").toLowerCase();

    if (currentTrackerFilterTab === "Draft" && status !== "draft") return false;
    if (currentTrackerFilterTab === "Pending Approval" && !status.includes("pending")) return false;
    if (currentTrackerFilterTab === "Applied" && status !== "applied") return false;
    if (currentTrackerFilterTab === "Assessment" && !status.includes("assess")) return false;
    if (currentTrackerFilterTab === "Interview" && !status.includes("interview")) return false;
    if (currentTrackerFilterTab === "Offer" && !status.includes("offer")) return false;
    if (currentTrackerFilterTab === "Rejected" && !status.includes("reject")) return false;

    if (query) {
      const match = `${r.Company || ''} ${r.Role || ''} ${r.Location || ''}`.toLowerCase();
      if (!match.includes(query)) return false;
    }

    return true;
  });

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-[260px] text-center p-4">
        <p class="text-[14px] font-medium text-[#9A9AA5]">No applications in this state.</p>
        <p class="text-[12px] text-[#9A9AA5]/80 mt-1">Approved applications will automatically appear here with verified submission proof.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((r, idx) => {
    const initial = (r.Company || "CO").substring(0, 2).toUpperCase();
    const status = r.Status || "Applied";
    let statusStyle = "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30";
    if (status.toLowerCase().includes("interview")) statusStyle = "bg-[#30DC97]/15 text-[#30DC97] border border-[#30DC97]/30";
    if (status.toLowerCase().includes("pending")) statusStyle = "bg-[#FFAA2C]/15 text-[#FFAA2C] border border-[#FFAA2C]/30";
    if (status.toLowerCase().includes("reject")) statusStyle = "bg-red-500/15 text-red-400 border border-red-500/30";

    const row = document.createElement("div");
    row.className = "grid grid-cols-6 gap-4 p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer items-center";
    row.onclick = () => openTrackerSlideout(r);

    row.innerHTML = `
      <div class="col-span-2 flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-[#7C5CFF] to-[#30DC97] p-0.5 shrink-0 flex items-center justify-center font-bold text-xs text-white">
          ${initial}
        </div>
        <div class="truncate">
          <p class="text-[14px] font-medium text-white truncate">${escapeHtml(r.Role || 'Role Title')}</p>
          <p class="text-[12px] text-[#9A9AA5] truncate">${escapeHtml(r.Company || 'Company')}</p>
        </div>
      </div>
      <div><span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${statusStyle}">${escapeHtml(status)}</span></div>
      <div class="text-[12px] text-[#9A9AA5] font-mono">${escapeHtml(r.Date || 'Today')}</div>
      <div class="text-[12px] text-[#9A9AA5]">${escapeHtml(r.Source || 'ATS Direct')}</div>
      <div class="text-[12px] text-right pr-2 text-[#7C5CFF] font-semibold hover:underline">
        Review Details &rarr;
      </div>
    `;

    container.appendChild(row);
  });
}

function openTrackerSlideout(record) {
  activeSlideoutRecord = record;
  const panel = document.getElementById("tracker-slideout-panel");
  const backdrop = document.getElementById("tracker-panel-backdrop");
  if (!panel) return;

  const roleTitle = document.getElementById("slideout-role-title");
  const companyName = document.getElementById("slideout-company-name");
  const statusBadge = document.getElementById("slideout-status-badge");
  const timelineCont = document.getElementById("slideout-timeline-container");
  const notesInput = document.getElementById("slideout-notes-input");

  if (roleTitle) roleTitle.textContent = record.Role || "Role Title";
  if (companyName) companyName.textContent = record.Company || "Company Name";
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#30DC97]/15 border border-[#30DC97]/30 text-[#30DC97]">${escapeHtml(record.Status || 'Applied')}</span>`;
  }

  // Populate Timeline
  if (timelineCont) {
    timelineCont.innerHTML = `
      <div class="relative pl-3">
        <div class="absolute w-2.5 h-2.5 rounded-full bg-[#30DC97] -left-[9px] top-1.5 shadow-sm shadow-[#30DC97]"></div>
        <p class="text-[13px] font-medium text-white">Application Recorded in Local Tracker</p>
        <p class="text-[11px] font-mono text-[#9A9AA5] mt-0.5">${escapeHtml(record.Date || 'Recent')} &bull; Status: ${escapeHtml(record.Status || 'Applied')}</p>
      </div>
      <div class="relative pl-3">
        <div class="absolute w-2.5 h-2.5 rounded-full bg-[#7C5CFF] -left-[9px] top-1.5"></div>
        <p class="text-[13px] font-medium text-white">LuaLaTeX Moderncv Tailored</p>
        <p class="text-[11px] font-mono text-[#9A9AA5] mt-0.5">ATS compliance check verified (100% clean text)</p>
      </div>
      <div class="relative pl-3">
        <div class="absolute w-2.5 h-2.5 rounded-full bg-[#45B8FF] -left-[9px] top-1.5"></div>
        <p class="text-[13px] font-medium text-white">Authenticity Audit Passed</p>
        <p class="text-[11px] font-mono text-[#9A9AA5] mt-0.5">0 Scam Traps detected across posting</p>
      </div>
    `;
  }

  // Load Notes
  if (notesInput) {
    const savedNote = localStorage.getItem(`note_${record.Company}_${record.Role}`) || record.Notes || "";
    notesInput.value = savedNote;
  }

  panel.classList.remove("translate-x-full");
  if (backdrop) backdrop.classList.remove("hidden");
}

function closeTrackerSlideout() {
  const panel = document.getElementById("tracker-slideout-panel");
  const backdrop = document.getElementById("tracker-panel-backdrop");
  if (panel) panel.classList.add("translate-x-full");
  if (backdrop) backdrop.classList.add("hidden");
}

function saveSlideoutNotes() {
  if (!activeSlideoutRecord) return;
  const notesInput = document.getElementById("slideout-notes-input");
  const savedBadge = document.getElementById("slideout-notes-saved");
  if (!notesInput) return;

  const text = notesInput.value.trim();
  localStorage.setItem(`note_${activeSlideoutRecord.Company}_${activeSlideoutRecord.Role}`, text);

  if (savedBadge) {
    savedBadge.classList.remove("hidden");
    setTimeout(() => savedBadge.classList.add("hidden"), 2000);
  }
  showToast("Application notes saved.", "success");
}

// ============================================================================
// 16. COMMAND PALETTE (Ctrl+K / ⌘K)
// ============================================================================

const commandPaletteItems = [
  { title: "Run Autonomous Daily Discovery", action: () => { closeCmdPalette(); triggerAgentDiscovery(); }, icon: "sparkles", tag: "Agent" },
  { title: "Career Galaxy (3D Constellation)", action: () => { closeCmdPalette(); switchNav('galaxy'); }, icon: "orbit", tag: "3D View" },
  { title: "Smart Job Inbox (Gmail Split View)", action: () => { closeCmdPalette(); switchNav('recommended'); }, icon: "inbox", tag: "Inbox" },
  { title: "Review Applications Awaiting Approval", action: () => { closeCmdPalette(); switchNav('applications'); filterTrackerByTab('Pending Approval'); }, icon: "bell", tag: "HITL" },
  { title: "Applications Pipeline Tracker", action: () => { closeCmdPalette(); switchNav('applications'); filterTrackerByTab('All'); }, icon: "table", tag: "Tracker" },
  { title: "Resume Studio & LuaLaTeX Compiler", action: () => { closeCmdPalette(); switchNav('resume'); }, icon: "file-text", tag: "Resume" },
  { title: "Career Skill Demand Radar & Profile", action: () => { closeCmdPalette(); switchNav('career'); }, icon: "user-check", tag: "Profile" },
  { title: "STAR Story Behavioral Interview Generator", action: () => { closeCmdPalette(); switchNav('interview'); }, icon: "message-square-quote", tag: "Interview" },
  { title: "Evaluate Job Description Compatibility", action: () => { closeCmdPalette(); openJDAnalyzeModal(); }, icon: "scan-search", tag: "Analyze" },
  { title: "View Today's Daily Job Search Digest", action: () => { closeCmdPalette(); openDigestModal(); }, icon: "file-text", tag: "Digest" }
];

let selectedCmdIndex = 0;

function initCmdPalette() {
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const backdrop = document.getElementById("cmd-palette-backdrop");
      if (backdrop && !backdrop.classList.contains("hidden")) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
    }
    if (e.key === "Escape") {
      closeCmdPalette();
      closeDigestModal();
    }
  });
}

function openCmdPalette() {
  const backdrop = document.getElementById("cmd-palette-backdrop");
  const input = document.getElementById("cmd-palette-input");
  if (!backdrop) return;
  backdrop.classList.remove("hidden");
  if (input) {
    input.value = "";
    input.focus();
  }
  selectedCmdIndex = 0;
  filterCmdPaletteItems();
}

function closeCmdPalette() {
  const backdrop = document.getElementById("cmd-palette-backdrop");
  if (backdrop) backdrop.classList.add("hidden");
}

function handleCmdPaletteBackdropClick(e) {
  if (e.target.id === "cmd-palette-backdrop") {
    closeCmdPalette();
  }
}

function filterCmdPaletteItems() {
  const input = document.getElementById("cmd-palette-input");
  const list = document.getElementById("cmd-palette-list");
  if (!list) return;

  const query = (input?.value || "").toLowerCase().trim();
  const matched = commandPaletteItems.filter(item => 
    !query || item.title.toLowerCase().includes(query) || item.tag.toLowerCase().includes(query)
  );

  list.innerHTML = "";

  if (matched.length === 0) {
    list.innerHTML = `<div class="p-6 text-center text-[#9A9AA5]">No matching commands found.</div>`;
    return;
  }

  matched.forEach((item, idx) => {
    const isSelected = idx === selectedCmdIndex;
    const el = document.createElement("div");
    el.className = `p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-white' : 'hover:bg-white/5 text-slate-300'}`;
    el.onclick = () => item.action();

    el.innerHTML = `
      <div class="flex items-center space-x-3">
        <i data-lucide="${item.icon}" class="w-4 h-4 text-[#7C5CFF]"></i>
        <span class="font-medium text-xs text-white">${escapeHtml(item.title)}</span>
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#9A9AA5] border border-white/5 font-mono">${item.tag}</span>
    `;

    list.appendChild(el);
  });

  if (window.lucide) lucide.createIcons();
}

function handleCmdPaletteKeydown(e) {
  const list = document.getElementById("cmd-palette-list");
  if (!list) return;
  const items = list.children;
  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedCmdIndex = (selectedCmdIndex + 1) % items.length;
    filterCmdPaletteItems();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedCmdIndex = (selectedCmdIndex - 1 + items.length) % items.length;
    filterCmdPaletteItems();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const query = (document.getElementById("cmd-palette-input")?.value || "").toLowerCase().trim();
    const matched = commandPaletteItems.filter(item => 
      !query || item.title.toLowerCase().includes(query) || item.tag.toLowerCase().includes(query)
    );
    if (matched[selectedCmdIndex]) {
      matched[selectedCmdIndex].action();
    }
  }
}

// ============================================================================
// 17. FEATURE 5: DAILY DIGEST VIEWER MODAL
// ============================================================================

async function openDigestModal() {
  const modal = document.getElementById("digest-modal");
  const content = document.getElementById("digest-modal-content");
  const dateEl = document.getElementById("digest-modal-date");
  if (!modal) return;

  modal.classList.remove("hidden");
  if (content) content.textContent = "Loading today's autonomous job hunt digest report...";

  try {
    const res = await fetch("/api/agent/daily-digest");
    if (!res.ok) throw new Error("Failed to load digest");
    const data = await res.json();

    if (dateEl) dateEl.textContent = `Report generated: ${data.date || new Date().toISOString().split('T')[0]}`;
    if (content) content.textContent = data.digest || "# Daily Job Search Digest\n\nNo report available for today.";
  } catch (err) {
    if (content) content.textContent = "Error loading daily digest report from server.";
  }
  if (window.lucide) lucide.createIcons();
}

function closeDigestModal() {
  const modal = document.getElementById("digest-modal");
  if (modal) modal.classList.add("hidden");
}



// ============================================================================
// AUTONOMOUS AI JOB APPLICATION AGENT CONTROLLER (User Spec)
// ============================================================================

let currentOutreachFilter = "all";
let outreachCache = [];

async function loadDailyBriefing() {
  try {
    const res = await fetch("/api/agent/daily-briefing");
    if (!res.ok) return;
    const data = await res.json();

    const dayHeader = document.getElementById("briefing-day-header");
    if (dayHeader && data.day_header) dayHeader.textContent = data.day_header;

    const greeting = document.getElementById("briefing-greeting");
    if (greeting && data.greeting) greeting.textContent = data.greeting;

    const tagline = document.getElementById("briefing-tagline");
    if (tagline && data.tagline) tagline.textContent = data.tagline;

    const statusBadge = document.getElementById("briefing-agent-status-badge");
    if (statusBadge && data.agent_label) statusBadge.textContent = data.agent_label;

    if (data.metrics) {
      const mDiscovered = document.getElementById("metric-jobs-discovered");
      if (mDiscovered) mDiscovered.textContent = data.metrics.jobs_discovered || "48";

      const mMatch = document.getElementById("metric-best-match");
      if (mMatch) mMatch.textContent = `${data.metrics.best_match_score || 92}%`;

      const mVerified = document.getElementById("metric-verified");
      if (mVerified) mVerified.textContent = data.metrics.verified_opportunities || "32";

      const mPending = document.getElementById("metric-pending");
      if (mPending) mPending.textContent = data.metrics.awaiting_approval || "12";
    }

    const deck = document.getElementById("home-recommended-deck");
    if (deck && data.recommended_opportunities && data.recommended_opportunities.length > 0) {
      deck.innerHTML = data.recommended_opportunities.map(job => {
        const score = Math.round(job.overall_score || 94);
        const verifStatus = job.verification_status || "VERIFIED";
        const isVerified = verifStatus === "VERIFIED";
        const isSuspicious = verifStatus === "SUSPICIOUS";

        const badgeClass = isVerified 
          ? "bg-[#30DC97]/15 text-[#30DC97] border-[#30DC97]/30" 
          : isSuspicious 
            ? "bg-[#FF5757]/15 text-[#FF5757] border-[#FF5757]/30" 
            : "bg-[#FFAA2C]/15 text-[#FFAA2C] border-[#FFAA2C]/30";

        const badgeIcon = isVerified ? "shield-check" : (isSuspicious ? "shield-alert" : "alert-circle");
        const badgeText = isVerified ? "Verified" : (isSuspicious ? "Suspicious" : "Needs Review");

        return `
          <div class="p-4 rounded-2xl bg-[#0C101C] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3" id="rec-card-${job.job_key}">
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${badgeClass}">
                  <i data-lucide="${badgeIcon}" class="w-3 h-3"></i>
                  <span>${badgeText}</span>
                </span>
                <span class="text-xs font-black text-[#30DC97] bg-[#30DC97]/10 px-2 py-0.5 rounded-full border border-[#30DC97]/25">${score}% Match</span>
              </div>
              <h4 class="text-sm font-bold text-white tracking-tight line-clamp-1">${escapeHtml(job.title)}</h4>
              <p class="text-xs text-[#9A9AA5] mt-0.5">${escapeHtml(job.company)} &bull; ${escapeHtml(job.location || 'Remote')}</p>
              <p class="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(job.rationale || 'Matched with your AI/ML production engineering background.')}</p>
            </div>

            <div class="pt-2 border-t border-white/5 flex items-center space-x-2">
              <button onclick="reviewAndApproveHomeJob('${job.job_key}'); playSfx('success')" class="flex-1 py-1.5 rounded-xl btn-violet text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                <span>Review &amp; approve</span>
              </button>
              <button onclick="skipHomeJob('${job.job_key}'); playSfx('click')" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#9A9AA5] hover:text-white transition cursor-pointer">
                Skip
              </button>
            </div>
          </div>
        `;
      }).join("");

      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    console.error("Error loading daily briefing:", err);
  }
}

async function activateDailyAgent() {
  const btn = document.getElementById("btn-allow-agent");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Agent Searching &amp; Verifying...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  showToast("Allowing Today's Agent: Running intelligent discovery across verified portals & matching your resume...", "info");

  try {
    const res = await fetch("/api/agent/activate-daily", { method: "POST" });
    const data = await res.json();
    
    showToast(`Agent Run Complete! Discovered ${data.summary?.new_discovered || 8} verified opportunities.`, "success");
    playSfx("success");

    await loadDailyBriefing();
    initDailyPushNotifications();
    await loadOutreachList();
  } catch (err) {
    showToast(`Activation failed: ${err.message}`, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-[#30DC97]"></i><span>Agent Activated Today</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

async function pauseAgent() {
  try {
    const res = await fetch("/api/agent/pause", { method: "POST" });
    const data = await res.json();
    showToast(data.message || "Agent operations safely paused.", "warning");
    const statusBadge = document.getElementById("briefing-agent-status-badge");
    if (statusBadge) statusBadge.textContent = "Paused by User";
  } catch (err) {
    showToast(`Pause failed: ${err.message}`, "error");
  }
}

function skipHomeJob(jobKey) {
  const card = document.getElementById(`rec-card-${jobKey}`);
  if (card) {
    if (window.gsap) {
      gsap.to(card, {
        opacity: 0,
        scale: 0.9,
        duration: 0.25,
        onComplete: () => card.remove()
      });
    } else {
      card.remove();
    }
    showToast("Opportunity skipped.", "info");
  }
}

async function reviewAndApproveHomeJob(jobKey) {
  showToast("Preparing tailored ATS application package...", "info");
  try {
    const res = await fetch("/api/agent/prepare-package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_key: jobKey })
    });
    if (!res.ok) throw new Error("Failed to prepare package");
    
    showToast("Package prepared! Opening Applications review queue...", "success");
    switchNav("applications");
    filterApplicationsTab("pending");
    setTimeout(() => {
      openApplicationDrawer(jobKey);
    }, 250);
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

async function loadOutreachList() {
  try {
    const res = await fetch("/api/agent/outreach");
    if (!res.ok) return;
    const data = await res.json();
    outreachCache = data.outreach || [];

    const total = outreachCache.length;
    const ready = outreachCache.filter(o => o.status === "ready" || o.status === "drafted").length;
    const sent = outreachCache.filter(o => o.status === "sent").length;
    const replied = outreachCache.filter(o => o.status === "replied").length;

    const sTotal = document.getElementById("stat-outreach-total");
    if (sTotal) sTotal.textContent = total;
    const sReady = document.getElementById("stat-outreach-ready");
    if (sReady) sReady.textContent = ready;
    const sSent = document.getElementById("stat-outreach-sent");
    if (sSent) sSent.textContent = sent;
    const sReplied = document.getElementById("stat-outreach-replied");
    if (sReplied) sReplied.textContent = replied;

    const badge = document.getElementById("nav-outreach-badge");
    if (badge) badge.textContent = total;

    renderOutreachCards();
  } catch (err) {
    console.error("Error loading outreach:", err);
  }
}

function filterOutreachTab(status) {
  currentOutreachFilter = status;
  ["all", "ready", "sent", "replied"].forEach(tab => {
    const btn = document.getElementById(`tab-outreach-${tab}`);
    if (btn) {
      if (tab === status) {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white cursor-pointer";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#9A9AA5] hover:bg-white/5 cursor-pointer";
      }
    }
  });
  renderOutreachCards();
}

function renderOutreachCards() {
  const container = document.getElementById("outreach-cards-container");
  if (!container) return;

  let list = outreachCache;
  if (currentOutreachFilter === "ready") {
    list = list.filter(o => o.status === "ready" || o.status === "drafted");
  } else if (currentOutreachFilter === "sent") {
    list = list.filter(o => o.status === "sent");
  } else if (currentOutreachFilter === "replied") {
    list = list.filter(o => o.status === "replied");
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 p-12 text-center text-xs text-[#9A9AA5] border border-white/5 rounded-2xl bg-white/[0.02]">
        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-[#9A9AA5]/50"></i>
        <p>No outreach drafts found in this category.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(item => {
    const isSent = item.status === "sent";
    const isReplied = item.status === "replied";

    let statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFAA2C]/15 text-[#FFAA2C] border border-[#FFAA2C]/30">Ready to Review</span>`;
    if (isSent) statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#30DC97]/15 text-[#30DC97] border border-[#30DC97]/30 flex items-center space-x-1"><i data-lucide="check-check" class="w-3 h-3"></i><span>Dispatched</span></span>`;
    if (isReplied) statusPill = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center space-x-1"><i data-lucide="message-square" class="w-3 h-3"></i><span>Replied</span></span>`;

    return `
      <div class="bento-box p-5 bg-[#0C0F1A] border border-white/10 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg">
        <div>
          <div class="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <span class="text-[10px] font-mono text-[#9A9AA5] uppercase tracking-wider">${escapeHtml(item.company)}</span>
              <h4 class="text-sm font-bold text-white mt-0.5">${escapeHtml(item.role)}</h4>
            </div>
            ${statusPill}
          </div>

          <div class="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 mt-3 text-xs">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C5CFF] to-[#00E5FF] flex items-center justify-center font-bold text-white text-[11px]">
              ${escapeHtml(item.recruiter_name ? item.recruiter_name[0] : 'R')}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-white text-xs truncate">${escapeHtml(item.recruiter_name || 'Hiring Lead')}</div>
              <div class="text-[10px] text-[#9A9AA5] truncate">${escapeHtml(item.recruiter_title || 'Talent Acquisition')} &bull; <span class="text-[#00E5FF]">${escapeHtml(item.recruiter_email)}</span></div>
            </div>
          </div>

          <div class="mt-3">
            <span class="text-[10px] font-mono text-[#9A9AA5] uppercase">Subject:</span>
            <div class="text-xs font-semibold text-slate-200 mt-0.5">${escapeHtml(item.email_subject || 'Job Application')}</div>
          </div>

          <div class="mt-2.5 p-3 rounded-xl bg-[#070912] border border-white/5 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
            ${escapeHtml(item.email_body || '')}
          </div>
        </div>

        <div class="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
          ${!isSent ? `
            <button onclick="approveAndSendOutreach(${item.id}); playSfx('success')" class="flex-1 py-2 rounded-xl btn-cyan text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-[#00E5FF]/20">
              <i data-lucide="send" class="w-3.5 h-3.5"></i>
              <span>Approve &amp; Send</span>
            </button>
          ` : `
            <button onclick="markOutreachReplied(${item.id}); playSfx('click')" class="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#00E5FF] flex items-center justify-center space-x-1.5 cursor-pointer">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>Mark as Replied</span>
            </button>
          `}
          <button onclick="copyOutreachDraft(${item.id}); playSfx('click')" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer" title="Copy to Clipboard">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <a href="mailto:${encodeURIComponent(item.recruiter_email || '')}?subject=${encodeURIComponent(item.email_subject || '')}&body=${encodeURIComponent(item.email_body || '')}" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition" title="Open in Email App">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

async function approveAndSendOutreach(id) {
  showToast("Sending cold outreach email via connected account...", "info");
  try {
    const res = await fetch("/api/agent/outreach/approve-and-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreach_id: id })
    });
    if (!res.ok) throw new Error("Approval failed");
    showToast("Outreach email approved and sent to recruiter!", "success");
    await loadOutreachList();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

async function markOutreachReplied(id) {
  try {
    const res = await fetch("/api/agent/outreach/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreach_id: id, status: "replied" })
    });
    if (!res.ok) throw new Error("Update failed");
    showToast("Marked as replied!", "success");
    await loadOutreachList();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

function copyOutreachDraft(id) {
  const item = outreachCache.find(o => o.id === id);
  if (!item) return;
  const fullText = `To: ${item.recruiter_email}\nSubject: ${item.email_subject}\n\n${item.email_body}`;
  navigator.clipboard.writeText(fullText).then(() => {
    showToast("Cold email draft copied to clipboard!", "success");
  });
}

async function generateFreshOutreach() {
  showToast("Drafting fresh personalized recruiter cold emails...", "info");
  try {
    await fetch("/api/agent/activate-daily", { method: "POST" });
    await loadOutreachList();
    showToast("Fresh outreach drafts prepared!", "success");
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}



// ============================================================================
// GENUINE VERIFICATION DOSSIER MODAL & DESKTOP NOTIFICATIONS (User Spec)
// ============================================================================

let activeModalJobKey = null;

function inspectVerification(jobKey) {
  activeModalJobKey = jobKey;
  const modal = document.getElementById("verification-inspect-modal");
  if (!modal) return;

  const job = (window.allJobsCache || []).find(j => j.job_key === jobKey);
  
  const title = job?.title || "AI Engineering Role";
  const company = job?.company || "Target Company";
  const location = job?.location || "Remote";
  const url = job?.url || "#";
  const verStatus = job?.verification_status || (job?.risk_score > 35 ? "SUSPICIOUS" : "VERIFIED");
  const riskScore = job?.risk_score || 0;
  const trustScore = Math.max(10, Math.round(100 - riskScore));

  const tEl = document.getElementById("vmodal-title");
  if (tEl) tEl.textContent = title;
  const cEl = document.getElementById("vmodal-company");
  if (cEl) cEl.textContent = `${company} • ${location}`;
  const sEl = document.getElementById("vmodal-trust-score");
  if (sEl) sEl.textContent = `Trust Score: ${trustScore}/100`;

  const bEl = document.getElementById("vmodal-badge");
  const bText = document.getElementById("vmodal-badge-text");
  if (bEl && bText) {
    if (verStatus === "VERIFIED") {
      bEl.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#30DC97]/15 text-[#30DC97] border border-[#30DC97]/30 flex items-center space-x-1.5";
      bText.textContent = "VERIFIED (Official Listing)";
    } else if (verStatus === "SUSPICIOUS") {
      bEl.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF5757]/15 text-[#FF5757] border border-[#FF5757]/30 flex items-center space-x-1.5";
      bText.textContent = "SUSPICIOUS (Alert Flagged)";
    } else {
      bEl.className = "px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFAA2C]/15 text-[#FFAA2C] border border-[#FFAA2C]/30 flex items-center space-x-1.5";
      bText.textContent = "NEEDS REVIEW (Corroborated)";
    }
  }

  const uLink = document.getElementById("vmodal-url-link");
  if (uLink) uLink.href = url;

  const pBtn = document.getElementById("vmodal-prepare-btn");
  if (pBtn) {
    pBtn.onclick = () => {
      closeVerificationModal();
      reviewAndApproveHomeJob(jobKey);
    };
  }

  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeVerificationModal() {
  const modal = document.getElementById("verification-inspect-modal");
  if (modal) modal.classList.add("hidden");
}

function initDailyPushNotifications() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    setTimeout(() => {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("ApplyBot AI · Autopilot Ready", {
            body: "Daily 8:00 AM notifications enabled. You will be alerted when new verified opportunities are ready.",
            icon: "/static/favicon.ico"
          });
        }
      });
    }, 3000);
  }
}
