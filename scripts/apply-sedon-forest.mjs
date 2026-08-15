import { readFile, writeFile } from 'node:fs/promises';

const file = 'src/components/Viewport3D.tsx';
const source = await readFile(file, 'utf8');
const startMarker = '    // --- 5. Pine Forest ---';
const endMarker = '    // --- 6. Atmospheric Floating Particles ---';

if (source.includes('Pine Forest — SEDON-inspired procedural instancing')) {
  console.log('SEDON forest optimization already applied.');
  process.exit(0);
}

const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Could not locate the canonical Pine Forest block.');
}

const replacement = `    // --- 5. Pine Forest — SEDON-inspired procedural instancing ---
    // The forest is described by a deterministic seed and rendered in six instanced
    // draw batches (two crossed billboards x three distance bands) instead of creating
    // hundreds of independent Group/Mesh objects. Near trees retain shadows; mid/far
    // bands rely on atmospheric depth and alpha-tested foliage.
    const nearTreeMat = new THREE.MeshStandardMaterial({
      map: realisticTreeTexture,
      transparent: true,
      alphaTest: 0.4,
      side: THREE.DoubleSide,
      roughness: 0.9,
      color: '#ffffff',
      depthWrite: true,
    });
    const midTreeMat = nearTreeMat.clone();
    const farTreeMat = nearTreeMat.clone();

    midTreeMat.transparent = false;
    midTreeMat.alphaTest = 0.42;
    midTreeMat.depthWrite = true;
    midTreeMat.color.set('#f3f7f3');

    farTreeMat.transparent = false;
    farTreeMat.alphaTest = 0.46;
    farTreeMat.depthWrite = true;
    farTreeMat.color.set('#dfe9e2');

    const planeGeo = new THREE.PlaneGeometry(6.4, 16.0);
    const totalTrees = 240;

    type ForestBand = {
      a: THREE.InstancedMesh;
      b: THREE.InstancedMesh;
      count: number;
      castsShadow: boolean;
      receivesShadow: boolean;
    };

    const createForestBand = (
      material: THREE.MeshStandardMaterial,
      castsShadow: boolean,
      receivesShadow: boolean
    ): ForestBand => ({
      a: new THREE.InstancedMesh(planeGeo, material, totalTrees),
      b: new THREE.InstancedMesh(planeGeo, material, totalTrees),
      count: 0,
      castsShadow,
      receivesShadow,
    });

    const forestBands: ForestBand[] = [
      createForestBand(nearTreeMat, true, true),
      createForestBand(midTreeMat, false, true),
      createForestBand(farTreeMat, false, false),
    ];

    // Mulberry32-style deterministic PRNG: the same compact scene description
    // always reconstructs the same forest across reloads and devices.
    let forestSeed = 0x6d2b79f5;
    const forestRandom = () => {
      forestSeed = (forestSeed + 0x6d2b79f5) | 0;
      let t = forestSeed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const treeTransform = new THREE.Object3D();

    for (let i = 0; i < totalTrees; i++) {
      const px = (forestRandom() - 0.5) * 120;
      const pz = 8.0 - forestRandom() * 98.0;

      // Preserve the architectural clearings from the original scene.
      if (px > -8.0 && px < 8.0 && pz > -5.0 && pz < 28.0) continue;
      if (px > 5.0 && px < 25.0 && pz > -5.0 && pz < 15.0) continue;

      const scale = pz < -30
        ? 1.4 + forestRandom() * 1.2
        : 0.42 + forestRandom() * 0.35;
      const rotation = forestRandom() * Math.PI;
      const terrainHeight = (pz + 20) * 0.16 + 8 * scale - 2.0;

      // Three perceptual LOD bands. The geometry stays tiny while shadows and
      // material cost fall away with distance.
      const depth = -pz;
      const bandIndex = depth < 20 ? 0 : depth < 55 ? 1 : 2;
      const band = forestBands[bandIndex];
      const instanceIndex = band.count;

      treeTransform.position.set(px, terrainHeight, pz);
      treeTransform.scale.set(scale, scale, scale);
      treeTransform.rotation.set(0, rotation, 0);
      treeTransform.updateMatrix();
      band.a.setMatrixAt(instanceIndex, treeTransform.matrix);

      treeTransform.rotation.y = rotation + Math.PI / 2;
      treeTransform.updateMatrix();
      band.b.setMatrixAt(instanceIndex, treeTransform.matrix);

      band.count += 1;
    }

    forestBands.forEach((band) => {
      for (const mesh of [band.a, band.b]) {
        mesh.count = band.count;
        mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = band.castsShadow;
        mesh.receiveShadow = band.receivesShadow;
        mesh.frustumCulled = true;
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
        scene.add(mesh);
      }
    });

`;

const next = source.slice(0, start) + replacement + source.slice(end);
await writeFile(file, next, 'utf8');
console.log('Applied deterministic instanced forest renderer to Viewport3D.tsx.');
