export type TimeOfDay = 'DAY' | 'SUNSET' | 'NIGHT';
export type NavigationMode = 'EXPLORE' | 'CINEMATIC';

export type CameraPreset = 'OVERVIEW' | 'FACADE' | 'TERRACE' | 'GROUND';

export interface CameraPresetConfig {
  id: CameraPreset;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}
