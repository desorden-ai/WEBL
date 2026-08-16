import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AtmosphericLayers } from './components/AtmosphericLayers';
import { EnvironmentCanvas3D } from './components/EnvironmentCanvas3D';
import { GesturePrompt } from './components/GesturePrompt';
import { RightSidebarHUD } from './components/RightSidebarHUD';
import { UnlockModal } from './components/UnlockModal';
import { AtmosphereConfig } from './types';

const CONFIG = {
  fps: 24,
  totalFrames: 240,
  startFrame: 20,
  endFrame: 196,
  videoStartTime: 19 / 24,
  videoEndTime: 195 / 24,
  scrubTravelScreens: 1.85,
  scrubDampingMs: 115,
  seekIntervalMs: 25,
  wheelGain: 1.05,
  autoplaySpeed: 0.075,
} as const;

const DEFAULT_ATMOSPHERE: AtmosphereConfig = {
  fogDensity: 0.85,
  lightIntensity: 1.05,
  particleDensity: 1,
  sunGlow: 1,
  lightingMode: 'cinematic',
  timeOfDayEnabled: false,
  timeOfDayProgress: 0.35,
  timeOfDaySpeed: 1,
  tvStaticEnabled: false,
  tvStaticIntensity: 0.16,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (a: number, b: number, value: number) => {
  if (a === b) return value < a ? 0 : 1;
  const t = clamp01((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

interface VisualAtmosphere {
  videoFilter: string;
  videoTransform: string;
  fogOpacity: number;
  farFogTransform: string;
  nearFogOpacity: number;
  nearFogTransform: string;
  colorLightOpacity: number;
  colorLightBackground: string;
}

function getVisualAtmosphere(
  progress: number,
  velocity: number,
  config: AtmosphereConfig
): VisualAtmosphere {
  const tod = config.timeOfDayProgress || 0.35;
  const lightProgress = smoothstep(0.56, 0.96, progress);
  const atmosphericProgress = smoothstep(0.08, 0.82, progress);
  const fogPeak = 1 - Math.abs(progress * 2 - 1);

  let brightness = 1 + lightProgress * 0.06;
  let contrast = 1.04 + progress * 0.02;
  let saturation = 0.98 + lightProgress * 0.06;
  let warmth = lightProgress * 0.02;

  if (tod < 0.2) {
    const t = tod / 0.2;
    brightness *= 0.94 + t * 0.12;
    saturation *= 0.96 + t * 0.08;
    warmth += 0.06 - t * 0.03;
    contrast *= 0.98 + t * 0.04;
  } else if (tod < 0.45) {
    brightness *= 1.1;
    saturation *= 1.04;
    contrast *= 1.06;
    warmth += 0.005;
  } else if (tod < 0.68) {
    const t = (tod - 0.45) / 0.23;
    brightness *= 1.06 - t * 0.06;
    saturation *= 1.14;
    warmth += 0.05 + t * 0.07;
    contrast *= 1.04;
  } else if (tod < 0.84) {
    const t = (tod - 0.68) / 0.16;
    brightness *= 0.9 - t * 0.08;
    saturation *= 0.9 - t * 0.1;
    contrast *= 1.04;
    warmth += 0.01;
  } else {
    brightness *= 0.78;
    saturation *= 0.75;
    contrast *= 1.02;
    warmth = 0;
  }

  brightness *= config.lightIntensity;
  const isNightVision = config.lightingMode === 'night_vision';
  if (isNightVision) {
    brightness *= 0.58;
    contrast *= 1.34;
    saturation *= 0.18;
    warmth = 0;
  }

  const absVelocity = Math.abs(velocity);
  const depthArc = Math.sin(progress * Math.PI);
  const cameraDriftX = Math.sin(progress * Math.PI * 2) * 1.6 + velocity * 1.2;
  const cameraDriftY = (0.5 - progress) * 1.4 - absVelocity * 0.8;
  const cameraYaw = Math.sin(progress * Math.PI * 2) * 0.16 + velocity * 0.18;
  const cameraPitch = (0.5 - progress) * 0.14 - velocity * 0.16;
  const cameraRoll = velocity * 0.06;
  const barrelScale = 1.022 + depthArc * 0.005 + Math.min(0.02, absVelocity * 0.012);
  const barrelCurvatureZ = -Math.min(14, absVelocity * 12);
  const lensAspectStretchX = 1 + Math.min(0.016, absVelocity * 0.012);
  const lensAspectStretchY = 1 + Math.min(0.01, absVelocity * 0.008);

  return {
    videoFilter: isNightVision
      ? `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturation.toFixed(3)}) hue-rotate(185deg) sepia(0.24)`
      : `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturation.toFixed(3)}) sepia(${warmth.toFixed(3)})`,
    videoTransform: `translate3d(${cameraDriftX.toFixed(2)}px, ${cameraDriftY.toFixed(2)}px, ${barrelCurvatureZ.toFixed(2)}px) rotateX(${cameraPitch.toFixed(2)}deg) rotateY(${cameraYaw.toFixed(2)}deg) rotateZ(${cameraRoll.toFixed(2)}deg) scale3d(${(barrelScale * lensAspectStretchX).toFixed(4)}, ${(barrelScale * lensAspectStretchY).toFixed(4)}, 1.02)`,
    fogOpacity: 0.06 + atmosphericProgress * 0.05 + fogPeak * 0.05,
    farFogTransform: `translate3d(${((progress - 0.5) * 8).toFixed(2)}px, ${(6 - progress * 12).toFixed(2)}px, 0) scale(1.02)`,
    nearFogOpacity: 0.035 + fogPeak * 0.05,
    nearFogTransform: `translate3d(${((0.5 - progress) * 18).toFixed(2)}px, ${(10 - progress * 20).toFixed(2)}px, 0) scale(${(1.055 + depthArc * 0.018).toFixed(4)})`,
    colorLightOpacity: 0.06 + lightProgress * 0.05,
    colorLightBackground: `linear-gradient(135deg, rgba(22,55,52,${0.12 - lightProgress * 0.06}) 0%, transparent 48%, rgba(204,139,76,${0.02 + lightProgress * 0.08}) 100%)`,
  };
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);
  const momentumRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastSeekAtRef = useRef(0);
  const lastInputAtRef = useRef(0);
  const lastRenderedProgressRef = useRef(0);
  const currentVelocityRef = useRef(0);
  const lastFrameRef = useRef(CONFIG.startFrame);
  const lastHudSyncRef = useRef(0);
  const touchYRef = useRef<number | null>(null);
  const touchHistoryRef = useRef<Array<{ y: number; time: number }>>([]);
  const isUnlockedRef = useRef(false);
  const isAutoplayRef = useRef(false);
  const atmosphereRef = useRef<AtmosphereConfig>(DEFAULT_ATMOSPHERE);
  const interactionTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [showGesturePrompt, setShowGesturePrompt] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [atmosphereConfig, setAtmosphereConfig] = useState<AtmosphereConfig>(DEFAULT_ATMOSPHERE);
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(CONFIG.startFrame);
  const [currentTime, setCurrentTime] = useState(CONFIG.videoStartTime);

  const visual = useMemo(
    () => getVisualAtmosphere(progress, velocity, atmosphereConfig),
    [progress, velocity, atmosphereConfig]
  );

  useEffect(() => {
    isAutoplayRef.current = isAutoplay;
  }, [isAutoplay]);

  useEffect(() => {
    atmosphereRef.current = atmosphereConfig;
  }, [atmosphereConfig]);

  useEffect(() => () => {
    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current);
    const context = audioContextRef.current;
    if (context && context.state !== 'closed') void context.close();
  }, []);

  const notifyInteraction = useCallback(() => {
    setIsInteracting(true);
    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = window.setTimeout(() => setIsInteracting(false), 1500);
  }, []);

  const handleUnlock = useCallback(async () => {
    if (isUnlockedRef.current) return;
    const video = videoRef.current;
    if (video) {
      try {
        await video.play();
        video.pause();
      } catch {
        // A metadata seek is still enough for browsers that block play().
      }
      video.currentTime = CONFIG.videoStartTime;
    }
    isUnlockedRef.current = true;
    setIsUnlocked(true);
  }, []);

  const toggleAudio = useCallback(() => {
    const existing = audioContextRef.current;
    if (!existing) {
      try {
        const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const context = new AudioCtor();
        const oscillator = context.createOscillator();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 55;
        filter.type = 'lowpass';
        filter.frequency.value = 180;
        gain.gain.value = 0.08;
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        audioContextRef.current = context;
        audioGainRef.current = gain;
        setIsAudioPlaying(true);
      } catch (error) {
        console.warn('AudioContext unavailable:', error);
      }
      return;
    }

    const gain = audioGainRef.current;
    if (!gain) return;
    if (existing.state === 'suspended') void existing.resume();
    const nextPlaying = !isAudioPlaying;
    gain.gain.setTargetAtTime(nextPlaying ? 0.08 : 0, existing.currentTime, 0.1);
    setIsAudioPlaying(nextPlaying);
  }, [isAudioPlaying]);

  const applyDelta = useCallback((deltaY: number, fling = false) => {
    if (!isUnlockedRef.current) void handleUnlock();
    if (isAutoplayRef.current) setIsAutoplay(false);
    setShowGesturePrompt(false);
    notifyInteraction();

    const travel = Math.max(1, window.innerHeight * CONFIG.scrubTravelScreens);
    const maxDelta = Math.max(100, window.innerHeight * 0.5);
    const bounded = Math.max(-maxDelta, Math.min(maxDelta, deltaY));
    const deltaProgress = bounded / travel;
    const next = clamp01(targetProgressRef.current + deltaProgress);
    const now = performance.now();
    const dt = lastInputAtRef.current ? Math.max(8, now - lastInputAtRef.current) : 16;
    lastInputAtRef.current = now;

    const rate = deltaProgress / (dt / 1000);
    momentumRef.current = fling
      ? rate * 0.45
      : momentumRef.current * 0.65 + rate * 0.35;
    momentumRef.current = Math.max(-1.8, Math.min(1.8, momentumRef.current));
    targetProgressRef.current = next;
  }, [handleUnlock, notifyInteraction]);

  const handleSeek = useCallback((target: number) => {
    if (!isUnlockedRef.current) void handleUnlock();
    setIsAutoplay(false);
    momentumRef.current = 0;
    targetProgressRef.current = clamp01(target);
    lastInputAtRef.current = performance.now();
    setShowGesturePrompt(false);
    notifyInteraction();
  }, [handleUnlock, notifyInteraction]);

  const toggleAutoplay = useCallback(() => {
    if (!isUnlockedRef.current) void handleUnlock();
    momentumRef.current = 0;
    setShowGesturePrompt(false);
    notifyInteraction();
    setIsAutoplay((value) => !value);
  }, [handleUnlock, notifyInteraction]);

  const updateAtmosphere = useCallback((next: AtmosphereConfig) => {
    atmosphereRef.current = next;
    setAtmosphereConfig(next);
    notifyInteraction();
  }, [notifyInteraction]);

  const resetAtmosphere = useCallback(() => {
    atmosphereRef.current = DEFAULT_ATMOSPHERE;
    setAtmosphereConfig(DEFAULT_ATMOSPHERE);
  }, []);

  useEffect(() => {
    let animationId = 0;
    let lastTodSync = 0;

    const tick = (now: number) => {
      const previous = lastTickRef.current || now;
      const dt = Math.min(50, Math.max(0, now - previous));
      lastTickRef.current = now;

      const atmosphere = atmosphereRef.current;
      if (atmosphere.timeOfDayEnabled) {
        const nextTod = (atmosphere.timeOfDayProgress + (dt / 90000) * (atmosphere.timeOfDaySpeed || 1)) % 1;
        const nextConfig = { ...atmosphere, timeOfDayProgress: nextTod };
        atmosphereRef.current = nextConfig;
        if (now - lastTodSync > 200) {
          lastTodSync = now;
          setAtmosphereConfig(nextConfig);
        }
      }

      if (isAutoplayRef.current) {
        targetProgressRef.current += (dt / 1000) * CONFIG.autoplaySpeed;
        if (targetProgressRef.current >= 1) targetProgressRef.current = 0;
      } else if (now - lastInputAtRef.current > 20 && Math.abs(momentumRef.current) > 0.00008) {
        const next = clamp01(targetProgressRef.current + momentumRef.current * (dt / 1000));
        targetProgressRef.current = next;
        momentumRef.current *= Math.pow(0.89, dt / 16.6);
        if (Math.abs(momentumRef.current) < 0.00008 || next === 0 || next === 1) momentumRef.current = 0;
      }

      const difference = targetProgressRef.current - smoothedProgressRef.current;
      const dynamicDamping = CONFIG.scrubDampingMs * Math.min(2.8, 1 + Math.abs(currentVelocityRef.current) * 0.85 + (Math.abs(momentumRef.current) > 0.0001 ? 0.6 : 0));
      const alpha = 1 - Math.exp(-dt / dynamicDamping);
      const settled = Math.abs(difference) < 0.00025 && Math.abs(momentumRef.current) < 0.0001;
      const nextProgress = settled
        ? targetProgressRef.current
        : smoothedProgressRef.current + difference * alpha;
      smoothedProgressRef.current = nextProgress;

      const progressChanged = Math.abs(nextProgress - lastRenderedProgressRef.current) > 0.0008;
      const needsVelocityReset = settled && Math.abs(currentVelocityRef.current) > 0.0001;
      if (progressChanged || needsVelocityReset) {
        const nextVelocity = progressChanged
          ? (nextProgress - lastRenderedProgressRef.current) / Math.max(0.016, dt / 1000)
          : 0;
        lastRenderedProgressRef.current = nextProgress;
        currentVelocityRef.current = nextVelocity;
        setProgress(nextProgress);
        setVelocity(nextVelocity);
      }

      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        if (!video.paused) video.pause();
        const desiredTime = CONFIG.videoStartTime + nextProgress * (CONFIG.videoEndTime - CONFIG.videoStartTime);
        const canSeek = !video.seeking && now - lastSeekAtRef.current >= CONFIG.seekIntervalMs;
        if (canSeek && Math.abs(desiredTime - video.currentTime) > (settled ? 0.004 : 0.018)) {
          video.currentTime = desiredTime;
          lastSeekAtRef.current = now;
        }

        const validTime = Math.min(CONFIG.videoEndTime, Math.max(CONFIG.videoStartTime, video.currentTime || CONFIG.videoStartTime));
        const frame = Math.min(CONFIG.endFrame, Math.max(CONFIG.startFrame, Math.floor(validTime * CONFIG.fps) + 1));
        const frameChanged = frame !== lastFrameRef.current;
        if (frameChanged) {
          lastFrameRef.current = frame;
          setCurrentFrame(frame);
        }
        if (frameChanged || now - lastHudSyncRef.current > 80) {
          lastHudSyncRef.current = now;
          setCurrentTime(validTime);
        }
      }

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 24;
      else if (event.deltaMode === 2) delta *= window.innerHeight * 0.5;
      const maxImpulse = Math.max(120, window.innerHeight * 0.35);
      applyDelta(Math.max(-maxImpulse, Math.min(maxImpulse, delta)) * CONFIG.wheelGain);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const y = event.touches[0].clientY;
      touchYRef.current = y;
      touchHistoryRef.current = [{ y, time: performance.now() }];
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || touchYRef.current === null) return;
      event.preventDefault();
      const now = performance.now();
      const y = event.touches[0].clientY;
      applyDelta(touchYRef.current - y);
      touchYRef.current = y;
      touchHistoryRef.current.push({ y, time: now });
      if (touchHistoryRef.current.length > 5) touchHistoryRef.current.shift();
    };

    const onTouchEnd = () => {
      const history = touchHistoryRef.current;
      if (history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = Math.max(10, last.time - first.time);
        const velocityPxMs = (first.y - last.y) / dt;
        if (Math.abs(velocityPxMs) > 0.35 && dt < 200) applyDelta(velocityPxMs * 140, true);
      }
      touchYRef.current = null;
      touchHistoryRef.current = [];
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        toggleAutoplay();
      } else if (event.code === 'ArrowDown' || event.code === 'ArrowRight') applyDelta(80);
      else if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') applyDelta(-80);
      else if (event.code === 'KeyM') toggleAudio();
      else if (event.code === 'KeyH') setIsHudVisible((value) => !value);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [applyDelta, toggleAudio, toggleAutoplay]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = CONFIG.videoStartTime;
    targetProgressRef.current = 0;
    smoothedProgressRef.current = 0;
    momentumRef.current = 0;
    lastRenderedProgressRef.current = 0;
    currentVelocityRef.current = 0;
    lastFrameRef.current = CONFIG.startFrame;
    setProgress(0);
    setVelocity(0);
    setCurrentFrame(CONFIG.startFrame);
    setCurrentTime(CONFIG.videoStartTime);
  };

  return (
    <main
      id="experience"
      aria-label="Recorrido cinematográfico de Mansión Refugio"
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#030706] select-none touch-none"
      style={{ perspective: '1050px', perspectiveOrigin: '50% 48%' }}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          ref={videoRef}
          src={`${import.meta.env.BASE_URL}cinematic/intro/intro-scroll-720.mp4`}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={() => setVideoReady(true)}
          onCanPlay={() => setVideoReady(true)}
          className="w-full h-full object-cover object-center"
          style={{
            opacity: videoReady ? 1 : 0,
            filter: visual.videoFilter,
            transform: visual.videoTransform,
            transformOrigin: '50% 48%',
            backfaceVisibility: 'hidden',
            willChange: 'filter, transform, opacity',
          }}
        />
      </div>

      <AtmosphericLayers
        effectsEnabled
        videoReady={videoReady}
        progress={progress}
        velocity={velocity}
        fogOpacity={visual.fogOpacity}
        farFogTransform={visual.farFogTransform}
        nearFogOpacity={visual.nearFogOpacity}
        nearFogTransform={visual.nearFogTransform}
        colorLightOpacity={visual.colorLightOpacity}
        colorLightBackground={visual.colorLightBackground}
        config={atmosphereConfig}
      />

      <EnvironmentCanvas3D
        effectsEnabled
        videoReady={videoReady}
        progress={progress}
        velocity={velocity}
        config={atmosphereConfig}
      />

      <div className={`fixed top-4 left-4 sm:left-6 z-20 pointer-events-none transition-opacity duration-500 ${isHudVisible && !isInteracting ? 'opacity-90' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white drop-shadow-md">
          <span className="font-semibold">Mansión Refugio</span>
          <span className="text-white/40">/</span>
          <span className="font-mono">{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <UnlockModal isUnlocked={isUnlocked} onUnlock={handleUnlock} />
      <div className={`transition-opacity duration-300 ${isInteracting ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
        <RightSidebarHUD
          isVisible={isHudVisible}
          progress={progress}
          currentFrame={currentFrame}
          totalFrames={CONFIG.totalFrames}
          currentTime={currentTime}
          isAudioPlaying={isAudioPlaying}
          isAutoplay={isAutoplay}
          atmosphereConfig={atmosphereConfig}
          onToggleAutoplay={toggleAutoplay}
          onToggleAudio={toggleAudio}
          onToggleVisibility={() => setIsHudVisible((value) => !value)}
          onUpdateAtmosphere={updateAtmosphere}
          onResetAtmosphere={resetAtmosphere}
          onSeek={handleSeek}
        />
      </div>
      <GesturePrompt show={showGesturePrompt && isUnlocked} />
    </main>
  );
}
