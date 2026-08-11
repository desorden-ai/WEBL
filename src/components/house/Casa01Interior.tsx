import { useMemo } from 'react';
import * as THREE from 'three';
import { CASA01, Casa01ViewMode, Casa01FloorKey, TimeOfDay } from '@/data/casa01Canonical';

type Props = {
  viewMode: Casa01ViewMode;
  floorIsolation?: Casa01FloorKey | null;
  timeOfDay?: TimeOfDay;
};

export function Casa01Interior({ viewMode, floorIsolation = null, timeOfDay = 'day' }: Props) {
  const showGround = !floorIsolation || floorIsolation === 'ground';
  const showLevel1 = !floorIsolation || floorIsolation === 'level1';
  const showLoft = !floorIsolation || floorIsolation === 'loft';

  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';
  const warmLightIntensity = isNight ? 1.8 : isSunset ? 1.2 : 0.4;

  const floorOakMat = useMemo(() => new THREE.MeshStandardMaterial({ color: CASA01.materials.floorOak, roughness: 0.4 }), []);
  const wallIntMat = useMemo(() => new THREE.MeshStandardMaterial({ color: CASA01.materials.interiorWall, roughness: 0.8 }), []);
  const darkWoodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3d2e21', roughness: 0.5 }), []);
  const fabricGreyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4f5660', roughness: 0.85 }), []);
  const fabricWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0ede6', roughness: 0.8 }), []);
  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d0d5dd', metalness: 0.9, roughness: 0.2 }), []);
  const blackMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1d20', roughness: 0.5 }), []);
  const warmLightColor = '#ffc890';

  return (
    <group name="Casa01Interior">
      {showGround && (
        <group name="GroundInterior" position={[0, 0, 0]}>
          <mesh position={[0, 0.11, 0]} receiveShadow material={floorOakMat}>
            <boxGeometry args={[CASA01.footprint.width - 0.36, 0.02, CASA01.footprint.depth - 0.36]} />
          </mesh>
          <pointLight position={[0, 2.5, 0]} color={warmLightColor} intensity={warmLightIntensity} distance={9} />
          <pointLight position={[0, 2.5, 3.2]} color={warmLightColor} intensity={warmLightIntensity * 0.9} distance={8} />

          <group position={[-2.2, 0.1, -1.0]}>
            {Array.from({ length: 14 }).map((_, i) => (
              <mesh key={`stair-g-${i}`} position={[0, i * 0.22 + 0.11, -i * 0.28]} material={darkWoodMat}>
                <boxGeometry args={[0.9, 0.06, 0.28]} />
              </mesh>
            ))}
            <mesh position={[0.45, 1.8, -1.8]} rotation={[Math.PI / 4, 0, 0]} material={chromeMat}>
              <cylinderGeometry args={[0.02, 0.02, 4.2]} />
            </mesh>
          </group>

          <group position={[-1.8, 1.35, -3.8]}>
            <mesh material={wallIntMat}><boxGeometry args={[1.6, 2.5, 1.8]} /></mesh>
            <mesh position={[0, -0.2, 0.91]} material={darkWoodMat}><boxGeometry args={[0.7, 2.0, 0.04]} /></mesh>
          </group>

          <group position={[0, 0.12, 3.2]}>
            <mesh position={[0.4, 0.01, 0]} material={fabricWhiteMat}><boxGeometry args={[3.2, 0.01, 2.8]} /></mesh>
            <group position={[1.2, 0.35, -0.4]}>
              <mesh material={fabricGreyMat}><boxGeometry args={[2.2, 0.4, 0.9]} /></mesh>
              <mesh position={[0, 0.4, -0.35]} material={fabricGreyMat}><boxGeometry args={[2.2, 0.4, 0.2]} /></mesh>
              <mesh position={[-0.7, 0, 0.8]} material={fabricGreyMat}><boxGeometry args={[0.8, 0.4, 0.8]} /></mesh>
            </group>
            <mesh position={[0.4, 0.22, 0.2]} material={darkWoodMat}><cylinderGeometry args={[0.45, 0.45, 0.24, 16]} /></mesh>
            <mesh position={[-1.2, 0.35, 0.6]} rotation={[0, Math.PI / 6, 0]} material={fabricGreyMat}><boxGeometry args={[0.8, 0.4, 0.8]} /></mesh>
            <mesh position={[-2.4, 0.3, 0]} material={blackMat}><boxGeometry args={[0.4, 0.45, 1.8]} /></mesh>
            <mesh position={[-2.55, 1.2, 0]} material={blackMat}><boxGeometry args={[0.04, 0.8, 1.4]} /></mesh>
            <mesh position={[2.2, 0.9, -1.1]} material={chromeMat}><cylinderGeometry args={[0.02, 0.02, 1.8]} /></mesh>
            <mesh position={[2.2, 1.7, -1.1]} material={fabricWhiteMat}><coneGeometry args={[0.25, 0.3, 16]} /></mesh>
          </group>

          <group position={[0, 0.12, -0.4]}>
            <mesh position={[0, 0.38, 0]} material={darkWoodMat}><boxGeometry args={[2.0, 0.08, 1.1]} /></mesh>
            <mesh position={[-0.8, 0.18, -0.4]} material={blackMat}><boxGeometry args={[0.08, 0.36, 0.08]} /></mesh>
            <mesh position={[0.8, 0.18, -0.4]} material={blackMat}><boxGeometry args={[0.08, 0.36, 0.08]} /></mesh>
            <mesh position={[-0.8, 0.18, 0.4]} material={blackMat}><boxGeometry args={[0.08, 0.36, 0.08]} /></mesh>
            <mesh position={[0.8, 0.18, 0.4]} material={blackMat}><boxGeometry args={[0.08, 0.36, 0.08]} /></mesh>
            {[-0.6, 0, 0.6].map((x, idx) => (
              <group key={`chair-top-${idx}`} position={[x, 0.22, -0.75]}>
                <mesh material={fabricWhiteMat}><boxGeometry args={[0.42, 0.06, 0.42]} /></mesh>
                <mesh position={[0, 0.25, -0.18]} material={darkWoodMat}><boxGeometry args={[0.42, 0.4, 0.06]} /></mesh>
              </group>
            ))}
            {[-0.6, 0, 0.6].map((x, idx) => (
              <group key={`chair-bot-${idx}`} position={[x, 0.22, 0.75]}>
                <mesh material={fabricWhiteMat}><boxGeometry args={[0.42, 0.06, 0.42]} /></mesh>
                <mesh position={[0, 0.25, 0.18]} material={darkWoodMat}><boxGeometry args={[0.42, 0.4, 0.06]} /></mesh>
              </group>
            ))}
            <mesh position={[0, 2.2, 0]} material={blackMat}><coneGeometry args={[0.3, 0.25, 16]} /></mesh>
          </group>

          <group position={[0, 0.12, -3.8]}>
            <mesh position={[0.8, 1.25, -0.95]} material={fabricWhiteMat}><boxGeometry args={[3.2, 2.4, 0.55]} /></mesh>
            <mesh position={[0.8, 0.48, -0.85]} material={darkWoodMat}><boxGeometry args={[3.2, 0.08, 0.60]} /></mesh>
            <mesh position={[0.5, 0.45, 0.4]} material={fabricWhiteMat}><boxGeometry args={[2.0, 0.86, 0.8]} /></mesh>
            <mesh position={[0.5, 0.89, 0.4]} material={darkWoodMat}><boxGeometry args={[2.04, 0.04, 0.84]} /></mesh>
            {[-0.4, 0.2, 0.8].map((x, idx) => (
              <mesh key={`stool-${idx}`} position={[x, 0.35, 1.05]} material={darkWoodMat}><cylinderGeometry args={[0.18, 0.18, 0.68, 12]} /></mesh>
            ))}
          </group>
        </group>
      )}

      {showLevel1 && (
        <group name="Level1Interior" position={[0, 3.2, 0]}>
          <mesh position={[0, 0.11, 0]} receiveShadow material={floorOakMat}>
            <boxGeometry args={[CASA01.footprint.width - 0.36, 0.02, CASA01.footprint.depth - 0.36]} />
          </mesh>
          <pointLight position={[0, 2.5, 2.0]} color={warmLightColor} intensity={warmLightIntensity} distance={8} />
          <pointLight position={[1.5, 2.5, -3.0]} color={warmLightColor} intensity={warmLightIntensity * 0.8} distance={6} />
          <mesh position={[0, 1.35, -1.8]} material={wallIntMat}><boxGeometry args={[CASA01.footprint.width - 0.4, 2.5, 0.14]} /></mesh>

          <group position={[0.2, 0.12, 1.8]}>
            <group position={[1.0, 0, 0.5]}>
              <mesh position={[0, 0.3, 0]} material={fabricWhiteMat}><boxGeometry args={[2.0, 0.35, 2.1]} /></mesh>
              <mesh position={[0, 0.6, -1.02]} material={darkWoodMat}><boxGeometry args={[2.2, 0.9, 0.12]} /></mesh>
              <mesh position={[-0.5, 0.5, -0.8]} material={fabricWhiteMat}><boxGeometry args={[0.7, 0.12, 0.4]} /></mesh>
              <mesh position={[0.5, 0.5, -0.8]} material={fabricWhiteMat}><boxGeometry args={[0.7, 0.12, 0.4]} /></mesh>
              <mesh position={[-1.3, 0.22, -0.8]} material={darkWoodMat}><boxGeometry args={[0.45, 0.4, 0.45]} /></mesh>
              <mesh position={[1.3, 0.22, -0.8]} material={darkWoodMat}><boxGeometry args={[0.45, 0.4, 0.45]} /></mesh>
            </group>
            <group position={[-2.2, 0, 0.2]}>
              <mesh position={[0, 0.38, 0]} material={darkWoodMat}><boxGeometry args={[0.6, 0.06, 1.6]} /></mesh>
              <mesh position={[0.2, 0.25, 0]} material={fabricGreyMat}><boxGeometry args={[0.45, 0.5, 0.45]} /></mesh>
            </group>
          </group>

          <group position={[-2.2, 0.1, -2.4]}>
            {Array.from({ length: 14 }).map((_, i) => (
              <mesh key={`stair-l1-${i}`} position={[0, i * 0.22 + 0.11, -i * 0.18]} material={darkWoodMat}><boxGeometry args={[0.85, 0.06, 0.22]} /></mesh>
            ))}
            <mesh position={[0.42, 1.8, -1.2]} rotation={[Math.PI / 4, 0, 0]} material={chromeMat}><cylinderGeometry args={[0.02, 0.02, 3.6]} /></mesh>
          </group>

          <group position={[1.4, 0.12, -3.6]}>
            <mesh position={[0, 0.4, -1.2]} material={fabricWhiteMat}><boxGeometry args={[1.6, 0.8, 0.5]} /></mesh>
            <mesh position={[0, 1.2, -1.4]} material={chromeMat}><boxGeometry args={[1.4, 0.8, 0.02]} /></mesh>
            <mesh position={[-0.7, 1.2, 0.4]} material={chromeMat}><boxGeometry args={[1.0, 2.2, 1.0]} /></mesh>
            <mesh position={[0.6, 0.25, 0.4]} material={fabricWhiteMat}><boxGeometry args={[0.4, 0.45, 0.6]} /></mesh>
          </group>
        </group>
      )}

      {showLoft && (
        <group name="LoftInterior" position={[0, 6.3, 0]}>
          <mesh position={[0.45, 0.11, 0.6]} receiveShadow material={floorOakMat}><boxGeometry args={[CASA01.footprint.width - 1.26, 0.02, CASA01.footprint.depth - 1.56]} /></mesh>
          <mesh position={[-2.05, 0.11, 1.8]} receiveShadow material={floorOakMat}><boxGeometry args={[1.70, 0.02, 6.0]} /></mesh>
          <mesh position={[-2.05, 0.11, -4.9]} receiveShadow material={floorOakMat}><boxGeometry args={[1.70, 0.02, 0.6]} /></mesh>
          <pointLight position={[0, 2.2, 1.5]} color={warmLightColor} intensity={warmLightIntensity * 1.1} distance={9} />
          <group position={[0, 0.12, 3.2]}>
            <mesh position={[0, 0.38, 0]} material={darkWoodMat}><boxGeometry args={[1.8, 0.06, 0.9]} /></mesh>
            <mesh position={[0, 0.4, 0.7]} material={blackMat}><boxGeometry args={[0.5, 0.8, 0.5]} /></mesh>
            <mesh position={[0, 0.42, -0.1]} material={chromeMat}><boxGeometry args={[0.32, 0.02, 0.22]} /></mesh>
            <mesh position={[-2.4, 1.1, -0.5]} material={darkWoodMat}><boxGeometry args={[0.3, 2.0, 1.2]} /></mesh>
          </group>
          <group position={[0, 0.12, -2.0]}>
            <mesh position={[0.8, 0.35, 0]} material={fabricGreyMat}><boxGeometry args={[1.8, 0.4, 0.8]} /></mesh>
            <group position={[0, 0, -2.2]}>
              <mesh position={[0, 0.25, 0]} material={fabricWhiteMat}><boxGeometry args={[1.6, 0.3, 2.0]} /></mesh>
              <mesh position={[0, 0.5, -0.95]} material={darkWoodMat}><boxGeometry args={[1.7, 0.6, 0.1]} /></mesh>
            </group>
          </group>
        </group>
      )}
    </group>
  );
}
