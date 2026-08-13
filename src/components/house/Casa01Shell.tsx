import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Casa01House } from './Casa01House';
import { Casa01Landscaping } from './Casa01Landscaping';
import { Casa01Environment } from './Casa01Environment';
import { Casa01CinematicEnvironment } from './Casa01CinematicEnvironment';
import { Casa01Controls } from './Casa01Controls';
import { Casa01PresentationDock } from '../ui/Casa01PresentationDock';
import { TimeOfDay, NavigationMode, CameraPreset } from '../../types';

export const Casa01Shell: React.FC = () => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('DAY');
  const [mode, setMode] = useState<NavigationMode>('CINEMATIC');
  const [preset, setPreset] = useState<CameraPreset>('OVERVIEW');
  const [showInfo, setShowInfo] = useState<boolean>(false);

  return (
    <div className="relative w-full h-screen bg-[#0d0f12] overflow-hidden select-none font-sans text-white">
      {/* 3D CANVAS */}
      <Canvas
        shadows
        camera={{ position: [22, 12, 28], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <color attach="background" args={[timeOfDay === 'NIGHT' ? '#0a0d18' : timeOfDay === 'SUNSET' ? '#181014' : '#141a22']} />
        
        {/* ENVIRONMENT & ATMOSPHERE */}
        {mode === 'CINEMATIC' ? (
          <Casa01CinematicEnvironment timeOfDay={timeOfDay} />
        ) : (
          <Casa01Environment timeOfDay={timeOfDay} />
        )}

        {/* ARCHITECTURE & LANDSCAPING */}
        <group position={[0, 0, 0]}>
          <Casa01House timeOfDay={timeOfDay} />
          <Casa01Landscaping timeOfDay={timeOfDay} />
        </group>

        {/* DREI CAMERA CONTROLS (ONLY CAMERA AUTHORITY) */}
        <Casa01Controls mode={mode} preset={preset} />
      </Canvas>

      {/* APPROVED AI STUDIO PRESENTATION DOCK */}
      <Casa01PresentationDock
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        mode={mode}
        setMode={setMode}
        preset={preset}
        setPreset={setPreset}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
      />
    </div>
  );
};
