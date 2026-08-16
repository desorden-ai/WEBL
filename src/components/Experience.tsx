import { lazy, Suspense, useCallback } from 'react';
import { CinematicScroll } from './CinematicScroll';

const LazyApp = lazy(() => import('../App'));

export default function Experience() {
  const warm3D = useCallback(() => {
    void import('../App');
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-neutral-100 font-sans">
      <CinematicScroll
        onWarm3D={warm3D}
        threeLayer={
          <Suspense fallback={<div className="w-full h-[100dvh] bg-[#030706]" />}>
            <LazyApp />
          </Suspense>
        }
        controlsLayer={null}
      />
    </div>
  );
}
