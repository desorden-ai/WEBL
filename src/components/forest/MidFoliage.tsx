import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MIDGROUND_TREES_DATA, generateSpraysForTree, type FoliageSpray } from './midgroundData';

export const MidFoliage: React.FC<{ wireframeMode: boolean }> = ({ wireframeMode }) => {
  const darkRef = useRef<THREE.InstancedMesh>(null!); const midRef = useRef<THREE.InstancedMesh>(null!); const highlightRef = useRef<THREE.InstancedMesh>(null!);
  const materials = useMemo(() => [new THREE.MeshStandardMaterial({ color: '#1c3024', roughness: 0.88, metalness: 0, wireframe: wireframeMode }), new THREE.MeshStandardMaterial({ color: '#23372a', roughness: 0.85, metalness: 0, wireframe: wireframeMode }), new THREE.MeshStandardMaterial({ color: '#283d2f', roughness: 0.82, metalness: 0, wireframe: wireframeMode })], [wireframeMode]);
  const sprays = useMemo(() => {
    const groups: { treeMatrix: THREE.Matrix4; spray: FoliageSpray }[][] = [[], [], []];
    MIDGROUND_TREES_DATA.forEach((tree) => { const treeObject = new THREE.Object3D(); treeObject.position.set(...tree.position); treeObject.rotation.set(tree.tiltAngleX, tree.rotationY, tree.tiltAngleZ); treeObject.updateMatrix(); generateSpraysForTree(tree).forEach((spray) => groups[spray.colorVariant].push({ treeMatrix: treeObject.matrix.clone(), spray })); });
    return groups;
  }, []);
  useEffect(() => {
    const refs = [darkRef, midRef, highlightRef]; const dummy = new THREE.Object3D(); const world = new THREE.Matrix4();
    refs.forEach((ref, color) => { sprays[color].forEach((item, index) => { dummy.position.set(...item.spray.pos); dummy.rotation.set(...item.spray.rot); dummy.scale.set(...item.spray.scale); dummy.updateMatrix(); world.multiplyMatrices(item.treeMatrix, dummy.matrix); ref.current.setMatrixAt(index, world); }); ref.current.instanceMatrix.needsUpdate = true; });
  }, [sprays]);
  return <><instancedMesh ref={darkRef} args={[undefined, undefined, sprays[0].length]} castShadow={false} receiveShadow material={materials[0]}><octahedronGeometry args={[0.5, 0]} /></instancedMesh><instancedMesh ref={midRef} args={[undefined, undefined, sprays[1].length]} castShadow={false} receiveShadow material={materials[1]}><octahedronGeometry args={[0.5, 0]} /></instancedMesh><instancedMesh ref={highlightRef} args={[undefined, undefined, sprays[2].length]} castShadow={false} receiveShadow material={materials[2]}><octahedronGeometry args={[0.5, 0]} /></instancedMesh></>;
};
