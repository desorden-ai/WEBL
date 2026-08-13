import React from 'react';
import { TimeOfDay } from '../../types';

interface Casa01InteriorProps {
  timeOfDay: TimeOfDay;
}

export const Casa01Interior: React.FC<Casa01InteriorProps> = ({ timeOfDay }) => {
  const interiorLightIntensity = timeOfDay === 'NIGHT' ? 2.5 : timeOfDay === 'SUNSET' ? 1.5 : 0.8;
  const interiorLightColor = timeOfDay === 'NIGHT' ? '#ffaa55' : timeOfDay === 'SUNSET' ? '#ffbe76' : '#fff3e0';

  return (
    <group position={[0, 0, 0]}>
      {/* Interior Flooring - Warm Oak Wood */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[14.8, 0.02, 7.8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Ceiling & Recessed Lighting Strip */}
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[14.8, 0.02, 7.8]} />
        <meshStandardMaterial color="#e5e0d8" roughness={0.8} />
      </mesh>

      {/* Warm Ambient Interior Point Lights */}
      <pointLight position={[-3, 2.8, 0]} color={interiorLightColor} intensity={interiorLightIntensity} distance={12} decay={2} castShadow={false} />
      <pointLight position={[3, 2.8, 0]} color={interiorLightColor} intensity={interiorLightIntensity} distance={12} decay={2} castShadow={false} />

      {/* Minimalist Interior Wall Division */}
      <mesh position={[-2, 1.75, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.3, 4.5]} />
        <meshStandardMaterial color="#2d3132" roughness={0.7} />
      </mesh>

      {/* Modern Sofa / Seating Lounge */}
      <group position={[3.5, 0.4, 0]}>
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.3, 1.6]} />
          <meshStandardMaterial color="#36393e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, -0.65]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.5, 0.3]} />
          <meshStandardMaterial color="#2b2d31" roughness={0.8} />
        </mesh>
        <mesh position={[-0.8, 0.35, 0.1]} castShadow>
          <boxGeometry args={[1.4, 0.18, 1.2]} />
          <meshStandardMaterial color="#8c8f94" roughness={0.9} />
        </mesh>
        <mesh position={[0.8, 0.35, 0.1]} castShadow>
          <boxGeometry args={[1.4, 0.18, 1.2]} />
          <meshStandardMaterial color="#8c8f94" roughness={0.9} />
        </mesh>
      </group>

      <mesh position={[3.5, 0.2, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.15, 0.9]} />
        <meshStandardMaterial color="#1f1f21" roughness={0.3} metalness={0.2} />
      </mesh>

      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-2, 0.5 + i * 0.4, -2.5 + i * 0.5]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.08, 0.4]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.5} />
        </mesh>
      ))}

      <group position={[3.5, 2.5, 1.8]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.8]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.25, 0.2, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.3} />
        </mesh>
        <pointLight position={[0, -0.1, 0]} color="#ffb76b" intensity={timeOfDay === 'NIGHT' ? 3 : 1} distance={6} decay={2} />
      </group>
    </group>
  );
};
