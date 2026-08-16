import React, { useCallback, useEffect, useRef, useState } from 'react';

const VIDEO_SCROLL_END = 0.72;
const SCENE_REVEAL_START = 0.70;
const SCENE_REVEAL_END = 0.96;
const SCROLL_LENGTH_VH = 520;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (start: number, end: number, value: number) => {
  const t = clamp01((value - start) / Math.max(end - start, Number.EPSILON));
  return t * t * (3 - 2 * t);
};

export const getSceneReveal = (progress: number) =>
  smoothstep(SCENE_REVEAL_START, SCENE_REVEAL_END, progress);

interface ScrollCinematicIntroProps {
  onProgress: (progress: number) => void;
}

export const ScrollCinematicIntro: React.FC<ScrollCinematicIntroProps> = ({ onProgress }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastNotifiedRef = useRef(-1);

  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const notifyProgress = useCallback(
    (nextProgress: number) => {
      setProgress(nextProgress);

      if (Math.abs(nextProgress - lastNotifiedRef.current) >= 0.001 || nextProgress === 1) {
        lastNotifiedRef.current = nextProgress;
        onProgress(nextProgress);
      }
    },
    [onProgress],
  );

  const syncToScroll = useCallback(() => {
    rafRef.current = null;

    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const nextProgress = clamp01(-rect.top / scrollableDistance);

    notifyProgress(nextProgress);

    const video = videoRef.current;
    const duration = durationRef.current;

    if (!video || !duration || videoFailed || video.readyState < 1) return;

    const videoProgress = clamp01(nextProgress / VIDEO_SCROLL_END);
    const targetTime = Math.min(duration - 0.001, duration * videoProgress);

    // Avoid flooding the decoder with seeks smaller than roughly one video frame.
    if (Math.abs(video.currentTime - targetTime) > 1 / 30) {
      try {
        video.currentTime = targetTime;
      } catch {
        // Browsers can reject a seek while metadata is being replaced/reloaded.
      }
    }
  }, [notifyProgress, videoFailed]);

  const requestSync = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = window.requestAnimationFrame(syncToScroll);
  }, [syncToScroll]);

  useEffect(() => {
    requestSync();
    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync, { passive: true });

    return () => {
      window.removeEventListener('scroll', requestSync);
      window.removeEventListener('resize', requestSync);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [requestSync]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    durationRef.current = video.duration;
    video.pause();
    setVideoReady(true);
    requestSync();
  };

  const handleVideoError = () => {
    setVideoFailed(true);
    notifyProgress(1);
  };

  if (videoFailed) return null;

  const reveal = getSceneReveal(progress);
  const videoOpacity = 1 - smoothstep(0.80, SCENE_REVEAL_END, progress);
  const hintOpacity = 1 - smoothstep(0.02, 0.16, progress);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 w-full bg-transparent"
      style={{ height: `${SCROLL_LENGTH_VH}vh` }}
      aria-label="Cinematic scroll introduction"
    >
      <div
        className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-black"
        style={{ pointerEvents: progress >= 0.92 ? 'none' : 'auto' }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: videoOpacity, transform: 'scale(1.003)' }}
          src="/media/hero-scroll.mp4"
          preload="auto"
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleVideoError}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_32%,rgba(3,8,10,0.18)_68%,rgba(3,8,10,0.62)_100%)]"
          style={{ opacity: 0.72 - reveal * 0.32 }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent"
          style={{ opacity: 1 - reveal * 0.75 }}
        />

        {!videoReady && (
          <div className="pointer-events-none absolute inset-0 bg-[#08100e]" />
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex justify-center px-6"
          style={{ opacity: hintOpacity }}
        >
          <div className="flex flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/75">
            <span>Desliza para explorar</span>
            <span className="h-8 w-px bg-gradient-to-b from-white/70 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
