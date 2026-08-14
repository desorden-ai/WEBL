export type HeroCameraPreset = {
  id: 'A' | 'B';
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  status: 'scaffold';
};

export const HERO_CAMERA_PRESETS: Record<'A' | 'B', HeroCameraPreset> = {
  A: {
    id: 'A',
    position: [18, 4.5, 28],
    target: [0, 2, 0],
    fov: 36,
    status: 'scaffold',
  },
  B: {
    id: 'B',
    position: [14, 4.2, 22],
    target: [0, 2, 0],
    fov: 36,
    status: 'scaffold',
  },
};
