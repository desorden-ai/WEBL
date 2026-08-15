import * as THREE from 'three';

export interface SolarLightingState {
  hour: number; // 0.0 - 24.0
  formattedTime: string;
  timeLabel: string;
  skyColor: THREE.Color;
  zenithColor: THREE.Color;
  horizonColor: THREE.Color;
  groundColor: THREE.Color;
  starOpacity: number;
  sunDiscGlow: number;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPosition: THREE.Vector3;
  isNight: boolean;
  shadowOpacity: number;
}

interface SunKeyframe {
  hour: number;
  label: string;
  sky: string;
  zenith: string;
  horizon: string;
  ground: string;
  starOpacity: number;
  sunDiscGlow: number;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambColor: string;
  ambInt: number;
  sunColor: string;
  sunInt: number;
  sunElevation: number; // in degrees
  sunAzimuth: number;   // in degrees
}

const SOLAR_KEYFRAMES: SunKeyframe[] = [
  {
    hour: 0,
    label: 'Medianoche',
    sky: '#020409',
    zenith: '#02040a',
    horizon: '#070e1b',
    ground: '#030508',
    starOpacity: 1.0,
    sunDiscGlow: 0.1,
    fog: '#04070e',
    fogNear: 18,
    fogFar: 75,
    ambColor: '#0c1622',
    ambInt: 0.7,
    sunColor: '#4f7194',
    sunInt: 0.35,
    sunElevation: 40,
    sunAzimuth: 190,
  },
  {
    hour: 5.3,
    label: 'Alba (Primeras luces)',
    sky: '#101433',
    zenith: '#0f122c',
    horizon: '#3b2347',
    ground: '#191522',
    starOpacity: 0.6,
    sunDiscGlow: 0.3,
    fog: '#241a2e',
    fogNear: 20,
    fogFar: 78,
    ambColor: '#2b233a',
    ambInt: 0.8,
    sunColor: '#e07a6a',
    sunInt: 0.6,
    sunElevation: 2,
    sunAzimuth: 75,
  },
  {
    hour: 6.8,
    label: 'Amanecer dorado',
    sky: '#c75932',
    zenith: '#244a78',
    horizon: '#f06a35',
    ground: '#5c2720',
    starOpacity: 0.0,
    sunDiscGlow: 1.2,
    fog: '#ad4f32',
    fogNear: 24,
    fogFar: 85,
    ambColor: '#5c3931',
    ambInt: 1.25,
    sunColor: '#ffa35c',
    sunInt: 2.2,
    sunElevation: 12,
    sunAzimuth: 85,
  },
  {
    hour: 9.2,
    label: 'Mañana luminosa',
    sky: '#549de8',
    zenith: '#256ec7',
    horizon: '#7fc4fd',
    ground: '#95c5e8',
    starOpacity: 0.0,
    sunDiscGlow: 1.0,
    fog: '#7ab3dc',
    fogNear: 28,
    fogFar: 95,
    ambColor: '#e2edfa',
    ambInt: 1.6,
    sunColor: '#fff5de',
    sunInt: 2.1,
    sunElevation: 35,
    sunAzimuth: 115,
  },
  {
    hour: 13.0,
    label: 'Mediodía Solar',
    sky: '#3077e6',
    zenith: '#1a5bb8',
    horizon: '#85c7ff',
    ground: '#bce3ff',
    starOpacity: 0.0,
    sunDiscGlow: 1.0,
    fog: '#7bb9e2',
    fogNear: 30,
    fogFar: 100,
    ambColor: '#ffffff',
    ambInt: 1.85,
    sunColor: '#fffae8',
    sunInt: 2.3,
    sunElevation: 68,
    sunAzimuth: 180,
  },
  {
    hour: 16.5,
    label: 'Tarde cálida',
    sky: '#478cdb',
    zenith: '#2d69b3',
    horizon: '#ffbe7b',
    ground: '#ba9173',
    starOpacity: 0.0,
    sunDiscGlow: 1.1,
    fog: '#8db7db',
    fogNear: 27,
    fogFar: 92,
    ambColor: '#f2dfcf',
    ambInt: 1.5,
    sunColor: '#ffb969',
    sunInt: 2.1,
    sunElevation: 38,
    sunAzimuth: 235,
  },
  {
    hour: 18.5,
    label: 'Hora Dorada / Ocaso',
    sky: '#db5627',
    zenith: '#202c63',
    horizon: '#f25822',
    ground: '#63251a',
    starOpacity: 0.0,
    sunDiscGlow: 1.6,
    fog: '#be4e35',
    fogNear: 22,
    fogFar: 85,
    ambColor: '#6a3c3b',
    ambInt: 1.3,
    sunColor: '#ff6e2b',
    sunInt: 2.6,
    sunElevation: 8,
    sunAzimuth: 275,
  },
  {
    hour: 19.8,
    label: 'Crepúsculo Azul',
    sky: '#141838',
    zenith: '#10153d',
    horizon: '#6a2e66',
    ground: '#241830',
    starOpacity: 0.35,
    sunDiscGlow: 0.5,
    fog: '#151733',
    fogNear: 20,
    fogFar: 80,
    ambColor: '#1a2238',
    ambInt: 0.9,
    sunColor: '#7b72ba',
    sunInt: 0.7,
    sunElevation: -4,
    sunAzimuth: 295,
  },
  {
    hour: 21.5,
    label: 'Noche Cerrada',
    sky: '#03080d',
    zenith: '#030612',
    horizon: '#0b172a',
    ground: '#040812',
    starOpacity: 0.95,
    sunDiscGlow: 0.1,
    fog: '#050a10',
    fogNear: 18,
    fogFar: 75,
    ambColor: '#121e2b',
    ambInt: 0.8,
    sunColor: '#6688aa',
    sunInt: 0.45,
    sunElevation: 30,
    sunAzimuth: 160,
  },
  {
    hour: 24,
    label: 'Medianoche',
    sky: '#020409',
    zenith: '#02040a',
    horizon: '#070e1b',
    ground: '#030508',
    starOpacity: 1.0,
    sunDiscGlow: 0.1,
    fog: '#04070e',
    fogNear: 18,
    fogFar: 75,
    ambColor: '#0c1622',
    ambInt: 0.7,
    sunColor: '#4f7194',
    sunInt: 0.35,
    sunElevation: 40,
    sunAzimuth: 190,
  },
];

export function formatHourToString(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const h = Math.floor(normalized);
  const m = Math.floor((normalized - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function computeSolarLighting(hour: number): SolarLightingState {
  const clampedHour = Math.max(0, Math.min(24, hour));

  // Find adjacent keyframes
  let idx = 0;
  for (let i = 0; i < SOLAR_KEYFRAMES.length - 1; i++) {
    if (clampedHour >= SOLAR_KEYFRAMES[i].hour && clampedHour <= SOLAR_KEYFRAMES[i + 1].hour) {
      idx = i;
      break;
    }
  }

  const k1 = SOLAR_KEYFRAMES[idx];
  const k2 = SOLAR_KEYFRAMES[idx + 1];
  const span = k2.hour - k1.hour;
  const t = span === 0 ? 0 : (clampedHour - k1.hour) / span;

  // Cosine smooth interpolation factor for natural atmospheric blending
  const smoothT = (1 - Math.cos(t * Math.PI)) * 0.5;

  const skyColor = new THREE.Color(k1.sky).lerp(new THREE.Color(k2.sky), smoothT);
  const zenithColor = new THREE.Color(k1.zenith).lerp(new THREE.Color(k2.zenith), smoothT);
  const horizonColor = new THREE.Color(k1.horizon).lerp(new THREE.Color(k2.horizon), smoothT);
  const groundColor = new THREE.Color(k1.ground).lerp(new THREE.Color(k2.ground), smoothT);

  const starOpacity = k1.starOpacity + (k2.starOpacity - k1.starOpacity) * smoothT;
  const sunDiscGlow = k1.sunDiscGlow + (k2.sunDiscGlow - k1.sunDiscGlow) * smoothT;

  const fogColor = new THREE.Color(k1.fog).lerp(new THREE.Color(k2.fog), smoothT);
  const fogNear = k1.fogNear + (k2.fogNear - k1.fogNear) * smoothT;
  const fogFar = k1.fogFar + (k2.fogFar - k1.fogFar) * smoothT;

  const ambientColor = new THREE.Color(k1.ambColor).lerp(new THREE.Color(k2.ambColor), smoothT);
  const ambientIntensity = k1.ambInt + (k2.ambInt - k1.ambInt) * smoothT;

  const sunColor = new THREE.Color(k1.sunColor).lerp(new THREE.Color(k2.sunColor), smoothT);
  const sunIntensity = k1.sunInt + (k2.sunInt - k1.sunInt) * smoothT;

  // Calculate sun position in 3D space from spherical coords (Elevation & Azimuth)
  const elev = k1.sunElevation + (k2.sunElevation - k1.sunElevation) * smoothT;
  const azim = k1.sunAzimuth + (k2.sunAzimuth - k1.sunAzimuth) * smoothT;

  const phi = THREE.MathUtils.degToRad(90 - Math.max(2, elev));
  const theta = THREE.MathUtils.degToRad(azim);
  const radius = 40;

  const sunPosition = new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    Math.max(1.5, radius * Math.cos(phi)),
    radius * Math.sin(phi) * Math.cos(theta)
  );

  const isNight = clampedHour < 5.6 || clampedHour > 20.2;
  const shadowOpacity = isNight ? 0.3 : 0.8;

  return {
    hour: clampedHour,
    formattedTime: formatHourToString(clampedHour),
    timeLabel: t < 0.5 ? k1.label : k2.label,
    skyColor,
    zenithColor,
    horizonColor,
    groundColor,
    starOpacity,
    sunDiscGlow,
    fogColor,
    fogNear,
    fogFar,
    ambientColor,
    ambientIntensity,
    sunColor,
    sunIntensity,
    sunPosition,
    isNight,
    shadowOpacity,
  };
}
