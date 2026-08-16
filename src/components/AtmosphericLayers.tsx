import React from 'react';
import { AtmosphereConfig } from '../types';

interface AtmosphericLayersProps {
  effectsEnabled: boolean;
  videoReady: boolean;
  progress?: number;
  velocity?: number;
  fogOpacity: number;
  farFogTransform: string;
  nearFogOpacity: number;
  nearFogTransform: string;
  colorLightOpacity: number;
  colorLightBackground: string;
  config: AtmosphereConfig;
}

export const AtmosphericLayers: React.FC<AtmosphericLayersProps> = ({
  effectsEnabled,
  videoReady,
  progress = 0,
  velocity = 0,
  fogOpacity,
  farFogTransform,
  nearFogOpacity,
  nearFogTransform,
  colorLightOpacity,
  colorLightBackground,
  config,
}) => {
  const getCustomColorLightBackground = () => {
    switch (config.lightingMode) {
      case 'golden_hour':
        return 'linear-gradient(135deg, rgba(80, 45, 15, 0.18) 0%, transparent 45%, rgba(255, 170, 70, 0.15) 100%)';
      case 'noon':
        return 'linear-gradient(180deg, rgba(200, 230, 255, 0.08) 0%, transparent 50%, rgba(255, 255, 230, 0.06) 100%)';
      case 'twilight':
        return 'linear-gradient(145deg, rgba(25, 20, 60, 0.20) 0%, transparent 50%, rgba(130, 80, 180, 0.10) 100%)';
      case 'overcast':
        return 'linear-gradient(180deg, rgba(40, 60, 65, 0.12) 0%, transparent 55%, rgba(150, 175, 185, 0.08) 100%)';
      case 'night_vision':
        return 'radial-gradient(ellipse at 50% 50%, rgba(10, 36, 68, 0.50) 0%, rgba(6, 22, 46, 0.65) 60%, rgba(2, 10, 26, 0.85) 100%)';
      case 'cinematic':
      default:
        return colorLightBackground;
    }
  };

  const finalFarFogOpacity = videoReady ? fogOpacity * 0.75 * config.fogDensity : 0;
  const finalNearFogOpacity = videoReady ? nearFogOpacity * 0.8 * config.fogDensity : 0;
  const finalColorLightOpacity = videoReady
    ? config.lightingMode === 'night_vision'
      ? 0.55 * config.lightIntensity
      : colorLightOpacity * config.lightIntensity * 0.7
    : 0;

  const isTvStaticActive = (config.tvStaticEnabled ?? false) && effectsEnabled && videoReady;
  const tvStaticIntensity = config.tvStaticIntensity ?? 0.16;

  return (
    <>
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="tvChromaticNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves="3" stitchTiles="stitch" result="noise" />
            <feColorMatrix
              type="matrix"
              values="
                1.2 0   0   0 0
                0   1.1 0   0 0
                0   0   1.3 0 0
                0   0   0   0.9 0"
              result="chromaNoise"
            />
          </filter>
        </defs>
      </svg>

      {isTvStaticActive && (
        <div
          id="tvStaticFoundFootageOverlay"
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden z-25 transition-opacity duration-300 select-none animate-vhs-tracking"
          style={{ opacity: Math.min(0.85, tvStaticIntensity * 1.5) }}
        >
          <div
            className="absolute inset-[-15%] w-[130%] h-[130%] pointer-events-none animate-tv-noise"
            style={{ mixBlendMode: 'overlay', opacity: 0.75 }}
          >
            <svg className="w-full h-full">
              <rect width="100%" height="100%" filter="url(#tvChromaticNoiseFilter)" fill="#ffffff" />
            </svg>
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.32) 0px, rgba(0, 0, 0, 0.32) 1.5px, transparent 1.5px, transparent 3px)',
              mixBlendMode: 'multiply',
              opacity: 0.85,
            }}
          />

          <div
            className="absolute left-0 right-0 h-24 pointer-events-none animate-scanline-roll"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, rgba(0, 255, 200, 0.04) 75%, transparent 100%)',
              mixBlendMode: 'screen',
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow:
                'inset 0 0 80px rgba(0, 0, 0, 0.7), inset 4px 0 16px rgba(255, 0, 80, 0.15), inset -4px 0 16px rgba(0, 230, 255, 0.15)',
              mixBlendMode: 'screen',
            }}
          />

          <div className="absolute bottom-6 left-6 flex items-center gap-3 font-mono text-xs text-white tracking-widest pointer-events-none uppercase drop-shadow-md">
            <div className="flex items-center gap-2 bg-transparent">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-bold">REC</span>
              <span className="text-white/60">|</span>
              <span className="text-white">SP 0:00:{(progress * 24).toFixed(0).padStart(2, '0')}</span>
            </div>
            <span className="hidden sm:inline text-white/70 text-xs">CH-03 NTSC</span>
          </div>
        </div>
      )}

      {effectsEnabled && config.fogDensity > 0.01 && (
        <div
          id="farFog"
          aria-hidden="true"
          className="absolute inset-[-10%] pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{ opacity: finalFarFogOpacity, transform: farFogTransform }}
        >
          <div
            className="w-full h-full animate-fog-far"
            style={{
              filter: 'blur(20px)',
              mixBlendMode: 'screen',
              background:
                config.lightingMode === 'golden_hour'
                  ? 'radial-gradient(ellipse at 20% 58%, rgba(220,180,140,.30) 0%, rgba(190,150,110,.12) 28%, transparent 58%), radial-gradient(ellipse at 76% 43%, rgba(230,170,120,.20) 0%, transparent 52%), linear-gradient(to top, rgba(200,160,120,.15), transparent 54%)'
                  : config.lightingMode === 'twilight'
                    ? 'radial-gradient(ellipse at 20% 58%, rgba(140,150,220,.25) 0%, rgba(120,130,190,.10) 28%, transparent 58%), radial-gradient(ellipse at 76% 43%, rgba(160,140,210,.18) 0%, transparent 52%), linear-gradient(to top, rgba(130,140,200,.12), transparent 54%)'
                    : 'radial-gradient(ellipse at 20% 58%, rgba(186,205,199,.28) 0%, rgba(160,181,175,.10) 28%, transparent 58%), radial-gradient(ellipse at 76% 43%, rgba(175,197,191,.18) 0%, transparent 52%), linear-gradient(to top, rgba(160,181,175,.14), transparent 54%)',
            }}
          />
        </div>
      )}

      {effectsEnabled && config.fogDensity > 0.01 && (
        <div
          id="nearFog"
          aria-hidden="true"
          className="absolute inset-[-15%] pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{ opacity: finalNearFogOpacity, transform: nearFogTransform }}
        >
          <div
            className="w-full h-full animate-fog-near"
            style={{
              filter: 'blur(28px)',
              mixBlendMode: 'screen',
              background:
                config.lightingMode === 'golden_hour'
                  ? 'radial-gradient(ellipse at 12% 76%, rgba(240,200,150,.25) 0%, rgba(210,170,120,.10) 26%, transparent 55%), radial-gradient(ellipse at 88% 64%, rgba(230,180,130,.18) 0%, transparent 46%)'
                  : config.lightingMode === 'twilight'
                    ? 'radial-gradient(ellipse at 12% 76%, rgba(170,180,240,.22) 0%, rgba(140,150,210,.08) 26%, transparent 55%), radial-gradient(ellipse at 88% 64%, rgba(180,160,230,.14) 0%, transparent 46%)'
                    : 'radial-gradient(ellipse at 12% 76%, rgba(208,224,219,.22) 0%, rgba(183,204,198,.08) 26%, transparent 55%), radial-gradient(ellipse at 88% 64%, rgba(198,217,211,.15) 0%, transparent 46%)',
            }}
          />
        </div>
      )}

      <div
        id="colorLight"
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
        style={{
          opacity: finalColorLightOpacity,
          background: getCustomColorLightBackground(),
          mixBlendMode: config.lightingMode === 'night_vision' ? 'multiply' : 'soft-light',
        }}
      />

      {effectsEnabled && videoReady && config.lightingMode === 'night_vision' && (
        <div
          id="cctvNightVisionHud"
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono select-none"
        >
          <div className="absolute top-5 left-6 right-6 flex items-center justify-between text-xs text-white tracking-wider drop-shadow-md">
            <div className="flex items-center gap-2 bg-transparent">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-bold text-white">CAM-04 [ACCESO]</span>
              <span className="text-white/40">|</span>
              <span className="text-white/90">IR-NIGHT ON</span>
            </div>
            <div className="flex items-center gap-3 bg-transparent text-xs text-white">
              <span className="text-white font-semibold">SENS-UP 16X</span>
              <span className="text-white/40">|</span>
              <span className="text-white">{(progress * 100).toFixed(1)}% FOV</span>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none opacity-40">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-cyan-400" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-3 bg-cyan-400" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-3 bg-cyan-400" />
          </div>

          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 200, 255, 0.12) 0px, rgba(0, 200, 255, 0.12) 1px, transparent 1px, transparent 4px)',
            }}
          />
        </div>
      )}

      {effectsEnabled && videoReady && !isTvStaticActive && (
        <div
          id="filmGrainOverlay"
          aria-hidden="true"
          className="absolute inset-[-10%] pointer-events-none transition-opacity duration-500 overflow-hidden"
          style={{
            opacity: config.lightingMode === 'night_vision' ? 0.09 : 0.052,
            mixBlendMode: 'overlay',
          }}
        >
          <svg className="w-full h-full animate-film-grain scale-110">
            <filter id="vintageFilmGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#vintageFilmGrain)" fill="#ffffff" />
          </svg>
        </div>
      )}

      <div
        id="vignette"
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: videoReady
            ? Math.min(
                0.88,
                0.36 +
                  Math.min(0.6, Math.abs(velocity)) * 0.25 +
                  (isTvStaticActive ? 0.15 : 0) +
                  (config.lightingMode === 'night_vision' ? 0.24 : 0)
              )
            : 0,
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 48%, rgba(0, 6, 14, 0.35) 75%, rgba(0, 3, 8, 0.75) 92%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      />
    </>
  );
};
