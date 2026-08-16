import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DepthTransition } from './DepthTransition';
import {
  CINEMATIC_INTRO,
  cinematicAsset,
  clamp01,
  smoothstep,
} from '../data/cinematicIntro';
import { useScrollVideo } from '../hooks/useScrollVideo';

interface CinematicScrollProps {
  threeLayer: ReactNode;
  controlsLayer: ReactNode;
  onWarm3D?: () => void;
}

export function CinematicScroll({
  threeLayer,
  controlsLayer,
  onWarm3D,
}: CinematicScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const warmed3DRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      setProgress(1);
      return;
    }

    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const scrolled = -rect.top;
    const next = clamp01(scrolled / travel);
    setProgress((prev) => (Math.abs(prev - next) > 0.0005 ? next : prev));
  }, [reducedMotion]);

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateProgress]);

  useEffect(() => {
    if (
      !warmed3DRef.current &&
      (reducedMotion || progress >= CINEMATIC_INTRO.prefetch3DProgress)
    ) {
      warmed3DRef.current = true;
      onWarm3D?.();
    }
  }, [onWarm3D, progress, reducedMotion]);

  useScrollVideo({
    videoRef,
    progress: reducedMotion ? CINEMATIC_INTRO.videoEndProgress : progress,
    enabled: !reducedMotion,
  });

  const videoOpacity = reducedMotion
    ? 0
    : 1 - smoothstep(
        CINEMATIC_INTRO.depthStartProgress,
        CINEMATIC_INTRO.videoEndProgress + 0.018,
        progress
      );

  const posterOpacity = videoReady || reducedMotion ? 0 : 1;
  const threeOpacity = reducedMotion
    ? 1
    : smoothstep(CINEMATIC_INTRO.threeStartProgress, 0.985, progress);
  const controlsOpacity = reducedMotion
    ? 1
    : smoothstep(CINEMATIC_INTRO.controlsStartProgress, 0.995, progress);
  const threeInteractive =
    reducedMotion || progress >= CINEMATIC_INTRO.threeInteractiveProgress;
  const shouldMount3D = reducedMotion || progress >= CINEMATIC_INTRO.mount3DProgress;

  const sectionHeight = useMemo(
    () => (reducedMotion ? '100dvh' : `${CINEMATIC_INTRO.scrollHeightVh}vh`),
    [reducedMotion]
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Introducción cinematográfica de Mansión Refugio 3D"
      style={{
        position: 'relative',
        width: '100%',
        height: sectionHeight,
        background: '#030706',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
          background: '#030706',
          touchAction: threeInteractive ? 'none' : 'pan-y',
        }}
      >
        <img
          src={cinematicAsset(CINEMATIC_INTRO.assets.posterStart)}
          alt="Mansión refugio entre coníferas y niebla"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: posterOpacity,
            transition: 'opacity 180ms linear',
            pointerEvents: 'none',
          }}
        />

        {!reducedMotion && (
          <video
            ref={videoRef}
            src={cinematicAsset(CINEMATIC_INTRO.assets.video)}
            poster={cinematicAsset(CINEMATIC_INTRO.assets.posterStart)}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: videoOpacity,
              pointerEvents: 'none',
              willChange: 'opacity',
            }}
          />
        )}

        {!reducedMotion && <DepthTransition progress={progress} />}

        {shouldMount3D && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: threeOpacity,
              pointerEvents: threeInteractive ? 'auto' : 'none',
              willChange: 'opacity',
            }}
          >
            {threeLayer}
          </div>
        )}

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.30) 100%)',
            opacity: 1 - threeOpacity * 0.7,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: controlsOpacity,
            pointerEvents: threeInteractive ? 'auto' : 'none',
            willChange: 'opacity',
          }}
        >
          {controlsLayer}
        </div>
      </div>
    </section>
  );
}
