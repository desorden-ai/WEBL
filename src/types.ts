export interface Chapter {
  id: string;
  title: string;
  progress: number;
  iconName: 'compass' | 'building' | 'door-open' | 'sun';
}

export type GraphicsQuality = 'low' | 'medium' | 'high';

export type LightingMode = 'golden_hour' | 'cinematic' | 'noon' | 'twilight' | 'overcast' | 'night_vision';

export interface AtmosphereConfig {
  fogDensity: number;       // 0.0 to 2.0 (default: 1.0)
  lightIntensity: number;   // 0.0 to 2.0 (default: 1.0)
  particleDensity: number;  // 0.0 to 2.0 (default: 1.0)
  sunGlow: number;          // 0.0 to 2.0 (default: 1.0)
  lightingMode: LightingMode;
  timeOfDayEnabled: boolean; // Dynamic automated day/night cycle
  timeOfDayProgress: number; // 0.0 (Dawn) -> 0.25 (Noon) -> 0.5 (Golden Hour) -> 0.75 (Twilight) -> 1.0
  timeOfDaySpeed: number;    // Cycle speed multiplier (e.g. 1.0 = ~60s cycle)
  tvStaticEnabled?: boolean; // Metraje encontrado / Vintage TV static & chromatic noise
  tvStaticIntensity?: number; // 0.0 to 1.0 intensity of static
  bokehEnabled?: boolean;    // Dynamic Bokeh & wide-aperture depth-of-field
  bokehIntensity?: number;   // 0.0 to 2.0 intensity of bokeh blur
}
