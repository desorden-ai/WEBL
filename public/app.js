const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

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

class WebGLSpace {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });

    if (!this.gl) throw new Error('WebGL no disponible');

    this.pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
    this.count = window.innerWidth < 768 ? 1500 : 3200;
    this.program = this.createProgram();
    this.locations = this.getLocations();
    this.buffer = this.createStarBuffer();
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  compile(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader: ${message}`);
    }
    return shader;
  }

  createProgram() {
    const vertex = this.compile(this.gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec3 aPosition;
      attribute float aSize;
      attribute float aAlpha;
      uniform float uCameraZ;
      uniform vec2 uCameraXY;
      uniform float uAspect;
      uniform float uPixelRatio;
      varying float vAlpha;

      void main() {
        float depth = uCameraZ - aPosition.z;
        float visible = step(0.6, depth) * step(depth, 190.0);
        vec2 projected = (aPosition.xy - uCameraXY) / max(depth, 0.6);
        projected.x /= uAspect;
        vec2 ndc = projected * 2.65;
        if (visible < 0.5) ndc = vec2(3.0);
        gl_Position = vec4(ndc, 0.0, 1.0);
        gl_PointSize = aSize * uPixelRatio * clamp(42.0 / max(depth, 1.0), 0.42, 4.5);
        float farFade = 1.0 - smoothstep(135.0, 190.0, depth);
        float nearFade = smoothstep(0.6, 8.0, depth);
        vAlpha = aAlpha * visible * farFade * nearFade;
      }
    `);

    const fragment = this.compile(this.gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.94), vAlpha * glow);
      }
    `);

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertex);
    this.gl.attachShader(program, fragment);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(`Programa WebGL: ${this.gl.getProgramInfoLog(program)}`);
    }
    return program;
  }

  getLocations() {
    return {
      position: this.gl.getAttribLocation(this.program, 'aPosition'),
      size: this.gl.getAttribLocation(this.program, 'aSize'),
      alpha: this.gl.getAttribLocation(this.program, 'aAlpha'),
      cameraZ: this.gl.getUniformLocation(this.program, 'uCameraZ'),
      cameraXY: this.gl.getUniformLocation(this.program, 'uCameraXY'),
      aspect: this.gl.getUniformLocation(this.program, 'uAspect'),
      pixelRatio: this.gl.getUniformLocation(this.program, 'uPixelRatio')
    };
  }

  createStarBuffer() {
    const stride = 5;
    const data = new Float32Array(this.count * stride);
    for (let i = 0; i < this.count; i += 1) {
      const p = i * stride;
      const radius = 6 + Math.pow(Math.random(), 0.55) * 28;
      const angle = Math.random() * Math.PI * 2;
      data[p] = Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
      data[p + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 3;
      data[p + 2] = 8 - Math.random() * 420;
      data[p + 3] = 1.3 + Math.random() * 3.2;
      data[p + 4] = 0.18 + Math.random() * 0.72;
    }
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const renderWidth = Math.max(1, Math.floor(this.width * this.pixelRatio));
    const renderHeight = Math.max(1, Math.floor(this.height * this.pixelRatio));
    if (this.canvas.width !== renderWidth || this.canvas.height !== renderHeight) {
      this.canvas.width = renderWidth;
      this.canvas.height = renderHeight;
      this.gl.viewport(0, 0, renderWidth, renderHeight);
    }
    this.aspect = this.width / this.height;
  }

  render(camera) {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const stride = 5 * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(this.locations.position);
    gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(this.locations.size);
    gl.vertexAttribPointer(this.locations.size, 1, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(this.locations.alpha);
    gl.vertexAttribPointer(this.locations.alpha, 1, gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);

    gl.uniform1f(this.locations.cameraZ, camera.z);
    gl.uniform2f(this.locations.cameraXY, camera.x, camera.y);
    gl.uniform1f(this.locations.aspect, this.aspect);
    gl.uniform1f(this.locations.pixelRatio, this.pixelRatio);
    gl.drawArrays(gl.POINTS, 0, this.count);
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
    this.focal = Math.min(this.width, this.height) * 1.22;
  }

  update(camera) {
    let active = this.items[0];
    let activeDistance = Infinity;

    for (const item of this.items) {
      const depth = camera.z - item.z;
      const visible = depth > 5 && depth < 135;
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
      const scale = clamp(31 / depth, 0.23, 2.1);
      const farFade = 1 - clamp((depth - 88) / 38, 0, 1);
      const nearFade = clamp((depth - 5) / 8, 0, 1);
      const opacity = farFade * nearFade;

      item.element.style.visibility = 'visible';
      item.element.style.opacity = opacity.toFixed(3);
      item.element.style.transform = `translate3d(${screenX}px, ${screenY}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
      item.element.classList.toggle('is-interactive', opacity > 0.72);

      const candidateDistance = Math.abs(depth - 24);
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
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateTarget();
    window.addEventListener('scroll', () => this.updateTarget(), { passive: true });
    window.addEventListener('resize', () => this.updateTarget(), { passive: true });
  }

  updateTarget() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.target = clamp(window.scrollY / maxScroll, 0, 1);
  }

  update() {
    const easing = this.reducedMotion ? 0.22 : 0.075;
    this.current = lerp(this.current, this.target, easing);
    const p = this.current;
    return {
      progress: p,
      z: p * this.maxDepth,
      x: Math.sin(p * Math.PI * 4.2) * 0.72,
      y: Math.cos(p * Math.PI * 2.8) * 0.34
    };
  }
}

class App {
  constructor() {
    this.loader = new Loader();
    this.loader.set(14);
    this.flight = new ScrollFlight();
    this.projector = new SceneProjector();
    this.cue = document.getElementById('scroll-cue');
    this.loader.set(48);

    try {
      this.space = new WebGLSpace(document.getElementById('world'));
      this.loader.set(82);
    } catch (error) {
      console.warn('[DESORDEN] Fallback visual activado:', error);
      document.documentElement.classList.add('no-webgl');
      this.space = null;
      this.loader.set(82);
    }

    this.tick = this.tick.bind(this);
    requestAnimationFrame(this.tick);
    this.loader.finish();
  }

  tick() {
    const camera = this.flight.update();
    this.projector.update(camera);
    if (this.space) this.space.render(camera);
    this.cue.style.opacity = String(clamp(1 - camera.progress * 18, 0, 1));
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
