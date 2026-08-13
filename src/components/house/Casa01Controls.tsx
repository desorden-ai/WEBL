import React, { useEffect, useRef } from 'react';
import { CameraControls as DreiCameraControls } from '@react-three/drei';
import { NavigationMode, CameraPreset } from '../../types';

interface Casa01ControlsProps {
  mode: NavigationMode;
  preset: CameraPreset;
}

const PRESET_CAMERA_POSITIONS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  OVERVIEW: {
    pos: [22, 12, 28],
    target: [0, 2.5, 0],
  },
  FACADE: {
    pos: [0, 4, 18],
    target: [0, 2.5, 0],
  },
  TERRACE: {
    pos: [10, 3.5, 9],
    target: [3, 2, 2],
  },
  GROUND: {
    pos: [-18, 2.2, 16],
    target: [0, 2.8, -1],
  },
};

export const Casa01Controls: React.FC<Casa01ControlsProps> = ({ mode, preset }) => {
  const controlsRef = useRef<DreiCameraControls>(null);

  useEffect(() => {
    if (!controlsRef.current) return;

    const targetConfig = PRESET_CAMERA_POSITIONS[preset] || PRESET_CAMERA_POSITIONS.OVERVIEW;
    const [px, py, pz] = targetConfig.pos;
    const [tx, ty, tz] = targetConfig.target;

    controlsRef.current.setLookAt(px, py, pz, tx, ty, tz, true);
  }, [preset, mode]);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (mode === 'CINEMATIC') {
      controlsRef.current.smoothTime = 0.8;
      controlsRef.current.draggingSmoothTime = 0.8;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.02;
      controlsRef.current.minPolarAngle = Math.PI / 6;
      controlsRef.current.minDistance = 6;
      controlsRef.current.maxDistance = 45;
    } else {
      controlsRef.current.smoothTime = 0.25;
      controlsRef.current.draggingSmoothTime = 0.15;
      controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.01;
      controlsRef.current.minPolarAngle = 0.1;
      controlsRef.current.minDistance = 3;
      controlsRef.current.maxDistance = 60;
    }
  }, [mode]);

  return (
    <DreiCameraControls
      ref={controlsRef}
      makeDefault
      dollyToCursor={mode === 'EXPLORE'}
      infinityDolly={false}
    />
  );
};
