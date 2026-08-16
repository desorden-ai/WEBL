export const CINEMATIC_INTRO = {
  duration: 10.005,
  fps: 24,
  totalFrames: 240,
  startFrame: 20,
  endFrame: 196,
  videoStartTime: 19 / 24,
  videoEndTime: 195 / 24,
  // Virtual gesture travel replaces native document scrolling. The value is
  // expressed in viewport-heights worth of finger/wheel travel.
  virtualTravelScreens: 4.1,
  scrollHeightVh: 100,
  videoEndProgress: 1,
  depthStartProgress: 0.765,
  depthEndProgress: 0.90,
  threeStartProgress: 0.86,
  threeInteractiveProgress: 0.965,
  controlsStartProgress: 0.94,
  prefetch3DProgress: 0.42,
  mount3DProgress: 0.90,
  assets: {
    video: 'cinematic/intro/intro-scroll-720.mp4',
    posterStart: 'cinematic/intro/poster-start.webp',
    posterEnd: 'cinematic/intro/poster-end.webp',
    finalClean: 'cinematic/intro/transition/final-clean.webp',
    depth: 'cinematic/intro/transition/final-depth.png',
    foreground: 'cinematic/intro/transition/layer-foreground.webp',
    house: 'cinematic/intro/transition/layer-house.webp',
    midground: 'cinematic/intro/transition/layer-midground.webp',
    background: 'cinematic/intro/transition/layer-background.webp',
  },
  parallaxPx: {
    foreground: 12,
    house: 5,
    midground: 2.5,
    background: 1,
  },
} as const;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const cinematicAsset = (relativePath: string) =>
  `${import.meta.env.BASE_URL}${relativePath}`;
