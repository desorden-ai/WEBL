export const CINEMATIC_INTRO = {
  duration: 10,
  videoEndTime: 9.86,
  scrollHeightVh: 650,
  videoEndProgress: 0.78,
  depthStartProgress: 0.765,
  depthEndProgress: 0.9,
  threeStartProgress: 0.86,
  threeEndProgress: 0.985,
  interactiveStartProgress: 0.97,
  warm3DProgress: 0.58,
} as const;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const remap01 = (value: number, start: number, end: number) => {
  if (end <= start) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
};
