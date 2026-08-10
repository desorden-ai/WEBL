import React, { useState, useCallback } from 'react';
import { HouseState, CameraPreset } from './types';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';
import { WebGLFallback } from './components/WebGLFallback';

export default function App() {
  const [houseState, setHouseState] = useState<HouseState>({
    viewMode: 'exterior',
    activeFloor: 'all',
    constructionProgress: 100, // Default to finished house
    timeOfDay: 'day',
    hideRoof: false,
    showLandscaping: true,
    interiorLightsOn: true,
    autoRotate: false,
    useApprovedExteriorModel: false, // Rule: Keep useApprovedExteriorModel=false
  });

  const [activePreset, setActivePreset] = useState<CameraPreset>('overview');
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // Download ZIP Handler
  const handleDownloadZip = useCallback(() => {
    const link = document.createElement('a');
    link.href = '/SOL_ARCHITECTURE_VISUAL_V3.zip';
    link.download = 'SOL_ARCHITECTURE_VISUAL_V3.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {hasWebGLError ? (
        <WebGLFallback state={houseState} onRetry={() => setHasWebGLError(false)} />
      ) : (
        <>
          {/* 3D WebGL Canvas Layer */}
          <Scene3D
            state={houseState}
            activePreset={activePreset}
            onWebGLError={() => setHasWebGLError(true)}
          />

          {/* Floating UI Controls Overlay Layer */}
          <UIOverlay
            state={houseState}
            onChangeState={setHouseState}
            activePreset={activePreset}
            onSelectPreset={setActivePreset}
            onDownloadZip={handleDownloadZip}
          />
        </>
      )}
    </div>
  );
}
