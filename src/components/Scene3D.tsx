import React, { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { HouseState, CameraPreset } from '../types';
import { House3D } from './House3D';

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
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const presetMap: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
    overview: { pos: [14, 11, 18], target: [0, 4.5, 0] },
    front: { pos: [0, 5, 20], target: [0, 4.5, 0] },
    balcony: { pos: [0, 6.8, 10], target: [0, 6.2, 3] },
    level1_interior: { pos: [0.5, 3.2, 10], target: [0, 1.8, 0] },
    level2_interior: { pos: [1, 6.5, 9], target: [0, 4.8, 0] },
    top_down: { pos: [0, 24, 0.1], target: [0, 1, 0] },
  };

  useEffect(() => {
    const selectedPreset = viewMode === 'plan' ? 'top_down' : preset;
    const { pos, target } = presetMap[selectedPreset] || presetMap.overview;
    if (controlsRef.current) {
      controlsRef.current.target.set(target[0], target[1], target[2]);
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.lookAt(target[0], target[1], target[2]);
      controlsRef.current.update();
    }
  }, [preset, viewMode, camera]);

  useFrame(() => controlsRef.current?.update());

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
    />
  );
};

export const Scene3D: React.FC<Scene3DProps> = ({ state, activePreset, onWebGLError }) => {
  const lightingConfig = {
    day: { ambient: 0.9, sunIntensity: 2.2, sunPos: [15, 25, 20] as [number, number, number], bgColor: '#eaf2f8', skyTurbidity: 3, skyRayleigh: 0.8, skyMire: 0.005 },
    sunset: { ambient: 0.6, sunIntensity: 1.8, sunPos: [25, 6, 15] as [number, number, number], bgColor: '#3b2531', skyTurbidity: 8, skyRayleigh: 3.5, skyMire: 0.01 },
    night: { ambient: 0.25, sunIntensity: 0.3, sunPos: [-10, 20, -15] as [number, number, number], bgColor: '#0c1017', skyTurbidity: 10, skyRayleigh: 0.2, skyMire: 0 },
  }[state.timeOfDay];

  return (
    <div className="sol-scene">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [14, 11, 18], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(lightingConfig.bgColor));
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            onWebGLError?.();
          });
        }}
      >
        <Sky turbidity={lightingConfig.skyTurbidity} rayleigh={lightingConfig.skyRayleigh} mieCoefficient={lightingConfig.skyMire} sunPosition={lightingConfig.sunPos} />
        <ambientLight intensity={lightingConfig.ambient} />
        <directionalLight
          position={lightingConfig.sunPos}
          intensity={lightingConfig.sunIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={14}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-15, 12, -15]} intensity={lightingConfig.ambient * 0.4} color="#a0c4ff" />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.65} scale={24} blur={1.8} far={8} resolution={1024} color="#0b0e14" />
        <House3D state={state} />
        <CameraController preset={activePreset} viewMode={state.viewMode} autoRotate={state.autoRotate} />
      </Canvas>
    </div>
  );
};
