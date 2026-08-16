import { useEffect, useRef, useState } from 'react';
import {
  CINEMATIC_INTRO,
  cinematicAsset,
  clamp01,
  smoothstep,
} from '../data/cinematicIntro';

type TransitionPhase = 'ready' | 'playing' | 'end';

export function CinematicScroll() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRafRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchTriggeredRef = useRef(false);
  const playingRef = useRef(false);
  const completedRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [phase, setPhase] = useState<TransitionPhase>('ready');
  const [frameReadout, setFrameReadout] = useState({
    frame: CINEMATIC_INTRO.startFrame,
    time: CINEMATIC_INTRO.videoStartTime,
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const previous = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      htmlTouchAction: html.style.touchAction,
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      bodyTouchAction: body.style.touchAction,
      bodyPosition: body.style.position,
      bodyInset: body.style.inset,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
    };

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    html.style.touchAction = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.touchAction = 'none';
    body.style.position = 'fixed';
    body.style.inset = '0';
    body.style.width = '100%';
    body.style.height = '100%';
    window.scrollTo(0, 0);

    const triggerForward = () => {
      if (reducedMotion || playingRef.current || completedRef.current) return;

      const video = videoRef.current;
      if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) return;

      playingRef.current = true;
      setPhase('playing');
      video.playbackRate = CINEMATIC_INTRO.transitionPlaybackRate;

      if (Math.abs(video.currentTime - CINEMATIC_INTRO.videoStartTime) > 0.05) {
        video.currentTime = CINEMATIC_INTRO.videoStartTime;
      }

      const playPromise = video.play();
      playPromise?.catch(() => {
        playingRef.current = false;
        setPhase('ready');
      });
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 4) triggerForward();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartYRef.current = event.touches[0].clientY;
      touchTriggeredRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || touchStartYRef.current === null) return;
      event.preventDefault();

      if (touchTriggeredRef.current) return;
      const deltaY = touchStartYRef.current - event.touches[0].clientY;
      if (deltaY >= CINEMATIC_INTRO.gestureTriggerPx) {
        touchTriggeredRef.current = true;
        triggerForward();
      }
    };

    const clearTouch = () => {
      touchStartYRef.current = null;
      touchTriggeredRef.current = false;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', clearTouch, { passive: true });
    window.addEventListener('touchcancel', clearTouch, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', clearTouch);
      window.removeEventListener('touchcancel', clearTouch);

      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      html.style.touchAction = previous.htmlTouchAction;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.style.touchAction = previous.bodyTouchAction;
      body.style.position = previous.bodyPosition;
      body.style.inset = previous.bodyInset;
      body.style.width = previous.bodyWidth;
      body.style.height = previous.bodyHeight;
    };
  }, [reducedMotion]);

  useEffect(() => {
    let lastFrame = -1;
    let lastProgress = -1;

    const updatePlaybackState = () => {
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        if (
          playingRef.current &&
          video.currentTime >= CINEMATIC_INTRO.videoEndTime - 0.012
        ) {
          video.pause();
          video.currentTime = CINEMATIC_INTRO.videoEndTime;
          playingRef.current = false;
          completedRef.current = true;
          setPhase('end');
        }

        const time = Math.min(
          CINEMATIC_INTRO.videoEndTime,
          Math.max(CINEMATIC_INTRO.videoStartTime, video.currentTime)
        );
        const range = CINEMATIC_INTRO.videoEndTime - CINEMATIC_INTRO.videoStartTime;
        const nextProgress = clamp01((time - CINEMATIC_INTRO.videoStartTime) / range);
        const frame = Math.min(
          CINEMATIC_INTRO.endFrame,
          Math.max(
            CINEMATIC_INTRO.startFrame,
            Math.floor(time * CINEMATIC_INTRO.fps) + 1
          )
        );

        if (Math.abs(nextProgress - lastProgress) > 0.001) {
          lastProgress = nextProgress;
          setProgress(nextProgress);
        }

        if (frame !== lastFrame) {
          lastFrame = frame;
          setFrameReadout({ frame, time });
        }
      }

      frameRafRef.current = requestAnimationFrame(updatePlaybackState);
    };

    frameRafRef.current = requestAnimationFrame(updatePlaybackState);

    return () => {
      if (frameRafRef.current !== null) {
        cancelAnimationFrame(frameRafRef.current);
        frameRafRef.current = null;
      }
    };
  }, []);

  const lightProgress = smoothstep(0.56, 0.96, progress);
  const atmosphericProgress = smoothstep(0.08, 0.82, progress);
  const fogPeak = 1 - Math.abs(progress * 2 - 1);
  const fogOpacity = 0.08 + atmosphericProgress * 0.08 + fogPeak * 0.08;

  const brightness = 0.94 + lightProgress * 0.055;
  const contrast = 1.06 + progress * 0.035;
  const saturation = 0.92 + lightProgress * 0.08;
  const warmth = lightProgress * 0.035;

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.playbackRate = CINEMATIC_INTRO.transitionPlaybackRate;
    video.currentTime = CINEMATIC_INTRO.videoStartTime;
    playingRef.current = false;
    completedRef.current = false;
    setProgress(0);
    setPhase('ready');
    setFrameReadout({
      frame: CINEMATIC_INTRO.startFrame,
      time: CINEMATIC_INTRO.videoStartTime,
    });
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= CINEMATIC_INTRO.videoStartTime - 0.03) {
      setVideoReady(true);
    }
  };

  const phaseLabel =
    phase === 'playing'
      ? `PLAY ×${CINEMATIC_INTRO.transitionPlaybackRate.toFixed(1)}`
      : phase === 'end'
        ? 'END'
        : 'READY · 1 SCROLL';

  return (
    <section
      aria-label="Recorrido cinematográfico de Mansión Refugio"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: '#030706',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      <video
        ref={videoRef}
        src={cinematicAsset(CINEMATIC_INTRO.assets.video)}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: videoReady ? 1 : 0,
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${warmth})`,
          transform: 'translateZ(0) scale(1.002)',
          backfaceVisibility: 'hidden',
          willChange: 'filter, transform',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-8%',
          opacity: videoReady ? fogOpacity : 0,
          transform: `translate3d(${(progress - 0.5) * 8}px, ${8 - progress * 14}px, 0)`,
          filter: 'blur(22px)',
          background:
            'radial-gradient(ellipse at 20% 58%, rgba(186,205,199,0.34) 0%, rgba(160,181,175,0.14) 28%, transparent 58%), radial-gradient(ellipse at 76% 43%, rgba(175,197,191,0.25) 0%, transparent 52%), linear-gradient(to top, rgba(160,181,175,0.20), transparent 54%)',
          mixBlendMode: 'screen',
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: videoReady ? 0.10 + lightProgress * 0.08 : 0,
          background: `linear-gradient(135deg, rgba(22,55,52,${0.20 - lightProgress * 0.10}) 0%, transparent 46%, rgba(204,139,76,${0.04 + lightProgress * 0.12}) 100%)`,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: videoReady ? 1 : 0,
          background:
            'radial-gradient(ellipse at 50% 48%, transparent 42%, rgba(0,0,0,0.08) 68%, rgba(0,0,0,0.38) 100%), linear-gradient(to bottom, rgba(2,8,7,0.14) 0%, transparent 24%, transparent 72%, rgba(1,6,5,0.24) 100%)',
          pointerEvents: 'none',
        }}
      />

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
            {frameReadout.time.toFixed(2)}s · {phaseLabel} · {(progress * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </section>
  );
}
