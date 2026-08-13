import React from 'react';
import { TimeOfDay } from '../../types';

interface Casa01EnvironmentProps {
  timeOfDay: TimeOfDay;
}

export const Casa01Environment: React.FC<Casa01EnvironmentProps> = ({ timeOfDay }) => {
  // Atmospheric lighting and fog configuration per time of day
  const envConfig = {
    DAY: {
      sunPos: [32, 42, 22] as [number, number, number],
      sunColor: '#fff5e6',
      sunIntensity: 2.0,
      skyColor: '#a2c0d6',
      ambientColor: '#88a2b6',
      ambientIntensity: 0.82,
      fogColor: '#8ca6b8',
      fogNear: 28,
      fogFar: 92,
    },
    SUNSET: {
      sunPos: [45, 9, 16] as [number, number, number],
      sunColor: '#ff8544',
      sunIntensity: 2.5,
      skyColor: '#ff9966',
      ambientColor: '#9c5c4e',
      ambientIntensity: 0.65,
      fogColor: '#9a6250',
      fogNear: 22,
      fogFar: 82,
    },
    NIGHT: {
      sunPos: [20, 40, -20] as [number, number, number],
      sunColor: '#5577aa',
      sunIntensity: 0.42,
      skyColor: '#0a0e1a',
      ambientColor: '#141f33',
      ambientIntensity: 0.42,
      fogColor: '#0a101d',
      fogNear: 20,
      fogFar: 75,
    },
  }[timeOfDay];

  return (
    <>
      {/* --- LAYERED ATMOSPHERIC SCENE FOG --- */}
      <fog attach="fog" args={[envConfig.fogColor, envConfig.fogNear, envConfig.fogFar]} />

      {/* --- AMBIENT & DIRECTIONAL LIGHTING --- */}
      <ambientLight color={envConfig.ambientColor} intensity={envConfig.ambientIntensity} />
      
      {/* Primary Directional Sun / Moon Light */}
      <directionalLight
        position={envConfig.sunPos}
        color={envConfig.sunColor}
        intensity={envConfig.sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={85}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0001}
      />

      {/* Soft Fill Light from Opposite Sky Vector */}
      <directionalLight
        position={[-envConfig.sunPos[0], envConfig.sunPos[1] * 0.5, -envConfig.sunPos[2]]}
        color={timeOfDay === 'SUNSET' ? '#4a5d7c' : timeOfDay === 'NIGHT' ? '#1f2e45' : '#7ba0be'}
        intensity={0.45}
      />

      {/* --- NIGHTTIME ARCHITECTURAL & LANDSCAPE SPOTLIGHTS --- */}
      {timeOfDay === 'NIGHT' && (
        <group>
          {/* Deck Walkway Warm Accent Lights */}
          <pointLight position={[-8, 0.4, 4.2]} color="#ffb066" intensity={1.9} distance={7} />
          <pointLight position={[0, 0.4, 4.2]} color="#ffb066" intensity={1.9} distance={7} />
          <pointLight position={[8, 0.4, 4.2]} color="#ffb066" intensity={1.9} distance={7} />
          
          {/* Protagonist Tree Base Soft Accent Spotlight */}
          <spotLight
            position={[-12, 0.3, 14]}
            target-position={[-14, 6, 11]}
            color="#ffc88a"
            intensity={3.8}
            angle={0.65}
            penumbra={0.85}
            distance={16}
          />
        </group>
      )}
    </>
  );
};
