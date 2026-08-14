import { useLayoutEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { HERO_CAMERA_PRESETS } from './heroCameraPresets';

export default function HeroCamera() {
  const camera = useRef<ThreePerspectiveCamera>(null);
  const preset = HERO_CAMERA_PRESETS.A;

  useLayoutEffect(() => {
    if (!camera.current) return;
    camera.current.lookAt(...preset.target);
    camera.current.updateProjectionMatrix();
  }, [preset]);

  return (
    <PerspectiveCamera
      ref={camera}
      makeDefault
      position={preset.position}
      fov={preset.fov}
      near={0.1}
      far={300}
    />
  );
}
