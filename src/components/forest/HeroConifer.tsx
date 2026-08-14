import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSolPbrTextures } from '../../materials/useSolPbrTextures';
import type { HeroTreeData } from './heroTreesData';
import { generateHeroTreeStructure } from './heroTreeStructure';

export const HeroConifer: React.FC<{ tree: HeroTreeData; wireframeMode: boolean }> = ({ tree, wireframeMode }) => {
  const { position, height, trunkRadiusBase, bareTrunkHeight, maxCrownRadius, rotationY, tiltAngleX = 0, tiltAngleZ = 0, seed } = tree;
  const barkPbr = useSolPbrTextures('03_conifer_bark', { repeat: [2.0, 6.0], enableNormal: true });
  const barkNormalScale = useMemo(() => new THREE.Vector2(0.18, 0.18), []);
  const barkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ map: barkPbr.map, normalMap: barkPbr.normalMap, normalScale: barkNormalScale, roughnessMap: barkPbr.roughnessMap, roughness: 0.78, metalness: 0, wireframe: wireframeMode }), [barkPbr.map, barkPbr.normalMap, barkPbr.roughnessMap, barkNormalScale, wireframeMode]);
  const branchMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f1914', roughness: 0.92, metalness: 0, wireframe: wireframeMode }), [wireframeMode]);
  const foliageDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15271d', roughness: 0.88, metalness: 0, wireframe: wireframeMode }), [wireframeMode]);
  const foliageMidMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a3022', roughness: 0.85, metalness: 0, wireframe: wireframeMode }), [wireframeMode]);
  const foliageHighlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#203828', roughness: 0.82, metalness: 0, wireframe: wireframeMode }), [wireframeMode]);
  const treeStructure = useMemo(() => generateHeroTreeStructure(tree), [height, bareTrunkHeight, maxCrownRadius, seed, trunkRadiusBase]);
  return (
    <group position={position} rotation={[tiltAngleX, rotationY, tiltAngleZ]} name={tree.id}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow material={barkMaterial}><cylinderGeometry args={[trunkRadiusBase * 0.14, trunkRadiusBase, height, 6]} /></mesh>
      {treeStructure.stubRoots.map((stub, idx) => <group key={`stub-${idx}`} position={[0, stub.y, 0]} rotation={[0, stub.angle, 0]}><mesh position={[stub.length / 2, 0, 0]} rotation={[0, 0, stub.pitch]} castShadow material={barkMaterial}><cylinderGeometry args={[0.02, 0.05, stub.length, 5]} /></mesh></group>)}
      {treeStructure.primaryBranches.map((branch) => <group key={`pbr-${branch.id}`} position={[0, branch.y, 0]} rotation={[0, branch.azimuth, 0]}>
        <mesh position={[(Math.cos(branch.pitch) * branch.length) / 2, (Math.sin(branch.pitch) * branch.length) / 2, 0]} rotation={[0, 0, branch.pitch - Math.PI / 2]} castShadow material={branchMaterial}><cylinderGeometry args={[branch.radiusBase * 0.35, branch.radiusBase, branch.length, 5]} /></mesh>
        {branch.branchlets.map((sec, sIdx) => { const midX = sec.startPos[0] + (Math.cos(sec.pitch) * sec.length) / 2; const midY = sec.startPos[1] + (Math.sin(sec.pitch) * sec.length) / 2; const midZ = sec.startPos[2] + (Math.sin(sec.yaw) * sec.length) / 2; return <mesh key={`sec-${sIdx}`} position={[midX, midY, midZ]} rotation={[0, sec.yaw, sec.pitch - Math.PI / 2]} castShadow material={branchMaterial}><cylinderGeometry args={[branch.radiusBase * 0.2, branch.radiusBase * 0.4, sec.length, 4]} /></mesh>; })}
        {branch.sprays.map((spray, spIdx) => { const mat = spray.colorVariant === 0 ? foliageDarkMaterial : spray.colorVariant === 1 ? foliageMidMaterial : foliageHighlightMaterial; return <group key={`sp-${spIdx}`} position={spray.pos} rotation={spray.rot}><mesh scale={spray.scale} castShadow receiveShadow material={mat}><dodecahedronGeometry args={[1, 0]} /></mesh></group>; })}
      </group>)}
      <group position={[0, height, 0]}><mesh position={[0, 0.4, 0]} castShadow material={barkMaterial}><cylinderGeometry args={[0.01, 0.03, 0.8, 4]} /></mesh><mesh position={[0, 0.2, 0]} scale={[0.12, 0.5, 0.12]} castShadow material={foliageDarkMaterial}><dodecahedronGeometry args={[1, 0]} /></mesh></group>
    </group>
  );
};
