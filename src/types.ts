export interface CameraPreset {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface StudioSettings {
  showGrid: boolean;
  showAxes: boolean;
  wireframeMode: boolean;
  enableFog: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  sunPosition: [number, number, number];
}
