import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { CINEMATIC_INTRO, clamp01, remap01 } from '../data/cinematicIntro';
import { useScrollVideo } from '../hooks/useScrollVideo';

interface CinematicScrollProps {
  threeLayer: ReactNode;
  onWarm3D?: () => void;
}

export function CinematicScroll({ threeLayer, onWarm3D }: CinematicScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const warmedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      if (!warmedRef.current) {
        warmedRef.current = true;
        onWarm3D?.();
      }
      return;
    }

    let raf = 0;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const next = clamp01(-rect.top / travel);
      setProgress((previous) => (Math.abs(previous - next) > 0.0005 ? next : previous));

      if (next >= CINEMATIC_INTRO.warm3DProgress && !warmedRef.current) {
        warmedRef.current = true;
        onWarm3D?.();
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [onWarm3D, reducedMotion]);

  useScrollVideo({ videoRef, progress, enabled: !reducedMotion });

  const depthProgress = useMemo(
    () => remap01(progress, CINEMATIC_INTRO.depthStartProgress, CINEMATIC_INTRO.depthEndProgress),
    [progress]
  );
  const threeOpacity = reducedMotion
    ? 1
    : remap01(progress, CINEMATIC_INTRO.threeStartProgress, CINEMATIC_INTRO.threeEndProgress);
  const videoOpacity = reducedMotion ? 0 : 1 - threeOpacity;
  const interactive = reducedMotion || progress >= CINEMATIC_INTRO.interactiveStartProgress;

  useEffect(() => {
    if (!interactive) return;
    const stopPageScroll = (event: WheelEvent | TouchEvent) => {
      event.preventDefault();
    };
    window.addEventListener('wheel', stopPageScroll, { passive: false });
    window.addEventListener('touchmove', stopPageScroll, { passive: false });
    return () => {
      window.removeEventListener('wheel', stopPageScroll);
      window.removeEventListener('touchmove', stopPageScroll);
    };
  }, [interactive]);

  const scale = 1 + depthProgress * 0.052;
  const shiftX = depthProgress * -0.9;
  const shiftY = depthProgress * -0.65;

  return (
    <section
      ref={sectionRef}
      style={{ height: reducedMotion ? '100dvh' : `${CINEMATIC_INTRO.scrollHeightVh}vh` }}
      className="relative w-full bg-black"
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0 bg-[#030706]"
          style={{ opacity: threeOpacity, pointerEvents: interactive ? 'auto' : 'none' }}
          aria-hidden={!interactive}
        >
          {threeLayer}
        </div>

        {!reducedMotion && (
          <div
            className="absolute inset-0 z-10 overflow-hidden bg-black"
            style={{ opacity: videoOpacity, pointerEvents: 'none' }}
          >
            <video
              ref={videoRef}
              src="/cinematic/intro/intro-scroll.mp4"
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              className="h-full w-full object-cover"
              style={{
                transform: `perspective(900px) translate3d(${shiftX}%, ${shiftY}%, 0) scale(${scale}) rotateX(${depthProgress * 0.35}deg)`,
                transformOrigin: '54% 48%',
                willChange: 'transform, opacity',
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 52% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.34) 100%)',
                opacity: 0.35 + depthProgress * 0.3,
              }}
            />

            <div
              className="absolute inset-x-0 bottom-0 h-[30vh]"
              style={{
                background: 'linear-gradient(to top, rgba(2,5,4,0.34), rgba(2,5,4,0))',
              }}
            />
          </div>
        )}

        {!reducedMotion && progress < 0.12 && (
          <div
            className="absolute inset-x-0 bottom-9 z-20 flex justify-center pointer-events-none"
            style={{ opacity: 1 - progress / 0.12 }}
          >
            <div className="flex flex-col items-center gap-2 text-[10px] tracking-[0.28em] text-white/70 uppercase">
              <span>Desliza</span>
              <span className="block h-8 w-px bg-white/45" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
