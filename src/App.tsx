import { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Casa01House } from '@/components/house/Casa01House';
import { Casa01Environment } from '@/components/house/Casa01Environment';
import { Casa01Header } from '@/components/ui/Casa01Header';
import { Casa01Controls, CameraPreset } from '@/components/ui/Casa01Controls';
import { Casa01RoomDetail } from '@/components/ui/Casa01RoomDetail';
import { Casa01SpecsModal } from '@/components/ui/Casa01SpecsModal';
import { Casa01ViewMode, Casa01FloorKey, TimeOfDay, RoomInfo } from '@/data/casa01Canonical';

// Smooth Camera Controller Component
function CameraController({
  preset,
  selectedRoom,
  isAutoRotating,
}: {
  preset: CameraPreset;
  selectedRoom: RoomInfo | null;
  isAutoRotating: boolean;
}) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const isTransitioning = useRef<boolean>(true);

  const targetPos = useRef(new THREE.Vector3(14, 8, 16));
  const targetLookAt = useRef(new THREE.Vector3(0, 4.5, 0));

  useEffect(() => {
    isTransitioning.current = true;
    if (selectedRoom) {
      targetPos.current.set(
        selectedRoom.position[0] + 3.5,
        selectedRoom.position[1] + 1.5,
        selectedRoom.position[2] + 4.0
      );
      targetLookAt.current.set(...selectedRoom.cameraTarget);
      return;
    }

    switch (preset) {
      case 'master': // 3/4 Master Perspective
        targetPos.current.set(14, 8, 16);
        targetLookAt.current.set(0, 4.5, 0);
        break;
      case 'front': // Clean Front Elevation
        targetPos.current.set(0, 5, 20);
        targetLookAt.current.set(0, 5, 0);
        break;
      case 'side': // Right Side Elevation
        targetPos.current.set(18, 5, 0);
        targetLookAt.current.set(0, 5, 0);
        break;
      case 'rear': // Rear Elevation
        targetPos.current.set(0, 5, -20);
        targetLookAt.current.set(0, 5, 0);
        break;
      case 'top': // Top Plan
        targetPos.current.set(0, 24, 0.1);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [preset, selectedRoom]);

  // Stop camera transition immediately when user touches/drags canvas
  useEffect(() => {
    const handleUserInteraction = () => {
      isTransitioning.current = false;
    };
    const domElement = gl.domElement;
    domElement.addEventListener('pointerdown', handleUserInteraction);
    domElement.addEventListener('touchstart', handleUserInteraction);
    return () => {
      domElement.removeEventListener('pointerdown', handleUserInteraction);
      domElement.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !isTransitioning.current) return;

    camera.position.lerp(targetPos.current, Math.min(1, delta * 4));
    controlsRef.current.target.lerp(targetLookAt.current, Math.min(1, delta * 4));
    controlsRef.current.update();

    // End transition when camera reaches preset position threshold
    const posDist = camera.position.distanceTo(targetPos.current);
    const lookDist = controlsRef.current.target.distanceTo(targetLookAt.current);
    if (posDist < 0.05 && lookDist < 0.05) {
      camera.position.copy(targetPos.current);
      controlsRef.current.target.copy(targetLookAt.current);
      controlsRef.current.update();
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={3}
      maxDistance={35}
      maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera going below ground level
      autoRotate={isAutoRotating}
      autoRotateSpeed={1.5}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<Casa01ViewMode>('exterior');
  const [floorIsolation, setFloorIsolation] = useState<Casa01FloorKey | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [progress, setProgress] = useState<number>(100);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('master');
  const [showDimensions, setShowDimensions] = useState<boolean>(false);
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(false); // Default OFF
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);

  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isCleanView, setIsCleanView] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Dynamic bloom settings tailored for nighttime and interior lighting modes
  const isInteriorFocused = viewMode !== 'exterior' || selectedRoom !== null || floorIsolation !== null;

  let bloomIntensity = 0.2;
  let bloomThreshold = 0.85;

  if (timeOfDay === 'night') {
    bloomIntensity = isInteriorFocused ? 1.2 : 0.85;
    bloomThreshold = 0.55;
  } else if (timeOfDay === 'sunset') {
    bloomIntensity = isInteriorFocused ? 0.7 : 0.45;
    bloomThreshold = 0.70;
  } else if (isInteriorFocused) {
    bloomIntensity = 0.4;
    bloomThreshold = 0.75;
  }

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullScreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Fail gracefully if browser blocks request
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] font-sans select-none">
      {/* HEADER BAR & TOP ACTIONS */}
      <Casa01Header
        isMenuOpen={isMenuOpen}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        isCleanView={isCleanView}
        onToggleCleanView={() => setIsCleanView(!isCleanView)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenInfo={() => setIsSpecsOpen(true)}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
      />

      {/* THREE.JS 3D CANVAS */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => {
          if (selectedRoom) setSelectedRoom(null);
        }}
      >
        <Canvas
          shadows
          camera={{ position: [14, 8, 16], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
          dpr={[1, 1.5]}
        >
          {/* DYNAMIC LIGHTING & ENVIRONMENT */}
          <Casa01Environment timeOfDay={timeOfDay} />

          {/* MASTER CASA 01 3D MODEL */}
          <Casa01House
            progress={progress}
            viewMode={viewMode}
            floorIsolation={floorIsolation}
            timeOfDay={timeOfDay}
            showDimensions={showDimensions}
            showRoomLabels={showRoomLabels}
            isCleanView={isCleanView}
            onSelectRoom={(room) => setSelectedRoom(room)}
          />

          {/* SMOOTH CAMERA CONTROLLER */}
          <CameraController
            preset={cameraPreset}
            selectedRoom={selectedRoom}
            isAutoRotating={isAutoRotating}
          />

          {/* ATMOSPHERIC POST-PROCESSING BLOOM */}
          <EffectComposer multisampling={4} enableNormalPass={false}>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomThreshold}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* SINGLE COLLAPSIBLE MENU DRAWER */}
      <Casa01Controls
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isCleanView={isCleanView}
        viewMode={viewMode}
        setViewMode={setViewMode}
        floorIsolation={floorIsolation}
        setFloorIsolation={setFloorIsolation}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        progress={progress}
        setProgress={setProgress}
        cameraPreset={cameraPreset}
        setCameraPreset={(preset) => {
          setSelectedRoom(null);
          setCameraPreset(preset);
        }}
        showDimensions={showDimensions}
        setShowDimensions={setShowDimensions}
        showRoomLabels={showRoomLabels}
        setShowRoomLabels={setShowRoomLabels}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
      />

      {/* ROOM DETAIL SLIDE-OVER MODAL */}
      <Casa01RoomDetail
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onFocusRoom={(room) => setSelectedRoom(room)}
        isCleanView={isCleanView}
      />

      {/* ARCHITECTURAL SPECS MODAL */}
      <Casa01SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />
    </main>
  );
}
