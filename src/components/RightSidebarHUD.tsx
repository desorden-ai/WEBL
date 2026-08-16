import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Layers,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sun,
  Sunrise,
  Sunset,
  Tv,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AtmosphereConfig, Chapter, LightingMode } from '../types';

interface RightSidebarHUDProps {
  isVisible: boolean;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  currentTime: number;
  isAudioPlaying: boolean;
  isAutoplay: boolean;
  atmosphereConfig: AtmosphereConfig;
  onToggleAutoplay: () => void;
  onToggleAudio: () => void;
  onToggleVisibility: () => void;
  onUpdateAtmosphere: (newConfig: AtmosphereConfig) => void;
  onResetAtmosphere: () => void;
  onSeek: (targetP: number) => void;
}

type ActiveFlyout = 'none' | 'hour' | 'chapters' | 'lighting';

const CHAPTERS: Chapter[] = [
  { id: 'c1', title: '01. Entrada y Mirador', progress: 0, iconName: 'compass' },
  { id: 'c2', title: '02. Fachada de Hormigón', progress: 0.3, iconName: 'building' },
  { id: 'c3', title: '03. Acceso Principal', progress: 0.6, iconName: 'door-open' },
  { id: 'c4', title: '04. Cubierta y Panorámica', progress: 0.95, iconName: 'sun' },
];

const HOURS: Array<{ name: string; hour: string; p: number; mode: LightingMode }> = [
  { name: 'Amanecer', hour: '06:00', p: 0.08, mode: 'cinematic' },
  { name: 'Mañana', hour: '09:30', p: 0.22, mode: 'noon' },
  { name: 'Mediodía', hour: '12:00', p: 0.35, mode: 'noon' },
  { name: 'Hora Dorada', hour: '18:30', p: 0.6, mode: 'golden_hour' },
  { name: 'Crepúsculo', hour: '20:00', p: 0.75, mode: 'twilight' },
  { name: 'Noche', hour: '23:00', p: 0.9, mode: 'cinematic' },
  { name: 'CCTV Nocturno', hour: '02:00', p: 0.98, mode: 'night_vision' },
];

const LIGHTS: Array<{ id: LightingMode; name: string; p: number }> = [
  { id: 'cinematic', name: 'Cinemático', p: 0.35 },
  { id: 'golden_hour', name: 'Hora Dorada', p: 0.6 },
  { id: 'noon', name: 'Mediodía', p: 0.35 },
  { id: 'twilight', name: 'Crepúsculo', p: 0.75 },
  { id: 'overcast', name: 'Brumoso', p: 0.4 },
  { id: 'night_vision', name: 'Visión Nocturna CCTV', p: 0.98 },
];

export const RightSidebarHUD: React.FC<RightSidebarHUDProps> = ({
  isVisible,
  progress,
  currentFrame,
  totalFrames,
  currentTime,
  isAudioPlaying,
  isAutoplay,
  atmosphereConfig,
  onToggleAutoplay,
  onToggleAudio,
  onToggleVisibility,
  onUpdateAtmosphere,
  onResetAtmosphere,
  onSeek,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<ActiveFlyout>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (activeFlyout === 'none') return;
    const close = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveFlyout('none');
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close, { passive: true });
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [activeFlyout]);

  const currentChapter = useMemo(
    () => CHAPTERS.slice().reverse().find((chapter) => progress >= chapter.progress - 0.08) ?? CHAPTERS[0],
    [progress]
  );

  const update = (patch: Partial<AtmosphereConfig>) =>
    onUpdateAtmosphere({ ...atmosphereConfig, ...patch });

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  };

  const open = (flyout: ActiveFlyout) =>
    setActiveFlyout((current) => (current === flyout ? 'none' : flyout));

  if (!isVisible) {
    return (
      <div className="fixed right-3 top-3 z-40 flex gap-1">
        <button aria-label="Mostrar interfaz" onClick={onToggleVisibility} className="min-h-11 min-w-11 grid place-items-center text-white drop-shadow-md">
          <Eye className="w-5 h-5" />
        </button>
        <button aria-label="Pantalla completa" onClick={toggleFullscreen} className="min-h-11 min-w-11 grid place-items-center text-white drop-shadow-md">
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-x-2 top-2 sm:inset-x-auto sm:right-4 sm:top-4 z-40 flex flex-col items-end gap-2 select-none">
      <div className="w-full sm:w-auto flex items-center justify-end gap-1 rounded-xl border border-white/15 bg-black/25 px-2 py-1.5 backdrop-blur-md text-white shadow-lg">
        <button aria-label={isAutoplay ? 'Pausar' : 'Reproducir'} onClick={onToggleAutoplay} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          {isAutoplay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button aria-label="Audio" onClick={onToggleAudio} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button aria-label="Hora" onClick={() => open('hour')} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          <Clock className="w-4 h-4" />
        </button>
        <button aria-label="Capítulos" onClick={() => open('chapters')} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          <Compass className="w-4 h-4" />
        </button>
        <button aria-label="Iluminación" onClick={() => open('lighting')} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          <Sliders className="w-4 h-4" />
        </button>
        <button aria-label="Ocultar interfaz" onClick={onToggleVisibility} className="min-h-10 min-w-10 grid place-items-center rounded-lg hover:bg-white/10">
          <EyeOff className="w-4 h-4" />
        </button>
        <button aria-label="Pantalla completa" onClick={toggleFullscreen} className="hidden sm:grid min-h-10 min-w-10 place-items-center rounded-lg hover:bg-white/10">
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {activeFlyout !== 'none' && (
        <aside
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="w-[min(22rem,calc(100vw-1rem))] max-h-[72dvh] overflow-y-auto no-scrollbar rounded-xl border border-white/15 bg-black/70 p-4 text-white shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest">
              {activeFlyout === 'hour' ? 'Hora y ambiente' : activeFlyout === 'chapters' ? 'Encuadres' : 'Luz y efectos'}
            </span>
            <button aria-label="Cerrar" onClick={() => setActiveFlyout('none')} className="min-h-9 min-w-9 grid place-items-center rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeFlyout === 'hour' && (
            <div className="grid gap-1">
              {HOURS.map((preset) => {
                const active = Math.abs(atmosphereConfig.timeOfDayProgress - preset.p) < 0.035;
                return (
                  <button
                    key={preset.name}
                    onClick={() => update({ timeOfDayProgress: preset.p, lightingMode: preset.mode, timeOfDayEnabled: false })}
                    className={`flex items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-white/10 ${active ? 'bg-white/15 font-bold' : ''}`}
                  >
                    <span className="flex items-center gap-2"><Sunrise className="w-4 h-4" />{preset.name}</span>
                    <span className="flex items-center gap-2 font-mono text-white/70">{preset.hour}{active && <Check className="w-3.5 h-3.5" />}</span>
                  </button>
                );
              })}
              <label className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span>Ciclo automático</span>
                <input type="checkbox" checked={atmosphereConfig.timeOfDayEnabled} onChange={(e) => update({ timeOfDayEnabled: e.target.checked })} />
              </label>
            </div>
          )}

          {activeFlyout === 'chapters' && (
            <div className="grid gap-1">
              {CHAPTERS.map((chapter) => {
                const active = chapter.id === currentChapter.id;
                return (
                  <button key={chapter.id} onClick={() => onSeek(chapter.progress)} className={`flex items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-white/10 ${active ? 'bg-white/15 font-bold' : ''}`}>
                    <span className="flex items-center gap-2"><Layers className="w-4 h-4" />{chapter.title}</span>
                    <span className="font-mono text-white/70">{Math.round(chapter.progress * 100)}%</span>
                  </button>
                );
              })}
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 font-mono text-[10px] text-white/60">
                <span>FRAME {String(currentFrame).padStart(3, '0')} / {totalFrames}</span>
                <span>{currentTime.toFixed(2)}s</span>
              </div>
            </div>
          )}

          {activeFlyout === 'lighting' && (
            <div className="grid gap-3">
              <div className="grid gap-1">
                {LIGHTS.map((preset) => {
                  const active = atmosphereConfig.lightingMode === preset.id;
                  return (
                    <button key={preset.id} onClick={() => update({ lightingMode: preset.id, timeOfDayProgress: preset.p, timeOfDayEnabled: false })} className={`flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-white/10 ${active ? 'bg-white/15 font-bold' : ''}`}>
                      <span className="flex items-center gap-2">{preset.id === 'night_vision' ? <Camera className="w-4 h-4" /> : preset.id === 'twilight' ? <Sunset className="w-4 h-4" /> : <Sun className="w-4 h-4" />}{preset.name}</span>
                      {active && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              {([
                ['Niebla', 'fogDensity', 0, 2.5, 0.05],
                ['Luz', 'lightIntensity', 0.4, 1.8, 0.05],
                ['Partículas', 'particleDensity', 0, 2.5, 0.1],
              ] as const).map(([label, key, min, max, step]) => (
                <label key={key} className="grid gap-1 text-xs">
                  <span className="flex justify-between"><span>{label}</span><span className="font-mono">{Math.round(atmosphereConfig[key] * 100)}%</span></span>
                  <input type="range" min={min} max={max} step={step} value={atmosphereConfig[key]} onChange={(e) => update({ [key]: Number(e.target.value) })} className="w-full" />
                </label>
              ))}

              <label className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span className="flex items-center gap-2"><Tv className="w-4 h-4" />Metraje encontrado</span>
                <input type="checkbox" checked={atmosphereConfig.tvStaticEnabled ?? false} onChange={(e) => update({ tvStaticEnabled: e.target.checked })} />
              </label>

              <button onClick={onResetAtmosphere} className="flex items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-xs hover:bg-white/10">
                <RotateCcw className="w-4 h-4" />Restablecer
              </button>
            </div>
          )}
        </aside>
      )}

      <div className="sm:hidden fixed inset-x-3 bottom-3 z-30 rounded-lg border border-white/15 bg-black/25 p-2 backdrop-blur-md text-white">
        <div className="mb-1 flex justify-between text-[10px]">
          <span className="truncate pr-2">{currentChapter.title}</span>
          <span className="font-mono">{Math.round(progress * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.002" value={progress} onChange={(e) => onSeek(Number(e.target.value))} className="w-full" />
      </div>
    </div>
  );
};
