import { RefObject, useEffect, useRef } from 'react';
import { CINEMATIC_INTRO, clamp01 } from '../data/cinematicIntro';

interface UseScrollVideoOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  progress: number;
  enabled?: boolean;
}

export function useScrollVideo({ videoRef, progress, enabled = true }: UseScrollVideoOptions) {
  const targetTimeRef = useRef(CINEMATIC_INTRO.videoStartTime);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const normalized = clamp01(progress);
    const span = CINEMATIC_INTRO.videoEndTime - CINEMATIC_INTRO.videoStartTime;
    targetTimeRef.current = CINEMATIC_INTRO.videoStartTime + normalized * span;
  }, [progress]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        video.pause();
        const target = Math.min(
          CINEMATIC_INTRO.videoEndTime,
          Math.max(CINEMATIC_INTRO.videoStartTime, targetTimeRef.current)
        );
        const delta = target - video.currentTime;

        // GOP 6 (~250 ms at 24 fps): direct seeking remains responsive while
        // the gesture controller coalesces progress into the latest target.
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
