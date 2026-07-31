import { scenesConfig } from './scenes.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

class Loader {
  constructor() {
    this.root = document.getElementById('loader');
    this.bar = document.getElementById('loader-bar');
    this.value = document.getElementById('loader-progress');
    this.progress = 0;
    this.watchdog = window.setTimeout(() => this.finish(), 2800);
  }

  set(value) {
    this.progress = clamp(value, 0, 100);
    this.bar.style.width = `${this.progress}%`;
    this.value.textContent = `${Math.round(this.progress)}%`;
  }

  finish() {
    window.clearTimeout(this.watchdog);
    this.set(100);
    window.setTimeout(() => this.root.classList.add('is-hidden'), 220);
  }
}

class SceneProjector {
  constructor(config) {
    this.container = document.getElementById('scene-layer');
    this.label = document.getElementById('section-label');
    this.number = document.getElementById('section-number');
    this.activeKey = '';

    const sectionNumbers = new Map();
    let nextSection = 1;

    this.items = config.map((scene) => {
      if (!sectionNumbers.has(scene.sectionLabel)) {
        sectionNumbers.set(scene.sectionLabel, String(nextSection).padStart(2, '0'));
        nextSection += 1;
      }

      const element = document.createElement('section');
      element.id = scene.id;
      element.className = `scene scene--${scene.id}`;
      element.dataset.scene = '';
      element.innerHTML = scene.html;
      this.container.appendChild(element);

      return {
        element,
        x: Number(scene.position.x || 0),
        y: Number(scene.position.y || 0),
        z: Number(scene.position.z || 0),
        label: scene.sectionLabel,
        number: sectionNumbers.get(scene.sectionLabel)
      };
    });

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.focal = Math.min(this.width, this.height) * 1.2;
  }

  update(camera) {
    let active = this.items[0];
    let activeDistance = Infinity;

    for (const item of this.items) {
      // Negativo: elemento delante de cámara. Positivo: ya ha rebasado la cámara.
      const distanceZ = item.z - camera.z;

      if (distanceZ > 5 || distanceZ < -600) {
        item.element.style.opacity = '0';
        item.element.style.visibility = 'hidden';
        item.element.style.pointerEvents = 'none';
        item.element.style.filter = 'blur(0px)';
        continue;
      }

      const safeDistance = Math.max(0.1, Math.abs(distanceZ));
      const depth = Math.max(0.1, -distanceZ);
      const relativeX = item.x - camera.x;
      const relativeY = item.y - camera.y;
      const screenX = this.width / 2 + (relativeX / depth) * this.focal;
      const screenY = this.height / 2 - (relativeY / depth) * this.focal;

      // Escala masiva al aproximarse a la cámara.
      const scale = 35 / safeDistance;
      const clampedScale = clamp(scale, 0.05, 20);

      let opacity = 1;
      let blur = 0;

      // Entrada larga desde el fondo.
      if (distanceZ < -260) {
        opacity = (600 + distanceZ) / 340;
      }

      // Salida suave y desenfocada al atravesar la cámara.
      if (distanceZ > -30) {
        opacity *= Math.max(0, -distanceZ / 30);
        blur = (30 + distanceZ) * 0.38;
      }

      opacity = clamp(opacity, 0, 1);
      blur = clamp(blur, 0, 13);

      item.element.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
      item.element.style.opacity = opacity.toFixed(4);
      item.element.style.pointerEvents = opacity > 0.65 ? 'auto' : 'none';
      item.element.style.filter = `blur(${blur.toFixed(2)}px)`;
      item.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${clampedScale.toFixed(4)})`;

      const candidateDistance = Math.abs(distanceZ + 35);
      if (opacity > 0.08 && candidateDistance < activeDistance) {
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
    this.startZ = 38;
    this.endZ = -820;
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

    // Suavizado continuo e independiente de los FPS del dispositivo.
    const response = this.reducedMotion ? 9 : 2.05;
    const easing = 1 - Math.exp(-response * delta);
    this.current = lerp(this.current, this.target, easing);

    const p = this.current;
    return {
      progress: p,
      z: lerp(this.startZ, this.endZ, p),
      x: Math.sin(p * Math.PI * 4.2) * 0.34,
      y: Math.cos(p * Math.PI * 3.1) * 0.17
    };
  }
}

class App {
  constructor() {
    this.loader = new Loader();
    this.loader.set(18);
    this.projector = new SceneProjector(scenesConfig);
    this.loader.set(58);
    this.flight = new ScrollFlight();
    this.cue = document.getElementById('scroll-cue');
    this.loader.set(86);

    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
    this.loader.finish();
  }

  tick(time) {
    const camera = this.flight.update(time);
    this.projector.update(camera);
    this.cue.style.opacity = String(clamp(1 - camera.progress * 16, 0, 1));
    requestAnimationFrame(this.tick);
  }
}

const boot = () => {
  try {
    new App();
  } catch (error) {
    console.error('[WEBL] Error de inicio:', error);
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('is-hidden');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
