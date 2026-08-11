import { X, MapPin, Compass } from 'lucide-react';
import { RoomInfo } from '@/data/casa01Canonical';

type Props = {
  room: RoomInfo | null;
  onClose: () => void;
  onFocusRoom: (room: RoomInfo) => void;
  isCleanView?: boolean;
};

export function Casa01RoomDetail({ room, onClose, onFocusRoom, isCleanView = false }: Props) {
  if (!room || isCleanView) return null;

  return (
    <>
      {/* TRANSPARENT BACKDROP FOR EASILY TAPPING OUTSIDE TO DESELECT ROOM */}
      <div
        className="fixed inset-0 z-20 cursor-default"
        onClick={onClose}
      />

      {/* COMPACT FLOATING ROOM CARD */}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:top-16 sm:bottom-auto z-30 w-80 max-w-[calc(100vw-2rem)] bg-[#0a0a0a]/95 border border-[#c5a059]/40 rounded-sm p-4 shadow-2xl text-[#e5e5e5] backdrop-blur-md animate-in fade-in slide-in-from-bottom sm:slide-in-from-right duration-200">
        <div className="flex items-start justify-between border-b border-white/10 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0a0a0a] text-[#c5a059] border border-[#c5a059]/40 rounded-xs">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white">{room.name}</h3>
              <p className="text-[9px] text-[#c5a059] font-medium tracking-wider uppercase">{room.floorName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#737373] hover:text-white hover:bg-white/10 transition-colors rounded-xs cursor-pointer"
            title="Close Room Info"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-[#e5e5e5]">
          <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 border border-white/5 rounded-xs">
            <span className="text-[9px] uppercase tracking-widest text-[#737373]">Dimensions:</span>
            <span className="font-mono text-[#c5a059] font-bold text-[11px]">{room.dimensions}</span>
          </div>

          <p className="text-[#a3a3a3] font-light leading-relaxed bg-white/5 p-2.5 border border-white/5 text-[10px] rounded-xs">
            {room.description}
          </p>

          <button
            onClick={() => onFocusRoom(room)}
            className="w-full py-2 bg-[#c5a059] hover:bg-[#d4af37] text-black font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-colors shadow-lg rounded-xs cursor-pointer active:scale-98"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Fly Camera to Room</span>
          </button>
        </div>
      </div>
    </>
  );
}
