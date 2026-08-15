export type EnvironmentId = 'day' | 'sunset' | 'night';

export type CameraViewId = 'general' | 'interior' | 'livingCorner' | 'lateral' | 'lowAngle';

export type VisualFilterId = 'normal' | 'cinematic-bw' | 'sepia' | 'vibrant';

export interface FreeWalkState {
  enabled: boolean;
  position: { x: number; y: number; z: number };
  zoneName: string;
}

export interface InteractiveElementData {
  id: string;
  name: string;
  category: 'arquitectura' | 'interior' | 'paisaje' | 'material' | 'estructura';
  description: string;
  targetView?: CameraViewId;
  hint?: string;
  color?: string;
  icon?: string;
}

export interface CrosshairTargetInfo {
  element: InteractiveElementData;
  distance: number; // Distance in meters from camera to 3D point
  point3D: { x: number; y: number; z: number };
  screenPos: { x: number; y: number };
}

export interface VisualFilterConfig {
  id: VisualFilterId;
  name: string;
  shortName: string;
  cssFilter: string;
  icon: string;
  description: string;
}

export interface CameraViewConfig {
  id: CameraViewId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  pos: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
}

export interface EnvironmentConfig {
  id: EnvironmentId;
  name: string;
  icon: string;
  hour: number; // reference hour
  bg: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambColor: string;
  ambInt: number;
  dirColor: string;
  dirInt: number;
  dirX: number;
  dirY: number;
  dirZ: number;
}
