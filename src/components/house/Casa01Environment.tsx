import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeOfDay } from '@/data/casa01Canonical';
import { Casa01Landscaping } from '@/components/house/Casa01Landscaping';
import { Casa01CinematicEnvironment } from '@/components/house/Casa01CinematicEnvironment';
import type { Casa01CameraMode } from '@/components/house/CameraController';

type Props = {
  timeOfDay: TimeOfDay;
  cameraMode: Casa01CameraMode;
  isExterior: boolean;
};

function atmosphereFor(timeOfDay: TimeOfDay, cameraMode: Casa01CameraMode) {
  const cinematic = cameraMode === 'cinematic';

  if (timeOfDay === 'day') {
    return {
      background: '#deded9',
      fog: '#c5c8c1',
      fogNear: cinematic ? 19 : 27,
      fogFar: cinematic ? 55 : 70,
    };
  }

  if (timeOfDay === 'sunset') {
    return {
      background: '#383236',
      fog: '#4a403f',
      fogNear: cinematic ? 18 : 26,
      fogFar: cinematic ? 52 : 68,
    };
  }

  return {
    background: '#141922',
    fog: '#18232e',
    fogNear: cinematic ? 18 : 26,
    fogFar: cinematic ? 50 : 66,
  };
}

export function Casa01Environment({ timeOfDay, cameraMode, isExterior }: Props) {
  const { scene } = useThree();

  const isDay = timeOfDay === 'day';
  const isSunset = timeOfDay === 'sunset';
  const isNight = timeOfDay === 'night';
  const atmosphere = atmosphereFor(timeOfDay, cameraMode);

  useEffect(() => {
    const previousBackground = scene.background;
    const previousFog = scene.fog;

    scene.background = new THREE.Color(atmosphere.background);
    scene.fog = isExterior
      ? new THREE.Fog(atmosphere.fog, atmosphere.fogNear, atmosphere.fogFar)
      : null;

    return () => {
      scene.background = previousBackground;
      scene.fog = previousFog;
    };
  }, [
    atmosphere.background,
    atmosphere.fog,
    atmosphere.fogFar,
    atmosphere.fogNear,
    isExterior,
    scene,
  ]);

  return (
    <group name="Casa01Environment">
      {/* DAYLIGHT CONFIGURATION */}
      {isDay && (
        <>
          <ambientLight intensity={1.1} color="#f4f4f0" />
          {/* Primary Direct Sun */}
          <directionalLight
            position={[14, 20, 16]}
            intensity={1.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
            shadow-normalBias={0.02}
            shadow-camera-near={0.5}
            shadow-camera-far={60}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          {/* Secondary Fill Light on Shaded Side to Prevent Black Shadows */}
          <directionalLight
            position={[-12, 10, -14]}
            intensity={0.5}
            color="#e2e6eb"
          />
          <hemisphereLight args={['#e8eff5', '#908880', 0.6]} />
        </>
      )}

      {/* SUNSET / GOLDEN HOUR CONFIGURATION */}
      {isSunset && (
        <>
          <ambientLight intensity={0.7} color="#ffd8c2" />
          <directionalLight
            position={[-18, 8, 12]}
            intensity={2.2}
            color="#ff8c42"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
            shadow-normalBias={0.02}
            shadow-camera-near={0.5}
            shadow-camera-far={60}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          <directionalLight
            position={[14, 10, -12]}
            intensity={0.4}
            color="#a090b0"
          />
          <hemisphereLight args={['#ff9a62', '#2a2230', 0.5]} />
        </>
      )}

      {/* ATMOSPHERIC NIGHT CONFIGURATION */}
      {isNight && (
        <>
          {/* Lifted Ambient Fill for Silhouette Visibility */}
          <ambientLight intensity={0.55} color="#60748c" />
          {/* Primary Moon Light */}
          <directionalLight
            position={[12, 22, -12]}
            intensity={0.8}
            color="#a0c0e8"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
            shadow-normalBias={0.02}
            shadow-camera-near={0.5}
            shadow-camera-far={60}
            shadow-camera-left={-25}
            shadow-camera-right={25}
            shadow-camera-top={25}
            shadow-camera-bottom={-25}
          />
          {/* Secondary Moon Fill on Front */}
          <directionalLight
            position={[-10, 12, 16]}
            intensity={0.35}
            color="#80a0c8"
          />
          <hemisphereLight args={['#304058', '#141a22', 0.5]} />

          {/* Exterior Architectural Facade Spotlights */}
          <spotLight
            position={[0, 0.2, 7.5]}
            target-position={[0, 5, 5.4]}
            intensity={3.5}
            color="#ffdfb3"
            angle={0.6}
            penumbra={0.5}
          />
          <spotLight
            position={[-2.8, 0.2, 7.0]}
            target-position={[-2.8, 6, 5.4]}
            intensity={2.5}
            color="#ffe6c2"
            angle={0.5}
          />
          <spotLight
            position={[2.8, 0.2, 7.0]}
            target-position={[2.8, 6, 5.4]}
            intensity={2.5}
            color="#ffe6c2"
            angle={0.5}
          />

          {/* Under Eave Downlights */}
          <pointLight position={[0, 9.8, 6.0]} intensity={1.5} color="#ffdfb3" distance={5} />
          <pointLight position={[-2.0, 9.8, 6.0]} intensity={1.2} color="#ffdfb3" distance={5} />
          <pointLight position={[2.0, 9.8, 6.0]} intensity={1.2} color="#ffdfb3" distance={5} />
        </>
      )}

      <Casa01Landscaping timeOfDay={timeOfDay} />

      {cameraMode === 'cinematic' && isExterior && (
        <Casa01CinematicEnvironment timeOfDay={timeOfDay} />
      )}
    </group>
  );
}
