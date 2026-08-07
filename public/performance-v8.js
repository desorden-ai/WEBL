'use strict';

const worldEl = document.getElementById('world');
const sceneEl = document.getElementById('scene');
const navThumb = document.getElementById('nav-thumb');
const pageNumberEl = document.getElementById('hud-page-number');
const loaderContainer = document.getElementById('loader');
const loaderTxtEl = document.getElementById('loader-text-3d');
const cookieWrapper = document.getElementById('cookie-wrapper');
const btnAccept = document.getElementById('btn-accept-cookies');
const menuButton = document.getElementById('hud-top-right');
const navMenu = document.getElementById('nav-menu');
const menuItems = Array.from(document.querySelectorAll('.menu-item'));

const scheduleIdle = (callback, timeout = 1000) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return window.setTimeout(() => callback({
    didTimeout: true,
    timeRemaining: () => 0
  }), 0);
};

let assetsLoaded = false;
let simulatedProgress = 0;
let currentWordIndex = 0;
let pendingWordIndex = 0;
let loaderAnimating = false;
let animFinished = false;
let launchStarted = false;
let sceneStarted = false;
let cookiesAccepted = false;

try {
  cookiesAccepted = localStorage.getItem('desorden_cookies') === 'true';
} catch {}

const loaderWords = ['D', 'E', 'S', 'O', 'R', 'D', 'E', 'N'];

function checkLoadingState() {
  assetsLoaded = true;
}

function animateNextLoaderLetter() {
  if (loaderAnimating || currentWordIndex >= pendingWordIndex || animFinished) return;

  loaderAnimating = true;
  const nextIndex = currentWordIndex + 1;
  loaderTxtEl.style.transition = 'transform .1s ease-in, opacity .1s ease';
  loaderTxtEl.style.transform = 'rotateX(90deg)';
  loaderTxtEl.style.opacity = '0';

  window.setTimeout(() => {
    loaderTxtEl.textContent = loaderWords[nextIndex];
    loaderTxtEl.style.transition = 'none';
    loaderTxtEl.style.transform = 'rotateX(-90deg)';
    void loaderTxtEl.offsetWidth;
    loaderTxtEl.style.transition = 'transform .1s ease-out, opacity .1s ease';
    loaderTxtEl.style.transform = 'rotateX(0deg)';
    loaderTxtEl.style.opacity = '1';
    currentWordIndex = nextIndex;

    window.setTimeout(() => {
      loaderAnimating = false;
      animateNextLoaderLetter();
      checkLoaderCompletion();
    }, 105);
  }, 100);
}

function requestLoaderIndex(index) {
  pendingWordIndex = Math.max(
    pendingWordIndex,
    Math.min(loaderWords.length - 1, index)
  );
  animateNextLoaderLetter();
}

function setMenuOpen(isOpen) {
  navMenu.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute(
    'aria-label',
    isOpen ? 'Cerrar navegación por secciones' : 'Abrir navegación por secciones'
  );
}

function launchExperience() {
  if (launchStarted) return;
  launchStarted = true;
  cookieWrapper.classList.remove('visible');

  window.setTimeout(() => {
    loaderContainer.style.opacity = '0';
    window.setTimeout(() => {
      loaderContainer.style.display = 'none';
      document.body.classList.add('ready');
      sceneStarted = true;
      wakeUpLoop(true);
    }, 500);
  }, 200);
}

function checkFinalLaunch() {
  if (!animFinished) return;
  if (cookiesAccepted) launchExperience();
  else cookieWrapper.classList.add('visible');
}

function checkLoaderCompletion() {
  if (
    animFinished ||
    simulatedProgress < 100 ||
    currentWordIndex !== loaderWords.length - 1 ||
    loaderAnimating
  ) return;

  animFinished = true;
  checkFinalLaunch();
}

btnAccept.addEventListener('click', () => {
  try {
    localStorage.setItem('desorden_cookies', 'true');
  } catch {}
  cookiesAccepted = true;
  checkFinalLaunch();
});

menuButton.addEventListener('click', () => {
  setMenuOpen(!navMenu.classList.contains('open'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuOpen(false);
});

document.addEventListener('pointerdown', (event) => {
  if (!navMenu.classList.contains('open')) return;
  if (navMenu.contains(event.target) || menuButton.contains(event.target)) return;
  setMenuOpen(false);
});

let loaderLastTime = performance.now();
function updateLoaderProgress(now) {
  if (animFinished) return;

  const frameScale = Math.min(4, (now - loaderLastTime) / 16.667 || 1);
  loaderLastTime = now;
  const target = assetsLoaded ? 100 : 90;
  const rate = assetsLoaded ? 0.18 : 0.012;
  simulatedProgress += (target - simulatedProgress) * (1 - Math.pow(1 - rate, frameScale));

  if (assetsLoaded && simulatedProgress > 99.35) simulatedProgress = 100;

  requestLoaderIndex(Math.floor(simulatedProgress / 12.5));
  checkLoaderCompletion();
  requestAnimationFrame(updateLoaderProgress);
}
requestAnimationFrame(updateLoaderProgress);

class StardustImage {
  constructor(src, container) {
    this.container = container;
    this.loaded = false;
    this.fallbackMode = false;
    this.readyToProcess = false;
    this.processingRequested = false;
    this.processing = false;
    this.particles = [];

    this.realImg = document.createElement('img');
    this.realImg.className = 'stardust-real-img';
    this.realImg.src = src;
    this.realImg.alt = 'David Milla, creativo y director de DESORDEN';
    this.realImg.fetchPriority = 'high';
    this.realImg.decoding = 'async';
    this.realImg.draggable = false;
    this.realImg.addEventListener('load', checkLoadingState, { once: true });

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'stardust-canvas';
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    container.append(this.realImg, this.canvas);

    this.pixelImg = new Image();
    this.pixelImg.decoding = 'async';
    this.pixelImg.onload = () => {
      this.readyToProcess = true;
      if (this.processingRequested) this.scheduleProcessing();
    };
    this.pixelImg.onerror = () => {
      this.fallbackMode = true;
      this.loaded = true;
      checkLoadingState();
      wakeUpLoop(true);
    };
    this.pixelImg.src = src;
  }

  requestProcessing() {
    this.processingRequested = true;
    if (this.readyToProcess) this.scheduleProcessing();
  }

  scheduleProcessing() {
    if (this.loaded || this.processing || !this.readyToProcess) return;
    this.processing = true;
    scheduleIdle(() => this.prepareParticles(), 1500);
  }

  prepareParticles() {
    try {
      const img = this.pixelImg;
      const cols = 75;
      const aspect = img.height / img.width;
      const rows = Math.floor(cols * aspect);
      const pixelSize = 4;
      const imgDrawWidth = cols * pixelSize;
      const imgDrawHeight = rows * pixelSize;

      this.canvas.width = imgDrawWidth * 3;
      this.canvas.height = imgDrawHeight * 3;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cols;
      tempCanvas.height = rows;
      const tempContext = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempContext.drawImage(img, 0, 0, cols, rows);

      const imageData = tempContext.getImageData(0, 0, cols, rows).data;
      const offsetX = imgDrawWidth;
      const offsetY = imgDrawHeight;
      let row = 0;

      const processChunk = (deadline) => {
        const startedAt = performance.now();
        while (row < rows) {
          for (let x = 0; x < cols; x += 1) {
            const index = (row * cols + x) * 4;
            const red = imageData[index];
            const green = imageData[index + 1];
            const blue = imageData[index + 2];
            const alpha = imageData[index + 3];
            const brightness = (red + green + blue) / 3;

            if (alpha > 50 && brightness > 15) {
              this.particles.push({
                baseX: (x * pixelSize) + offsetX,
                baseY: (row * pixelSize) + offsetY,
                color: `rgba(${red},${green},${blue},1)`,
                randX: (Math.random() - 0.5) * window.innerWidth * 3,
                randY: (Math.random() - 0.5) * window.innerHeight * 3
              });
            }
          }
          row += 1;

          const timeAvailable = typeof deadline?.timeRemaining === 'function'
            ? deadline.timeRemaining() > 2
            : performance.now() - startedAt < 6;
          if (!timeAvailable) break;
        }

        if (row < rows) {
          scheduleIdle(processChunk, 1000);
          return;
        }

        this.loaded = true;
        this.processing = false;
        wakeUpLoop(true);
      };

      scheduleIdle(processChunk, 1000);
    } catch {
      this.fallbackMode = true;
      this.loaded = true;
      this.processing = false;
      wakeUpLoop(true);
    }
  }

  update(trueZ) {
    if (!this.loaded) {
      this.realImg.style.opacity = '1';
      this.canvas.style.opacity = '0';
      return;
    }

    let dispersion = trueZ > -400 ? (trueZ + 400) / 2800 : 0;
    dispersion = Math.max(0, Math.min(1, dispersion));
    const eased = Math.pow(dispersion, 1.2);

    if (this.fallbackMode) {
      this.realImg.style.opacity = String(1 - eased);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (eased === 0) {
      this.realImg.style.opacity = '1';
      this.canvas.style.opacity = '0';
    } else if (eased < 0.1) {
      const fade = eased / 0.1;
      this.realImg.style.opacity = String(1 - fade);
      this.canvas.style.opacity = String(fade);
    } else {
      this.realImg.style.opacity = '0';
      this.canvas.style.opacity = String(1 - eased * 0.8);
    }

    if (eased >= 0.99) return;

    for (const particle of this.particles) {
      const x = particle.baseX + particle.randX * eased;
      const y = particle.baseY + particle.randY * eased;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(x, y, 3.5, 3.5);
    }
  }
}

const verified = '<svg viewBox="0 0 24 24" fill="white" style="width:10px;height:10px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
const sceneData = [
  { id: 's0_img', type: 'stardust', src: '1000091876.jpg', x: 4, y: 22, z: -600 },
  { id: 's1_1', html: '<h2 class="font-bebas text-white title-huge">TU</h2>', x: -3, y: -15, z: -2500 },
  { id: 's1_2', html: '<h2 class="font-bebas text-orange title-huge">PARTNER</h2>', x: 2, y: 5, z: -4000 },
  { id: 's1_3', html: '<p class="body-text text-muted" style="font-size:.9rem;letter-spacing:2px">( TECNOLÓGICO Y CREATIVO )</p>', x: 0, y: 25, z: -5500 },
  { id: 's2_1', html: '<h2 class="font-bebas text-orange title-section">QUIÉN SOY</h2>', x: -5, y: -25, z: -10500 },
  { id: 's2_2', html: '<p class="body-text text-muted">David Milla, creador y director<br>de <span class="text-orange">DESORDEN.</span></p>', x: 2, y: -5, z: -12500 },
  { id: 's2_3', html: '<p class="body-text text-muted">Dirección visual, vídeo,<br>fotografía, dron, IA y web.</p>', x: -2, y: 15, z: -14500 },
  { id: 's2_4', html: '<p class="body-text text-muted">Un <span class="text-orange">único interlocutor</span><br>durante todo el proceso.</p>', x: 4, y: 35, z: -16500 },
  { id: 's3_1', html: '<div class="font-bebas text-orange subtitle-small" style="border-bottom:1px solid #555;padding-bottom:10px">FORMACIONES | ACREDITACIONES</div>', x: 0, y: -20, z: -21000 },
  { id: 's3_2', html: '<div class="acred-col"><div class="acred-icon">G</div><div class="acred-text">Fundamentals of<br>Digital Marketing Certification</div></div>', x: -4, y: 5, z: -23000 },
  { id: 's3_3', html: '<div class="acred-col"><div class="acred-icon" style="display:flex;align-items:center;justify-content:center;gap:5px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:35px;height:35px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path></svg><span class="font-bebas" style="font-size:2.5rem">AESA</span></div><div class="acred-text">Certificación oficial de<br>piloto de dron (AESA)</div></div>', x: 4, y: 30, z: -25000 },
  { id: 's4_1', html: `<div class="artist-card"><div class="avatar">[Rosalía]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROSALÍA <div class="verified-badge">${verified}</div></div></div><div class="card-arrow">→</div></div>`, x: -4, y: -25, z: -30000 },
  { id: 's4_2', html: `<div class="artist-card"><div class="avatar">[Rozalén]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">ROZALÉN <div class="verified-badge">${verified}</div></div><div style="color:var(--accent-color);font-size:1.2rem;margin-top:5px">💬 ♡ @</div></div><div class="card-arrow">→</div></div>`, x: 5, y: 0, z: -32000 },
  { id: 's4_3', html: `<div class="artist-card"><div class="avatar">[Leire]</div><div class="artist-info"><div class="font-bebas text-orange artist-name">LEIRE MARTÍNEZ <div class="verified-badge">${verified}</div></div><div style="color:var(--accent-color);margin-top:5px">···|·|||··|·|·||····</div></div><div class="card-arrow">→</div></div>`, x: -3, y: 25, z: -34000 },
  { id: 's5_1', html: '<h2 class="font-bebas text-orange title-section" style="line-height:.9">HABLEMOS DE TU<br>PROYECTO</h2>', x: -5, y: -30, z: -39000 },
  { id: 's5_2', html: '<p class="body-text text-white">Hacemos visible lo que tienes en mente.</p>', x: 4, y: -10, z: -41000 },
  { id: 's5_3', html: '<div class="input-group"><div class="input-icon">👤</div><div style="color:#ddd">Nombre</div></div>', x: -2, y: 5, z: -43000 },
  { id: 's5_4', html: '<div class="input-group"><div class="input-icon">📞</div><div style="color:#ddd">Contacto</div></div>', x: 2, y: 15, z: -45000 },
  { id: 's5_5', html: '<div class="input-group textarea"><div class="input-icon">🎯</div><div style="color:#ddd">Objetivo</div></div>', x: -2, y: 28, z: -47000 },
  { id: 's5_6', html: '<div class="btn-primary font-bebas">HABLEMOS <span style="font-family:sans-serif">→</span></div>', x: 2, y: 43, z: -49000 },
  { id: 's5_7', html: '<div class="btn-row"><div class="btn-half font-bebas"><span style="font-family:sans-serif">💬</span> WHATSAPP</div><div class="btn-half font-bebas"><span style="font-family:sans-serif">✉</span> CORREO</div></div>', x: 0, y: 55, z: -51000 },
  { id: 's6_1', html: '<h2 class="font-bebas text-white title-section" style="text-align:center">MANIFIESTO</h2>', x: 0, y: -35, z: -56000 },
  { id: 's6_2', html: '<div class="tall-text-block">No seguimos reglas.<br><span>Desafiamos</span> la gravedad digital.<br>Creamos espacios donde tu<br>marca <span>respira</span> libremente.<br>Donde cada píxel cuenta<br>una historia profunda.<br>Y cada <span>scroll</span> es<br>un viaje sin fin.</div>', x: 0, y: 10, z: -58000 }
];

const domElements = [];
for (const item of sceneData) {
  const element = document.createElement('div');
  if (item.type === 'stardust') {
    element.className = 'hologram stardust-container';
    worldEl.appendChild(element);
    domElements.push({ element, data: item, stardust: new StardustImage(item.src, element) });
  } else {
    element.className = 'hologram';
    element.innerHTML = item.html;
    worldEl.appendChild(element);
    domElements.push({ element, data: item });
  }
}

const minZ = Math.min(...sceneData.map((item) => item.z));
const requiredCameraTravel = Math.abs(minZ) + 5000;
const maxVirtualScroll = 25000;
const lerpFactor = 0.12;
let currentScroll = 0;
let targetScroll = 0;
let cx = window.innerWidth / 100;
let cy = window.innerHeight / 100;
let touchStartY = 0;
let heavyTasksRequested = false;
let isRendering = false;

function initHeavyTasks() {
  if (heavyTasksRequested) return;
  heavyTasksRequested = true;
  for (const item of domElements) item.stardust?.requestProcessing();
}

window.setTimeout(() => scheduleIdle(initHeavyTasks, 2000), 4000);

function wakeUpLoop(forceFrame = false) {
  if (!sceneStarted || isRendering) return;
  isRendering = true;
  if (forceFrame) sceneEl.dataset.forceFrame = 'true';
  requestAnimationFrame(updateScene);
}

window.addEventListener('resize', () => {
  cx = window.innerWidth / 100;
  cy = window.innerHeight / 100;
  wakeUpLoop(true);
}, { passive: true });

window.addEventListener('touchstart', (event) => {
  if (!sceneStarted) return;
  touchStartY = event.touches[0].clientY;
  initHeavyTasks();
  wakeUpLoop(true);
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  if (!sceneStarted) return;
  const touchY = event.touches[0].clientY;
  targetScroll += (touchStartY - touchY) * 4.5;
  targetScroll = Math.max(0, Math.min(targetScroll, maxVirtualScroll));
  touchStartY = touchY;
  wakeUpLoop();
}, { passive: true });

window.addEventListener('wheel', (event) => {
  if (!sceneStarted) return;
  targetScroll += event.deltaY * 2;
  targetScroll = Math.max(0, Math.min(targetScroll, maxVirtualScroll));
  initHeavyTasks();
  wakeUpLoop();
}, { passive: true });

menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    const destination = Number(item.dataset.target);
    if (Number.isFinite(destination)) {
      targetScroll = Math.max(0, Math.min(destination, maxVirtualScroll));
    }
    setMenuOpen(false);
    initHeavyTasks();
    wakeUpLoop();
  });
});

const sectionBreaks = [0.02, 0.10, 0.24, 0.39, 0.53, 0.73];

function updateScene() {
  const delta = targetScroll - currentScroll;
  const settled = Math.abs(delta) < 0.1;
  currentScroll = settled ? targetScroll : currentScroll + delta * lerpFactor;

  const scrollProgress = currentScroll / maxVirtualScroll;
  const cameraZ = scrollProgress * requiredCameraTravel;
  const t = Math.min(1, Math.max(0, cameraZ / requiredCameraTravel));
  const adjustedT = Math.pow(t, 1.2);
  const panX = Math.sin(adjustedT * Math.PI * 1.5) * 12;
  const panY = Math.sin(t * Math.PI * 2.5) * 4;
  const rotationY = -Math.cos(adjustedT * Math.PI * 1.5) * 2;
  const rotationX = Math.sin(t * Math.PI * 2.5) * 1.5;

  sceneEl.style.perspectiveOrigin = `${50 + panX}% ${50 + panY}%`;
  worldEl.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
  navThumb.style.top = `${scrollProgress * 80}%`;

  let activePage = 1;
  while (activePage <= sectionBreaks.length && scrollProgress >= sectionBreaks[activePage - 1]) {
    activePage += 1;
  }

  const formattedPage = String(activePage).padStart(2, '0');
  if (pageNumberEl.textContent !== formattedPage) {
    pageNumberEl.textContent = formattedPage;
  }
  menuItems.forEach((item, index) => {
    item.classList.toggle('active', index === activePage - 1);
  });

  for (const item of domElements) {
    const z = item.data.z + cameraZ;

    if (item.data.type === 'stardust') {
      item.element.style.display = 'inline-block';
      item.stardust.update(z);
      item.element.style.transform = `translate(-50%,-50%) translate3d(${item.data.x * cx}px,${item.data.y * cy}px,${z}px)`;
      item.element.style.opacity = '1';
      item.element.style.filter = 'none';
      continue;
    }

    const distance = Math.abs(z + 600);
    const core = 1200;
    const transition = 3500;
    let opacity = distance > core ? 1 - ((distance - core) / transition) : 1;
    opacity = Math.max(0, Math.min(1, opacity));

    if (opacity > 0.01) {
      const blur = (1 - opacity) * 10;
      item.element.style.transform = `translate(-50%,-50%) translate3d(${item.data.x * cx}px,${item.data.y * cy}px,${z}px)`;
      item.element.style.opacity = String(opacity);
      item.element.style.filter = blur > 0.15 ? `blur(${Math.round(blur * 2) / 2}px)` : 'none';
      item.element.style.display = 'block';
    } else {
      item.element.style.display = 'none';
    }
  }

  delete sceneEl.dataset.forceFrame;

  if (Math.abs(targetScroll - currentScroll) < 0.1) {
    currentScroll = targetScroll;
    isRendering = false;
    return;
  }

  requestAnimationFrame(updateScene);
}

window.addEventListener('load', () => {
  window.setTimeout(checkLoadingState, 500);
}, { once: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isRendering = false;
  } else if (sceneStarted) {
    wakeUpLoop(true);
  }
});
