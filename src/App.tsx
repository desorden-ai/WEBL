import React, { useState } from 'react';
import { HouseState, CameraPreset } from './types';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';
import { WebGLFallback } from './components/WebGLFallback';

export default function App() {
  const [houseState, setHouseState] = useState<HouseState>({
    viewMode: 'exterior',
    activeFloor: 'all',
    constructionProgress: 100,
    timeOfDay: 'day',
    hideRoof: false,
    showLandscaping: true,
    interiorLightsOn: true,
    autoRotate: false,
    useApprovedExteriorModel: false,
  });
  const [activePreset, setActivePreset] = useState<CameraPreset>('overview');
  const [hasWebGLError, setHasWebGLError] = useState(false);

  return (
    <div className="sol-app">
      {hasWebGLError ? (
        <WebGLFallback state={houseState} onRetry={() => setHasWebGLError(false)} />
      ) : (
        <>
          <Scene3D
            state={houseState}
            activePreset={activePreset}
            onWebGLError={() => setHasWebGLError(true)}
          />
          <UIOverlay
            state={houseState}
            onChangeState={setHouseState}
            activePreset={activePreset}
            onSelectPreset={setActivePreset}
          />
        </>
      )}
    </div>
  );
}
