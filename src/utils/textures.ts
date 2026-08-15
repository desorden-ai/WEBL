import * as THREE from 'three';

export function createMossTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#182b1a';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 50000; i++) {
    const isHighlight = Math.random() > 0.8;
    ctx.fillStyle = isHighlight
      ? `rgba(${20 + Math.random() * 20}, ${60 + Math.random() * 40}, ${20 + Math.random() * 20}, 0.8)`
      : `rgba(${10 + Math.random() * 15}, ${30 + Math.random() * 20}, ${10 + Math.random() * 15}, 0.9)`;
    const size = isHighlight ? 1.5 : 2.5;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createStoneTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#2a2f2d';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 40000; i++) {
    const shade = 20 + Math.random() * 60;
    ctx.fillStyle = `rgba(${shade}, ${shade + 5}, ${shade + 5}, ${0.5 + Math.random() * 0.5})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createBlackWoodTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 512, 512);

  for (let x = 0; x < 512; x += 32) {
    ctx.fillStyle = '#030303';
    ctx.fillRect(x, 0, 4, 512);
    ctx.fillStyle = '#161817';
    ctx.fillRect(x + 4, 0, 28, 512);

    for (let g = 0; g < 100; g++) {
      ctx.fillStyle = `rgba(30, 32, 31, ${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(x + 4 + Math.random() * 28, Math.random() * 512, 1, 10 + Math.random() * 40);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createInteriorWoodTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 512, 512);

  const plankW = 64;
  const plankH = 256;

  for (let x = 0; x < 512; x += plankW) {
    const yOffset = Math.random() * plankH;
    for (let y = -plankH; y < 512; y += plankH) {
      ctx.fillStyle = `rgb(${100 + Math.random() * 30}, ${60 + Math.random() * 20}, ${30 + Math.random() * 15})`;
      ctx.fillRect(x + 2, y + yOffset + 2, plankW - 4, plankH - 4);
      ctx.fillStyle = `rgba(60, 30, 15, 0.15)`;
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(x + 2 + Math.random() * (plankW - 4), y + yOffset + 2, 1.5, plankH - 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createBarkMossTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#1f1611';
  ctx.fillRect(0, 0, 512, 1024);

  for (let x = 0; x < 512; x += 10 + Math.random() * 15) {
    ctx.fillStyle = '#0a0705';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y < 1024; y += 50) {
      ctx.lineTo(x + (Math.random() - 0.5) * 10, y);
    }
    ctx.lineTo(x, 1024);
    ctx.lineWidth = 2 + Math.random() * 4;
    ctx.stroke();
  }

  for (let i = 0; i < 40000; i++) {
    if (Math.random() > 0.4) {
      ctx.fillStyle = `rgba(${15 + Math.random() * 20}, ${45 + Math.random() * 30}, ${20 + Math.random() * 15}, 0.8)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2.5, 2.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createRealisticTreeTexture(maxAnisotropy = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 1024, 2048);
  ctx.fillStyle = '#1c1511';
  ctx.fillRect(496, 80, 32, 1968);
  ctx.fillStyle = '#2b211a';
  ctx.fillRect(512, 80, 12, 1968);

  for (let y = 150; y < 1950; y += 18) {
    const p = (y - 150) / 1800;
    const w = 60 + Math.pow(p, 0.8) * 450 + Math.random() * 40;
    const clusters = 15 + Math.floor(p * 35);

    for (let i = 0; i < clusters; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const cx = 512 + side * (Math.random() * w);
      const drop = Math.pow(Math.abs(cx - 512) / w, 1.8) * (150 + p * 80) + Math.random() * 20;
      const cy = y + drop;

      const distToCenter = Math.abs(cx - 512) / w;
      const darkness = 0.4 + distToCenter * 0.6;

      ctx.fillStyle = `rgba(${10 * darkness}, ${28 * darkness}, ${18 * darkness}, 0.95)`;
      ctx.beginPath();
      ctx.arc(cx, cy, 25 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();

      for (let j = 0; j < 12; j++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (Math.random() - 0.5) * 50, cy + 15 + Math.random() * 60);
        ctx.strokeStyle = `rgba(${18 + Math.random() * 25}, ${40 + Math.random() * 30}, ${25 + Math.random() * 20}, 0.9)`;
        ctx.lineWidth = 2.5 + Math.random() * 2;
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export function createFireTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 256, 512);

  // Radial flame glow
  const grad = ctx.createRadialGradient(128, 400, 20, 128, 300, 220);
  grad.addColorStop(0, 'rgba(255, 255, 240, 1)');
  grad.addColorStop(0.15, 'rgba(255, 210, 60, 0.95)');
  grad.addColorStop(0.4, 'rgba(255, 120, 20, 0.85)');
  grad.addColorStop(0.7, 'rgba(230, 45, 10, 0.6)');
  grad.addColorStop(0.9, 'rgba(120, 15, 5, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(128, 60);
  ctx.bezierCurveTo(70, 180, 40, 320, 60, 440);
  ctx.bezierCurveTo(70, 490, 186, 490, 196, 440);
  ctx.bezierCurveTo(216, 320, 186, 180, 128, 60);
  ctx.fill();

  // Inner bright tongues of fire
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 245, 180, 0.8)' : 'rgba(255, 180, 40, 0.7)';
    ctx.beginPath();
    const bx = 90 + Math.random() * 76;
    const by = 200 + Math.random() * 180;
    ctx.arc(bx, by, 25 + Math.random() * 20, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createEmberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#100806';
  ctx.fillRect(0, 0, 256, 256);

  // Glowing hot cracks and embers
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const rad = 2 + Math.random() * 8;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(255, 200, 100, 0.9)');
    grad.addColorStop(0.4, 'rgba(255, 80, 10, 0.7)');
    grad.addColorStop(1, 'rgba(30, 10, 5, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createAcousticWoodTexture(maxAnisotropy: number = 1): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f0f10';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical wood slats
  const slatWidth = 12;
  const gap = 6;
  for (let x = 0; x < 512; x += slatWidth + gap) {
    // Slat base oak tone
    ctx.fillStyle = '#3a271c';
    ctx.fillRect(x, 0, slatWidth, 512);

    // Slat highlight
    ctx.fillStyle = '#4d3628';
    ctx.fillRect(x + 1, 0, 3, 512);

    // Slat shadow
    ctx.fillStyle = '#22150e';
    ctx.fillRect(x + slatWidth - 2, 0, 2, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

