import { scenesConfig } from './scenes.js?v=20260801-services-depth-2';

const OPENING_SUBJECT = './assets/module-1-subject.png?v=20260801-cinematic-1';

const TIMELINE = Object.freeze({
  'module-1': [0, 0.20],
  services: [0.17, 0.40],
  about: [0.37, 0.61],
  radar: [0.58, 0.82],
  contact: [0.79, 1]
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};
const wrap = (value, max) => ((value % max) + max) % max;

const preloadImage = (src) => new Promise((resolve) => {
  const image = new Image();
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
    resolve();
  };

  const timeoutId = window.setTimeout(finish, 3200);
  image.decoding = 'async';
  image.onload = async () => {
    try { if (image.decode) await image.decode(); } catch {}
    finish();
  };
  image.onerror = finish;
  image.src = src;
});

const OPENING_HTML = `
  <article class="panel panel--module-1" aria-label="Mòdul inicial DESORDEN">
    <div class="glow-background" aria-hidden="true"></div>
    <div class="intro-text">
      <h2>SI NO ET VEUEN<br>NO ET TRIEN</h2>
    </div>
    <div class="silhouette-container">
      <img class="zoom-silhouette" src="${OPENING_SUBJECT}" width="1024" height="1536" alt="Perfil Desorden" fetchpriority="high" decoding="async" draggable="false">
    </div>
  </article>
`;

const localizeScene = (scene) => {
  let html = scene.html;
  let sectionLabel = scene.sectionLabel;

  if (scene.id === 'about') {
    html = html.replace(
      /<div class="about-copy">[\s\S]*?<\/div>\s*<section class="credentials"/,
      `<div class="about-copy">
          <h2>QUI SOC</h2>
          <p>David Milla, creador i director de <strong>DESORDEN.</strong></p>
          <p>Direcció visual, vídeo, fotografia, dron, IA i web.</p>
          <p>Un <strong>únic interlocutor</strong> durant tot el procés.</p>
        </div>
        <section class="credentials"`
    );
  }

  if (scene.id === 'radar') {
    sectionLabel = 'AL RADAR';
    html = html
      .replaceAll('EN EL RADAR', 'AL RADAR')
      .replaceAll('Vídeo IA enviado', 'Vídeo IA enviat')
      .replaceAll('Respuesta directa', 'Resposta directa')
      .replaceAll('Juego secreto', 'Joc secret')
      .replaceAll('Comentario +', 'Comentari +')
      .replaceAll('like + mención', 'like + menció')
      .replaceAll('Interacción orgánica', 'Interacció orgànica')
      .replaceAll('Reacción a una pieza', 'Reacció a una peça')
      .replaceAll('Señal ', 'Senyal ');
  }

  return { ...scene, html, sectionLabel };
};

const buildRuntimeScenes = () => {
  const numbers = {
    services: '02',
    about: '03',
    radar: '04',
    contact: '05'
  };

  const currentScenes = scenesConfig.map(localizeScene).map((scene) => ({
    ...scene,
    number: numbers[scene.id] || scene.number,
    timeline: TIMELINE[scene.id]
  }));

  return [
    {
      id: 'module-1',
      kind: 'opening-profile',
      number: '01',
      sectionLabel: 'PORTADA',
      timeline: TIMELINE['module-1'],
      html: OPENING_HTML
    },
    ...currentScenes
  ];
};

class Loader {
  constructor() {
    this.root = document.getElementById('loader');
    this.bar = document.getElementById('loader-bar');
    this.value = document.getElementById('loader-progress');
  }

  set(value) {
    const progress = clamp(value, 0, 100);
    if (this.bar) this.bar.style.width = `${progress}%`;
    if (this.value) this.value.textContent = `${Math.round(progress)}%`;
  }

  finish() {
    window.clearTimeout(window.__WEBL_BOOT_TIMEOUT__);
    this.set(100);
    requestAnimationFrame(() => requestAnimationFrame(() => this.root?.classList.add('is-hidden')));
  }
}

const createRandom = (seed) => () => {
  let value = seed += 0x6D2B79F5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

class ParticleField {
  constructor(canvas) {
    if (!canvas) throw new Error('No existeix #particle-field.');

    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) throw new Error('Canvas 2D no disponible.');

    this.canvas = canvas;
    this.context = context;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
      || (navigator.deviceMemory && navigator.deviceMemory <= 4);
    this.motionScale = this.reducedMotion ? 0 : 1;
    this.qualityScale = 1;
    this.slowFrames = 0;
    this.lastTime = 0;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.particles = [];

    const rootStyle = getComputedStyle(document.documentElement);
    this.accent = rootStyle.getPropertyValue('--accent').trim() || '#f2a000';
    this.white = rootStyle.getPropertyValue('--white').trim() || '#f1f1ef';
    this.resize();
  }

  getTargetCount() {
    if (this.reducedMotion) return 26;

    let count = this.width <= 360 ? 48 : this.width <= 430 ? 60 : this.width <= 560 ? 72 : 86;
    if (this.lowPower) count = Math.max(45, count - 15);
    return count;
  }

  createParticles(count) {
    const random = createRandom(0xD3502D3);
    this.particles = Array.from({ length: count }, (_, index) => {
      const foreground = index % 17 === 0;
      return {
        nx: random(),
        ny: random(),
        depth: 0.35 + random() * 1.45,
        size: foreground ? 4 + random() * 5 : 0.45 + random() * 1.35,
        alpha: foreground ? 0.12 + random() * 0.13 : 0.20 + random() * 0.42,
        vx: (random() - 0.5) * 4.2,
        vy: (random() - 0.5) * 3.2,
        phase: random() * Math.PI * 2,
        focusX: random() - 0.5,
        focusY: random() - 0.5,
        foreground,
        accent: index % 7 === 0
      };
    });
  }

  resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const dprLimit = this.lowPower ? 1.25 : 1.75;
    const dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
    const targetCount = this.getTargetCountForWidth(width);

    if (width === this.width && height === this.height && dpr === this.dpr
      && targetCount === this.particles.length) return;

    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (targetCount !== this.particles.length) this.createParticles(targetCount);
  }

  getTargetCountForWidth(width) {
    const previousWidth = this.width;
    this.width = width;
    const count = this.getTargetCount();
    this.width = previousWidth;
    return count;
  }

  resetClock() {
    this.lastTime = 0;
  }

  render(time, progress, focus) {
    const context = this.context;
    const delta = this.lastTime ? time - this.lastTime : 16.7;
    this.lastTime = time;

    if (!this.reducedMotion && delta > 32) {
      this.slowFrames += 1;
      if (this.slowFrames > 36 && this.qualityScale > 0.72) this.qualityScale = 0.72;
    } else {
      this.slowFrames = Math.max(0, this.slowFrames - 1);
    }

    context.clearRect(0, 0, this.width, this.height);

    const contactReduction = smoothstep(0.82, 0.96, progress) * 0.68;
    const count = Math.max(10, Math.floor(
      this.particles.length * this.qualityScale * (1 - contactReduction)
    ));
    const seconds = time * 0.001 * this.motionScale;
    const focusStrength = clamp(focus?.intensity || 0, 0, 0.5);
    const focusX = (focus?.x || 0.5) * this.width;
    const focusY = (focus?.y || 0.5) * this.height;

    for (let index = 0; index < count; index += 1) {
      const particle = this.particles[index];
      const margin = particle.foreground ? 18 : 4;
      const parallax = (progress - 0.5) * (particle.depth - 1) * 22;
      let x = wrap(
        particle.nx * this.width
          + particle.vx * seconds
          + Math.sin(seconds * 0.24 + particle.phase) * 4
          + parallax,
        this.width + margin * 2
      ) - margin;
      let y = wrap(
        particle.ny * this.height
          + particle.vy * seconds
          + Math.cos(seconds * 0.19 + particle.phase) * 3
          - parallax * 0.45,
        this.height + margin * 2
      ) - margin;

      if (focusStrength > 0) {
        const targetX = focusX + particle.focusX * this.width * 0.30;
        const targetY = focusY + particle.focusY * this.height * 0.18;
        const attraction = focusStrength * (particle.accent ? 0.34 : 0.16);
        x = lerp(x, targetX, attraction);
        y = lerp(y, targetY, attraction);
      }

      const depthScale = lerp(0.65, 1.35, particle.depth / 1.8);
      const radius = particle.size * depthScale;
      const alpha = particle.alpha * (1 - contactReduction * 0.45);

      context.beginPath();
      context.globalAlpha = alpha;
      context.fillStyle = particle.accent ? this.accent : this.white;
      if (particle.foreground) {
        context.shadowBlur = Math.min(14, radius * 1.8);
        context.shadowColor = particle.accent ? this.accent : this.white;
      } else {
        context.shadowBlur = 0;
      }
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
  }
}

class TimelineProjector {
  constructor(config) {
    if (!Array.isArray(config) || config.length !== 5) {
      throw new Error('La configuració ha de contenir exactament cinc escenes.');
    }

    this.container = document.getElementById('scene-layer');
    this.number = document.getElementById('section-number');
    this.activeIndex = -1;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.particleFocus = null;

    if (!this.container) throw new Error('No existeix #scene-layer.');

    const fragment = document.createDocumentFragment();
    this.items = config.map((scene, index) => {
      if (!Array.isArray(scene.timeline)) throw new Error(`Falta el rang temporal de ${scene.id}.`);

      const element = document.createElement('section');
      element.id = scene.id;
      element.className = `scene scene--${scene.id}`;
      element.setAttribute('aria-label', scene.sectionLabel || `Secció ${index + 1}`);
      element.setAttribute('aria-hidden', 'true');
      element.style.zIndex = String(index + 1);
      element.innerHTML = scene.html;
      fragment.appendChild(element);

      return {
        id: scene.id,
        kind: scene.kind || 'default',
        element,
        timeline: scene.timeline,
        label: scene.sectionLabel || 'SECCIÓ',
        number: scene.number || String(index + 1).padStart(2, '0'),
        visible: false,
        opacity: 0,
        silhouette: element.querySelector('.silhouette-container'),
        introText: element.querySelector('.intro-text'),
        glowBg: element.querySelector('.glow-background'),
        servicesTitle: element.querySelector('.services-title'),
        serviceLinks: element.querySelector('.service-links'),
        serviceNodes: [...element.querySelectorAll('.service-node')],
        kineticWord: element.querySelector('.kinetic-word'),
        aboutStages: [...element.querySelectorAll('.about-copy > *, .credentials')],
        radarCards: [...element.querySelectorAll('.radar-card')],
        contactStages: [...element.querySelectorAll('.contact-header, .contact-form, .contact-actions')]
      };
    });

    this.container.replaceChildren(fragment);
    this.resize();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mainWidth = Math.min(this.width, 560);
  }

  hideItem(item) {
    if (!item.visible) return;
    item.visible = false;
    item.opacity = 0;
    item.element.style.opacity = '0';
    item.element.style.visibility = 'hidden';
    item.element.style.pointerEvents = 'none';
  }

  setSceneFrame(item, progress) {
    const [start, end] = item.timeline;
    if (progress < start || progress > end) {
      this.hideItem(item);
      return null;
    }

    const local = clamp((progress - start) / Math.max(end - start, 0.0001), 0, 1);
    const enter = item.id === 'module-1' ? 1 : smoothstep(0, 0.24, local);
    const exit = item.id === 'contact' ? 1 : 1 - smoothstep(0.76, 1, local);
    const opacity = clamp(enter * exit, 0, 1);

    if (opacity < 0.002) {
      this.hideItem(item);
      return { local, opacity: 0, score: 0 };
    }

    let scale = 1;
    let offsetY = 0;
    if (!this.reducedMotion && item.id !== 'module-1') {
      const entryScale = item.id === 'contact' ? 0.90 : 0.78;
      scale = lerp(entryScale, 1, enter);
      if (item.id !== 'contact') scale = lerp(scale, 1.30, 1 - exit);
      offsetY = lerp(this.height * 0.06, 0, enter);
      if (item.id !== 'contact') offsetY += lerp(0, -this.height * 0.05, 1 - exit);
    }

    item.visible = true;
    item.opacity = opacity;
    item.element.style.visibility = 'visible';
    item.element.style.opacity = opacity.toFixed(4);
    item.element.style.transform = `translate3d(-50%, calc(-50% + ${offsetY.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;

    const inReadingWindow = local >= 0.22 && (item.id === 'contact' || local <= 0.80);
    return { local, opacity, score: opacity + (inReadingWindow ? 0.22 : 0) };
  }

  updateOpening(item, local) {
    const movement = smoothstep(0.04, 0.90, local);
    const textOpacity = 1 - smoothstep(0.05, 0.54, local);

    if (item.silhouette) {
      const scale = this.reducedMotion ? 1 : lerp(1, 3.15, movement);
      const x = this.reducedMotion ? 0 : lerp(0, -6, movement);
      const y = this.reducedMotion ? 0 : lerp(0, 8, movement);
      item.silhouette.style.transform = `translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
    }

    if (item.introText) {
      const lift = this.reducedMotion ? 0 : movement * Math.min(110, this.height * 0.13);
      item.introText.style.opacity = textOpacity.toFixed(4);
      item.introText.style.transform = `translate3d(0, ${(-lift).toFixed(2)}px, 0) translateY(-50%)`;
    }

    if (item.glowBg) item.glowBg.style.opacity = textOpacity.toFixed(4);
  }

  updateServices(item, local) {
    const titleReveal = smoothstep(0.03, 0.20, local);
    const motion = smoothstep(0.42, 0.94, local);

    if (item.servicesTitle) {
      item.servicesTitle.style.opacity = titleReveal.toFixed(4);
      const titleScale = this.reducedMotion ? 1 : 1 + motion * 0.055;
      item.servicesTitle.style.transform = `translate3d(0, ${(18 * (1 - titleReveal) - motion * 8).toFixed(2)}px, 0) scale(${titleScale.toFixed(4)})`;
    }

    item.serviceNodes.forEach((node, index) => {
      const baseX = Number(node.dataset.x || 50);
      const baseY = Number(node.dataset.y || 50);
      const drift = Number(node.dataset.drift || 0);
      const rotation = Number(node.dataset.rotate || 0);
      const delay = index * 0.075;
      const travel = this.reducedMotion ? 0 : smoothstep(delay, Math.min(1, delay + 0.62), motion);
      const currentZ = travel * 520;
      const driftX = drift * travel;
      const waveY = Math.sin(travel * Math.PI + index * 0.7) * 2.2 * travel;
      const opacity = this.reducedMotion ? 1 : 1 - smoothstep(0.62, 1, travel);
      const blur = this.reducedMotion ? 0 : smoothstep(0.70, 1, travel) * 4.5;
      const scale = this.reducedMotion ? 1 : 1 + travel * 0.18;

      node.style.left = `${(baseX + driftX).toFixed(2)}%`;
      node.style.top = `${(baseY + waveY).toFixed(2)}%`;
      node.style.opacity = opacity.toFixed(4);
      node.style.filter = `blur(${blur.toFixed(2)}px)`;
      node.style.transform = `translate3d(-50%, -50%, ${currentZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${(rotation * travel).toFixed(2)}deg)`;
    });
  }

  updateAbout(item, local) {
    item.aboutStages.forEach((stage, index) => {
      const reveal = smoothstep(0.04 + index * 0.045, 0.22 + index * 0.045, local);
      stage.style.opacity = reveal.toFixed(4);
      stage.style.transform = `translate3d(0, ${(22 * (1 - reveal)).toFixed(2)}px, 0)`;
    });

    if (item.kineticWord) {
      const shift = this.reducedMotion ? 0 : lerp(-this.mainWidth * 0.12, this.mainWidth * 0.12, local);
      item.kineticWord.style.setProperty('--kinetic-shift', `${shift.toFixed(2)}px`);
    }
  }

  updateRadar(item, local) {
    const sequence = smoothstep(0.22, 0.68, local) * 2;
    const rotations = [-2.2, 1.8, -1.2];

    item.radarCards.forEach((card, index) => {
      const reveal = smoothstep(0.04 + index * 0.045, 0.22 + index * 0.04, local);
      const proximity = clamp(1 - Math.abs(index - sequence), 0, 1);
      const opacity = reveal * (0.40 + proximity * 0.60);
      const scale = this.reducedMotion ? 1 : lerp(0.78, 0.965, reveal) + proximity * 0.045;
      const y = this.reducedMotion ? 0 : (1 - reveal) * (index % 2 === 0 ? -52 : 52);
      const rotation = this.reducedMotion ? 0 : rotations[index] * (0.65 + reveal * 0.35);

      card.style.opacity = opacity.toFixed(4);
      card.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(3)}deg)`;
    });

    const activeCard = clamp(Math.round(sequence), 0, 2);
    this.particleFocus = {
      x: 0.57,
      y: [0.39, 0.60, 0.79][activeCard],
      intensity: smoothstep(0.18, 0.34, local) * (1 - smoothstep(0.76, 1, local)) * 0.46
    };
  }

  updateContact(item, local) {
    item.contactStages.forEach((stage, index) => {
      const reveal = smoothstep(0.04 + index * 0.055, 0.20 + index * 0.055, local);
      stage.style.opacity = reveal.toFixed(4);
      stage.style.transform = `translate3d(0, ${(24 * (1 - reveal)).toFixed(2)}px, 0)`;
    });

    if (item.kineticWord) {
      const shift = this.reducedMotion ? 0 : lerp(-this.mainWidth * 0.08, this.mainWidth * 0.06, smoothstep(0, 0.32, local));
      item.kineticWord.style.setProperty('--kinetic-shift', `${shift.toFixed(2)}px`);
    }
  }

  setActive(index) {
    const changed = index !== this.activeIndex;
    if (changed) {
      this.activeIndex = index;
      this.items.forEach((item, itemIndex) => {
        const active = itemIndex === index;
        item.element.setAttribute('aria-hidden', String(!active));
        item.element.inert = !active;
        if (!active) item.element.style.pointerEvents = 'none';
      });
    }

    const active = this.items[index];
    active.element.style.pointerEvents = active.id === 'contact' && active.opacity > 0.55 ? 'auto' : 'none';
    if (changed) {
      if (this.number) this.number.textContent = active.number;
      document.body.dataset.section = active.label;
    }
  }

  update(progress) {
    let bestIndex = 0;
    let bestScore = -1;
    this.particleFocus = null;

    this.items.forEach((item, index) => {
      const frame = this.setSceneFrame(item, progress);
      if (!frame || frame.opacity <= 0) return;

      if (item.id === 'module-1') this.updateOpening(item, frame.local);
      if (item.id === 'services') this.updateServices(item, frame.local);
      if (item.id === 'about') this.updateAbout(item, frame.local);
      if (item.id === 'radar') this.updateRadar(item, frame.local);
      if (item.id === 'contact') this.updateContact(item, frame.local);

      if (frame.score > bestScore) {
        bestScore = frame.score;
        bestIndex = index;
      }
    });

    this.setActive(bestIndex);
    return { particleFocus: this.particleFocus };
  }
}

class ScrollFlight {
  constructor() {
    this.target = 0;
    this.current = 0;
    this.lastTime = performance.now();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateTarget = this.updateTarget.bind(this);

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.addEventListener('scroll', this.updateTarget, { passive: true });
    this.updateTarget();
  }

  updateTarget() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.target = clamp(window.scrollY / maxScroll, 0, 1);
  }

  resetClock() {
    this.lastTime = performance.now();
    this.updateTarget();
  }

  update(time) {
    const delta = clamp((time - this.lastTime) / 1000, 0.001, 0.05);
    this.lastTime = time;

    if (this.reducedMotion) {
      this.current = this.target;
    } else {
      this.current = lerp(this.current, this.target, 1 - Math.exp(-8.5 * delta));
      if (Math.abs(this.current - this.target) < 0.00001) this.current = this.target;
    }

    return this.current;
  }
}

const bindContactForm = () => {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-note');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const text = `Hola DESORDEN.\nNom: ${data.get('nom')}\nContacte: ${data.get('contacte')}\nObjectiu: ${data.get('objectiu')}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Projecte per a DESORDEN',
          text,
          url: 'https://www.desorden.cat/#contacte'
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('No hi ha cap mètode de compartició disponible.');
      }

      if (note) {
        note.textContent = navigator.share ? 'Missatge preparat per compartir.' : 'Missatge copiat.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError' && note) {
        note.textContent = 'Pots contactar directament amb els botons inferiors.';
      }
    }
  });
};

class App {
  constructor(loader) {
    this.loader = loader;
    this.projector = new TimelineProjector(buildRuntimeScenes());
    this.loader.set(72);
    this.flight = new ScrollFlight();
    this.cue = document.getElementById('scroll-cue');
    this.progress = document.getElementById('rail-progress');
    this.frameId = 0;
    this.running = false;
    this.resizePending = false;
    this.particles = null;
    this.tick = this.tick.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleResize = this.handleResize.bind(this);

    try {
      this.particles = new ParticleField(document.getElementById('particle-field'));
    } catch (error) {
      console.warn('[WEBL] Camp de partícules desactivat:', error);
    }

    bindContactForm();
    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.render(performance.now());
    document.documentElement.classList.add('is-ready');
    this.loader.finish();
    this.start();
  }

  handleResize() {
    this.resizePending = true;
    this.flight.updateTarget();
  }

  handleVisibility() {
    if (document.hidden) {
      this.stop();
      document.documentElement.classList.add('is-paused');
      return;
    }

    document.documentElement.classList.remove('is-paused');
    this.resizePending = true;
    this.flight.resetClock();
    this.particles?.resetClock();
    this.start();
  }

  start() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  render(time) {
    if (this.resizePending) {
      this.resizePending = false;
      this.projector.resize();
      this.particles?.resize();
    }

    const progress = this.flight.update(time);
    const sceneState = this.projector.update(progress);

    if (this.particles) {
      try {
        this.particles.render(time, progress, sceneState.particleFocus);
      } catch (error) {
        console.warn('[WEBL] Camp de partícules desactivat durant el render:', error);
        this.particles = null;
      }
    }

    if (this.cue) this.cue.style.opacity = String(clamp(1 - progress * 15, 0, 1));
    if (this.progress) this.progress.style.transform = `scaleY(${progress.toFixed(4)})`;
  }

  tick(time) {
    if (!this.running) return;
    this.render(time);
    this.frameId = requestAnimationFrame(this.tick);
  }
}

const showBootFallback = () => {
  const layer = document.getElementById('scene-layer');
  if (!layer) return;

  if (!layer.querySelector('.panel--module-1')) {
    const fallback = document.createElement('section');
    fallback.className = 'scene scene--module-1 scene--opening-fallback';
    fallback.setAttribute('aria-label', 'Mòdul inicial DESORDEN');
    fallback.innerHTML = OPENING_HTML;
    layer.replaceChildren(fallback);
  }
  const opening = layer.querySelector('.scene--module-1');
  if (opening) {
    opening.style.opacity = '1';
    opening.style.visibility = 'visible';
    opening.style.transform = 'translate3d(-50%, -50%, 0)';
    opening.removeAttribute('aria-hidden');
    opening.inert = false;
  }
  layer.classList.add('boot-error');
};

const boot = async () => {
  const loader = new Loader();
  loader.set(16);
  await preloadImage(OPENING_SUBJECT);
  loader.set(56);
  new App(loader);
};

boot().catch((error) => {
  console.error('[WEBL] Error d’inici:', error);
  window.clearTimeout(window.__WEBL_BOOT_TIMEOUT__);
  document.getElementById('loader')?.classList.add('is-hidden');
  showBootFallback();
});
