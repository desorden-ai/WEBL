import React from 'react';
import { MousePointerClick, MoveVertical } from 'lucide-react';

interface GesturePromptProps {
  show: boolean;
}

export const GesturePrompt: React.FC<GesturePromptProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div
      id="gesture-prompt"
      className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center p-4 transition-opacity duration-700"
    >
      <div className="bg-transparent flex flex-col items-center gap-1.5 text-center text-white drop-shadow-lg">
        <div className="flex items-center justify-center text-white mb-1">
          <div className="hidden sm:block">
            <MousePointerClick className="w-6 h-6 animate-bounce" />
          </div>
          <div className="block sm:hidden">
            <MoveVertical className="w-6 h-6 animate-bounce" />
          </div>
        </div>
        <p className="font-semibold text-white text-sm sm:text-base tracking-wide uppercase">
          Desplaza para navegar
        </p>
        <p className="text-xs text-white/80 font-light max-w-xs">
          Desliza o usa la rueda para avanzar fotograma a fotograma
        </p>
      </div>
    </div>
  );
};
