const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
};

class Loader {
  constructor() {
    this.root = document.getElementById('loader');
    this.bar = document.getElementById('loader-bar');
    this.value = document.getElementById('loader-progress');
    this.progress = 0;
    this.watchdog = window.setTimeout(() => this.finish(), 2600);
  }

  set(value) {
    this.progress = clamp(value, 0, 100);
    this.bar.style.width = `${this.progress}%`;
    this.value.textContent = `${Math.round(this.progress)}%`;
  }

  finish() {
    window.clearTimeout(this.watchdog);
    this.set(100);
    window.setTimeout(() => this.root.classList.add('is-hidden'), 180);
  }
}

class SceneProjector {
  constructor() {
    this.items = [...document.querySelectorAll('[data-scene]')].map((element) => ({
      element,
      x: Number(element.dataset.x || 0),
      y: Number(element.dataset.y || 0),
      z: Number(element.dataset.z || 0),
      label: element.dataset.label || '',
      number: element.dataset.number || ''
    }));
    this.label = document.getElementById('section-label');
    this.number = document.getElementById('section-number');
    this.activeKey = '';
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.focal = Math.min(this.width, this.height) * 1.18;
  }

  update(camera) {
    let active = this.items[0];
    let activeDistance = Infinity;

    for (const item of this.items) {
      const depth = camera.z - item.z;
      const visible = depth > 1.5 && depth < 174;

      if (!visible) {
        item.element.style.opacity = '0';
        item.element.style.visibility = 'hidden';
        item.element.classList.remove('is-interactive');
        continue;
      }

      const relativeX = item.x - camera.x;
      const relativeY = item.y - camera.y;
      const screenX = this.width / 2 + (relativeX / depth) * this.focal;
      const screenY = this.height / 2 - (relativeY / depth) * this.focal;

      const scale = clamp(33 / depth, 0.22, 1.9);
      const farFade = 1 - smoothstep(105, 174, depth);
      const nearFade = smoothstep(1.5, 24, depth);
      const opacity = Math.pow(farFade * nearFade, 0.82);

      item.element.style.visibility = 'visible';
      item.element.style.opacity = opacity.toFixed(4);
      item.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
      item.element.classList.toggle('is-interactive', opacity > 0.68);

      const candidateDistance = Math.abs(depth - 32);
      if (candidateDistance < activeDistance) {
        activeDistance = candidateDistance;
        active = item;
      }
    }

    const key = `${active.number}-${active.label}`;
    if (key !== this.activeKey) {
      this.activeKey = key;
      this.number.textContent = active.number;
      this.label.textContent = active.label;
    }
  }
}

class ScrollFlight {
  constructor() {
    this.target = 0;
    this.current = 0;
    this.maxDepth = -296;
    this.lastTime = performance.now();
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateTarget();

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

    const response = this.reducedMotion ? 9 : 2.65;
    const easing = 1 - Math.exp(-response * delta);
    this.current = lerp(this.current, this.target, easing);

    const p = this.current;
    return {
      progress: p,
      z: p * this.maxDepth,
      x: Math.sin(p * Math.PI * 3.2) * 0.42,
      y: Math.cos(p * Math.PI * 2.1) * 0.2
    };
  }
}

class App {
  constructor() {
    this.loader = new Loader();
    this.loader.set(20);
    this.flight = new ScrollFlight();
    this.projector = new SceneProjector();
    this.cue = document.getElementById('scroll-cue');
    this.loader.set(84);

    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
    this.loader.finish();
  }

  tick(time) {
    const camera = this.flight.update(time);
    this.projector.update(camera);
    this.cue.style.opacity = String(clamp(1 - camera.progress * 14, 0, 1));
    requestAnimationFrame(this.tick);
  }
}

const boot = () => {
  try {
    new App();
  } catch (error) {
    console.error('[DESORDEN] Error de inicio:', error);
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
