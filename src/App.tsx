import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { StudioUI } from './components/StudioUI';
import { CameraPreset, CameraState, StudioSettings } from './types';

const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'hero',
    name: 'Hero Perspective',
    description: 'Canonical 3/4 photographic composition with generous forest context and headroom',
    position: [39, 2.8, 54],
    target: [0, 2.3, -2],
    fov: 36,
  },
  {
    id: 'front',
    name: 'Front Elevation',
    description: 'Direct front facade composition',
    position: [0, 3.2, 38],
    target: [0, 2.2, 0],
    fov: 35,
  },
  {
    id: 'low-angle',
    name: 'Low-Angle Corner',
    description: 'Eye-level corner perspective looking slightly up',
    position: [20, 1.8, 28],
    target: [0, 2.8, -2],
    fov: 38,
  },
  {
    id: 'overview',
    name: 'Site Overview',
    description: 'Elevated view showing terrain massing and site bounds',
    position: [35, 35, 45],
    target: [0, 0, 0],
    fov: 42,
  },
];

export default function App() {
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(CAMERA_PRESETS[0]);
  const [cameraState, setCameraState] = useState<CameraState>({
    position: CAMERA_PRESETS[0].position,
    target: CAMERA_PRESETS[0].target,
    fov: CAMERA_PRESETS[0].fov,
  });

  const [settings, setSettings] = useState<StudioSettings>({
    showGrid: false,
    showAxes: false,
    wireframeMode: false,
    enableFog: true,
    fogColor: '#66727b',
    fogNear: 72,
    fogFar: 190,
    sunPosition: [28, 32, 22],
  });

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
  };

  const handleUpdateSettings = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetHeroCamera = () => {
    setActivePreset(CAMERA_PRESETS[0]);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 select-none">
      <Scene
        activePreset={activePreset}
        onCameraUpdate={setCameraState}
        settings={settings}
      />
      <StudioUI
        presets={CAMERA_PRESETS}
        activePresetId={activePreset?.id || ''}
        onSelectPreset={handleSelectPreset}
        cameraState={cameraState}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetHeroCamera={handleResetHeroCamera}
      />
    </div>
  );
}
