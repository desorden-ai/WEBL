import React from 'react';

interface LightingAndAtmosphereProps {
  enableFog?: boolean;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  sunPosition?: [number, number, number];
}

export const LightingAndAtmosphere: React.FC<LightingAndAtmosphereProps> = ({
  enableFog = true,
  fogColor = '#66727b',
  fogNear = 72,
  fogFar = 190,
  sunPosition = [28, 32, 22],
}) => {
  return (
    <>
      {/* Overcast Atmospheric Background & Linear Distance Fog */}
      {enableFog ? (
        <>
          <color attach="background" args={[fogColor]} />
          <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
        </>
      ) : (
        <color attach="background" args={['#1e293b']} />
      )}

      {/* Cool Overcast Ambient Fill */}
      <ambientLight intensity={0.52} color="#c0cbd5" />

      {/* Natural Cold Sky-Ground Hemisphere Light */}
      <hemisphereLight args={['#94a3b8', '#2d3748', 0.50]} />

      {/* Key Cool Overcast Daylight */}
      <directionalLight
        position={sunPosition}
        intensity={1.28}
        color="#e2e8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.0001}
      />

      {/* Secondary Cold Fill */}
      <directionalLight position={[-25, 20, -20]} intensity={0.26} color="#94a3b8" />
    </>
  );
};
