import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { Casa01House } from '@/components/house/Casa01House';
import { Casa01Environment } from '@/components/house/Casa01Environment';
import { CameraController, type Casa01CameraMode } from '@/components/house/CameraController';
import { Casa01Header } from '@/components/ui/Casa01Header';
import { Casa01Controls, CameraPreset } from '@/components/ui/Casa01Controls';
import { Casa01RoomDetail } from '@/components/ui/Casa01RoomDetail';
import { Casa01SpecsModal } from '@/components/ui/Casa01SpecsModal';
import { Casa01ViewMode, Casa01FloorKey, TimeOfDay, RoomInfo } from '@/data/casa01Canonical';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<Casa01ViewMode>('exterior');
  const [floorIsolation, setFloorIsolation] = useState<Casa01FloorKey | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [progress, setProgress] = useState<number>(100);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('master');
  const [cameraMode, setCameraMode] = useState<Casa01CameraMode>('cinematic');
  const [isCameraInteracting, setIsCameraInteracting] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(false);
  const [showRoomLabels, setShowRoomLabels] = useState<boolean>(false); // Default OFF
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);

  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isCleanView, setIsCleanView] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Dynamic bloom settings tailored for nighttime and interior lighting modes
  const isInteriorFocused = viewMode !== 'exterior' || selectedRoom !== null || floorIsolation !== null;
  const isExteriorPresentation = !isInteriorFocused;
  const isTechnicalPreset = cameraPreset === 'rear' || cameraPreset === 'top';
  const isCinematicPresentation = cameraMode === 'cinematic'
    && isExteriorPresentation
    && !isTechnicalPreset;
  const enableCinematicDof = isCinematicPresentation && !isCameraInteracting;

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

  useEffect(() => {
    if ((isInteriorFocused || isTechnicalPreset) && isAutoRotating) {
      setIsAutoRotating(false);
    }
  }, [isAutoRotating, isInteriorFocused, isTechnicalPreset]);

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
      if (!document.fullscreenElement) {
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

      {!isCleanView && isExteriorPresentation && (
        <div className="absolute left-1/2 top-20 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/35 p-1 text-[10px] font-semibold tracking-[0.16em] text-white/70 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setCameraMode('cinematic');
              if (isTechnicalPreset) setCameraPreset('master');
            }}
            className={`rounded-full px-3 py-2 transition-colors ${
              cameraMode === 'cinematic' ? 'bg-white text-black' : 'text-white/70'
            }`}
            aria-pressed={cameraMode === 'cinematic'}
          >
            CINEMATIC
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('explore')}
            className={`rounded-full px-3 py-2 transition-colors ${
              cameraMode === 'explore' ? 'bg-white text-black' : 'text-white/70'
            }`}
            aria-pressed={cameraMode === 'explore'}
          >
            EXPLORE
          </button>
        </div>
      )}

      {/* THREE.JS 3D CANVAS */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => {
          if (selectedRoom) setSelectedRoom(null);
        }}
      >
        <Canvas
          shadows
          camera={{ position: [14, 8, 16.5], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
          dpr={[1, 1.5]}
        >
          {/* DYNAMIC LIGHTING & ENVIRONMENT */}
          <Casa01Environment
            timeOfDay={timeOfDay}
            cameraMode={isCinematicPresentation ? 'cinematic' : 'explore'}
            isExterior={isExteriorPresentation}
          />

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
            mode={cameraMode}
            isTechnicalFocus={isInteriorFocused}
            onInteractionChange={setIsCameraInteracting}
            onUserTakeover={() => setIsAutoRotating(false)}
          />

          {/* ATMOSPHERIC POST-PROCESSING BLOOM */}
          <EffectComposer multisampling={4} enableNormalPass={false}>
            {enableCinematicDof && (
              <DepthOfField
                focusDistance={20.5}
                focusRange={10}
                bokehScale={0.65}
                resolutionScale={0.4}
              />
            )}
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
          if (preset === 'rear' || preset === 'top') {
            setCameraMode('explore');
            setIsAutoRotating(false);
          }
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
