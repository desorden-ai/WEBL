import React from 'react';
import { Casa01Interior } from './Casa01Interior';
import { TimeOfDay } from '../../types';
interface Casa01HouseProps {
  timeOfDay: TimeOfDay;
}
export const Casa01House: React.FC<Casa01HouseProps> = ({ timeOfDay }) => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[18, 0.3, 11]} />
        <meshStandardMaterial color="#3a3c3e" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[19.6, 0.04, 12.6]} />
        <meshStandardMaterial color="#2d2f31" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 3.9]}>
        <boxGeometry args={[14.6, 3.1, 0.05]} />
        <meshPhysicalMaterial color="#d0e5f2" transparent={true} opacity={0.25} roughness={0.05} transmission={0.85} thickness={0.2} ior={1.5} />
      </mesh>
      {[-7.2, -3.6, 0, 3.6, 7.2].map((x, i) => (
        <mesh key={i} position={[x, 1.75, 3.92]} castShadow>
          <boxGeometry args={[0.08, 3.1, 0.08]} />
          <meshStandardMaterial color="#1a1b1d" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.75, -3.9]} castShadow receiveShadow>
        <boxGeometry args={[15, 3.1, 0.2]} />
        <meshStandardMaterial color="#1f2124" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[-7.4, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.1, 7.8]} />
        <meshStandardMaterial color="#222426" roughness={0.8} />
      </mesh>
      <mesh position={[7.4, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.1, 7.8]} />
        <meshStandardMaterial color="#222426" roughness={0.8} />
      </mesh>
      <Casa01Interior timeOfDay={timeOfDay} />
      <mesh position={[0, 3.45, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[18.4, 0.35, 11.6]} />
        <meshStandardMaterial color="#2a2c2e" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[-1.5, 5.2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 3.1, 7.5]} />
        <meshStandardMaterial color="#191a1c" roughness={0.8} />
      </mesh>
      <mesh position={[-1.5, 5.2, 3.22]}>
        <boxGeometry args={[11.2, 2.9, 0.05]} />
        <meshPhysicalMaterial color="#d0e5f2" transparent={true} opacity={0.3} roughness={0.05} transmission={0.8} />
      </mesh>
      <mesh position={[2, 4.15, 5.95]}>
        <boxGeometry args={[14, 1.1, 0.04]} />
        <meshPhysicalMaterial color="#e6f2fa" transparent={true} opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[2, 4.72, 5.95]} castShadow>
        <boxGeometry args={[14.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#0f1012" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[-0.5, 6.9, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[19.2, 0.35, 12.8]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[-0.5, 6.7, 0.5]}>
        <boxGeometry args={[18.8, 0.04, 12.4]} />
        <meshStandardMaterial color="#402e20" roughness={0.6} />
      </mesh>
      <group position={[5.5, 0.16, 4.2]}>
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[5.2, 0.2, 2.8]} />
          <meshStandardMaterial color="#232528" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[4.8, 0.02, 2.4]} />
          <meshStandardMaterial color={timeOfDay === 'NIGHT' ? '#0f334a' : timeOfDay === 'SUNSET' ? '#4a2c20' : '#1a4c66'} roughness={0.05} metalness={0.9} />
        </mesh>
        {timeOfDay === 'NIGHT' && <pointLight position={[0, 0.2, 0]} color="#40b5ff" intensity={2} distance={5} decay={2} />}
      </group>
    </group>
  );
};
