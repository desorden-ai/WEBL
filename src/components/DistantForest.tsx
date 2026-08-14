import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface DistantForestProps {
  wireframeMode?: boolean;
}

export interface DistantTreeData {
  id: string;
  position: [number, number, number];
  height: number;
  trunkRadiusBase: number;
  bareTrunkHeight: number;
  maxCrownRadius: number;
  rotationY: number;
  tiltAngleX: number;
  tiltAngleZ: number;
  variant: number; // 0..3
  seed: number;
  distanceFromCamera: number;
}

// Deterministic PRNG
function createPRNG(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Terrain elevation matching TerrainBlockout.tsx ground slope
function getDistantGroundY(x: number, z: number): number {
  let y = -0.1 - z * 0.02 + x * 0.012;
  if (z < -25) {
    y += (-25 - z) * 0.025;
  }
  return y;
}

// Canonical Hero Camera position for depth calculations
const HERO_CAM_POS: [number, number, number] = [39, 2.8, 54];

// Generate 78 deterministic distant conifers (45m - 120m from CASA 01)
export function generateDistantTrees(): DistantTreeData[] {
  const rng = createPRNG(4004);
  const trees: DistantTreeData[] = [];

  function isTooCloseToOtherDistant(x: number, z: number): boolean {
    for (const t of trees) {
      const dist = Math.hypot(x - t.position[0], z - t.position[2]);
      if (dist < 4.2) return true;
    }
    return false;
  }

  // Distribution Zones (Total = 78 trees)
  // Region: 45m to 120m from origin [0,0,0]
  const zoneCandidates: { bounds: [number, number, number, number]; count: number }[] = [
    // Core Rear Distant Wall (45m - 80m behind CASA 01) - 32 trees
    { bounds: [-38, 38, -80, -43], count: 32 },
    // Deep Rear Distant Band (80m - 118m behind CASA 01) - 22 trees
    { bounds: [-52, 52, -118, -80], count: 22 },
    // Left Rear Flank (40m - 85m left/rear) - 12 trees
    { bounds: [-85, -38, -85, -35], count: 12 },
    // Right Rear Flank (40m - 85m right/rear) - 12 trees
    { bounds: [38, 85, -85, -35], count: 12 },
  ];

  let treeIdCount = 1;

  for (const zc of zoneCandidates) {
    let placed = 0;
    let attempts = 0;
    while (placed < zc.count && attempts < 500) {
      attempts++;
      const [minX, maxX, minZ, maxZ] = zc.bounds;
      const rx = minX + rng() * (maxX - minX);
      const rz = minZ + rng() * (maxZ - minZ);

      // Verify distance from origin is between 45m and 120m
      const distFromOrigin = Math.hypot(rx, rz);
      if (distFromOrigin < 43 || distFromOrigin > 122) continue;

      if (!isTooCloseToOtherDistant(rx, rz)) {
        // Height distribution: 18m - 30m, majority 21m - 27m
        const hRoll = rng();
        let height = 24.0;
        if (hRoll < 0.20) {
          height = 18.0 + rng() * 3.0; // 18m - 21m
        } else if (hRoll < 0.82) {
          height = 21.0 + rng() * 6.0; // 21m - 27m
        } else {
          height = 27.0 + rng() * 3.0; // 27m - 30m
        }

        const trunkRadiusBase = 0.18 + rng() * 0.06;
        const bareTrunkHeight = height * (0.32 + rng() * 0.08); // 32% - 40% bare trunk
        const maxCrownRadius = 1.10 + rng() * 0.45; // slender conifer crown 1.1m - 1.55m
        const rotationY = rng() * Math.PI * 2;
        const tiltAngleX = (rng() - 0.5) * 0.02;
        const tiltAngleZ = (rng() - 0.5) * 0.02;
        const variant = Math.floor(rng() * 4); // 4 lightweight variants
        const ry = getDistantGroundY(rx, rz);

        const distCam = Math.hypot(rx - HERO_CAM_POS[0], rz - HERO_CAM_POS[2]);

        trees.push({
          id: `distant-tree-${String(treeIdCount++).padStart(2, '0')}`,
          position: [Number(rx.toFixed(2)), Number(ry.toFixed(2)), Number(rz.toFixed(2))],
          height: Number(height.toFixed(2)),
          trunkRadiusBase: Number(trunkRadiusBase.toFixed(2)),
          bareTrunkHeight: Number(bareTrunkHeight.toFixed(2)),
          maxCrownRadius: Number(maxCrownRadius.toFixed(2)),
          rotationY: Number(rotationY.toFixed(2)),
          tiltAngleX: Number(tiltAngleX.toFixed(3)),
          tiltAngleZ: Number(tiltAngleZ.toFixed(3)),
          variant,
          seed: 4000 + treeIdCount,
          distanceFromCamera: Number(distCam.toFixed(2)),
        });
        placed++;
      }
    }
  }

  return trees;
}

export const DISTANT_TREES_DATA: DistantTreeData[] = generateDistantTrees();

// Structure for pre-calculated foliage spray instances
interface SprayInstanceData {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  color: THREE.Color;
}

export const DistantForest: React.FC<DistantForestProps> = ({ wireframeMode = false }) => {
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null!);
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null!);

  // Pre-calculate all 14-20 foliage spray instances per tree
  const { sprayInstances, totalSprays } = useMemo(() => {
    const sprays: SprayInstanceData[] = [];

    const nearFoliage = new THREE.Color('#26322d'); // Dark pine charcoal green
    const deepFoliage = new THREE.Color('#46524f'); // Dark slate green-grey

    DISTANT_TREES_DATA.forEach((tree) => {
      const treeRng = createPRNG(tree.seed);
      // 14 - 20 foliage sprays per tree for continuous slender conifer silhouette
      const numSprays = 14 + Math.floor(treeRng() * 7);

      const crownStart = tree.bareTrunkHeight;
      const crownHeight = tree.height - crownStart;

      // Distance factor from Hero camera (~90m to ~165m)
      const distCam = tree.distanceFromCamera;
      const t = Math.max(0, Math.min(1, (distCam - 90) / 75));

      // Restrained dark foliage color (never white, mint, or pale)
      const treeColor = nearFoliage.clone().lerp(deepFoliage, t);

      for (let s = 0; s < numSprays; s++) {
        // Crown progress p from 0 (bottom of foliage) to 1 (top spire)
        const p = s / (numSprays - 1);

        // Foliage distributed continuously along upper 60-68% of tree
        const foliageY = tree.position[1] + crownStart + crownHeight * (0.02 + 0.96 * p);

        // Crown radius profile: narrow start, lower-middle widest, upper taper, slender leader
        let radiusProfile = 0.4;
        if (p < 0.2) {
          radiusProfile = 0.45 + (p / 0.2) * 0.55; // 0.45 -> 1.0
        } else if (p < 0.5) {
          radiusProfile = 1.0 - (p - 0.2) * 0.25; // 1.0 -> 0.925
        } else if (p < 0.85) {
          radiusProfile = 0.925 - ((p - 0.5) / 0.35) * 0.6; // 0.925 -> 0.325
        } else {
          radiusProfile = 0.325 * Math.max(0.05, 1 - (p - 0.85) / 0.15); // 0.325 -> 0.016
        }

        const maxR = tree.maxCrownRadius * (0.85 + treeRng() * 0.3);
        const sprayRadius = Math.max(0.10, maxR * radiusProfile);

        // Radial angle with deterministic golden-ratio step + random variation to avoid shelf rows
        const angle = tree.rotationY + s * 2.39996 + (treeRng() - 0.5) * 0.7;

        // Radial offset away from trunk
        const radialOffset = sprayRadius * (0.30 + treeRng() * 0.35);
        const px = tree.position[0] + Math.cos(angle) * radialOffset;
        const pz = tree.position[2] + Math.sin(angle) * radialOffset;
        const py = foliageY;

        // Spray dimensions: elongated radially, thin vertically, tapered wedge
        const radialLen = Math.max(0.45, sprayRadius * (1.1 + treeRng() * 0.35));
        const thickness = 0.12 + treeRng() * 0.12; // thin vertically
        const tangentialWidth = Math.max(0.32, sprayRadius * (0.5 + treeRng() * 0.3));

        // Pitch down outwards (droop)
        const droopX = 0.10 + treeRng() * 0.16; // ~6 to 15 degrees droop

        sprays.push({
          position: [px, py, pz],
          scale: [radialLen, thickness, tangentialWidth],
          rotation: [
            tree.tiltAngleX + Math.sin(angle) * droopX,
            angle,
            tree.tiltAngleZ - Math.cos(angle) * droopX,
          ],
          color: treeColor,
        });
      }
    });

    return { sprayInstances: sprays, totalSprays: sprays.length };
  }, []);

  // Shared lighting-independent materials (MeshBasicMaterial prevents key light glare / pale crowns)
  const barkMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        wireframe: wireframeMode,
      }),
    [wireframeMode]
  );

  const foliageMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff', // Modulation base for instance colors
        wireframe: wireframeMode,
      }),
    [wireframeMode]
  );

  // Apply matrix and colors to instanced meshes
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const nearTrunk = new THREE.Color('#25292a');
    const deepTrunk = new THREE.Color('#343a3b');

    // 1. Trunks (78 instances)
    DISTANT_TREES_DATA.forEach((tree, idx) => {
      const distCam = tree.distanceFromCamera;
      const t = Math.max(0, Math.min(1, (distCam - 90) / 75));
      const trunkColor = nearTrunk.clone().lerp(deepTrunk, t);

      dummy.position.set(tree.position[0], tree.position[1] + tree.height / 2, tree.position[2]);
      dummy.rotation.set(tree.tiltAngleX, tree.rotationY, tree.tiltAngleZ);
      dummy.scale.set(tree.trunkRadiusBase, tree.height, tree.trunkRadiusBase);
      dummy.updateMatrix();

      if (trunkMeshRef.current) {
        trunkMeshRef.current.setMatrixAt(idx, dummy.matrix);
        trunkMeshRef.current.setColorAt(idx, trunkColor);
      }
    });

    if (trunkMeshRef.current) {
      trunkMeshRef.current.instanceMatrix.needsUpdate = true;
      if (trunkMeshRef.current.instanceColor) trunkMeshRef.current.instanceColor.needsUpdate = true;
    }

    // 2. Foliage Sprays (~1,300 instances)
    sprayInstances.forEach((spray, idx) => {
      dummy.position.set(...spray.position);
      dummy.rotation.set(...spray.rotation);
      dummy.scale.set(...spray.scale);
      dummy.updateMatrix();

      if (foliageMeshRef.current) {
        foliageMeshRef.current.setMatrixAt(idx, dummy.matrix);
        foliageMeshRef.current.setColorAt(idx, spray.color);
      }
    });

    if (foliageMeshRef.current) {
      foliageMeshRef.current.instanceMatrix.needsUpdate = true;
      if (foliageMeshRef.current.instanceColor) foliageMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [sprayInstances]);

  const numTrees = DISTANT_TREES_DATA.length;

  return (
    <group name="Distant_Forest_Phase04_FinalCorrection">
      {/* 1. Trunks InstancedMesh (4-sided cylinder) */}
      <instancedMesh
        ref={trunkMeshRef}
        args={[undefined, undefined, numTrees]}
        castShadow={false}
        receiveShadow={false}
        material={barkMaterial}
      >
        <cylinderGeometry args={[0.08, 0.45, 1.0, 4]} />
      </instancedMesh>

      {/* 2. Ultra-light Foliage Sprays InstancedMesh (shared low-poly octahedron / diamond wedge primitive) */}
      <instancedMesh
        ref={foliageMeshRef}
        args={[undefined, undefined, totalSprays]}
        castShadow={false}
        receiveShadow={false}
        material={foliageMaterial}
      >
        <octahedronGeometry args={[1.0, 0]} />
      </instancedMesh>
    </group>
  );
};
