import React, { useEffect, useState } from 'react';
import { HouseState, TimeOfDay, CameraPreset, STAGES } from '../types';

interface UIOverlayProps {
  state: HouseState;
  onChangeState: (updater: (prev: HouseState) => HouseState) => void;
  activePreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
}

type SectionKey = 'building' | 'views' | 'construction' | 'lighting' | 'scene';

const cameraPresets: { id: CameraPreset; label: string }[] = [
  { id: 'overview', label: '3/4 Master View' },
  { id: 'front', label: 'Front Elevation' },
  { id: 'balcony', label: 'Balcony View' },
  { id: 'level1_interior', label: 'L1 Living' },
  { id: 'level2_interior', label: 'L2 Suite' },
  { id: 'top_down', label: 'Top Site Plan' },
];

const times: { id: TimeOfDay; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'night', label: 'Night' },
];

export const UIOverlay: React.FC<UIOverlayProps> = ({ state, onChangeState, activePreset, onSelectPreset }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCleanView, setIsCleanView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey | null>('building');

  const currentStage = STAGES.find(
    (stage) => state.constructionProgress >= stage.minProgress && state.constructionProgress <= stage.maxProgress,
  ) || STAGES[STAGES.length - 1];

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      // Some embedded browsers block fullscreen. Keep the viewer usable.
    }
  };

  const toggleSection = (section: SectionKey) => setOpenSection((current) => current === section ? null : section);

  const setBuilding = (mode: 'exterior' | 'dollhouse' | 'ground' | 'level1' | 'loft' | 'roof-hide') => {
    onChangeState((prev) => {
      if (mode === 'dollhouse') return { ...prev, viewMode: 'dollhouse', activeFloor: 'all', hideRoof: false };
      if (mode === 'ground') return { ...prev, viewMode: 'exterior', activeFloor: 'level1', hideRoof: false };
      if (mode === 'level1') return { ...prev, viewMode: 'exterior', activeFloor: 'level2', hideRoof: false };
      if (mode === 'loft') return { ...prev, viewMode: 'exterior', activeFloor: 'level3', hideRoof: false };
      if (mode === 'roof-hide') return { ...prev, viewMode: 'exterior', activeFloor: 'all', hideRoof: true };
      return { ...prev, viewMode: 'exterior', activeFloor: 'all', hideRoof: false };
    });
  };

  const buildingActive = (mode: 'exterior' | 'dollhouse' | 'ground' | 'level1' | 'loft' | 'roof-hide') => {
    if (mode === 'dollhouse') return state.viewMode === 'dollhouse';
    if (mode === 'roof-hide') return state.hideRoof && state.activeFloor === 'all';
    if (mode === 'ground') return state.activeFloor === 'level1';
    if (mode === 'level1') return state.activeFloor === 'level2';
    if (mode === 'loft') return state.activeFloor === 'level3';
    return state.viewMode === 'exterior' && state.activeFloor === 'all' && !state.hideRoof;
  };

  if (isCleanView) {
    return <div className="casa01-clean-restore"><button className="casa01-icon-btn" onClick={() => setIsCleanView(false)} aria-label="Restore interface">◉</button></div>;
  }

  return (
    <div className="casa01-ui">
      <header className="casa01-header">
        <div className="casa01-wordmark" aria-label="CASA SOL CASA 01">
          <span>CASA</span><span className="accent">SOL</span><span className="accent">—</span><span>CASA</span><span>01</span>
        </div>
        <div className="casa01-top-actions">
          <button className={`casa01-action-btn casa01-rotate-btn ${state.autoRotate ? 'is-active' : ''}`} onClick={() => onChangeState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}>
            <span className="casa01-action-icon">↻</span><span>Rotate</span>
          </button>
          <button className="casa01-icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>{isFullscreen ? '↙' : '↗'}</button>
          <button className="casa01-icon-btn" onClick={() => setIsCleanView(true)} aria-label="Clean view">◉</button>
          <button className={`casa01-action-btn casa01-menu-btn ${isMenuOpen ? 'is-active' : ''}`} onClick={() => setIsMenuOpen(true)}><span className="casa01-action-icon">☰</span><span>Menu</span></button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="casa01-menu-backdrop" onPointerDown={() => setIsMenuOpen(false)}>
          <aside className="casa01-menu-drawer" onPointerDown={(event) => event.stopPropagation()}>
            <div className="casa01-menu-head">
              <div><span className="casa01-menu-kicker">☷</span><strong>CASA 01 CONTROLS</strong></div>
              <button className="casa01-menu-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">×</button>
            </div>

            <button className={`casa01-turntable ${state.autoRotate ? 'is-active' : ''}`} onClick={() => onChangeState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}>
              ↻ <span>{state.autoRotate ? 'STOP AUTO-ROTATE TURNTABLE' : 'START AUTO-ROTATE TURNTABLE'}</span>
            </button>

            <div className="casa01-accordion">
              <button className="casa01-section-head" onClick={() => toggleSection('building')}><span>⌂ &nbsp; BUILDING &amp; FLOOR VIEWS</span><span>{openSection === 'building' ? '⌄' : '›'}</span></button>
              {openSection === 'building' && (
                <div className="casa01-section-body casa01-grid-2">
                  <button className={buildingActive('exterior') ? 'is-active' : ''} onClick={() => setBuilding('exterior')}>⌂ &nbsp; EXTERIOR</button>
                  <button className={buildingActive('dollhouse') ? 'is-active' : ''} onClick={() => setBuilding('dollhouse')}>◇ &nbsp; 3D DOLLHOUSE</button>
                  <button className={buildingActive('ground') ? 'is-active' : ''} onClick={() => setBuilding('ground')}>PLANTA BAJA<br/><small>(+0.0M)</small></button>
                  <button className={buildingActive('level1') ? 'is-active' : ''} onClick={() => setBuilding('level1')}>PRIMERA PLANTA<br/><small>(+3.2M)</small></button>
                  <button className={buildingActive('loft') ? 'is-active' : ''} onClick={() => setBuilding('loft')}>PLANTA LOFT<br/><small>(+6.3M)</small></button>
                  <button className={buildingActive('roof-hide') ? 'is-active' : ''} onClick={() => setBuilding('roof-hide')}>ROOF HIDE</button>
                </div>
              )}
            </div>

            <div className="casa01-accordion">
              <button className="casa01-section-head" onClick={() => toggleSection('views')}><span>▣ &nbsp; CAMERA &amp; PERSPECTIVE PRESETS</span><span>{openSection === 'views' ? '⌄' : '›'}</span></button>
              {openSection === 'views' && (
                <div className="casa01-section-body casa01-grid-2">
                  {cameraPresets.map((preset) => <button key={preset.id} className={activePreset === preset.id ? 'is-active subtle' : ''} onClick={() => onSelectPreset(preset.id)}>{preset.label}</button>)}
                </div>
              )}
            </div>

            <div className="casa01-accordion">
              <button className="casa01-section-head" onClick={() => toggleSection('construction')}><span>✦ &nbsp; CONSTRUCTION PROGRESS ({state.constructionProgress}%)</span><span>{openSection === 'construction' ? '⌄' : '›'}</span></button>
              {openSection === 'construction' && (
                <div className="casa01-section-body casa01-slider-block">
                  <div className="casa01-progress-copy"><span>{currentStage.name}</span><strong>{state.constructionProgress}%</strong></div>
                  <input type="range" min="0" max="100" value={state.constructionProgress} onChange={(event) => onChangeState((prev) => ({ ...prev, constructionProgress: Number(event.target.value) }))}/>
                </div>
              )}
            </div>

            <div className="casa01-accordion">
              <button className="casa01-section-head" onClick={() => toggleSection('lighting')}><span>☼ &nbsp; LIGHTING ATMOSPHERE</span><span>{openSection === 'lighting' ? '⌄' : '›'}</span></button>
              {openSection === 'lighting' && (
                <div className="casa01-section-body casa01-grid-3">
                  {times.map((time) => <button key={time.id} className={state.timeOfDay === time.id ? 'is-active' : ''} onClick={() => onChangeState((prev) => ({ ...prev, timeOfDay: time.id }))}>{time.label}</button>)}
                </div>
              )}
            </div>

            <div className="casa01-accordion">
              <button className="casa01-section-head" onClick={() => toggleSection('scene')}><span>◎ &nbsp; SCENE</span><span>{openSection === 'scene' ? '⌄' : '›'}</span></button>
              {openSection === 'scene' && (
                <div className="casa01-section-body casa01-grid-2">
                  <button className={state.showLandscaping ? 'is-active' : ''} onClick={() => onChangeState((prev) => ({ ...prev, showLandscaping: !prev.showLandscaping }))}>LANDSCAPING</button>
                  <button className={state.interiorLightsOn ? 'is-active' : ''} onClick={() => onChangeState((prev) => ({ ...prev, interiorLightsOn: !prev.interiorLightsOn }))}>INTERIOR LIGHTS</button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
