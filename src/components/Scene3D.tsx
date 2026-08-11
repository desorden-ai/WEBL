import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { HouseState, CameraPreset } from '../types';
import { House3D } from './House3D';
import { Casa01Environment } from './house/Casa01Environment';

interface Scene3DProps {
  state: HouseState;
  activePreset: CameraPreset;
  onWebGLError?: () => void;
}

const CameraController: React.FC<{
  preset: CameraPreset;
  viewMode: string;
  autoRotate: boolean;
}> = ({ preset, viewMode, autoRotate }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const transitioning = useRef(true);
  const targetPosition = useRef(new THREE.Vector3(14, 8, 16));
  const targetLookAt = useRef(new THREE.Vector3(0, 4.5, 0));

  useEffect(() => {
    const selectedPreset = viewMode === 'plan' ? 'top_down' : preset;
    const presets: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
      overview: { pos: [14, 8, 16], target: [0, 4.5, 0] },
      front: { pos: [0, 5, 20], target: [0, 5, 0] },
      balcony: { pos: [0, 7, 11], target: [0, 6.2, 4.8] },
      level1_interior: { pos: [8, 3.8, 8], target: [0, 1.7, 0] },
      level2_interior: { pos: [8, 7.2, 8], target: [0, 5.0, 0] },
      top_down: { pos: [0, 24, 0.1], target: [0, 0, 0] },
    };
    const next = presets[selectedPreset] ?? presets.overview;
    targetPosition.current.set(...next.pos);
    targetLookAt.current.set(...next.target);
    transitioning.current = true;
  }, [preset, viewMode]);

  useEffect(() => {
    const stopTransition = () => { transitioning.current = false; };
    const element = gl.domElement;
    element.addEventListener('pointerdown', stopTransition);
    element.addEventListener('touchstart', stopTransition, { passive: true });
    return () => {
      element.removeEventListener('pointerdown', stopTransition);
      element.removeEventListener('touchstart', stopTransition);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !transitioning.current) return;
    const alpha = Math.min(1, delta * 4);
    camera.position.lerp(targetPosition.current, alpha);
    controlsRef.current.target.lerp(targetLookAt.current, alpha);
    controlsRef.current.update();
    if (
      camera.position.distanceTo(targetPosition.current) < 0.05 &&
      controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05
    ) {
      camera.position.copy(targetPosition.current);
      controlsRef.current.target.copy(targetLookAt.current);
      controlsRef.current.update();
      transitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      zoomSpeed={1}
      panSpeed={0.8}
      minDistance={3}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 + 0.05}
      autoRotate={autoRotate}
      autoRotateSpeed={0.8}
      onStart={() => { transitioning.current = false; }}
    />
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({ state, activePreset, onWebGLError }) => {
  return (
    <div className="sol-scene">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [14, 8, 16], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onWebGLError?.();
          });
        }}
      >
        <Casa01Environment timeOfDay={state.timeOfDay} />
        <House3D state={state} />
        <CameraController preset={activePreset} viewMode={state.viewMode} autoRotate={state.autoRotate} />
      </Canvas>
    </div>
  );
};
