import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { HouseState } from '../types';

interface WebGLFallbackProps {
  state: HouseState;
  onRetry: () => void;
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ state, onRetry }) => {
  return (
    <div className="relative w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-wide text-white">3D Canvas Recovery Mode</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          The 3D WebGL context paused or lost acceleration. Click below to restore high-performance rendering.
        </p>
        <div className="bg-slate-950/60 rounded-xl p-4 mb-6 border border-slate-800/80 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-400"><span>Current View:</span><span className="font-semibold text-amber-300 capitalize">{state.viewMode} Mode</span></div>
          <div className="flex justify-between text-slate-400"><span>Floor Isolated:</span><span className="font-semibold text-amber-300 capitalize">{state.activeFloor}</span></div>
          <div className="flex justify-between text-slate-400"><span>Construction Stage:</span><span className="font-semibold text-amber-300">{state.constructionProgress}% Finished</span></div>
        </div>
        <button onClick={onRetry} className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-98">
          <RefreshCw size={18} /> Reload 3D Graphics Engine
        </button>
      </div>
    </div>
  );
};
