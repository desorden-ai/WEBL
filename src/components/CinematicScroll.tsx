import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CINEMATIC_INTRO,
  cinematicAsset,
  clamp01,
  smoothstep,
} from '../data/cinematicIntro';
import { useScrollVideo } from '../hooks/useScrollVideo';

export function CinematicScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const frameRafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [frameReadout, setFrameReadout] = useState({ frame: 1, time: 0 });

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
      setProgress(0);
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

  useScrollVideo({
    videoRef,
    progress,
    enabled: !reducedMotion,
  });

  useEffect(() => {
    if (reducedMotion) {
      setFrameReadout({ frame: 1, time: 0 });
      return;
    }

    let lastFrame = -1;

    const updateFrameReadout = () => {
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        const time = Math.max(0, video.currentTime);
        const frame = Math.min(
          CINEMATIC_INTRO.totalFrames,
          Math.max(1, Math.floor(time * CINEMATIC_INTRO.fps) + 1)
        );

        if (frame !== lastFrame) {
          lastFrame = frame;
          setFrameReadout({ frame, time });
        }
      }

      frameRafRef.current = requestAnimationFrame(updateFrameReadout);
    };

    frameRafRef.current = requestAnimationFrame(updateFrameReadout);

    return () => {
      if (frameRafRef.current !== null) {
        cancelAnimationFrame(frameRafRef.current);
        frameRafRef.current = null;
      }
    };
  }, [reducedMotion]);

  const sectionHeight = useMemo(
    () => (reducedMotion ? '100dvh' : `${CINEMATIC_INTRO.scrollHeightVh}vh`),
    [reducedMotion]
  );

  const lightProgress = smoothstep(0.56, 0.96, progress);
  const atmosphericProgress = smoothstep(0.08, 0.82, progress);
  const fogPeak = 1 - Math.abs(progress * 2 - 1);
  const fogOpacity = 0.08 + atmosphericProgress * 0.08 + fogPeak * 0.08;
  const posterOpacity = videoReady || reducedMotion ? 0 : 1;

  const brightness = 0.94 + lightProgress * 0.055;
  const contrast = 1.06 + progress * 0.035;
  const saturation = 0.92 + lightProgress * 0.08;
  const warmth = lightProgress * 0.035;

  return (
    <section
      ref={sectionRef}
      aria-label="Recorrido cinematográfico de Mansión Refugio"
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
          touchAction: 'pan-y',
          pointerEvents: 'none',
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
            opacity: reducedMotion ? 1 : posterOpacity,
            transition: 'opacity 160ms linear',
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
            onLoadedMetadata={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${warmth})`,
              transform: 'translateZ(0) scale(1.002)',
              backfaceVisibility: 'hidden',
              willChange: 'filter, transform',
            }}
          />
        )}

        {/* Atmospheric veil: softens compression edges without blurring the architecture. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-8%',
            opacity: fogOpacity,
            transform: `translate3d(${(progress - 0.5) * 8}px, ${8 - progress * 14}px, 0)`,
            filter: 'blur(22px)',
            background:
              'radial-gradient(ellipse at 20% 58%, rgba(186,205,199,0.34) 0%, rgba(160,181,175,0.14) 28%, transparent 58%), radial-gradient(ellipse at 76% 43%, rgba(175,197,191,0.25) 0%, transparent 52%), linear-gradient(to top, rgba(160,181,175,0.20), transparent 54%)',
            mixBlendMode: 'screen',
            willChange: 'opacity, transform',
          }}
        />

        {/* Final-frame house light patch. It only appears near the end, where alignment is valid. */}
        {!reducedMotion && (
          <img
            src={cinematicAsset(CINEMATIC_INTRO.assets.house)}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: smoothstep(0.80, 0.97, progress) * 0.22,
              filter: 'brightness(1.34) saturate(1.22) sepia(0.34) hue-rotate(-8deg)',
              mixBlendMode: 'screen',
              willChange: 'opacity',
            }}
          />
        )}

        {/* Cool-to-warm lighting evolution, kept deliberately subtle. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.10 + lightProgress * 0.08,
            background: `linear-gradient(135deg, rgba(22,55,52,${0.20 - lightProgress * 0.10}) 0%, transparent 46%, rgba(204,139,76,${0.04 + lightProgress * 0.12}) 100%)`,
            mixBlendMode: 'soft-light',
          }}
        />

        {/* Filmic contrast patch / vignette. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 48%, transparent 42%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0.38) 100%), linear-gradient(to bottom, rgba(2,8,7,0.14) 0%, transparent 24%, transparent 72%, rgba(1,6,5,0.24) 100%)',
          }}
        />

        {/* Temporary calibration HUD: remove once scroll duration is locked. */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 12,
              bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
              zIndex: 20,
              padding: '7px 9px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.58)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.28)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.94)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 11,
              lineHeight: 1.35,
              letterSpacing: '0.02em',
              textAlign: 'right',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div style={{ fontWeight: 700 }}>
              FRAME {String(frameReadout.frame).padStart(3, '0')} / {CINEMATIC_INTRO.totalFrames}
            </div>
            <div style={{ opacity: 0.72 }}>
              {frameReadout.time.toFixed(2)}s · SCROLL {(progress * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
