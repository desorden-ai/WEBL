import { useMemo } from 'react';
import * as THREE from 'three';
import { CASA01, Casa01ViewMode, Casa01FloorKey, TimeOfDay } from '@/data/casa01Canonical';

type Props = {
  viewMode: Casa01ViewMode;
  floorIsolation?: Casa01FloorKey | null;
  progress?: number;
  timeOfDay?: TimeOfDay;
};

export function Casa01Shell({ viewMode, floorIsolation = null, progress = 100, timeOfDay = 'day' }: Props) {
  const p = Math.max(0, Math.min(100, progress));
  const width = CASA01.footprint.width;
  const depth = CASA01.footprint.depth;
  const halfW = width / 2;
  const halfD = depth / 2;
  const isDollhouse = viewMode === 'dollhouse';
  const roofHidden = viewMode === 'roof-hide' || isDollhouse;
  const showGround = !floorIsolation || floorIsolation === 'ground';
  const showLevel1 = !floorIsolation || floorIsolation === 'level1';
  const showLoft = !floorIsolation || floorIsolation === 'loft';
  const showSite = !floorIsolation || floorIsolation === 'ground';
  const showRoof = p >= 55 && !roofHidden && (!floorIsolation || floorIsolation === 'loft');
  const showGlass = p >= 75;
  const showDetails = p >= 85;
  const isNight = timeOfDay === 'night';
  const isSunset = timeOfDay === 'sunset';

  const claddingMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#282e36', roughness: 0.58, metalness: 0.12 }), []);
  const concreteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9ca2aa', roughness: 0.72 }), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#181c22', roughness: 0.3, metalness: 0.72 }), []);
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: CASA01.materials.warmWood, roughness: 0.52 }), []);
  const deckMat = useMemo(() => new THREE.MeshStandardMaterial({ color: CASA01.materials.deck, roughness: 0.72 }), []);
  const glassMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#80b4d0', transparent: true, opacity: 0.34, roughness: 0.12, metalness: 0.08, depthWrite: false }), []);
  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: CASA01.materials.steelBeam, metalness: 0.82, roughness: 0.32 }), []);
  const lightMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffc890', emissive: '#ffb870', emissiveIntensity: isNight ? 3.5 : isSunset ? 1.1 : 0, roughness: 0.2,
  }), [isNight, isSunset]);

  const roofAngle = useMemo(() => Math.atan2(-1.4, width), [width]);
  const rearWallShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-halfW, 0); s.lineTo(halfW, 0); s.lineTo(halfW, 2.9); s.lineTo(-halfW, 4.3); s.closePath();
    return s;
  }, [halfW]);
  const frontGlassShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.42, 0); s.lineTo(2.42, 0); s.lineTo(2.42, 3.04); s.lineTo(-2.42, 4.13); s.closePath();
    return s;
  }, []);

  const Wall = ({ position, size }: { position: [number, number, number]; size: [number, number, number] }) => (
    <mesh position={position} receiveShadow castShadow material={claddingMat}><boxGeometry args={size} /></mesh>
  );

  const BalconyRail = ({ width: railW, depth: railD }: { width: number; depth: number }) => (
    <group>
      {[-railW / 2 + 0.02, railW / 2 - 0.02].flatMap((x) => [-railD / 2 + 0.02, railD / 2 - 0.02].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.52, z]} material={frameMat}><boxGeometry args={[0.03, 1.05, 0.03]} /></mesh>
      )))}
      <mesh position={[0, 1.035, railD / 2 - 0.02]} material={frameMat}><boxGeometry args={[railW, 0.03, 0.04]} /></mesh>
      <mesh position={[-railW / 2 + 0.02, 1.035, 0]} material={frameMat}><boxGeometry args={[0.04, 0.03, railD]} /></mesh>
      <mesh position={[railW / 2 - 0.02, 1.035, 0]} material={frameMat}><boxGeometry args={[0.04, 0.03, railD]} /></mesh>
      {[0.28, 0.53, 0.78].map((y) => (
        <group key={y}>
          <mesh position={[0, y, railD / 2 - 0.02]} material={frameMat}><boxGeometry args={[railW - 0.04, 0.016, 0.016]} /></mesh>
          <mesh position={[-railW / 2 + 0.02, y, 0]} material={frameMat}><boxGeometry args={[0.016, 0.016, railD - 0.04]} /></mesh>
          <mesh position={[railW / 2 - 0.02, y, 0]} material={frameMat}><boxGeometry args={[0.016, 0.016, railD - 0.04]} /></mesh>
        </group>
      ))}
    </group>
  );

  return (
    <group name="Casa01Shell">
      {p >= 5 && showSite && <mesh position={[0, -0.14, 0.4]} receiveShadow castShadow material={concreteMat}><boxGeometry args={[width - 0.44, 0.2, depth + 2]} /></mesh>}
      {p >= 60 && showSite && (
        <group position={[0, 0, halfD + 0.9]}>
          <mesh position={[0, 0.085, 0]} receiveShadow castShadow material={deckMat}><boxGeometry args={[4.8, 0.15, 1.8]} /></mesh>
          <mesh position={[0, 0.025, 1.1]} receiveShadow castShadow material={deckMat}><boxGeometry args={[2.2, 0.07, 0.4]} /></mesh>
          <mesh position={[0, -0.045, 1.4]} receiveShadow castShadow material={deckMat}><boxGeometry args={[2.4, 0.07, 0.4]} /></mesh>
        </group>
      )}

      {showGround && p >= 10 && (
        <group name="GroundShell">
          <mesh position={[0, 0.1, 0]} receiveShadow castShadow material={concreteMat}><boxGeometry args={[width - 0.44, 0.2, depth - 0.44]} /></mesh>
          {p >= 15 && [-halfW + 0.12, halfW - 0.12].flatMap((x) => [-halfD + 0.12, halfD - 0.12].map((z) => (
            <mesh key={`g-${x}-${z}`} position={[x, 1.7, z]} material={steelMat}><boxGeometry args={[0.14, 3.0, 0.14]} /></mesh>
          )))}
          {p >= 25 && (
            <>
              {!isDollhouse && <Wall position={[-halfW + 0.09, 1.7, 0]} size={[0.18, 2.96, depth]} />}
              <Wall position={[halfW - 0.09, 1.6, -3.95]} size={[0.18, 3.16, 2.9]} />
              <Wall position={[halfW - 0.09, 1.6, 1.95]} size={[0.18, 3.16, 6.9]} />
              <Wall position={[halfW - 0.09, 0.48, -2]} size={[0.18, 0.92, 1]} />
              <Wall position={[halfW - 0.09, 2.64, -2]} size={[0.18, 1.08, 1]} />
              <Wall position={[-1.8, 1.6, -halfD + 0.09]} size={[2.6, 3.16, 0.18]} />
              <Wall position={[2.0, 1.6, -halfD + 0.09]} size={[2.2, 3.16, 0.18]} />
              <Wall position={[0.2, 2.92, -halfD + 0.09]} size={[1.4, 0.52, 0.18]} />
              {!isDollhouse && <Wall position={[-2.75, 1.6, halfD - 0.09]} size={[0.7, 3.16, 0.18]} />}
              {!isDollhouse && <Wall position={[2.75, 1.6, halfD - 0.09]} size={[0.7, 3.16, 0.18]} />}
              {!isDollhouse && <Wall position={[0, 2.92, halfD - 0.09]} size={[4.8, 0.52, 0.18]} />}
            </>
          )}
          {showGlass && (
            <>
              <group position={[halfW - 0.09, 1.5, -2]}>
                <mesh material={glassMat}><boxGeometry args={[0.02, 1.08, 0.88]} /></mesh>
                {[-0.54, 0.54].map((y) => <mesh key={y} position={[0, y, 0]} material={frameMat}><boxGeometry args={[0.20, 0.05, 0.98]} /></mesh>)}
                {[-0.46, 0.46].map((z) => <mesh key={z} position={[0, 0, z]} material={frameMat}><boxGeometry args={[0.20, 1.08, 0.05]} /></mesh>)}
              </group>
              <group position={[0.2, 1.45, -halfD + 0.075]}>
                <mesh material={glassMat}><boxGeometry args={[1.28, 2.38, 0.02]} /></mesh>
                {[-0.66, 0.66].map((x) => <mesh key={x} position={[x, 0, 0]} material={frameMat}><boxGeometry args={[0.05, 2.42, 0.10]} /></mesh>)}
                {[-1.21, 1.21].map((y) => <mesh key={y} position={[0, y, 0]} material={frameMat}><boxGeometry args={[1.38, 0.05, 0.10]} /></mesh>)}
              </group>
              {!isDollhouse && <group position={[0, 1.55, halfD - 0.075]}>
                <mesh material={glassMat}><boxGeometry args={[4.66, 2.56, 0.02]} /></mesh>
                {[-2.36, 2.36].map((x) => <mesh key={x} position={[x, 0, 0]} material={frameMat}><boxGeometry args={[0.05, 2.64, 0.10]} /></mesh>)}
                {[-1.31, 1.31].map((y) => <mesh key={y} position={[0, y, 0]} material={frameMat}><boxGeometry args={[4.76, 0.05, 0.10]} /></mesh>)}
                {[-1.2, 0, 1.2].map((x) => <mesh key={x} position={[x, 0, 0]} material={frameMat}><boxGeometry args={[0.04, 2.56, 0.06]} /></mesh>)}
              </group>}
            </>
          )}
          {showDetails && (
            <group name="RearExteriorLights">
              {[-0.3, 0.7].map((x) => <mesh key={x} position={[x, 2.95, -halfD - 0.04]} material={lightMat}><boxGeometry args={[0.08, 0.12, 0.04]} /></mesh>)}
              <spotLight position={[-0.3, 2.75, -halfD - 0.24]} target-position={[-0.3, 0.8, -halfD - 1.2]} color="#ffc285" intensity={isNight ? 2 : isSunset ? 0.7 : 0} distance={4.5} angle={0.5} penumbra={0.65} castShadow={false} />
              <spotLight position={[0.7, 2.75, -halfD - 0.24]} target-position={[0.7, 0.8, -halfD - 1.2]} color="#ffc285" intensity={isNight ? 2 : isSunset ? 0.7 : 0} distance={4.5} angle={0.5} penumbra={0.65} castShadow={false} />
            </group>
          )}
        </group>
      )}

      {showLevel1 && p >= 25 && (
        <group name="Level1Shell">
          <mesh position={[0, 3.2, 0]} receiveShadow castShadow material={concreteMat}><boxGeometry args={[width - 0.44, 0.18, depth - 0.44]} /></mesh>
          {p >= 65 && <>
            <Wall position={[-halfW + 0.025, 3.2, 0]} size={[0.05, 0.176, depth - 0.05]} />
            <Wall position={[halfW - 0.025, 3.2, 0]} size={[0.05, 0.176, depth - 0.05]} />
            <Wall position={[0, 3.2, -halfD + 0.025]} size={[width - 0.05, 0.176, 0.05]} />
            <Wall position={[0, 3.2, halfD - 0.025]} size={[width - 0.05, 0.176, 0.05]} />
          </>}
          {p >= 40 && <>
            {!isDollhouse && <Wall position={[-halfW + 0.09, 4.78, 0]} size={[0.18, 2.94, depth]} />}
            <Wall position={[halfW - 0.09, 4.75, -3.95]} size={[0.18, 3.02, 2.9]} />
            <Wall position={[halfW - 0.09, 4.75, 1.95]} size={[0.18, 3.02, 6.9]} />
            <Wall position={[halfW - 0.09, 3.75, -2]} size={[0.18, 0.92, 1]} />
            <Wall position={[halfW - 0.09, 5.78, -2]} size={[0.18, 0.96, 1]} />
            {!isDollhouse && <Wall position={[0, 4.76, -halfD + 0.09]} size={[width, 2.96, 0.18]} />}
            {!isDollhouse && <Wall position={[1.45, 4.76, halfD - 0.08]} size={[3.3, 2.96, 0.16]} />}
            {!isDollhouse && <Wall position={[-2.55, 4.76, halfD - 0.08]} size={[1.1, 2.96, 0.16]} />}
            {!isDollhouse && <Wall position={[-1.1, 5.96, halfD - 0.08]} size={[1.8, 0.56, 0.16]} />}
          </>}
          {showGlass && !isDollhouse && <group position={[-1.1, 4.46, halfD - 0.075]}>
            <mesh material={glassMat}><boxGeometry args={[1.68, 2.18, 0.02]} /></mesh>
            {[-0.86, 0.86].map((x) => <mesh key={x} position={[x, 0, 0]} material={frameMat}><boxGeometry args={[0.05, 2.24, 0.08]} /></mesh>)}
            {[-1.11, 1.11].map((y) => <mesh key={y} position={[0, y, 0]} material={frameMat}><boxGeometry args={[1.78, 0.05, 0.08]} /></mesh>)}
          </group>}
          {p >= 50 && (
            <group position={[-0.9, 3.2, halfD + 0.65]}>
              <mesh position={[0, -0.08, 0]} receiveShadow castShadow material={claddingMat}><boxGeometry args={[3, 0.16, 1.3]} /></mesh>
              {showDetails && <>
                <mesh position={[0, -0.185, 0]} material={woodMat}><boxGeometry args={[2.96, 0.02, 1.26]} /></mesh>
                <BalconyRail width={3} depth={1.26} />
                {[-0.9, 0.9].map((x) => <mesh key={x} position={[x, -0.19, 0]} material={lightMat}><cylinderGeometry args={[0.04, 0.04, 0.01, 12]} /></mesh>)}
                <pointLight position={[-0.9, -0.3, 0]} color="#ffc285" intensity={isNight ? 1.2 : 0} distance={3.5} castShadow={false} />
                <pointLight position={[0.9, -0.3, 0]} color="#ffc285" intensity={isNight ? 1.2 : 0} distance={3.5} castShadow={false} />
              </>}
            </group>
          )}
        </group>
      )}

      {showLoft && p >= 40 && (
        <group name="LoftShell">
          <mesh position={[0, 6.3, 0]} receiveShadow castShadow material={concreteMat}><boxGeometry args={[width - 0.44, 0.18, depth - 0.44]} /></mesh>
          {p >= 65 && <>
            <Wall position={[-halfW + 0.025, 6.3, 0]} size={[0.05, 0.176, depth - 0.05]} />
            <Wall position={[halfW - 0.025, 6.3, 0]} size={[0.05, 0.176, depth - 0.05]} />
            <Wall position={[0, 6.3, -halfD + 0.025]} size={[width - 0.05, 0.176, 0.05]} />
            <Wall position={[0, 6.3, halfD - 0.025]} size={[width - 0.05, 0.176, 0.05]} />
          </>}
          {p >= 45 && <>
            {!isDollhouse && <Wall position={[-halfW + 0.09, 8.45, 0]} size={[0.18, 4.12, depth]} />}
            <Wall position={[halfW - 0.09, 7.84, -3.95]} size={[0.18, 2.92, 2.9]} />
            <Wall position={[halfW - 0.09, 7.84, 1.95]} size={[0.18, 2.92, 6.9]} />
            <Wall position={[halfW - 0.09, 6.82, -2]} size={[0.18, 0.86, 1]} />
            <Wall position={[halfW - 0.09, 8.82, -2]} size={[0.18, 1.02, 1]} />
            {!isDollhouse && <mesh position={[0, 6.3, -halfD - 0.09]} receiveShadow castShadow material={claddingMat}><extrudeGeometry args={[rearWallShape, { steps: 1, depth: 0.18, bevelEnabled: false }]} /></mesh>}
          </>}
          {showGlass && !isDollhouse && <group position={[0, 6.3, halfD - 0.01]}>
            <mesh material={glassMat}><extrudeGeometry args={[frontGlassShape, { steps: 1, depth: 0.02, bevelEnabled: false }]} /></mesh>
            <mesh position={[0, 0.04, 0.02]} material={frameMat}><boxGeometry args={[4.84, 0.08, 0.06]} /></mesh>
            <mesh position={[-2.42, 2.025, 0.02]} material={frameMat}><boxGeometry args={[0.06, 4.05, 0.06]} /></mesh>
            <mesh position={[2.42, 1.475, 0.02]} material={frameMat}><boxGeometry args={[0.06, 2.95, 0.06]} /></mesh>
            <mesh position={[0, 3.5, 0.02]} rotation={[0, 0, Math.atan2(-1.1, 4.84)]} material={frameMat}><boxGeometry args={[4.96, 0.08, 0.06]} /></mesh>
            {[-1.21, 0, 1.21].map((x) => {
              const h = 3.5 - x * (1.1 / 4.84);
              return <mesh key={x} position={[x, h / 2, 0.02]} material={frameMat}><boxGeometry args={[0.06, h, 0.06]} /></mesh>;
            })}
          </group>}
          {p >= 55 && (
            <group position={[0, 6.3, halfD + 0.7]}>
              <mesh position={[0, -0.08, 0]} receiveShadow castShadow material={claddingMat}><boxGeometry args={[4.9, 0.16, 1.4]} /></mesh>
              {showDetails && <><mesh position={[0, -0.185, 0]} material={woodMat}><boxGeometry args={[4.86, 0.02, 1.36]} /></mesh><BalconyRail width={4.9} depth={1.36} /></>}
            </group>
          )}
        </group>
      )}

      {showRoof && (
        <group name="SlopedRoof" position={[0, 10.0, 0]} rotation={[0, 0, roofAngle]}>
          <mesh receiveShadow={false} castShadow material={frameMat}><boxGeometry args={[width + 0.7, 0.16, depth + 1.2]} /></mesh>
          {showDetails && <mesh position={[0, -0.105, 0]} material={woodMat}><boxGeometry args={[width + 0.68, 0.02, depth + 1.18]} /></mesh>}
          {showDetails && [-1.5, 0, 1.5].map((x) => <mesh key={x} position={[x, -0.12, depth / 2 + 0.4]} material={lightMat}><cylinderGeometry args={[0.05, 0.05, 0.01, 12]} /></mesh>)}
        </group>
      )}
    </group>
  );
}
