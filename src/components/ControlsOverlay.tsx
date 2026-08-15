import { useState, useEffect } from 'react';
import { CameraViewId, EnvironmentId, VisualFilterId } from '../types';
import { CAMERA_VIEWS, FILTER_ORDER, VIEW_ORDER, VISUAL_FILTERS } from '../data/config';
import { CINEMATIC_POIS } from '../data/cinematicPOIs';
import { motion, AnimatePresence } from 'motion/react';
import { formatHourToString } from '../utils/sunCalculator';
import { triggerHaptic } from '../utils/haptics';
import {
  Camera,
  Sun,
  Sparkles,
  Lightbulb,
  Flashlight,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  X,
  Sliders,
  FileText,
  Monitor,
  Orbit,
} from 'lucide-react';

interface ControlsOverlayProps {
  currentView: CameraViewId;
  currentEnv: EnvironmentId;
  visualFilter: VisualFilterId;
  timeOfDay: number;
  lightsOn: boolean;
  flashlightOn: boolean;
  audioOn: boolean;
  showHint: boolean;
  isUIHidden: boolean;
  isAutoPanorama: boolean;
  isCinematicTour: boolean;
  isManual360: boolean;
  cinematicPOIIndex: number;
  cinematicProgress: number;
  isPlayingTimelapse: boolean;
  secondsUntilIdle: number;
  onSelectView: (view: CameraViewId, fromManualSelector?: boolean) => void;
  onSelectEnv: (env: EnvironmentId) => void;
  onSelectFilter: (filter: VisualFilterId) => void;
  onSetTimeOfDay: (hour: number) => void;
  onToggleLights: () => void;
  onToggleFlashlight: () => void;
  onToggleAudio: () => void;
  onToggleUI: () => void;
  onToggleAutoPanorama: () => void;
  onToggleCinematicTour: () => void;
  onToggleTimelapse: () => void;
  onToggleManual360: (enabled?: boolean) => void;
  onResetCamera?: () => void;
  onNextView: () => void;
  onPrevView: () => void;
}

type MenuCategory = 'escenas' | 'sol' | 'modos' | 'filtros' | 'memoria' | null;

export function ControlsOverlay({
  currentView,
  visualFilter,
  timeOfDay,
  lightsOn,
  flashlightOn,
  audioOn,
  isUIHidden,
  isAutoPanorama,
  isCinematicTour,
  isManual360,
  cinematicPOIIndex,
  cinematicProgress,
  isPlayingTimelapse,
  onSelectView,
  onSelectFilter,
  onSetTimeOfDay,
  onToggleLights,
  onToggleFlashlight,
  onToggleAudio,
  onToggleUI,
  onToggleAutoPanorama,
  onToggleCinematicTour,
  onToggleTimelapse,
  onToggleManual360,
  onResetCamera,
}: ControlsOverlayProps) {
  // Lateral sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  // Active centered text menu
  const [activeCenterMenu, setActiveCenterMenu] = useState<MenuCategory>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    triggerHaptic(18);
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const toggleSidebar = () => {
    triggerHaptic(15);
    setIsSidebarOpen((prev) => {
      if (prev) {
        setActiveCenterMenu(null);
      }
      return !prev;
    });
  };

  const openCenterMenu = (menu: MenuCategory) => {
    triggerHaptic(15);
    setActiveCenterMenu((prev) => (prev === menu ? null : menu));
  };

  const closeAll = () => {
    setIsSidebarOpen(false);
    setActiveCenterMenu(null);
  };

  const activePOI = CINEMATIC_POIS[cinematicPOIIndex] || CINEMATIC_POIS[0];

  const solarPresets = [
    { label: 'ALBA (6:30)', hour: 6.5, desc: 'Amanecer con tonos dorados suaves' },
    { label: 'MEDIODÍA (13:00)', hour: 13.0, desc: 'Sol cenital y máxima iluminación' },
    { label: 'OCASO (18:30)', hour: 18.5, desc: 'Puesta de sol y sombras alargadas' },
    { label: 'NOCHE (22:00)', hour: 22.0, desc: 'Cielo estrellado e iluminación nocturna' },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* 1. CINEMATIC TOUR HUD                                     */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCinematicTour && (
          <motion.div
            id="cinematic-tour-hud"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 sm:p-8"
          >
            {/* Top info */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white animate-pulse" />
                <span className="text-xs font-mono tracking-widest uppercase text-white font-bold">
                  TOUR CINEMATOGRÁFICO ({cinematicPOIIndex + 1}/{CINEMATIC_POIS.length})
                </span>
              </div>

              <button
                id="exit-cinematic-btn"
                onClick={() => {
                  triggerHaptic(15);
                  onToggleCinematicTour();
                }}
                className="text-neutral-400 hover:text-white p-2 cursor-pointer transition-transform hover:scale-110"
                title="Salir del tour"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Centered Bottom Description - Sin recuadros pesados */}
            <div className="w-full max-w-lg mx-auto text-center pointer-events-auto flex flex-col items-center gap-2 font-mono pb-4">
              <div className="w-40 bg-white/20 h-0.5 overflow-hidden mb-1">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, cinematicProgress * 100))}%` }}
                />
              </div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400">
                {activePOI.tag}
              </span>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase">
                {activePOI.title}
              </h2>
              <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-md">
                {activePOI.subtitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 2. AUTO PANORAMA 360° HUD                                 */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isAutoPanorama && !isCinematicTour && (
          <motion.div
            id="panorama-hud"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 left-6 z-50 flex items-center gap-3 pointer-events-auto font-mono text-white"
          >
            <span className="w-2 h-2 bg-white animate-ping" />
            <span className="text-xs tracking-widest uppercase font-semibold">
              GIRO 360° AUTOMÁTICO
            </span>
            <button
              id="exit-panorama-btn"
              onClick={() => {
                triggerHaptic(15);
                onToggleAutoPanorama();
              }}
              className="text-neutral-400 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 ml-2"
              title="Detener giro"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. BOTÓN RESTAURAR INTERFAZ (Modo visualización limpia)   */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isUIHidden && !isAutoPanorama && !isCinematicTour && (
          <motion.button
            id="restore-ui-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              triggerHaptic(15);
              onToggleUI();
            }}
            className="fixed top-5 right-5 z-50 text-neutral-300 hover:text-white cursor-pointer p-2 transition-transform hover:scale-110"
            title="Mostrar menús"
          >
            <Eye className="w-6 h-6 text-white drop-shadow-md" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. MENÚS SUPERIORES: SOLO ICONOS / MODO 360 AISLADO       */}
      {/* ========================================================= */}
      <AnimatePresence mode="wait">
        {!isUIHidden && !isAutoPanorama && !isCinematicTour && (
          isManual360 ? (
            /* Al activar desplazamiento/360°, solo es visible el icono de desplazamiento de 360° */
            <motion.div
              key="top-360-active-bar"
              id="top-360-active-bar"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-5 inset-x-0 mx-auto w-fit z-40 pointer-events-auto flex items-center justify-center select-none"
            >
              <button
                id="top-icon-desplazamiento-360-active"
                onClick={() => {
                  triggerHaptic(18);
                  onToggleManual360(false);
                }}
                className="group p-2.5 bg-neutral-900/90 hover:bg-neutral-800/95 border border-white/40 hover:border-white/80 rounded-full text-white transition-all cursor-pointer shadow-2xl backdrop-blur-md flex items-center gap-2 hover:scale-105"
                title="Desplazamiento 360° Activo (Clic para volver a desplazamiento automático)"
              >
                <span className="relative flex h-2.5 w-2.5 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <Orbit className="w-5 h-5 drop-shadow-md text-white animate-spin-slow" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-white pr-2 uppercase">
                  360° ACTIVO
                </span>
              </button>
            </motion.div>
          ) : (
            /* Menú superior normal completo con icono de desplazamiento 360° */
            <motion.div
              key="top-full-icons-bar"
              id="top-icons-bar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-5 inset-x-0 mx-auto w-fit z-40 pointer-events-auto flex items-center justify-center gap-6 sm:gap-8 select-none"
            >
              {/* 1. ICONO ESCENA */}
              <button
                id="top-icon-escena"
                onClick={() => openCenterMenu('escenas')}
                className={`p-2 transition-all cursor-pointer ${
                  activeCenterMenu === 'escenas'
                    ? 'text-white scale-125'
                    : 'text-neutral-300 hover:text-white hover:scale-115'
                }`}
                title="Escenas"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
              </button>

              {/* 2. ICONO DESPLAZAMIENTO / MODO 360 */}
              <button
                id="top-icon-desplazamiento"
                onClick={() => {
                  triggerHaptic(18);
                  closeAll();
                  onToggleManual360(true);
                }}
                className="p-2 text-neutral-300 hover:text-white transition-all hover:scale-115 cursor-pointer flex items-center justify-center"
                title="Activar Desplazamiento / Vista 360°"
              >
                <Orbit className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
              </button>

              {/* 3. ICONO PANTALLA COMPLETA */}
              <button
                id="top-icon-pantalla-completa"
                onClick={toggleFullscreen}
                className="p-2 text-neutral-300 hover:text-white transition-all hover:scale-115 cursor-pointer"
                title={isFullscreen ? 'Ventana' : 'Pantalla Completa'}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                ) : (
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                )}
              </button>

              {/* 4. ICONO AJUSTES */}
              <button
                id="top-icon-ajustes"
                onClick={toggleSidebar}
                className={`p-2 transition-all cursor-pointer ${
                  isSidebarOpen
                    ? 'text-white scale-125'
                    : 'text-neutral-300 hover:text-white hover:scale-115'
                }`}
                title="Ajustes"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                ) : (
                  <Sliders className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
                )}
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 5. BARRA LATERAL DE AJUSTES (Texto e Iconos limpios)      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isSidebarOpen && !isUIHidden && !isAutoPanorama && !isCinematicTour && (
          <motion.div
            id="ajustes-lateral-sidebar"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-64 sm:w-72 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-between p-6 select-none font-mono pt-16 pointer-events-auto"
          >
            <div className="flex flex-col gap-6">
              {/* Header con botón cerrar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[11px] uppercase tracking-widest text-neutral-400">
                  AJUSTES
                </span>
                <button
                  onClick={toggleSidebar}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 flex items-center gap-1.5 text-[10px] tracking-widest uppercase"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                  <span>CERRAR</span>
                </button>
              </div>

              {/* Lista de opciones en texto puro */}
              <div className="flex flex-col gap-3">
                {/* 1. SOL & TIEMPO */}
                <button
                  id="lateral-item-sol"
                  onClick={() => openCenterMenu('sol')}
                  className={`w-full flex items-center justify-between py-2 text-left transition-all cursor-pointer ${
                    activeCenterMenu === 'sol'
                      ? 'text-white font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">SOL & TIEMPO</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatHourToString(timeOfDay)}
                  </span>
                </button>

                {/* 2. LINTERNA */}
                <button
                  id="lateral-item-linterna"
                  onClick={() => {
                    triggerHaptic(18);
                    onToggleFlashlight();
                  }}
                  className="w-full flex items-center justify-between py-2 text-left text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Flashlight className="w-4 h-4 text-white" />
                    <span className="text-xs uppercase tracking-wider">LINTERNA</span>
                  </div>
                  <span className={`text-[10px] font-mono ${flashlightOn ? 'text-white font-bold' : 'text-neutral-500'}`}>
                    {flashlightOn ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 3. SONIDO */}
                <button
                  id="lateral-item-sonido"
                  onClick={() => {
                    triggerHaptic(18);
                    onToggleAudio();
                  }}
                  className="w-full flex items-center justify-between py-2 text-left text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {audioOn ? (
                      <Volume2 className="w-4 h-4 text-white" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-neutral-400" />
                    )}
                    <span className="text-xs uppercase tracking-wider">SONIDO</span>
                  </div>
                  <span className={`text-[10px] font-mono ${audioOn ? 'text-white font-bold' : 'text-neutral-500'}`}>
                    {audioOn ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 4. LUCES */}
                <button
                  id="lateral-item-luces"
                  onClick={() => {
                    triggerHaptic(18);
                    onToggleLights();
                  }}
                  className="w-full flex items-center justify-between py-2 text-left text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-4 h-4 text-white" />
                    <span className="text-xs uppercase tracking-wider">LUCES</span>
                  </div>
                  <span className={`text-[10px] font-mono ${lightsOn ? 'text-white font-bold' : 'text-neutral-500'}`}>
                    {lightsOn ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* 5. OCULTAR UI */}
                <button
                  id="lateral-item-ocultar-ui"
                  onClick={() => {
                    triggerHaptic(18);
                    closeAll();
                    onToggleUI();
                  }}
                  className="w-full flex items-center justify-between py-2 text-left text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-4 h-4 text-white" />
                    <span className="text-xs uppercase tracking-wider">OCULTAR UI</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">LIMPIAR</span>
                </button>

                {/* 6. MODOS & RECORRIDOS */}
                <button
                  id="lateral-item-modos"
                  onClick={() => openCenterMenu('modos')}
                  className={`w-full flex items-center justify-between py-2 text-left transition-all cursor-pointer ${
                    activeCenterMenu === 'modos'
                      ? 'text-white font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">MODOS</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">VER</span>
                </button>

                {/* 7. FILTROS VISUALES */}
                <button
                  id="lateral-item-filtros"
                  onClick={() => openCenterMenu('filtros')}
                  className={`w-full flex items-center justify-between py-2 text-left transition-all cursor-pointer ${
                    activeCenterMenu === 'filtros'
                      ? 'text-white font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">FILTROS</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 uppercase">
                    {VISUAL_FILTERS[visualFilter]?.name || 'NORMAL'}
                  </span>
                </button>

                {/* 8. MEMORIA ARQUITECTÓNICA */}
                <button
                  id="lateral-item-memoria"
                  onClick={() => openCenterMenu('memoria')}
                  className={`w-full flex items-center justify-between py-2 text-left transition-all cursor-pointer ${
                    activeCenterMenu === 'memoria'
                      ? 'text-white font-bold'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">MEMORIA</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">LEER</span>
                </button>
              </div>
            </div>

            {/* Pie de barra lateral */}
            <div className="pt-4 border-t border-white/10 text-[10px] text-neutral-500 text-center">
              <span>MANSIÓN REFUGIO 3D</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 6. SUBMENÚS CENTRADOS EN TEXTO PURO (Sin recuadros/globos) */}
      {/* Al seleccionar una opción se aplica y se cierra de inmediato */}
      {/* ========================================================= */}
      <AnimatePresence>
        {activeCenterMenu && !isUIHidden && !isAutoPanorama && !isCinematicTour && (
          <motion.div
            id="center-text-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-6 select-none bg-black/75 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                triggerHaptic(10);
                setActiveCenterMenu(null);
              }
            }}
          >
            <div className="w-full max-w-md font-mono text-neutral-100 flex flex-col gap-6 relative">
              {/* Header de texto con botón cerrar */}
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <span className="text-xs font-bold tracking-widest uppercase text-white">
                  {activeCenterMenu === 'escenas' && 'SELECCIONAR ESCENA'}
                  {activeCenterMenu === 'visualizacion' && 'VISUALIZACIÓN & CÁMARA'}
                  {activeCenterMenu === 'sol' && 'ILUMINACIÓN SOLAR & HORA'}
                  {activeCenterMenu === 'modos' && 'MODOS DE VISUALIZACIÓN'}
                  {activeCenterMenu === 'filtros' && 'FILTROS VISUALES'}
                  {activeCenterMenu === 'memoria' && 'MEMORIA ARQUITECTÓNICA'}
                </span>

                <button
                  onClick={() => {
                    triggerHaptic(12);
                    setActiveCenterMenu(null);
                  }}
                  className="text-neutral-400 hover:text-white p-1 cursor-pointer transition-transform hover:scale-110 flex items-center gap-1 text-[11px] uppercase tracking-wider"
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                  <span>CERRAR</span>
                </button>
              </div>

              {/* ---------------------------------------------------- */}
              {/* SUBMENÚ: ESCENAS                                     */}
              {/* ---------------------------------------------------- */}
              {activeCenterMenu === 'escenas' && (
                <div className="flex flex-col gap-3">
                  {/* LISTA DE ESCENAS */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 tracking-widest uppercase mb-1">
                      ENCUADRES ARQUITECTÓNICOS
                    </span>

                    {VIEW_ORDER.map((vId, idx) => {
                      const v = CAMERA_VIEWS[vId];
                      const isActive = currentView === vId;
                      return (
                        <button
                          key={vId}
                          onClick={() => {
                            triggerHaptic(20);
                            // Aplica la escena seleccionada con desplazamiento automático y cierra de inmediato
                            onSelectView(vId);
                            closeAll();
                          }}
                          className={`w-full flex items-center justify-between py-2.5 border-b border-white/10 text-left cursor-pointer transition-all ${
                            isActive
                              ? 'text-white font-bold pl-2'
                              : 'text-neutral-300 hover:text-white hover:pl-2'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500">0{idx + 1}</span>
                            <div>
                              <div className="text-sm uppercase tracking-wider font-semibold">
                                {v.name}
                              </div>
                              <div className="text-[11px] text-neutral-400 font-normal">
                                {v.shortName}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                            {isActive ? '● ACTUAL' : 'IR A ESCENA'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SUBMENÚ: SOL & TIEMPO                                */}
              {/* ---------------------------------------------------- */}
              {activeCenterMenu === 'sol' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {solarPresets.map((preset, idx) => {
                      const isPresetActive = Math.abs(timeOfDay - preset.hour) < 1.2;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => {
                            triggerHaptic(18);
                            // Aplica la iluminación solar y cierra de inmediato
                            onSetTimeOfDay(preset.hour);
                            closeAll();
                          }}
                          className={`w-full flex items-center justify-between py-3 border-b border-white/10 text-left cursor-pointer transition-all ${
                            isPresetActive
                              ? 'text-white font-bold pl-2'
                              : 'text-neutral-300 hover:text-white hover:pl-2'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500">0{idx + 1}</span>
                            <div>
                              <div className="text-sm uppercase tracking-wider font-semibold">
                                {preset.label}
                              </div>
                              <div className="text-[11px] text-neutral-400 font-normal">
                                {preset.desc}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                            {isPresetActive ? '● ACTUAL' : 'APLICAR'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Timelapse */}
                  <button
                    onClick={() => {
                      triggerHaptic(18);
                      onToggleTimelapse();
                      closeAll();
                    }}
                    className="w-full flex items-center justify-between py-3 text-left text-neutral-300 hover:text-white cursor-pointer transition-all hover:pl-2 pt-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">05</span>
                      <div className="text-sm uppercase tracking-wider font-semibold">
                        {isPlayingTimelapse ? 'DETENER TIMELAPSE 24H' : 'INICIAR TIMELAPSE 24H'}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                      {isPlayingTimelapse ? '■ DETENER' : '▶ INICIAR'}
                    </span>
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SUBMENÚ: MODOS & RECORRIDOS                          */}
              {/* ---------------------------------------------------- */}
              {activeCenterMenu === 'modos' && (
                <div className="flex flex-col gap-3">
                  {/* Giro 360 Auto */}
                  <button
                    onClick={() => {
                      triggerHaptic(18);
                      onToggleAutoPanorama();
                      closeAll();
                    }}
                    className="w-full flex items-center justify-between py-3.5 border-b border-white/10 text-left text-neutral-300 hover:text-white cursor-pointer transition-all hover:pl-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">01</span>
                      <div>
                        <div className="text-sm uppercase tracking-wider font-semibold">
                          GIRO 360° AUTOMÁTICO
                        </div>
                        <div className="text-[11px] text-neutral-400 font-normal">
                          Rotación orbital continua alrededor de la casa
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                      {isAutoPanorama ? '■ DETENER' : '▶ INICIAR'}
                    </span>
                  </button>

                  {/* Tour Cinematográfico */}
                  <button
                    onClick={() => {
                      triggerHaptic(18);
                      onToggleCinematicTour();
                      closeAll();
                    }}
                    className="w-full flex items-center justify-between py-3.5 border-b border-white/10 text-left text-neutral-300 hover:text-white cursor-pointer transition-all hover:pl-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">02</span>
                      <div>
                        <div className="text-sm uppercase tracking-wider font-semibold">
                          TOUR CINEMATOGRÁFICO
                        </div>
                        <div className="text-[11px] text-neutral-400 font-normal">
                          Recorrido por los 6 puntos arquitectónicos clave
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                      {isCinematicTour ? '■ DETENER' : '▶ INICIAR'}
                    </span>
                  </button>
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SUBMENÚ: FILTROS VISUALES                            */}
              {/* ---------------------------------------------------- */}
              {activeCenterMenu === 'filtros' && (
                <div className="flex flex-col gap-2">
                  {FILTER_ORDER.map((fId, idx) => {
                    const f = VISUAL_FILTERS[fId];
                    const isFActive = visualFilter === fId;
                    return (
                      <button
                        key={fId}
                        onClick={() => {
                          triggerHaptic(15);
                          // Aplica el filtro visual y cierra de inmediato
                          onSelectFilter(fId);
                          closeAll();
                        }}
                        className={`w-full flex items-center justify-between py-3 border-b border-white/10 text-left cursor-pointer transition-all ${
                          isFActive
                            ? 'text-white font-bold pl-2'
                            : 'text-neutral-300 hover:text-white hover:pl-2'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-neutral-500">0{idx + 1}</span>
                          <div>
                            <div className="text-sm uppercase tracking-wider font-semibold">
                              {f.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-normal">
                              {f.description}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                          {isFActive ? '● ACTIVO' : 'APLICAR'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* SUBMENÚ: MEMORIA ARQUITECTÓNICA                      */}
              {/* ---------------------------------------------------- */}
              {activeCenterMenu === 'memoria' && (
                <div className="flex flex-col gap-4 text-xs leading-relaxed max-h-80 overflow-y-auto pr-2">
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-white font-bold uppercase tracking-wider block text-sm">
                      01. FOGAR MONOLÍTICO & PIEDRA
                    </span>
                    <p className="text-neutral-400 text-xs font-light mt-1">
                      Estructura continua en basalto y acero carbón (1.30 m × 0.68 m) que actúa como núcleo térmico principal.
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-3">
                    <span className="text-white font-bold uppercase tracking-wider block text-sm">
                      02. BARRA & ISLA DE COCINA
                    </span>
                    <p className="text-neutral-400 text-xs font-light mt-1">
                      Cocina integrada con superficie en madera maciza tratada y módulo de refrigeración empotrado.
                    </p>
                  </div>

                  <div className="border-b border-white/10 pb-3">
                    <span className="text-white font-bold uppercase tracking-wider block text-sm">
                      03. REVESTIMIENTO SHOU SUGI BAN
                    </span>
                    <p className="text-neutral-400 text-xs font-light mt-1">
                      Técnica japonesa de madera quemada para máxima durabilidad natural e ignífuga.
                    </p>
                  </div>

                  <div className="pb-2">
                    <span className="text-white font-bold uppercase tracking-wider block text-sm">
                      04. CIMENTACIÓN VOLADA
                    </span>
                    <p className="text-neutral-400 text-xs font-light mt-1">
                      Micropilotes de acero empotrados directamente en roca madre para un mínimo impacto ecológico en el terreno.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
