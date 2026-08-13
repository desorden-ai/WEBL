import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TimeOfDay } from '@/data/casa01Canonical';

type Props = {
  timeOfDay: TimeOfDay;
};

type TreeInstance = {
  x: number;
  z: number;
  height: number;
  radius: number;
  canopy: number;
};

const MID_TREES: TreeInstance[] = [
  { x: -13, z: 8, height: 12.1, radius: 0.32, canopy: 2.45 },
  { x: -15, z: -2, height: 12.6, radius: 0.34, canopy: 2.55 },
  { x: -11, z: -12, height: 11.8, radius: 0.31, canopy: 2.4 },
  { x: -4, z: -16, height: 12.4, radius: 0.33, canopy: 2.5 },
  { x: 6, z: -16, height: 12.0, radius: 0.32, canopy: 2.45 },
  { x: 14, z: -10, height: 12.7, radius: 0.34, canopy: 2.55 },
  { x: 16, z: 0, height: 11.9, radius: 0.31, canopy: 2.4 },
  { x: 14, z: 10, height: 12.5, radius: 0.33, canopy: 2.5 },
  { x: 7, z: 15, height: 11.9, radius: 0.31, canopy: 2.4 },
  { x: -3, z: 16, height: 12.3, radius: 0.33, canopy: 2.48 },
];

const SHRUBS = [
  [-6.79, 8.03, 1.1],
  [-5.33, 8.93, 0.8],
  [5.97, 8.33, 1],
  [7.24, 6.99, 0.8],
  [-7.59, -6.84, 1],
  [7.05, -7.67, 0.9],
  [-9.17, 1.53, 0.8],
  [9.09, 1.02, 0.8],
] as const;

function palette(timeOfDay: TimeOfDay) {
  if (timeOfDay === 'day') {
    return {
      ground: '#587142',
      trunk: '#4a3d32',
      foliage: '#386044',
      foliageFar: '#2c4937',
    };
  }

  if (timeOfDay === 'sunset') {
    return {
      ground: '#46583b',
      trunk: '#3b3029',
      foliage: '#314936',
      foliageFar: '#273b2e',
    };
  }

  return {
    ground: '#233126',
    trunk: '#252824',
    foliage: '#203a2e',
    foliageFar: '#1a2e25',
  };
}

function ProtagonistTree({ timeOfDay }: Props) {
  const colors = palette(timeOfDay);

  const canopyLayers = [
    { y: 6.25, radius: 1.82, height: 3.7 },
    { y: 7.9, radius: 1.55, height: 3.45 },
    { y: 9.45, radius: 1.25, height: 3.05 },
    { y: 10.85, radius: 0.93, height: 2.55 },
  ];

  return (
    <group position={[-8.9, 0, 5.2]} rotation={[0, 0, -0.025]} name="Casa01ProtagonistTree">
      <mesh position={[0, 5.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.4, 11.8, 8]} />
        <meshStandardMaterial color={colors.trunk} roughness={1} />
      </mesh>

      {canopyLayers.map((layer, index) => (
        <mesh
          key={index}
          position={[0, layer.y, 0]}
          rotation={[0, index * 0.45, 0]}
          castShadow
        >
          <coneGeometry args={[layer.radius, layer.height, 8]} />
          <meshStandardMaterial color={colors.foliage} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function InstancedMidTrees({ timeOfDay }: Props) {
  const trunksRef = useRef<THREE.InstancedMesh>(null);
  const lowerCanopiesRef = useRef<THREE.InstancedMesh>(null);
  const middleCanopiesRef = useRef<THREE.InstancedMesh>(null);
  const upperCanopiesRef = useRef<THREE.InstancedMesh>(null);
  const colors = palette(timeOfDay);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    MID_TREES.forEach((tree, index) => {
      dummy.position.set(tree.x, tree.height * 0.5, tree.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(tree.radius, tree.height, tree.radius);
      dummy.updateMatrix();
      trunksRef.current?.setMatrixAt(index, dummy.matrix);

      dummy.position.set(tree.x, tree.height * 0.63, tree.z);
      dummy.rotation.set(0, index * 0.39, 0);
      dummy.scale.set(tree.canopy, tree.height * 0.31, tree.canopy);
      dummy.updateMatrix();
      lowerCanopiesRef.current?.setMatrixAt(index, dummy.matrix);

      dummy.position.set(tree.x, tree.height * 0.77, tree.z);
      dummy.rotation.set(0, index * 0.39 + 0.22, 0);
      dummy.scale.set(tree.canopy * 0.76, tree.height * 0.27, tree.canopy * 0.76);
      dummy.updateMatrix();
      middleCanopiesRef.current?.setMatrixAt(index, dummy.matrix);

      dummy.position.set(tree.x, tree.height * 0.89, tree.z);
      dummy.rotation.set(0, index * 0.39 + 0.44, 0);
      dummy.scale.set(tree.canopy * 0.52, tree.height * 0.22, tree.canopy * 0.52);
      dummy.updateMatrix();
      upperCanopiesRef.current?.setMatrixAt(index, dummy.matrix);
    });

    for (const ref of [
      trunksRef,
      lowerCanopiesRef,
      middleCanopiesRef,
      upperCanopiesRef,
    ]) {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group name="Casa01MidgroundTrees">
      <instancedMesh ref={trunksRef} args={[undefined, undefined, MID_TREES.length]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color={colors.trunk} roughness={1} />
      </instancedMesh>

      {[lowerCanopiesRef, middleCanopiesRef, upperCanopiesRef].map((ref, index) => (
        <instancedMesh
          key={index}
          ref={ref}
          args={[undefined, undefined, MID_TREES.length]}
        >
          <coneGeometry args={[1, 1, 7]} />
          <meshStandardMaterial color={colors.foliageFar} roughness={1} />
        </instancedMesh>
      ))}
    </group>
  );
}

function InstancedShrubs({ timeOfDay }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const colors = palette(timeOfDay);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    SHRUBS.forEach(([x, z, scale], index) => {
      dummy.position.set(x, 0.4 * scale, z);
      dummy.scale.set(scale * 1.25, scale * 0.46, scale);
      dummy.rotation.set(0, index * 0.73, 0);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });

    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, SHRUBS.length]}
      name="Casa01NearShrubs"
      castShadow
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={colors.foliage} roughness={1} />
    </instancedMesh>
  );
}

function createTreeImpostorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (!context) return new THREE.CanvasTexture(canvas);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';

  context.fillRect(120, 255, 16, 245);

  const drawTriangle = (
    topY: number,
    baseY: number,
    halfWidth: number,
  ) => {
    context.beginPath();
    context.moveTo(128, topY);
    context.lineTo(128 - halfWidth, baseY);
    context.lineTo(128 + halfWidth, baseY);
    context.closePath();
    context.fill();
  };

  drawTriangle(30, 235, 58);
  drawTriangle(105, 330, 82);
  drawTriangle(185, 420, 105);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function ImpostorRing({ timeOfDay }: Props) {
  const ringARef = useRef<THREE.InstancedMesh>(null);
  const ringBRef = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => createTreeImpostorTexture(), []);
  const colors = palette(timeOfDay);
  const count = 20;

  useEffect(() => () => texture.dispose(), [texture]);

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2 + 0.13;
      const radius = 27 + ((index * 7) % 9);
      const height = 12.0 + ((index * 5) % 3) * 0.45;
      const width = 5.9 + ((index * 3) % 3) * 0.35;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      dummy.position.set(x, height * 0.5, z);
      dummy.scale.set(width, height, 1);
      dummy.lookAt(0, height * 0.48, 0);
      dummy.updateMatrix();
      ringARef.current?.setMatrixAt(index, dummy.matrix);

      dummy.rotateY(Math.PI / 2);
      dummy.updateMatrix();
      ringBRef.current?.setMatrixAt(index, dummy.matrix);
    }

    if (ringARef.current) ringARef.current.instanceMatrix.needsUpdate = true;
    if (ringBRef.current) ringBRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group name="Casa01ImpostorRing">
      <instancedMesh ref={ringARef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          color={colors.foliageFar}
          alphaTest={0.18}
          transparent
          depthWrite
          side={THREE.DoubleSide}
          fog
        />
      </instancedMesh>
      <instancedMesh ref={ringBRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          color={colors.foliageFar}
          alphaTest={0.18}
          transparent
          depthWrite
          side={THREE.DoubleSide}
          fog
        />
      </instancedMesh>
    </group>
  );
}

export function Casa01Landscaping({ timeOfDay }: Props) {
  const colors = palette(timeOfDay);

  return (
    <group name="Casa01Landscaping">
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]} receiveShadow>
        <circleGeometry args={[42, 48]} />
        <meshStandardMaterial color={colors.ground} roughness={1} metalness={0} />
      </mesh>

      <ProtagonistTree timeOfDay={timeOfDay} />
      <InstancedShrubs timeOfDay={timeOfDay} />
      <InstancedMidTrees timeOfDay={timeOfDay} />
      <ImpostorRing timeOfDay={timeOfDay} />
    </group>
  );
}
