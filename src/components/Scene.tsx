import React from 'react';
import { Canvas } from '@react-three/fiber';
import { HouseBlockout } from './HouseBlockout';
import { TerrainBlockout } from './TerrainBlockout';
import { ForestRocks } from './ForestRocks';
import { ForestFloorVegetation } from './ForestFloorVegetation';
import { HeroTrees } from './HeroTrees';
import { MidgroundForest } from './MidgroundForest';
import { DistantForest } from './DistantForest';
import { LightingAndAtmosphere } from './LightingAndAtmosphere';
import { CameraControlsComponent } from './CameraControls';
import { CameraPreset, CameraState, StudioSettings } from '../types';

interface SceneProps {
  activePreset: CameraPreset | null;
  onCameraUpdate: (state: CameraState) => void;
  settings: StudioSettings;
}

export const Scene: React.FC<SceneProps> = ({
  activePreset,
  onCameraUpdate,
  settings,
}) => {
  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden">
      <Canvas
        shadows
        camera={{
          position: [39, 2.8, 54],
          fov: 36,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          // Small global exposure lift to preserve the cold/moody calibration while avoiding crushed blacks.
          gl.toneMappingExposure = 1.12;
        }}
      >
        <LightingAndAtmosphere
          enableFog={settings.enableFog}
          fogColor={settings.fogColor}
          fogNear={settings.fogNear}
          fogFar={settings.fogFar}
          sunPosition={settings.sunPosition}
        />

        <HouseBlockout wireframeMode={settings.wireframeMode} />

        <TerrainBlockout
          showGrid={settings.showGrid}
          showAxes={settings.showAxes}
          wireframeMode={settings.wireframeMode}
        />

        <ForestRocks wireframeMode={settings.wireframeMode} />

        <ForestFloorVegetation wireframeMode={settings.wireframeMode} />

        <HeroTrees wireframeMode={settings.wireframeMode} />

        <MidgroundForest wireframeMode={settings.wireframeMode} />

        <DistantForest wireframeMode={settings.wireframeMode} />

        <CameraControlsComponent
          activePreset={activePreset}
          onCameraUpdate={onCameraUpdate}
        />
      </Canvas>
    </div>
  );
};
