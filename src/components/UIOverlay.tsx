import React, { useState } from 'react';
import { HouseState, ViewMode, FloorLevel, TimeOfDay, CameraPreset, STAGES } from '../types';

interface UIOverlayProps {
  state: HouseState;
  onChangeState: (updater: (prev: HouseState) => HouseState) => void;
  activePreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
}

const viewModes: { id: ViewMode; label: string }[] = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'dollhouse', label: 'Dollhouse' },
  { id: 'plan', label: 'Plan' },
];

const times: { id: TimeOfDay; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'night', label: 'Night' },
];

const presets: { id: CameraPreset; label: string }[] = [
  { id: 'overview', label: 'Orbit' },
  { id: 'front', label: 'Front' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'level1_interior', label: 'L1 Living' },
  { id: 'level2_interior', label: 'L2 Suite' },
  { id: 'top_down', label: 'Top' },
];

const floors: { id: FloorLevel; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'level1', label: 'L1' },
  { id: 'level2', label: 'L2' },
  { id: 'level3', label: 'L3' },
];

export const UIOverlay: React.FC<UIOverlayProps> = ({
  state,
  onChangeState,
  activePreset,
  onSelectPreset,
}) => {
  const [showSpecs, setShowSpecs] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const currentStage = STAGES.find(
    (stage) => state.constructionProgress >= stage.minProgress && state.constructionProgress <= stage.maxProgress,
  ) || STAGES[STAGES.length - 1];

  return (
    <div className="sol-ui">
      <header className="sol-topbar">
        <div className="sol-card sol-brand-card">
          <div className="sol-logo">SOL</div>
          <div className="sol-brand-copy">
            <strong>PROJECT SOL</strong>
            <span>3D Architectural Experience</span>
          </div>
          <button className="sol-icon-button" onClick={() => setShowSpecs(true)} aria-label="Project specifications">i</button>
        </div>

        <div className="sol-card sol-segmented" aria-label="View mode">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              className={state.viewMode === mode.id ? 'is-active' : ''}
              onClick={() => onChangeState((prev) => ({ ...prev, viewMode: mode.id }))}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="sol-card sol-segmented sol-time-controls" aria-label="Lighting">
          {times.map((time) => (
            <button
              key={time.id}
              className={state.timeOfDay === time.id ? 'is-active' : ''}
              onClick={() => onChangeState((prev) => ({ ...prev, timeOfDay: time.id }))}
            >
              {time.label}
            </button>
          ))}
        </div>
      </header>

      <div className="sol-side-controls">
        <div className="sol-card sol-control-stack">
          <span className="sol-control-title">Angles</span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              className={activePreset === preset.id ? 'is-active' : ''}
              onClick={() => onSelectPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="sol-card sol-control-stack sol-toggle-stack">
          <span className="sol-control-title">Scene</span>
          <button
            className={state.hideRoof ? 'is-active' : ''}
            onClick={() => onChangeState((prev) => ({ ...prev, hideRoof: !prev.hideRoof }))}
          >
            {state.hideRoof ? 'Roof off' : 'Roof'}
          </button>
          <button
            className={state.showLandscaping ? 'is-active' : ''}
            onClick={() => onChangeState((prev) => ({ ...prev, showLandscaping: !prev.showLandscaping }))}
          >
            Trees
          </button>
          <button
            className={state.interiorLightsOn ? 'is-active' : ''}
            onClick={() => onChangeState((prev) => ({ ...prev, interiorLightsOn: !prev.interiorLightsOn }))}
          >
            Lights
          </button>
          <button
            className={state.autoRotate ? 'is-active' : ''}
            onClick={() => onChangeState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}
          >
            Rotate
          </button>
        </div>
      </div>

      <section className={`sol-bottom-panel ${collapsed ? 'is-collapsed' : ''}`}>
        <div className="sol-panel-head">
          <div>
            <span className="sol-kicker">Construction timeline</span>
            <strong>{currentStage.name}</strong>
          </div>
          <div className="sol-panel-head-actions">
            <span className="sol-progress-number">{state.constructionProgress}%</span>
            <button className="sol-icon-button" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle controls">
              {collapsed ? '+' : '−'}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="sol-panel-body">
            <input
              className="sol-progress-slider"
              type="range"
              min="0"
              max="100"
              value={state.constructionProgress}
              onChange={(event) => onChangeState((prev) => ({ ...prev, constructionProgress: Number(event.target.value) }))}
              aria-label="Construction progress"
            />
            <p className="sol-stage-description">{currentStage.description}</p>
            <div className="sol-floor-row">
              <span>Floor</span>
              <div className="sol-segmented sol-floor-buttons">
                {floors.map((floor) => (
                  <button
                    key={floor.id}
                    className={state.activeFloor === floor.id ? 'is-active' : ''}
                    onClick={() => onChangeState((prev) => ({ ...prev, activeFloor: floor.id }))}
                  >
                    {floor.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {showSpecs && (
        <div className="sol-modal-backdrop" role="dialog" aria-modal="true" aria-label="Project specifications">
          <div className="sol-modal">
            <button className="sol-modal-close" onClick={() => setShowSpecs(false)} aria-label="Close">×</button>
            <div className="sol-modal-title"><div className="sol-logo">SOL</div><div><strong>Project SOL</strong><span>Studio architectural preview</span></div></div>
            <div className="sol-spec-block">
              <span>Envelope</span>
              <p>7.5 m × 11.5 m footprint, three visual levels, pitched dark zinc roof and charcoal façade.</p>
            </div>
            <div className="sol-spec-block">
              <span>Interior</span>
              <p>Walnut floors, open kitchen/living area, master suite, bathroom and loft study.</p>
            </div>
            <div className="sol-spec-block">
              <span>Outdoor</span>
              <p>Timber terrace, fire pit, planter beds and simplified 3D landscaping.</p>
            </div>
            <button className="sol-primary-button" onClick={() => setShowSpecs(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
