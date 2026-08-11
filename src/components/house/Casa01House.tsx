import { ThreeElements } from '@react-three/fiber';
import { Casa01Shell } from './Casa01Shell';
import { Casa01Interior } from './Casa01Interior';
import { Casa01Progress } from './Casa01Progress';
import { Casa01ViewMode, Casa01FloorKey, TimeOfDay } from '@/data/casa01Canonical';

type Props = ThreeElements['group'] & {
  progress: number;
  viewMode: Casa01ViewMode;
  floorIsolation?: Casa01FloorKey | null;
  timeOfDay?: TimeOfDay;
};

export function Casa01House({
  progress,
  viewMode,
  floorIsolation = null,
  timeOfDay = 'day',
  ...props
}: Props) {
  const showInterior = progress >= 85;

  return (
    <group {...props} name="Casa01House">
      <Casa01Progress progress={progress} />
      <Casa01Shell
        viewMode={viewMode}
        floorIsolation={floorIsolation}
        progress={progress}
        timeOfDay={timeOfDay}
      />
      {showInterior && (
        <Casa01Interior
          viewMode={viewMode}
          floorIsolation={floorIsolation}
          timeOfDay={timeOfDay}
        />
      )}
    </group>
  );
}
