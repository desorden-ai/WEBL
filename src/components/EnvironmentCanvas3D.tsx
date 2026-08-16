import React, { useEffect, useRef } from 'react';
import { AtmosphereConfig } from '../types';

interface EnvironmentCanvas3DProps {
  effectsEnabled: boolean;
  videoReady: boolean;
  progress: number;
  velocity: number;
  config: AtmosphereConfig;
}

interface DustMote3D {
  x: number;
  y: number;
  z: number;
  baseSize: number;
  baseAlpha: number;
  phase: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftSpeedZ: number;
  wobbleSpeed: number;
  colorType: 'warm' | 'cool' | 'neutral';
}

interface FogPuff3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  speedX: number;
  speedY: number;
  phase: number;
}

export const EnvironmentCanvas3D: React.FC<EnvironmentCanvas3DProps> = ({
  effectsEnabled,
  videoReady,
  progress,
  velocity,
  config,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const progressRef = useRef(progress);
  const velocityRef = useRef(velocity);
  const smoothedVelocityRef = useRef(0);
  const effectsRef = useRef(effectsEnabled);
  const videoReadyRef = useRef(videoReady);
  const configRef = useRef(config);

  progressRef.current = progress;
  velocityRef.current = velocity;
  effectsRef.current = effectsEnabled;
  videoReadyRef.current = videoReady;
  configRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width;
      mouseRef.current.targetY = e.clientY / height;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX / width;
        mouseRef.current.targetY = e.touches[0].clientY / height;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const isMobileLike = window.matchMedia('(pointer: coarse)').matches || width < 768;
    const DUST_MOTE_COUNT = isMobileLike ? 72 : 110;
    const dustMotes: DustMote3D[] = [];
    for (let i = 0; i < DUST_MOTE_COUNT; i++) {
      const colorRand = Math.random();
      dustMotes.push({
        x: (Math.random() - 0.5) * 1800,
        y: (Math.random() - 0.5) * 1400,
        z: Math.random() * 1000 + 30,
        baseSize: Math.random() * 2.2 + 0.8,
        baseAlpha: Math.random() * 0.38 + 0.12,
        phase: Math.random() * Math.PI * 2,
        driftSpeedX: (Math.random() - 0.5) * 0.18,
        driftSpeedY: (Math.random() - 0.5) * 0.14 - 0.04,
        driftSpeedZ: (Math.random() - 0.5) * 0.22,
        wobbleSpeed: Math.random() * 0.0015 + 0.0008,
        colorType: colorRand > 0.6 ? 'warm' : colorRand > 0.25 ? 'neutral' : 'cool',
      });
    }

    const FOG_PUFF_COUNT = isMobileLike ? 10 : 14;
    const fogPuffs: FogPuff3D[] = [];
    for (let i = 0; i < FOG_PUFF_COUNT; i++) {
      fogPuffs.push({
        x: (Math.random() - 0.5) * 1500,
        y: Math.random() * 450 + 100,
        z: Math.random() * 750 + 60,
        radius: Math.random() * 260 + 150,
        baseAlpha: Math.random() * 0.035 + 0.012,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const fov = 500;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(60, Math.max(1, now - lastTime));
      const dtScale = Math.min(2.5, Math.max(0.25, dt / (1000 / 60)));
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const p = progressRef.current;
      const targetVel = velocityRef.current;
      smoothedVelocityRef.current += (targetVel - smoothedVelocityRef.current) * 0.12;
      const vel = smoothedVelocityRef.current;

      const cfg = configRef.current;
      const ready = videoReadyRef.current;
      const enabled = effectsRef.current;

      if (enabled && ready) {
        const centerX = width * 0.5;
        const centerY = height * 0.48;
        const parallaxX = (mouseRef.current.x - 0.5) * 42;
        const parallaxY = (mouseRef.current.y - 0.5) * 32;

        const tod = cfg.timeOfDayProgress || 0.25;
        let ambientColor = '255, 220, 175';
        let warmColor = '255, 205, 140';
        let coolColor = '210, 240, 255';

        if (cfg.lightingMode === 'night_vision') {
          ambientColor = '40, 145, 225';
          warmColor = '25, 115, 190';
          coolColor = '75, 190, 255';
        } else if (tod < 0.2) {
          ambientColor = '255, 195, 145';
          warmColor = '255, 180, 120';
          coolColor = '230, 210, 255';
        } else if (tod < 0.45) {
          ambientColor = '255, 255, 240';
          warmColor = '255, 245, 210';
          coolColor = '220, 245, 255';
        } else if (tod < 0.68) {
          ambientColor = '255, 185, 95';
          warmColor = '255, 160, 65';
          coolColor = '255, 215, 165';
        } else if (tod < 0.84) {
          ambientColor = '215, 165, 240';
          warmColor = '240, 180, 205';
          coolColor = '180, 195, 255';
        } else {
          ambientColor = '175, 205, 250';
          warmColor = '200, 220, 255';
          coolColor = '160, 190, 245';
        }

        if (cfg.fogDensity > 0.05) {
          fogPuffs.forEach((puff) => {
            puff.x += (puff.speedX + vel * 0.03) * dtScale;
            puff.y += puff.speedY * dtScale;

            if (puff.x > 850) puff.x = -850;
            if (puff.x < -850) puff.x = 850;
            if (puff.y > 600) puff.y = 80;
            if (puff.y < 80) puff.y = 600;

            const puffZ = puff.z - p * 280;
            const effectiveZ = ((puffZ % 800) + 800) % 800 + 40;
            const scale = fov / (fov + effectiveZ);

            const screenX = centerX + (puff.x + parallaxX * (effectiveZ / 300)) * scale;
            const screenY = centerY + (puff.y + parallaxY * (effectiveZ / 300)) * scale;
            const screenRadius = puff.radius * scale;

            const pulse = Math.sin(now * 0.0008 + puff.phase) * 0.15;
            const currentAlpha = (puff.baseAlpha + pulse * 0.01) * cfg.fogDensity;

            if (
              screenX + screenRadius > 0 &&
              screenX - screenRadius < width &&
              screenY + screenRadius > 0 &&
              screenY - screenRadius < height
            ) {
              const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, screenRadius);
              grad.addColorStop(0, `rgba(${ambientColor}, ${currentAlpha * 0.75})`);
              grad.addColorStop(0.55, `rgba(${ambientColor}, ${currentAlpha * 0.28})`);
              grad.addColorStop(1, `rgba(${ambientColor}, 0)`);

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        if (cfg.particleDensity > 0.05) {
          const velFactor = vel * 4.5;
          const velDragY = vel * -1.8;
          const absVel = Math.abs(vel);

          dustMotes.forEach((mote) => {
            const wobbleX = Math.sin(now * mote.wobbleSpeed + mote.phase) * 0.35;
            const wobbleY = Math.cos(now * mote.wobbleSpeed * 0.8 + mote.phase) * 0.25;

            mote.x += (mote.driftSpeedX + wobbleX + (mouseRef.current.x - 0.5) * 0.4) * dtScale;
            mote.y += (mote.driftSpeedY + wobbleY + velDragY) * dtScale;
            mote.z -= (mote.driftSpeedZ + velFactor) * dtScale;

            if (mote.z < 20) mote.z = 1000;
            if (mote.z > 1000) mote.z = 20;
            if (mote.x > 900) mote.x = -900;
            if (mote.x < -900) mote.x = 900;
            if (mote.y > 700) mote.y = -700;
            if (mote.y < -700) mote.y = 700;

            const scale = fov / (fov + mote.z);
            const screenX = centerX + (mote.x + parallaxX * (mote.z / 220)) * scale;
            const screenY = centerY + (mote.y + parallaxY * (mote.z / 220)) * scale;
            const screenSize = Math.max(0.5, mote.baseSize * scale);

            const dynamicAlpha = Math.min(
              0.55,
              mote.baseAlpha * scale * cfg.particleDensity * (1 + Math.min(0.5, absVel * 0.2))
            );

            if (screenX >= -10 && screenX <= width + 10 && screenY >= -10 && screenY <= height + 10) {
              const particleColor =
                mote.colorType === 'warm'
                  ? warmColor
                  : mote.colorType === 'cool'
                  ? coolColor
                  : ambientColor;

              if (absVel > 0.25) {
                const streakLength = Math.min(18, absVel * 3.8 * scale);
                ctx.strokeStyle = `rgba(${particleColor}, ${dynamicAlpha * 0.85})`;
                ctx.lineWidth = screenSize;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(screenX, screenY - streakLength * Math.sign(vel));
                ctx.lineTo(screenX, screenY + streakLength * Math.sign(vel));
                ctx.stroke();
              } else {
                ctx.fillStyle = `rgba(${particleColor}, ${dynamicAlpha})`;
                ctx.beginPath();
                ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="environmentCanvas3D"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
