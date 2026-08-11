import { Html } from '@react-three/drei';
import { CASA01, ROOMS, RoomInfo, Casa01FloorKey } from '@/data/casa01Canonical';

type Props = {
  showDimensions: boolean;
  showRoomLabels: boolean;
  floorIsolation?: Casa01FloorKey | null;
  onSelectRoom?: (room: RoomInfo) => void;
  isCleanView?: boolean;
};

export function Casa01Annotations({
  showDimensions,
  showRoomLabels,
  floorIsolation = null,
  onSelectRoom,
  isCleanView = false,
}: Props) {
  if (isCleanView) return null;

  const width = CASA01.footprint.width;
  const depth = CASA01.footprint.depth;

  const visibleRooms = ROOMS.filter(
    (room) => !floorIsolation || room.floor === floorIsolation
  );

  return (
    <group name="Casa01Annotations">
      {/* 3D DIMENSION CALLOUTS */}
      {showDimensions && (
        <group name="DimensionLines">
          {/* Width Marker (Front Base 6.20m) */}
          <Html position={[0, -0.2, depth / 2 + 2.0]} center>
            <div className="bg-[#0a0a0a]/95 text-[#c5a059] font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm border border-[#c5a059]/40 shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></span>
              WIDTH: {width.toFixed(2)} m
            </div>
          </Html>

          {/* Depth Marker (Side Base 10.80m) */}
          <Html position={[width / 2 + 1.2, -0.2, 0]} center>
            <div className="bg-[#0a0a0a]/95 text-[#c5a059] font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm border border-[#c5a059]/40 shadow-xl whitespace-nowrap backdrop-blur-md pointer-events-none">
              DEPTH: {depth.toFixed(2)} m
            </div>
          </Html>

          {/* Ground Elevation (±0.00 m) */}
          <Html position={[-width / 2 - 1.2, 0.2, depth / 2]} center>
            <div className="bg-[#0a0a0a]/95 text-white font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-white/20 shadow-md backdrop-blur-md pointer-events-none">
              ±0.00 m Ground
            </div>
          </Html>

          {/* First Floor Elevation (+3.20 m) */}
          <Html position={[-width / 2 - 1.2, 3.2, depth / 2]} center>
            <div className="bg-[#0a0a0a]/95 text-white font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-white/20 shadow-md backdrop-blur-md pointer-events-none">
              +3.20 m Level 1
            </div>
          </Html>

          {/* Loft Floor Elevation (+6.30 m) */}
          <Html position={[-width / 2 - 1.2, 6.3, depth / 2]} center>
            <div className="bg-[#0a0a0a]/95 text-white font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-white/20 shadow-md backdrop-blur-md pointer-events-none">
              +6.30 m Loft
            </div>
          </Html>

          {/* Top High Point Roof Elevation (+10.70 m) */}
          <Html position={[-width / 2 - 1.2, 10.7, depth / 2]} center>
            <div className="bg-[#0a0a0a]/95 text-[#c5a059] font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-[#c5a059]/50 shadow-md font-bold backdrop-blur-md pointer-events-none">
              +10.70 m Roof Max
            </div>
          </Html>

          {/* Balcony Depth Callout Upper */}
          <Html position={[0, 6.7, depth / 2 + 0.7]} center>
            <div className="bg-[#0a0a0a]/95 text-[#e5e5e5] font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-white/20 backdrop-blur-md pointer-events-none">
              Upper Balcony: 1.40 m
            </div>
          </Html>

          {/* Balcony Depth Callout Middle */}
          <Html position={[-1.2, 3.6, depth / 2 + 0.65]} center>
            <div className="bg-[#0a0a0a]/95 text-[#e5e5e5] font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-white/20 backdrop-blur-md pointer-events-none">
              Middle Balcony: 1.30 m
            </div>
          </Html>
        </group>
      )}

      {/* ROOM INTERACTIVE DOT MARKERS */}
      {showRoomLabels && (
        <group name="RoomLabels">
          {visibleRooms.map((room) => (
            <Html key={room.id} position={room.position} center>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRoom?.(room);
                }}
                className="group relative flex items-center justify-center w-6 h-6 rounded-full bg-[#0a0a0a]/90 border border-[#c5a059]/60 hover:border-[#c5a059] hover:bg-[#c5a059] shadow-xl transition-all duration-200 transform hover:scale-125 focus:outline-none backdrop-blur-sm cursor-pointer"
                title={`${room.name} (${room.floorName})`}
              >
                <span className="w-2 h-2 rounded-full bg-[#c5a059] group-hover:bg-black animate-ping absolute opacity-75"></span>
                <span className="w-2 h-2 rounded-full bg-[#c5a059] group-hover:bg-black relative"></span>
              </button>
            </Html>
          ))}
        </group>
      )}
    </group>
  );
}
