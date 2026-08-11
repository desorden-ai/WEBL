import { ThreeElements } from '@react-three/fiber';
import { Casa01Shell } from './Casa01Shell';
import { Casa01Interior } from './Casa01Interior';
import { Casa01Progress } from './Casa01Progress';
import { Casa01Annotations } from './Casa01Annotations';
import { Casa01ViewMode, Casa01FloorKey, TimeOfDay, RoomInfo } from '@/data/casa01Canonical';

type Props = ThreeElements['group'] & {
  progress: number;
  viewMode: Casa01ViewMode;
  floorIsolation?: Casa01FloorKey | null;
  timeOfDay?: TimeOfDay;
  showDimensions?: boolean;
  showRoomLabels?: boolean;
  isCleanView?: boolean;
  onSelectRoom?: (room: RoomInfo) => void;
};

export function Casa01House({
  progress,
  viewMode,
  floorIsolation = null,
  timeOfDay = 'day',
  showDimensions = false,
  showRoomLabels = false,
  isCleanView = false,
  onSelectRoom,
  ...props
}: Props) {
  // Determine if interior should be rendered based on progress (85%+ finished)
  const showInterior = progress >= 85;

  return (
    <group {...props} name="Casa01House">
      {/* CONSTRUCTION PROGRESS SITE ELEMENTS (0-85%) */}
      <Casa01Progress progress={progress} />

      {/* MASTER CANONICAL CASA 01 HOUSE SHELL & GEOMETRY (0-100% PROGRESSIVE ASSEMBLY) */}
      <Casa01Shell
        viewMode={viewMode}
        floorIsolation={floorIsolation}
        progress={progress}
        timeOfDay={timeOfDay}
      />

      {/* INTERIOR FURNISHINGS & SPATIAL PROGRAM (85-100%) */}
      {showInterior && (
        <Casa01Interior
          viewMode={viewMode}
          floorIsolation={floorIsolation}
          timeOfDay={timeOfDay}
        />
      )}

      {/* 3D ANNOTATIONS, DIMENSIONS & ROOM LABELS */}
      <Casa01Annotations
        showDimensions={showDimensions}
        showRoomLabels={showRoomLabels}
        floorIsolation={floorIsolation}
        onSelectRoom={onSelectRoom}
        isCleanView={isCleanView}
      />
    </group>
  );
}
