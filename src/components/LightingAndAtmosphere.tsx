import React from 'react';

interface LightingAndAtmosphereProps {
  enableFog?: boolean;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  sunPosition?: [number, number, number];
  cinematicProgress?: number;
}

export const LightingAndAtmosphere: React.FC<LightingAndAtmosphereProps> = ({
  enableFog = true,
  fogColor = '#66727b',
  fogNear = 72,
  fogFar = 190,
  sunPosition = [28, 32, 22],
  cinematicProgress = 1,
}) => {
  const transition = Math.min(1, Math.max(0, cinematicProgress));

  // During the video -> WebGL handoff the 3D world starts denser, colder and dimmer,
  // then resolves into the calibrated studio lighting as the video disappears.
  const effectiveFogNear = Math.max(24, fogNear - (1 - transition) * 38);
  const effectiveFogFar = Math.max(effectiveFogNear + 42, fogFar - (1 - transition) * 70);
  const ambientIntensity = 0.18 + transition * 0.34;
  const hemisphereIntensity = 0.18 + transition * 0.32;
  const keyIntensity = 0.38 + transition * 0.90;
  const fillIntensity = 0.08 + transition * 0.18;

  return (
    <>
      {/* Overcast Atmospheric Background & Linear Distance Fog */}
      {enableFog ? (
        <>
          <color attach="background" args={[fogColor]} />
          <fog attach="fog" args={[fogColor, effectiveFogNear, effectiveFogFar]} />
        </>
      ) : (
        <color attach="background" args={['#1e293b']} />
      )}

      {/* Cool Overcast Ambient Fill */}
      <ambientLight intensity={ambientIntensity} color="#c0cbd5" />

      {/* Natural Cold Sky-Ground Hemisphere Light */}
      <hemisphereLight args={['#94a3b8', '#2d3748', hemisphereIntensity]} />

      {/* Key Cool Overcast Daylight */}
      <directionalLight
        position={sunPosition}
        intensity={keyIntensity}
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
      <directionalLight position={[-25, 20, -20]} intensity={fillIntensity} color="#94a3b8" />
    </>
  );
};
