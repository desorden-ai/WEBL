import { RefObject, useEffect, useRef } from 'react';
import { CINEMATIC_INTRO, clamp01 } from '../data/cinematicIntro';

interface UseScrollVideoOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  progress: number;
  enabled?: boolean;
}

export function useScrollVideo({ videoRef, progress, enabled = true }: UseScrollVideoOptions) {
  const targetTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const normalized = clamp01(progress / CINEMATIC_INTRO.videoEndProgress);
    targetTimeRef.current = normalized * CINEMATIC_INTRO.videoEndTime;
  }, [progress]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        video.pause();
        const target = Math.min(
          CINEMATIC_INTRO.videoEndTime,
          Math.max(0, targetTimeRef.current)
        );
        const delta = target - video.currentTime;
        if (!video.seeking && Math.abs(delta) > 0.025) {
          video.currentTime = target;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, videoRef]);
}
