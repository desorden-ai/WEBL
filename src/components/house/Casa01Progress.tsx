import { useMemo } from 'react';
import * as THREE from 'three';
import { CASA01 } from '@/data/casa01Canonical';

type Props = {
  progress: number;
};

export function Casa01Progress({ progress }: Props) {
  const p = Math.max(0, Math.min(100, progress)) / 100;
  const showFoundationPrep = p >= 0.0 && p < 0.25;
  const showScaffolding = p >= 0.25 && p < 0.85;
  const showCrane = p >= 0.15 && p < 0.75;

  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: CASA01.materials.steelBeam,
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  const scaffoldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d18b2c',
    metalness: 0.6,
    roughness: 0.4,
  }), []);

  const width = CASA01.footprint.width;
  const depth = CASA01.footprint.depth;

  return (
    <group name="Casa01Progress">
      {showFoundationPrep && (
        <group name="FoundationPrepPhase">
          <mesh position={[0, -0.15, 0.4]}>
            <boxGeometry args={[width + 1.6, 0.3, depth + 2.0]} />
            <meshStandardMaterial color="#4a3b2c" roughness={1.0} />
          </mesh>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={`rebar-x-${i}`} position={[-2.8 + i * 0.7, 0.02, 0.4]} material={steelMat}>
              <cylinderGeometry args={[0.015, 0.015, depth + 1.2]} />
            </mesh>
          ))}
        </group>
      )}

      {showScaffolding && (
        <group name="Scaffolding">
          <group position={[0, 4.5, depth / 2 + 1.2]}>
            {[-2.5, -0.8, 0.8, 2.5].map((x, idx) => (
              <mesh key={`scaff-v-${idx}`} position={[x, 0, 0]} material={scaffoldMat}>
                <cylinderGeometry args={[0.03, 0.03, 9.0]} />
              </mesh>
            ))}
            {[2.0, 5.0, 8.0].map((y, idx) => (
              <mesh key={`scaff-h-${idx}`} position={[0, y - 4.5, 0]} material={scaffoldMat}>
                <boxGeometry args={[5.5, 0.06, 0.8]} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {showCrane && (
        <group position={[-width / 2 - 2.5, 5.0, -depth / 2]}>
          <mesh position={[0, 0, 0]} material={scaffoldMat}>
            <boxGeometry args={[0.4, 10.0, 0.4]} />
          </mesh>
          <mesh position={[1.5, 5.0, 0]} material={scaffoldMat}>
            <boxGeometry args={[3.4, 0.3, 0.3]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
