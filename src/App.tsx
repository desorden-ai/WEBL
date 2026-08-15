import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Viewport3D } from './components/Viewport3D';
import { ControlsOverlay } from './components/ControlsOverlay';
import { CameraViewId, EnvironmentId, VisualFilterId } from './types';
import { VIEW_ORDER } from './data/config';
import { audioEngine } from './utils/audio';
import { triggerHaptic } from './utils/haptics';

const IDLE_TIMEOUT_MS = 30000; // 30 seconds

export default function App() {
  const [currentView, setCurrentView] = useState<CameraViewId>('general');
  const [currentEnv, setCurrentEnv] = useState<EnvironmentId>('night');
  const [visualFilter, setVisualFilter] = useState<VisualFilterId>('normal');
  const [timeOfDay, setTimeOfDay] = useState<number>(22.0); // 00:00 to 24:00
  const [lightsOn, setLightsOn] = useState(true);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [audioOn, setAudioOn] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isAutoPanorama, setIsAutoPanorama] = useState(false);
  const [isCinematicTour, setIsCinematicTour] = useState(false);
  const [isManual360, setIsManual360] = useState(false); // 360 look-around only active when user manually selects scene
  const [resetCameraKey, setResetCameraKey] = useState<number>(0);
  const [cinematicPOIIndex, setCinematicPOIIndex] = useState(0);
  const [cinematicProgress, setCinematicProgress] = useState(0);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [secondsUntilIdle, setSecondsUntilIdle] = useState(30);

  const lastActivityTimeRef = useRef<number>(Date.now());
  const isCinematicTourRef = useRef<boolean>(isCinematicTour);
  isCinematicTourRef.current = isCinematicTour;
  const isAutoPanoramaRef = useRef<boolean>(isAutoPanorama);
  isAutoPanoramaRef.current = isAutoPanorama;
  const isPlayingTimelapseRef = useRef<boolean>(isPlayingTimelapse);
  isPlayingTimelapseRef.current = isPlayingTimelapse;

  // Auto hide initial hint after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Timelapse clock loop
  useEffect(() => {
    if (!isPlayingTimelapse) return;

    const interval = setInterval(() => {
      setTimeOfDay((prev) => {
        const next = (prev + 0.05) % 24;
        return parseFloat(next.toFixed(2));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlayingTimelapse]);

  // Synchronize currentEnv when timeOfDay changes
  useEffect(() => {
    if (timeOfDay >= 8.0 && timeOfDay < 17.0) {
      setCurrentEnv('day');
    } else if (timeOfDay >= 17.0 && timeOfDay < 20.5) {
      setCurrentEnv('sunset');
    } else {
      setCurrentEnv('night');
    }
  }, [timeOfDay]);

  // 30-Second Inactivity Detector
  useEffect(() => {
    const recordActivity = () => {
      lastActivityTimeRef.current = Date.now();

      // If cinematic tour was running, user interaction returns control to the user
      if (isCinematicTourRef.current) {
        setIsCinematicTour(false);
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
        recordActivity();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCinematicTourRef.current) {
          setIsCinematicTour(false);
        } else if (isAutoPanoramaRef.current) {
          setIsAutoPanorama(false);
        } else if (isUIHidden) {
          setIsUIHidden(false);
        }
      }
      recordActivity();
    };

    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('touchmove', recordActivity, { passive: true });
    window.addEventListener('wheel', recordActivity, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    const idleCheckInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityTimeRef.current;
      const remaining = Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
      setSecondsUntilIdle(remaining);

      if (
        elapsed >= IDLE_TIMEOUT_MS &&
        !isCinematicTourRef.current &&
        !isAutoPanoramaRef.current &&
        !isPlayingTimelapseRef.current
      ) {
        setIsCinematicTour(true);
        setShowHint(false);
      }
    }, 500);

    return () => {
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('touchmove', recordActivity);
      window.removeEventListener('wheel', recordActivity);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(idleCheckInterval);
    };
  }, [isUIHidden]);

  const handleDismissHint = useCallback(() => {
    setShowHint(false);
  }, []);

  // When selected from the scene selector or navigation, switch scene with smooth automatic displacement
  const handleSelectView = (view: CameraViewId) => {
    triggerHaptic(20);
    if (isAutoPanorama) setIsAutoPanorama(false);
    if (isCinematicTour) setIsCinematicTour(false);
    setCurrentView(view);
    setShowHint(false);
    lastActivityTimeRef.current = Date.now();
  };

  // Scroll navigation helpers: step to next or prev scene
  const handleNextView = useCallback(() => {
    triggerHaptic(12);
    setCurrentView((prev) => {
      const currIdx = VIEW_ORDER.indexOf(prev);
      const nextIdx = (currIdx + 1) % VIEW_ORDER.length;
      return VIEW_ORDER[nextIdx];
    });
    lastActivityTimeRef.current = Date.now();
  }, []);

  const handlePrevView = useCallback(() => {
    triggerHaptic(12);
    setCurrentView((prev) => {
      const currIdx = VIEW_ORDER.indexOf(prev);
      const prevIdx = (currIdx - 1 + VIEW_ORDER.length) % VIEW_ORDER.length;
      return VIEW_ORDER[prevIdx];
    });
    lastActivityTimeRef.current = Date.now();
  }, []);

  const handleToggleManual360 = (enabled?: boolean) => {
    triggerHaptic(15);
    setIsManual360((prev) => (enabled !== undefined ? enabled : !prev));
    lastActivityTimeRef.current = Date.now();
  };

  const handleSelectEnv = (env: EnvironmentId) => {
    triggerHaptic(15);
    setCurrentEnv(env);
    lastActivityTimeRef.current = Date.now();
    if (env === 'day') {
      setTimeOfDay(12.5);
      if (lightsOn) setLightsOn(false);
    } else if (env === 'sunset') {
      setTimeOfDay(18.5);
      if (!lightsOn) setLightsOn(true);
    } else if (env === 'night') {
      setTimeOfDay(22.0);
      if (!lightsOn) setLightsOn(true);
    }
  };

  const handleSelectFilter = (filter: VisualFilterId) => {
    triggerHaptic(15);
    setVisualFilter(filter);
    lastActivityTimeRef.current = Date.now();
  };

  const handleSetTimeOfDay = (hour: number) => {
    setTimeOfDay(hour);
    setIsPlayingTimelapse(false);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleLights = () => {
    triggerHaptic(15);
    setLightsOn((prev) => !prev);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleFlashlight = () => {
    triggerHaptic(15);
    setFlashlightOn((prev) => !prev);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleAudio = () => {
    triggerHaptic(15);
    const active = audioEngine.toggle();
    setAudioOn(active);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleUI = () => {
    triggerHaptic(15);
    setIsUIHidden((prev) => !prev);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleAutoPanorama = () => {
    triggerHaptic(15);
    setIsAutoPanorama((prev) => !prev);
    if (isCinematicTour) setIsCinematicTour(false);
    setShowHint(false);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleCinematicTour = () => {
    triggerHaptic(15);
    setIsCinematicTour((prev) => !prev);
    if (isAutoPanorama) setIsAutoPanorama(false);
    setShowHint(false);
    lastActivityTimeRef.current = Date.now();
  };

  const handleToggleTimelapse = () => {
    triggerHaptic(15);
    setIsPlayingTimelapse((prev) => !prev);
    lastActivityTimeRef.current = Date.now();
  };

  const handleResetCamera = useCallback(() => {
    triggerHaptic(20);
    setResetCameraKey((prev) => prev + 1);
    lastActivityTimeRef.current = Date.now();
  }, []);

  const handlePOIUpdate = useCallback((poiIndex: number, progress: number) => {
    setCinematicPOIIndex(poiIndex);
    setCinematicProgress(progress);
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black text-neutral-100 select-none overflow-hidden font-sans">
      <main className="relative w-full h-[100dvh] overflow-hidden bg-black flex flex-col justify-between">
        {/* 3D WebGL Canvas Layer */}
        <Viewport3D
          currentView={currentView}
          currentEnv={currentEnv}
          visualFilter={visualFilter}
          timeOfDay={timeOfDay}
          lightsOn={lightsOn}
          flashlightOn={flashlightOn}
          isAutoPanorama={isAutoPanorama}
          isCinematicTour={isCinematicTour}
          isManual360={isManual360}
          resetCameraTrigger={resetCameraKey}
          onViewChange={handleSelectView}
          onNextView={handleNextView}
          onPrevView={handlePrevView}
          onInteract={handleDismissHint}
          onPOIUpdate={handlePOIUpdate}
        />

        {/* Cinematic Subtle Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Mobile Controls Overlay with Clean Top Bar & Settings Drawer */}
        <ControlsOverlay
          currentView={currentView}
          currentEnv={currentEnv}
          visualFilter={visualFilter}
          timeOfDay={timeOfDay}
          lightsOn={lightsOn}
          flashlightOn={flashlightOn}
          audioOn={audioOn}
          showHint={showHint}
          isUIHidden={isUIHidden}
          isAutoPanorama={isAutoPanorama}
          isCinematicTour={isCinematicTour}
          isManual360={isManual360}
          cinematicPOIIndex={cinematicPOIIndex}
          cinematicProgress={cinematicProgress}
          isPlayingTimelapse={isPlayingTimelapse}
          secondsUntilIdle={secondsUntilIdle}
          onSelectView={handleSelectView}
          onSelectEnv={handleSelectEnv}
          onSelectFilter={handleSelectFilter}
          onSetTimeOfDay={handleSetTimeOfDay}
          onToggleLights={handleToggleLights}
          onToggleFlashlight={handleToggleFlashlight}
          onToggleAudio={handleToggleAudio}
          onToggleUI={handleToggleUI}
          onToggleAutoPanorama={handleToggleAutoPanorama}
          onToggleCinematicTour={handleToggleCinematicTour}
          onToggleTimelapse={handleToggleTimelapse}
          onToggleManual360={handleToggleManual360}
          onResetCamera={handleResetCamera}
          onNextView={handleNextView}
          onPrevView={handlePrevView}
        />
      </main>
    </div>
  );
}
