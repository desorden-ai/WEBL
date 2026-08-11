import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TimeOfDay } from '@/data/casa01Canonical';

type Props = {
  timeOfDay: TimeOfDay;
};

export function Casa01Environment({ timeOfDay }: Props) {
  const { scene } = useThree();

  const isDay = timeOfDay === 'day';
  const isSunset = timeOfDay === 'sunset';
  const isNight = timeOfDay === 'night';

  useEffect(() => {
    if (isDay) {
      scene.background = new THREE.Color('#deded9');
    } else if (isSunset) {
      scene.background = new THREE.Color('#383236');
    } else if (isNight) {
      scene.background = new THREE.Color('#1c2430');
    }
  }, [scene, isDay, isSunset, isNight]);

  return (
    <group name="Casa01Environment">
      {isDay && (
        <>
          <ambientLight intensity={1.1} color="#f4f4f0" />
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
          <directionalLight position={[-12, 10, -14]} intensity={0.5} color="#e2e6eb" />
          <hemisphereLight args={['#e8eff5', '#908880', 0.6]} />
        </>
      )}

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
          <directionalLight position={[14, 10, -12]} intensity={0.4} color="#a090b0" />
          <hemisphereLight args={['#ff9a62', '#2a2230', 0.5]} />
        </>
      )}

      {isNight && (
        <>
          <ambientLight intensity={0.55} color="#60748c" />
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
          <directionalLight position={[-10, 12, 16]} intensity={0.35} color="#80a0c8" />
          <hemisphereLight args={['#304058', '#141a22', 0.5]} />
          <spotLight position={[0, 0.2, 7.5]} target-position={[0, 5, 5.4]} intensity={3.5} color="#ffdfb3" angle={0.6} penumbra={0.5} />
          <spotLight position={[-2.8, 0.2, 7.0]} target-position={[-2.8, 6, 5.4]} intensity={2.5} color="#ffe6c2" angle={0.5} />
          <spotLight position={[2.8, 0.2, 7.0]} target-position={[2.8, 6, 5.4]} intensity={2.5} color="#ffe6c2" angle={0.5} />
          <pointLight position={[0, 9.8, 6.0]} intensity={1.5} color="#ffdfb3" distance={5} />
          <pointLight position={[-2.0, 9.8, 6.0]} intensity={1.2} color="#ffdfb3" distance={5} />
          <pointLight position={[2.0, 9.8, 6.0]} intensity={1.2} color="#ffdfb3" distance={5} />
        </>
      )}
    </group>
  );
}
