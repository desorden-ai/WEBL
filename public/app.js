import { scenesConfig } from './scenes.js?v=20260731-desorden';

const OPENING_SUBJECT = './assets/module-1-subject.png';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};

const preloadImage = (src) => new Promise((resolve) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = async () => {
    try { if (image.decode) await image.decode(); } catch {}
    resolve();
  };
  image.onerror = resolve;
  image.src = src;
});

const OPENING_HTML = `
  <article class="panel panel--opening-profile" aria-label="Mòdul inicial DESORDEN">
    <div class="opening-profile__bg-wrap" aria-hidden="true">
      <div class="opening-profile__bg"></div>
    </div>
    <div class="opening-profile__center-hole" aria-hidden="true"></div>
    <img class="opening-profile__subject" src="${OPENING_SUBJECT}" width="1024" height="1536" alt="Figura en perfil" fetchpriority="high" decoding="async" draggable="false">
  </article>
`;

const buildRuntimeScenes = () => {
  const positions = {
    intro: { x: 0, y: 0, z: -170 },
    about: { x: 0, y: 0, z: -340 },
    radar: { x: 0, y: 0, z: -510 },
    contact: { x: 0, y: 0, z: -680 }
  };

  const currentScenes = scenesConfig.map((scene) => ({
    ...scene,
    position: positions[scene.id] || scene.position
  }));

  return [
    {
      id: 'opening-profile',
      kind: 'opening-profile',
      number: '01',
      sectionLabel: 'INICI',
      position: { x: 0, y: 0, z: 0 },
      html: OPENING_HTML
    },
    ...currentScenes.map((scene, index) => ({
      ...scene,
      number: String(index + 2).padStart(2, '0')
    }))
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

class SceneProjector {
  constructor(config) {
    if (!Array.isArray(config) || config.length === 0) throw new Error('La configuració d’escenes està buida.');
    this.container = document.getElementById('scene-layer');
    this.number = document.getElementById('section-number');
    this.activeKey = '';
    if (!this.container) throw new Error('No existeix #scene-layer.');
    this.container.replaceChildren();

    this.items = config.map((scene, index) => {
      const element = document.createElement('section');
      element.id = scene.id;
      element.className = `scene scene--${scene.id}`;
      element.setAttribute('aria-label', scene.sectionLabel || `Secció ${index + 1}`);
      element.innerHTML = scene.html;
      this.container.appendChild(element);
      return {
        id: scene.id,
        kind: scene.kind || 'default',
        element,
        bgWrap: element.querySelector('.opening-profile__bg-wrap'),
        subject: element.querySelector('.opening-profile__subject'),
        centerHole: element.querySelector('.opening-profile__center-hole'),
        x: Number(scene.position?.x || 0),
        y: Number(scene.position?.y || 0),
        z: Number(scene.position?.z || 0),
        label: scene.sectionLabel || 'SECCIÓ',
        number: scene.number || String(index + 1).padStart(2, '0')
      };
    });

    this.minZ = Math.min(...this.items.map((item) => item.z));
    this.maxZ = Math.max(...this.items.map((item) => item.z));
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.focal = Math.min(this.width, this.height) * 1.08;
  }

  hideItem(item) {
    item.element.style.opacity = '0';
    item.element.style.visibility = 'hidden';
    item.element.style.pointerEvents = 'none';
  }

  updateOpeningProfile(item, distanceZ, camera) {
    if (distanceZ > 12 || distanceZ < -135) {
      this.hideItem(item);
      return 0;
    }

    const movement = smoothstep(-72, 8, distanceZ);
    const farVisibility = smoothstep(-135, -72, distanceZ);
    const nearVisibility = 1 - smoothstep(7, 12, distanceZ);
    const opacity = clamp(farVisibility * nearVisibility, 0, 1);
    const depth = Math.max(0.5, -distanceZ);
    const screenX = this.width / 2 + ((item.x - camera.x) / depth) * this.focal;
    const screenY = this.height / 2 - ((item.y - camera.y) / depth) * this.focal;

    item.element.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
    item.element.style.opacity = opacity.toFixed(4);
    item.element.style.pointerEvents = 'none';
    item.element.style.filter = 'none';
    item.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${lerp(1, 1.08, movement).toFixed(4)})`;

    if (item.bgWrap) {
      const rotation = lerp(0, 55, movement);
      const scale = lerp(1.03, 1.18, movement);
      item.bgWrap.style.transform = `rotate(${rotation.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
    }

    if (item.subject) {
      const subjectX = lerp(0, this.width * 0.62, movement);
      const subjectScale = lerp(1, 1.16, movement);
      item.subject.style.transform = `translate3d(${subjectX.toFixed(2)}px,0,0) scale(${subjectScale.toFixed(4)})`;
    }

    if (item.centerHole) {
      item.centerHole.style.transform = `translate(-50%,-50%) scale(${lerp(1, 2.25, movement).toFixed(4)})`;
    }

    return opacity;
  }

  updateDefaultScene(item, distanceZ, camera) {
    if (distanceZ > 10 || distanceZ < -205) {
      this.hideItem(item);
      return 0;
    }
    const safeDistance = Math.max(0.5, Math.abs(distanceZ));
    const depth = Math.max(0.5, -distanceZ);
    const screenX = this.width / 2 + ((item.x - camera.x) / depth) * this.focal;
    const screenY = this.height / 2 - ((item.y - camera.y) / depth) * this.focal;
    const scale = clamp(35 / safeDistance, 0.17, 16);
    const opacity = clamp(smoothstep(-200, -105, distanceZ) * (1 - smoothstep(-28, 8, distanceZ)), 0, 1);
    const blur = distanceZ > -28 ? clamp((28 + distanceZ) * 0.34, 0, 12) : 0;
    item.element.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
    item.element.style.opacity = opacity.toFixed(4);
    item.element.style.pointerEvents = opacity > 0.72 ? 'auto' : 'none';
    item.element.style.filter = `blur(${blur.toFixed(2)}px)`;
    item.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
    return opacity;
  }

  update(camera) {
    let active = this.items[0];
    let activeDistance = Infinity;
    for (const item of this.items) {
      const distanceZ = item.z - camera.z;
      const opacity = item.kind === 'opening-profile'
        ? this.updateOpeningProfile(item, distanceZ, camera)
        : this.updateDefaultScene(item, distanceZ, camera);
      const candidateDistance = Math.abs(distanceZ + 38);
      if (opacity > 0.08 && candidateDistance < activeDistance) {
        activeDistance = candidateDistance;
        active = item;
      }
    }
    const key = `${active.number}-${active.label}`;
    if (key !== this.activeKey) {
      this.activeKey = key;
      if (this.number) this.number.textContent = active.number;
      document.body.dataset.section = active.label;
    }
  }
}

class ScrollFlight {
  constructor(minZ, maxZ) {
    this.target = 0;
    this.current = 0;
    this.startZ = maxZ + 42;
    this.endZ = minZ + 37;
    this.lastTime = performance.now();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.addEventListener('scroll', () => this.updateTarget(), { passive: true });
    window.addEventListener('resize', () => this.updateTarget(), { passive: true });
  }
  updateTarget() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.target = clamp(window.scrollY / maxScroll, 0, 1);
  }
  update(time) {
    const delta = clamp((time - this.lastTime) / 1000, 0.001, 0.05);
    this.lastTime = time;
    this.current = lerp(this.current, this.target, 1 - Math.exp(-(this.reducedMotion ? 10 : 2.25) * delta));
    const p = this.current;
    return { progress: p, z: lerp(this.startZ, this.endZ, p), x: Math.sin(p * Math.PI * 4.1) * 0.1, y: Math.cos(p * Math.PI * 3) * 0.05 };
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
      if (navigator.share) await navigator.share({ title: 'Projecte per a DESORDEN', text, url: 'https://www.desorden.cat/#contacte' });
      else await navigator.clipboard.writeText(text);
      if (note) note.textContent = navigator.share ? 'Missatge preparat per compartir.' : 'Missatge copiat.';
    } catch (error) {
      if (error?.name !== 'AbortError' && note) note.textContent = 'Pots contactar directament amb els botons inferiors.';
    }
  });
};

class App {
  constructor(loader) {
    this.loader = loader;
    this.projector = new SceneProjector(buildRuntimeScenes());
    this.loader.set(72);
    this.flight = new ScrollFlight(this.projector.minZ, this.projector.maxZ);
    this.cue = document.getElementById('scroll-cue');
    this.progress = document.getElementById('rail-progress');
    bindContactForm();
    this.tick = this.tick.bind(this);
    this.tick(performance.now());
    document.documentElement.classList.add('is-ready');
    this.loader.finish();
  }
  tick(time) {
    const camera = this.flight.update(time);
    this.projector.update(camera);
    if (this.cue) this.cue.style.opacity = String(clamp(1 - camera.progress * 15, 0, 1));
    if (this.progress) this.progress.style.transform = `scaleY(${camera.progress.toFixed(4)})`;
    requestAnimationFrame(this.tick);
  }
}

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
  document.getElementById('scene-layer')?.classList.add('boot-error');
});
