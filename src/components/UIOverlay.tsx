import React, { useState } from 'react';
import {
  Building2,
  Home,
  Grid,
  Sun,
  Sunset,
  Moon,
  Eye,
  EyeOff,
  Trees,
  Lightbulb,
  RotateCw,
  Camera,
  Layers,
  Sliders,
  Info,
  Download,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { HouseState, ViewMode, FloorLevel, TimeOfDay, CameraPreset, STAGES } from '../types';

interface UIOverlayProps {
  state: HouseState;
  onChangeState: (updater: (prev: HouseState) => HouseState) => void;
  activePreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  onDownloadZip: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  state,
  onChangeState,
  activePreset,
  onSelectPreset,
  onDownloadZip,
}) => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const currentStage = STAGES.find(
    (s) => state.constructionProgress >= s.minProgress && state.constructionProgress <= s.maxProgress
  ) || STAGES[4];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none font-sans text-white">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">SOL</div>
            <div>
              <h1 className="text-xs font-bold tracking-wider uppercase text-slate-100">Project SOL</h1>
              <p className="text-[10px] text-amber-400 font-medium">3D Architectural Experience</p>
            </div>
          </div>
          <button onClick={() => setShowSpecsModal(true)} className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors" title="Architectural Specifications">
            <Info size={16} />
          </button>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center justify-center gap-1">
          {[
            { id: 'exterior', label: 'Exterior', icon: Building2 },
            { id: 'dollhouse', label: 'Dollhouse', icon: Home },
            { id: 'plan', label: 'Floor Plan', icon: Grid },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = state.viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onChangeState((prev) => ({ ...prev, viewMode: mode.id as ViewMode }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
              >
                <Icon size={14} /><span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center justify-center gap-1 self-end sm:self-auto">
          {[
            { id: 'day', icon: Sun, label: 'Day' },
            { id: 'sunset', icon: Sunset, label: 'Sunset' },
            { id: 'night', icon: Moon, label: 'Night' },
          ].map((tod) => {
            const Icon = tod.icon;
            const isActive = state.timeOfDay === tod.id;
            return (
              <button
                key={tod.id}
                onClick={() => onChangeState((prev) => ({ ...prev, timeOfDay: tod.id as TimeOfDay }))}
                className={`p-2 rounded-xl transition-all ${isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
                title={tod.label}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-end gap-2 pointer-events-none my-auto">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Angles</span>
          {[
            { id: 'overview', label: '3D Orbit' },
            { id: 'front', label: 'Front Facade' },
            { id: 'balcony', label: 'Balcony' },
            { id: 'level1_interior', label: 'L1 Living' },
            { id: 'level2_interior', label: 'L2 Suite' },
            { id: 'top_down', label: 'Top Down' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id as CameraPreset)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] text-left font-medium transition-all flex items-center gap-1.5 ${activePreset === p.id ? 'bg-slate-700 text-amber-400 font-semibold border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}`}
            >
              <Camera size={12} /><span>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Toggles</span>
          <button
            onClick={() => onChangeState((prev) => ({ ...prev, hideRoof: !prev.hideRoof }))}
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${state.hideRoof ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Hide / Show Roof"
          >
            {state.hideRoof ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline">{state.hideRoof ? 'Roof Hidden' : 'Show Roof'}</span>
          </button>
          <button
            onClick={() => onChangeState((prev) => ({ ...prev, showLandscaping: !prev.showLandscaping }))}
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${state.showLandscaping ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Toggle Landscaping Trees"
          >
            <Trees size={16} /><span className="hidden sm:inline">Trees & Landscaping</span>
          </button>
          <button
            onClick={() => onChangeState((prev) => ({ ...prev, interiorLightsOn: !prev.interiorLightsOn }))}
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${state.interiorLightsOn ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Toggle Interior Lights"
          >
            <Lightbulb size={16} /><span className="hidden sm:inline">Interior Warm Lights</span>
          </button>
          <button
            onClick={() => onChangeState((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}
            className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${state.autoRotate ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-300 hover:bg-slate-800'}`}
            title="Toggle Auto Turntable Rotation"
          >
            <RotateCw size={16} /><span className="hidden sm:inline">Turntable</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden transition-all duration-300">
        <div className="p-3 bg-slate-950/60 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Construction Timeline & Floor Controls</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDownloadZip} className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-colors">
              <Download size={12} /><span>Export ZIP</span>
            </button>
            <button onClick={() => setPanelCollapsed(!panelCollapsed)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              {panelCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {!panelCollapsed && (
          <div className="p-3 sm:p-4 space-y-3.5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-slate-300">Stage: <strong className="text-amber-400">{currentStage.name}</strong></span>
                <span className="text-xs font-mono text-slate-400 font-bold">{state.constructionProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={state.constructionProgress}
                onChange={(e) => onChangeState((prev) => ({ ...prev, constructionProgress: parseInt(e.target.value, 10) }))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1 italic">{currentStage.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Layers size={14} className="text-amber-400" />Floor Isolation:</span>
              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'All Levels' },
                  { id: 'level1', label: 'L1 Ground' },
                  { id: 'level2', label: 'L2 Suite' },
                  { id: 'level3', label: 'L3 Loft' },
                ].map((fl) => {
                  const isActive = state.activeFloor === fl.id;
                  return (
                    <button
                      key={fl.id}
                      onClick={() => onChangeState((prev) => ({ ...prev, activeFloor: fl.id as FloorLevel }))}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                      {fl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showSpecsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowSpecsModal(false)} className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"><X size={18} /></button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center">SOL</div>
              <div><h3 className="text-lg font-bold text-white">Project SOL Architectural Brief</h3><p className="text-xs text-amber-400">Mobile-First 3D Visualization Model V3</p></div>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Building Envelope & Geometry</h4>
                <p>• <strong>Footprint:</strong> 7.5m (Width) × 11.5m (Depth) × 11.2m (Gable Peak Height)</p>
                <p>• <strong>Structure:</strong> Black steel frame columns, reinforced ground footings, structural floor slabs</p>
                <p>• <strong>Façade Cladding:</strong> Matte charcoal vertical-seam metal panels with matching black trims</p>
                <p>• <strong>Gable Transom Roof:</strong> Pitched zinc roof with floor-to-ceiling angled transom glass windows</p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Interior Zoning & Materials</h4>
                <p>• <strong>Flooring:</strong> Dark walnut parquet floorboards throughout all levels</p>
                <p>• <strong>Ground Level (L1):</strong> Gourmet kitchen with under-cabinet LED lights, 6-person dining, grey L-sofa lounge, powder room</p>
                <p>• <strong>Suite Level (L2):</strong> Master bedroom with king bed, nightstand warm lamps, luxury slate bathroom with glass shower</p>
                <p>• <strong>Loft Level (L3):</strong> Vaulted study lounge, executive desk, reading armchair & bookshelf</p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Terrace & Landscaping</h4>
                <p>• Outdoor warm timber deck with sunken fire pit & lounge seating</p>
                <p>• Raised charcoal planter boxes with lush deciduous and evergreen pine trees</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowSpecsModal(false)} className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">Close Brief</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
