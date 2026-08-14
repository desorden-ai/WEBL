import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CameraPreset, CameraState } from '../types';

interface CameraControlsProps {
  activePreset: CameraPreset | null;
  onCameraUpdate: (state: CameraState) => void;
}

export const CameraControlsComponent: React.FC<CameraControlsProps> = ({
  activePreset,
  onCameraUpdate,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();

  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(39, 2.8, 54));
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.3, -2));
  const targetFov = useRef<number>(36);
  const isTransitioning = useRef<boolean>(false);

  // When active preset changes, set smooth transition targets
  useEffect(() => {
    if (activePreset) {
      targetPos.current.set(...activePreset.position);
      targetLook.current.set(...activePreset.target);
      targetFov.current = activePreset.fov;
      isTransitioning.current = true;
    }
  }, [activePreset]);

  const lastStateKey = useRef<string>('');

  // Smooth lerp camera position, target, and FOV during transitions
  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      const lerpFactor = Math.min(delta * 4.5, 1.0);

      // Lerp camera position
      camera.position.lerp(targetPos.current, lerpFactor);

      // Lerp orbit target
      controlsRef.current.target.lerp(targetLook.current, lerpFactor);

      // Lerp FOV if perspective camera
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, lerpFactor);
        camera.updateProjectionMatrix();
      }

      controlsRef.current.update();

      // Stop transition when close enough
      const posDist = camera.position.distanceTo(targetPos.current);
      const targetDist = controlsRef.current.target.distanceTo(targetLook.current);

      if (posDist < 0.05 && targetDist < 0.05) {
        isTransitioning.current = false;
      }
    }

    // Report live camera state only when position/target/fov actually change
    if (controlsRef.current && (camera instanceof THREE.PerspectiveCamera)) {
      const px = parseFloat(camera.position.x.toFixed(2));
      const py = parseFloat(camera.position.y.toFixed(2));
      const pz = parseFloat(camera.position.z.toFixed(2));
      const tx = parseFloat(controlsRef.current.target.x.toFixed(2));
      const ty = parseFloat(controlsRef.current.target.y.toFixed(2));
      const tz = parseFloat(controlsRef.current.target.z.toFixed(2));
      const fov = Math.round(camera.fov);

      const stateKey = `${px},${py},${pz}|${tx},${ty},${tz}|${fov}`;
      if (stateKey !== lastStateKey.current) {
        lastStateKey.current = stateKey;
        onCameraUpdate({
          position: [px, py, pz],
          target: [tx, ty, tz],
          fov,
        });
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 + 0.02} // Prevent camera going under ground
      minDistance={4}
      maxDistance={120}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
};
