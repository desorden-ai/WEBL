export interface HeroTreeData {
  id: string;
  position: [number, number, number];
  height: number;
  trunkRadiusBase: number;
  bareTrunkHeight: number;
  maxCrownRadius: number;
  rotationY: number;
  tiltAngleX?: number;
  tiltAngleZ?: number;
  seed: number;
}

// Exactly 7 Hero Conifers (Phase 02 - Final Refinement)
// Positions & Heights strictly locked per instruction
export const HERO_TREES_DATA: HeroTreeData[] = [
  { id: 'hero-tree-01-fg-left-frame', position: [17.0, 0.0, 30.0], height: 28.5, trunkRadiusBase: 0.24, bareTrunkHeight: 10.0, maxCrownRadius: 2.2, rotationY: 0.45, tiltAngleX: 0.012, tiltAngleZ: -0.01, seed: 101 },
  { id: 'hero-tree-02-fg-right-frame', position: [24.0, 0.0, 25.0], height: 29.5, trunkRadiusBase: 0.25, bareTrunkHeight: 10.5, maxCrownRadius: 2.3, rotationY: 1.2, tiltAngleX: -0.01, tiltAngleZ: 0.015, seed: 202 },
  { id: 'hero-tree-03-mid-left-flank', position: [-13.0, 0.0, 15.0], height: 24.0, trunkRadiusBase: 0.24, bareTrunkHeight: 8.2, maxCrownRadius: 2.0, rotationY: 2.3, tiltAngleX: 0.01, seed: 303 },
  { id: 'hero-tree-04-mid-right-flank', position: [15.0, 0.0, 9.0], height: 25.0, trunkRadiusBase: 0.25, bareTrunkHeight: 8.8, maxCrownRadius: 2.1, rotationY: 3.8, tiltAngleZ: -0.012, seed: 404 },
  { id: 'hero-tree-05-rear-left-bg', position: [-9.0, 0.0, -9.0], height: 26.5, trunkRadiusBase: 0.26, bareTrunkHeight: 9.2, maxCrownRadius: 2.1, rotationY: 0.85, seed: 505 },
  { id: 'hero-tree-06-rear-right-bg', position: [11.0, 0.0, -11.0], height: 27.5, trunkRadiusBase: 0.27, bareTrunkHeight: 9.6, maxCrownRadius: 2.2, rotationY: 1.9, seed: 606 },
  { id: 'hero-tree-07-rear-deep-center-bg', position: [-2.5, 0.0, -18.0], height: 30.0, trunkRadiusBase: 0.28, bareTrunkHeight: 11.0, maxCrownRadius: 2.4, rotationY: 2.75, seed: 707 },
];
