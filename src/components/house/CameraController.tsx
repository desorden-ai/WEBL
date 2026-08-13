import { useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import type { CameraPreset } from '@/components/ui/Casa01Controls';
import type { RoomInfo } from '@/data/casa01Canonical';

export type Casa01CameraMode = 'explore' | 'cinematic';

type CameraControllerProps = {
  preset: CameraPreset;
  selectedRoom: RoomInfo | null;
  isAutoRotating: boolean;
  mode: Casa01CameraMode;
  isTechnicalFocus?: boolean;
  onInteractionChange?: (isInteracting: boolean) => void;
  onUserTakeover?: () => void;
};

type CameraPresetDefinition = {
  position: [number, number, number];
  target: [number, number, number];
};

type CameraProfile = {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minAzimuthAngle: number;
  maxAzimuthAngle: number;
  smoothTime: number;
  draggingSmoothTime: number;
  azimuthRotateSpeed: number;
  polarRotateSpeed: number;
  dollySpeed: number;
};

const DEG = Math.PI / 180;
const { ACTION } = CameraControlsImpl;

const PRESETS: Record<CameraPreset, CameraPresetDefinition> = {
  master: {
    position: [14, 8, 16.5],
    target: [0, 4.8, 0],
  },
  front: {
    position: [0, 7.6, 20],
    target: [0, 4.8, 0],
  },
  side: {
    position: [18.5, 7.5, 5],
    target: [0, 4.8, 0],
  },
  rear: {
    position: [0, 7.3, -21],
    target: [0, 4.8, 0],
  },
  top: {
    position: [0, 26, 0.01],
    target: [0, 0, 0],
  },
};

const EXPLORE_PROFILE: CameraProfile = {
  minDistance: 9.5,
  maxDistance: 32,
  minPolarAngle: 29 * DEG,
  maxPolarAngle: 86 * DEG,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  smoothTime: 0.45,
  draggingSmoothTime: 0.08,
  azimuthRotateSpeed: 0.72,
  polarRotateSpeed: 0.72,
  dollySpeed: 0.85,
};

const CINEMATIC_PROFILE: CameraProfile = {
  minDistance: 13.5,
  maxDistance: 23,
  minPolarAngle: 58 * DEG,
  maxPolarAngle: 82.5 * DEG,
  minAzimuthAngle: -75 * DEG,
  maxAzimuthAngle: 75 * DEG,
  smoothTime: 0.75,
  draggingSmoothTime: 0.16,
  azimuthRotateSpeed: 0.48,
  polarRotateSpeed: 0.48,
  dollySpeed: 0.62,
};

const ROOM_PROFILE: CameraProfile = {
  minDistance: 2.5,
  maxDistance: 14,
  minPolarAngle: 15 * DEG,
  maxPolarAngle: 92 * DEG,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  smoothTime: 0.42,
  draggingSmoothTime: 0.08,
  azimuthRotateSpeed: 0.68,
  polarRotateSpeed: 0.68,
  dollySpeed: 0.8,
};

const TOP_PROFILE: CameraProfile = {
  minDistance: 16,
  maxDistance: 30,
  minPolarAngle: 0.01 * DEG,
  maxPolarAngle: 32 * DEG,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
  smoothTime: 0.5,
  draggingSmoothTime: 0.1,
  azimuthRotateSpeed: 0.62,
  polarRotateSpeed: 0.62,
  dollySpeed: 0.8,
};

const EXPLORE_AUTO_ROTATE_RADIANS_PER_SECOND = Math.PI / 20;
const CINEMATIC_AUTO_ROTATE_RADIANS_PER_SECOND = Math.PI / 60;
const AUTO_ROTATE_EDGE_EPSILON = 0.5 * DEG;

function resolveProfile(
  mode: Casa01CameraMode,
  preset: CameraPreset,
  selectedRoom: RoomInfo | null,
  isTechnicalFocus: boolean,
) {
  if (selectedRoom) return ROOM_PROFILE;
  if (preset === 'top') return TOP_PROFILE;
  if (preset === 'rear' || isTechnicalFocus) return EXPLORE_PROFILE;
  return mode === 'cinematic' ? CINEMATIC_PROFILE : EXPLORE_PROFILE;
}

export function CameraController({
  preset,
  selectedRoom,
  isAutoRotating,
  mode,
  isTechnicalFocus = false,
  onInteractionChange,
  onUserTakeover,
}: CameraControllerProps) {
  const controlsRef = useRef<CameraControlsImpl | null>(null);
  const userControllingRef = useRef(false);
  const transitionInFlightRef = useRef(false);
  const transitionTokenRef = useRef(0);
  const interactionReportedRef = useRef(false);
  const autoRotateDirectionRef = useRef(1);

  const profile = resolveProfile(mode, preset, selectedRoom, isTechnicalFocus);
  const effectiveMode: Casa01CameraMode = selectedRoom
    || preset === 'rear'
    || preset === 'top'
    || isTechnicalFocus
    ? 'explore'
    : mode;

  const reportInteraction = useCallback((isInteracting: boolean) => {
    if (interactionReportedRef.current === isInteracting) return;
    interactionReportedRef.current = isInteracting;
    onInteractionChange?.(isInteracting);
  }, [onInteractionChange]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const nextLookAt: CameraPresetDefinition = selectedRoom
      ? {
          position: [
            selectedRoom.position[0] + 3.5,
            selectedRoom.position[1] + 1.5,
            selectedRoom.position[2] + 4,
          ],
          target: [...selectedRoom.cameraTarget],
        }
      : PRESETS[preset];

    const token = ++transitionTokenRef.current;
    transitionInFlightRef.current = true;
    userControllingRef.current = false;
    autoRotateDirectionRef.current = 1;
    reportInteraction(false);

    controls.stop();

    const [px, py, pz] = nextLookAt.position;
    const [tx, ty, tz] = nextLookAt.target;

    void controls
      .normalizeRotations()
      .setLookAt(px, py, pz, tx, ty, tz, true)
      .finally(() => {
        if (transitionTokenRef.current === token) {
          transitionInFlightRef.current = false;
        }
      });
  }, [isTechnicalFocus, mode, preset, reportInteraction, selectedRoom]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (
      !controls
      || !isAutoRotating
      || selectedRoom
      || isTechnicalFocus
      || preset === 'rear'
      || preset === 'top'
      || userControllingRef.current
      || transitionInFlightRef.current
    ) {
      return;
    }

    if (Number.isFinite(profile.minAzimuthAngle) && Number.isFinite(profile.maxAzimuthAngle)) {
      if (controls.azimuthAngle >= profile.maxAzimuthAngle - AUTO_ROTATE_EDGE_EPSILON) {
        autoRotateDirectionRef.current = -1;
      } else if (controls.azimuthAngle <= profile.minAzimuthAngle + AUTO_ROTATE_EDGE_EPSILON) {
        autoRotateDirectionRef.current = 1;
      }
    }

    const speed = effectiveMode === 'cinematic'
      ? CINEMATIC_AUTO_ROTATE_RADIANS_PER_SECOND
      : EXPLORE_AUTO_ROTATE_RADIANS_PER_SECOND;

    controls.rotate(speed * autoRotateDirectionRef.current * delta, 0, false);
  });

  const beginUserControl = () => {
    const controls = controlsRef.current;
    const isNewInteraction = !userControllingRef.current;
    userControllingRef.current = true;

    if (transitionInFlightRef.current) {
      ++transitionTokenRef.current;
      transitionInFlightRef.current = false;
      controls?.stop();
    }

    if (isNewInteraction) {
      reportInteraction(true);
      if (isAutoRotating) onUserTakeover?.();
    }
  };

  const endUserControl = () => {
    userControllingRef.current = false;
    reportInteraction(false);
  };

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      minDistance={profile.minDistance}
      maxDistance={profile.maxDistance}
      minPolarAngle={profile.minPolarAngle}
      maxPolarAngle={profile.maxPolarAngle}
      minAzimuthAngle={profile.minAzimuthAngle}
      maxAzimuthAngle={profile.maxAzimuthAngle}
      smoothTime={profile.smoothTime}
      draggingSmoothTime={profile.draggingSmoothTime}
      azimuthRotateSpeed={profile.azimuthRotateSpeed}
      polarRotateSpeed={profile.polarRotateSpeed}
      dollySpeed={profile.dollySpeed}
      dollyToCursor={false}
      mouseButtons={{
        left: ACTION.ROTATE,
        middle: ACTION.DOLLY,
        right: ACTION.NONE,
        wheel: ACTION.DOLLY,
      }}
      touches={{
        one: ACTION.TOUCH_ROTATE,
        two: ACTION.TOUCH_DOLLY,
        three: ACTION.NONE,
      }}
      onControlStart={beginUserControl}
      onControl={beginUserControl}
      onControlEnd={endUserControl}
      onRest={() => {
        if (userControllingRef.current && controlsRef.current?.currentAction === ACTION.NONE) {
          endUserControl();
        }
      }}
    />
  );
}
