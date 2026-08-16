import React from 'react';
import { PlayCircle, ArrowRight } from 'lucide-react';

interface UnlockModalProps {
  isUnlocked: boolean;
  onUnlock: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ isUnlocked, onUnlock }) => {
  if (isUnlocked) return null;

  return (
    <div
      id="unlock-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 transition-opacity duration-500 animate-in fade-in"
    >
      <div className="max-w-sm w-full glass-panel p-8 rounded-3xl shadow-2xl text-center border border-emerald-500/30">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-inner">
          <PlayCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Mansión Refugio</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Inicia la experiencia interactiva por desplazamiento fotograma a fotograma con audio y efectos ambientales.
        </p>
        <button
          id="btn-start-experience"
          onClick={onUnlock}
          className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <span>Iniciar Recorrido</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
