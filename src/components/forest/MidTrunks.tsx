import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolPbrTextures } from '../../materials/useSolPbrTextures';
import { MIDGROUND_TREES_DATA } from './midgroundData';

export const MidTrunks: React.FC<{ wireframeMode: boolean }> = ({ wireframeMode }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const barkPbr = useSolPbrTextures('03_conifer_bark', { repeat: [2.0, 6.0], enableNormal: true });
  const normalScale = useMemo(() => new THREE.Vector2(0.18, 0.18), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map: barkPbr.map, normalMap: barkPbr.normalMap, normalScale, roughnessMap: barkPbr.roughnessMap, roughness: 0.78, metalness: 0, wireframe: wireframeMode }), [barkPbr.map, barkPbr.normalMap, barkPbr.roughnessMap, normalScale, wireframeMode]);
  useEffect(() => {
    const dummy = new THREE.Object3D();
    MIDGROUND_TREES_DATA.forEach((tree, idx) => { dummy.position.set(tree.position[0], tree.position[1] + tree.height / 2, tree.position[2]); dummy.rotation.set(tree.tiltAngleX, tree.rotationY, tree.tiltAngleZ); dummy.scale.set(tree.trunkRadiusBase, tree.height, tree.trunkRadiusBase); dummy.updateMatrix(); meshRef.current.setMatrixAt(idx, dummy.matrix); });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={meshRef} args={[undefined, undefined, MIDGROUND_TREES_DATA.length]} castShadow receiveShadow material={material}><cylinderGeometry args={[0.15, 1, 1, 5]} /></instancedMesh>;
};
