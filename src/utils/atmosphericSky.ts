import * as THREE from 'three';
import { SolarLightingState } from './sunCalculator';

export interface AtmosphericSky {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  update: (solar: SolarLightingState, timeInSeconds: number) => void;
}

const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uGroundColor;
  uniform vec3 uSunPosition;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  uniform float uSunDiscGlow;
  uniform float uStarOpacity;
  uniform float uTime;

  varying vec3 vWorldPosition;

  // Pseudo-random 3D noise for crisp star points
  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = dir.y;

    // 1. Multi-band atmospheric gradient
    vec3 sky;
    if (h >= 0.0) {
      // Atmospheric power curve for natural horizon haze transition
      float t = pow(h, 0.42);
      sky = mix(uHorizonColor, uZenithColor, t);
    } else {
      // Sub-horizon ground mist blend
      float t = clamp(-h * 3.5, 0.0, 1.0);
      sky = mix(uHorizonColor, uGroundColor, t);
    }

    // 2. Solar radiance, Rayleigh/Mie halo & Sun Disc
    vec3 sunDir = normalize(uSunPosition);
    float cosTheta = dot(dir, sunDir);
    if (cosTheta > 0.0) {
      float wideHalo = pow(cosTheta, 4.0) * 0.32 * uSunDiscGlow;
      float tightGlow = pow(cosTheta, 28.0) * 0.9 * uSunDiscGlow;
      float sunDisc = smoothstep(0.9984, 0.9996, cosTheta) * 2.5;
      vec3 radiance = (wideHalo + tightGlow + sunDisc) * uSunColor * (uSunIntensity * 0.65);
      sky += radiance;
    }

    // 3. Night Sky Procedural Starfield & Twinkle
    if (uStarOpacity > 0.01 && h > 0.02) {
      vec3 starCoord = dir * 210.0;
      vec3 cell = floor(starCoord);
      float rnd = hash31(cell);
      if (rnd > 0.982) {
        float twinkle = sin(uTime * (1.8 + rnd * 5.0) + rnd * 6.28) * 0.5 + 0.5;
        float starBrightness = pow((rnd - 0.982) / 0.018, 1.8) * (0.35 + 0.65 * twinkle);
        float altitudeFade = smoothstep(0.04, 0.28, h);
        sky += vec3(0.92, 0.96, 1.0) * starBrightness * uStarOpacity * altitudeFade;
      }
    }

    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function createAtmosphericSky(initialSolar: SolarLightingState): AtmosphericSky {
  const uniforms = {
    uZenithColor: { value: initialSolar.zenithColor.clone() },
    uHorizonColor: { value: initialSolar.horizonColor.clone() },
    uGroundColor: { value: initialSolar.groundColor.clone() },
    uSunPosition: { value: initialSolar.sunPosition.clone() },
    uSunColor: { value: initialSolar.sunColor.clone() },
    uSunIntensity: { value: initialSolar.sunIntensity },
    uSunDiscGlow: { value: initialSolar.sunDiscGlow },
    uStarOpacity: { value: initialSolar.starOpacity },
    uTime: { value: 0.0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const geometry = new THREE.SphereGeometry(160, 36, 24);
  const mesh = new THREE.Mesh(geometry, material);

  const update = (solar: SolarLightingState, timeInSeconds: number) => {
    // Smoothly interpolate uniform values for butter-smooth time-lapse transitions
    uniforms.uZenithColor.value.lerp(solar.zenithColor, 0.08);
    uniforms.uHorizonColor.value.lerp(solar.horizonColor, 0.08);
    uniforms.uGroundColor.value.lerp(solar.groundColor, 0.08);
    uniforms.uSunPosition.value.lerp(solar.sunPosition, 0.08);
    uniforms.uSunColor.value.lerp(solar.sunColor, 0.08);

    uniforms.uSunIntensity.value += (solar.sunIntensity - uniforms.uSunIntensity.value) * 0.08;
    uniforms.uSunDiscGlow.value += (solar.sunDiscGlow - uniforms.uSunDiscGlow.value) * 0.08;
    uniforms.uStarOpacity.value += (solar.starOpacity - uniforms.uStarOpacity.value) * 0.08;
    uniforms.uTime.value = timeInSeconds;
  };

  return {
    mesh,
    material,
    update,
  };
}
