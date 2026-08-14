import type { HeroTreeData } from './heroTreesData';

function createRandom(seed: number) { let s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
interface FoliageSpray { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number]; colorVariant: number; }
interface SecondaryBranchlet { startPos: [number, number, number]; length: number; pitch: number; yaw: number; }
interface PrimaryBranch { id: number; y: number; azimuth: number; length: number; pitch: number; radiusBase: number; branchlets: SecondaryBranchlet[]; sprays: FoliageSpray[]; }

export function generateHeroTreeStructure(tree: HeroTreeData) {
  const { height, bareTrunkHeight, maxCrownRadius, seed, trunkRadiusBase } = tree;
  const rng = createRandom(seed);
  const crownHeight = height - bareTrunkHeight;
  const numPrimaryBranches = 54;
  const primaryBranches: PrimaryBranch[] = [];
  const stubRoots = [];
  const numStubs = 5;
  for (let s = 0; s < numStubs; s++) {
    const stubY = bareTrunkHeight * (0.28 + s * 0.14 + (rng() - 0.5) * 0.06);
    const angle = rng() * Math.PI * 2;
    const length = 0.3 + rng() * 0.45;
    stubRoots.push({ y: stubY, angle, length, pitch: -0.32 - rng() * 0.2 });
  }
  const goldenAngle = 2.399963;
  for (let i = 0; i < numPrimaryBranches; i++) {
    const progress = i / (numPrimaryBranches - 1);
    const pJitter = progress + (rng() - 0.5) * (0.8 / numPrimaryBranches);
    const pClamped = Math.max(0, Math.min(1, pJitter));
    const branchY = bareTrunkHeight + pClamped * crownHeight * 0.95;
    let profileFactor = 0;
    if (pClamped < 0.2) profileFactor = 0.65 + 0.35 * (pClamped / 0.2);
    else profileFactor = Math.pow(Math.max(0, (1.0 - pClamped) / 0.8), 0.78);
    const lengthVar = 0.75 + rng() * 0.42;
    const maxRadiusAtY = maxCrownRadius * Math.max(0.1, profileFactor);
    const branchLength = Math.max(0.35, maxRadiusAtY * lengthVar);
    const azimuth = i * goldenAngle + (rng() - 0.5) * 0.45;
    const pitch = -0.35 + pClamped * 0.47 + (rng() - 0.5) * 0.08;
    const radiusBase = Math.max(0.015, trunkRadiusBase * 0.22 * (1.0 - pClamped * 0.6));
    const numBranchlets = Math.max(2, Math.round(3.8 - pClamped * 1.5));
    const branchlets: SecondaryBranchlet[] = [];
    const sprays: FoliageSpray[] = [];
    for (let j = 0; j < numBranchlets; j++) {
      const attachP = 0.35 + (j / Math.max(1, numBranchlets - 1)) * 0.52 + (rng() - 0.5) * 0.08;
      const attachDist = branchLength * Math.min(0.92, Math.max(0.3, attachP));
      const startX = Math.cos(pitch) * attachDist;
      const startY = Math.sin(pitch) * attachDist;
      const startZ = (rng() - 0.5) * 0.04;
      const sideSign = j % 2 === 0 ? 1 : -1;
      const yaw = sideSign * (0.35 + rng() * 0.28);
      const secPitch = pitch + (rng() - 0.5) * 0.15 - 0.06;
      const secLength = branchLength * (0.28 + rng() * 0.25);
      branchlets.push({ startPos: [startX, startY, startZ], length: secLength, pitch: secPitch, yaw });
      const sprayDistX = startX + Math.cos(secPitch) * secLength * 0.85;
      const sprayDistY = startY + Math.sin(secPitch) * secLength * 0.85;
      const sprayDistZ = startZ + Math.sin(yaw) * secLength * 0.85;
      const scaleBase = Math.max(0.12, secLength * 0.7);
      sprays.push({ pos: [sprayDistX, sprayDistY, sprayDistZ], rot: [(rng() - 0.5) * 0.3, yaw + (rng() - 0.5) * 0.3, secPitch * 0.5], scale: [scaleBase * (0.8 + rng() * 0.3), scaleBase * (0.35 + rng() * 0.15), scaleBase * (1.4 + rng() * 0.5)], colorVariant: Math.floor(rng() * 3) });
    }
    const tipX = Math.cos(pitch) * branchLength;
    const tipY = Math.sin(pitch) * branchLength;
    const tipScaleBase = Math.max(0.14, branchLength * 0.22);
    sprays.push({ pos: [tipX, tipY, 0], rot: [(rng() - 0.5) * 0.2, (rng() - 0.5) * 0.3, pitch * 0.5], scale: [tipScaleBase * (0.85 + rng() * 0.3), tipScaleBase * (0.38 + rng() * 0.15), tipScaleBase * (1.5 + rng() * 0.5)], colorVariant: Math.floor(rng() * 3) });
    primaryBranches.push({ id: i, y: branchY, azimuth, length: branchLength, pitch, radiusBase, branchlets, sprays });
  }
  return { stubRoots, primaryBranches };
}
