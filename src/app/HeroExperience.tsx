import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Casa01HeroScene from '@/hero/Casa01HeroScene';
import ViewerErrorBoundary from '@/fallback/ViewerErrorBoundary';
import WebGLFallback from '@/fallback/WebGLFallback';
import HeroOverlay from '@/ui/HeroOverlay';
import { getCanvasDpr } from '@/systems/deviceQuality';
import { canUseWebGL } from '@/systems/webglCapabilities';

export default function HeroExperience() {
  const [canvasKey, setCanvasKey] = useState(0);

  if (!canUseWebGL()) {
    return <WebGLFallback onRetry={() => window.location.reload()} />;
  }

  return (
    <ViewerErrorBoundary onReset={() => setCanvasKey((value) => value + 1)}>
      <main className="hero-experience">
        <Canvas
          key={canvasKey}
          dpr={getCanvasDpr()}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
        >
          <Suspense fallback={null}>
            <Casa01HeroScene />
          </Suspense>
        </Canvas>
        <HeroOverlay />
      </main>
    </ViewerErrorBoundary>
  );
}
