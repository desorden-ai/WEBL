import React, { useMemo } from 'react';
import * as THREE from 'three';
import { HouseState } from '../types';

interface House3DProps {
  state: HouseState;
}

export const House3D: React.FC<House3DProps> = ({ state }) => {
  const {
    viewMode,
    activeFloor,
    constructionProgress: progress,
    hideRoof,
    showLandscaping,
    interiorLightsOn,
    timeOfDay,
  } = state;

  const showFoundation = progress >= 5;
  const showFraming = progress >= 20;
  const showSlabsAndWalls = progress >= 40;
  const showCladding = progress >= 60;
  const showInteriors = progress >= 75;
  const showDetailsAndGlass = progress >= 90;

  const isDollhouse = viewMode === 'dollhouse';
  const showL1 = activeFloor === 'all' || activeFloor === 'level1';
  const showL2 = activeFloor === 'all' || activeFloor === 'level2';
  const showL3 = activeFloor === 'all' || activeFloor === 'level3';

  const renderRoof =
    showCladding &&
    !hideRoof &&
    activeFloor === 'all' &&
    viewMode !== 'plan' &&
    (!isDollhouse || progress < 100);

  const renderFrontWall =
    showCladding &&
    viewMode === 'exterior' &&
    activeFloor === 'all' &&
    progress >= 60;

  const materials = useMemo(() => {
    return {
      darkPanel: new THREE.MeshStandardMaterial({ color: new THREE.Color('#1f2226'), roughness: 0.6, metalness: 0.2 }),
      darkPanelTrim: new THREE.MeshStandardMaterial({ color: new THREE.Color('#141618'), roughness: 0.4, metalness: 0.4 }),
      roofZinc: new THREE.MeshStandardMaterial({ color: new THREE.Color('#181a1d'), roughness: 0.5, metalness: 0.5 }),
      concreteSlab: new THREE.MeshStandardMaterial({ color: new THREE.Color('#d1d5db'), roughness: 0.8, metalness: 0.1 }),
      basePodium: new THREE.MeshStandardMaterial({ color: new THREE.Color('#eaecef'), roughness: 0.9, metalness: 0.05 }),
      woodDeck: new THREE.MeshStandardMaterial({ color: new THREE.Color('#b88b58'), roughness: 0.7, metalness: 0.1 }),
      interiorWalnut: new THREE.MeshStandardMaterial({ color: new THREE.Color('#2d221a'), roughness: 0.4, metalness: 0.1 }),
      bathroomTile: new THREE.MeshStandardMaterial({ color: new THREE.Color('#2d3138'), roughness: 0.5, metalness: 0.2 }),
      interiorWall: new THREE.MeshStandardMaterial({ color: new THREE.Color('#f3f4f6'), roughness: 0.8, metalness: 0.05 }),
      steelFrame: new THREE.MeshStandardMaterial({ color: new THREE.Color('#1a1a1c'), roughness: 0.3, metalness: 0.8 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#e0f2fe'),
        transparent: true,
        opacity: timeOfDay === 'night' ? 0.35 : 0.45,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5,
      }),
      blackFrame: new THREE.MeshStandardMaterial({ color: new THREE.Color('#111315'), roughness: 0.3, metalness: 0.7 }),
      sofaFabric: new THREE.MeshStandardMaterial({ color: new THREE.Color('#54524f'), roughness: 0.9 }),
      sofaPillows: new THREE.MeshStandardMaterial({ color: new THREE.Color('#8a8278'), roughness: 0.8 }),
      rugFabric: new THREE.MeshStandardMaterial({ color: new THREE.Color('#3e3d3a'), roughness: 0.95 }),
      coffeeTableGlass: new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#1a1a1d'), transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.5 }),
      bedSheet: new THREE.MeshStandardMaterial({ color: new THREE.Color('#3a3836'), roughness: 0.8 }),
      bedPillow: new THREE.MeshStandardMaterial({ color: new THREE.Color('#f0ece1'), roughness: 0.7 }),
      kitchenCabinet: new THREE.MeshStandardMaterial({ color: new THREE.Color('#211c19'), roughness: 0.5, metalness: 0.2 }),
      stainlessSteel: new THREE.MeshStandardMaterial({ color: new THREE.Color('#9ca3af'), roughness: 0.3, metalness: 0.9 }),
      brassAccent: new THREE.MeshStandardMaterial({ color: new THREE.Color('#d4af37'), roughness: 0.3, metalness: 0.8 }),
      foliageGreen: new THREE.MeshStandardMaterial({ color: new THREE.Color('#2d5a27'), roughness: 0.8 }),
      trunkWood: new THREE.MeshStandardMaterial({ color: new THREE.Color('#4a3525'), roughness: 0.9 }),
      planterDark: new THREE.MeshStandardMaterial({ color: new THREE.Color('#23262a'), roughness: 0.6 }),
      firePitEmber: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff5500') }),
      lampEmitter: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffddaa') }),
    };
  }, [timeOfDay]);

  const W = 7.5;
  const D = 11.5;
  const H1 = 3.2;
  const H2 = 6.2;
  const H3 = 9.2;
  const H_PEAK = 11.2;

  return (
    <group position={[0, 0, 0]}>
      {showFoundation && (
        <group name="Site_Base">
          <mesh position={[0, -0.25, 0]} material={materials.basePodium} receiveShadow castShadow>
            <boxGeometry args={[11, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={materials.concreteSlab} receiveShadow castShadow>
            <boxGeometry args={[W + 0.2, 0.3, D + 0.2]} />
          </mesh>
          <mesh position={[0, 0.22, D / 2 + 1.8]} material={materials.woodDeck} receiveShadow castShadow>
            <boxGeometry args={[W + 0.4, 0.08, 3.8]} />
          </mesh>
          <mesh position={[0, 0.12, D / 2 + 3.8]} material={materials.woodDeck} receiveShadow castShadow>
            <boxGeometry args={[W + 0.4, 0.12, 0.6]} />
          </mesh>
        </group>
      )}

      {showFraming && progress < 80 && (
        <group name="Steel_Structural_Framing">
          {[-W / 2 + 0.1, W / 2 - 0.1].map((x, i) =>
            [-D / 2 + 0.1, D / 2 - 0.1].map((z, j) => (
              <mesh key={`col-${i}-${j}`} position={[x, H3 / 2, z]} material={materials.steelFrame}>
                <boxGeometry args={[0.18, H3, 0.18]} />
              </mesh>
            )),
          )}
          {[0.2, H1, H2, H3].map((y, idx) => (
            <group key={`beam-level-${idx}`} position={[0, y, 0]}>
              <mesh position={[0, 0, -D / 2 + 0.1]} material={materials.steelFrame}><boxGeometry args={[W, 0.15, 0.15]} /></mesh>
              <mesh position={[0, 0, D / 2 - 0.1]} material={materials.steelFrame}><boxGeometry args={[W, 0.15, 0.15]} /></mesh>
              <mesh position={[-W / 2 + 0.1, 0, 0]} material={materials.steelFrame}><boxGeometry args={[0.15, 0.15, D]} /></mesh>
              <mesh position={[W / 2 - 0.1, 0, 0]} material={materials.steelFrame}><boxGeometry args={[0.15, 0.15, D]} /></mesh>
            </group>
          ))}
        </group>
      )}

      {showL1 && showSlabsAndWalls && (
        <group name="Level_1">
          <mesh position={[0, 0.25, 0]} material={materials.interiorWalnut} receiveShadow><boxGeometry args={[W - 0.2, 0.05, D - 0.2]} /></mesh>
          <mesh position={[0, H1 / 2, -D / 2 + 0.1]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[W, H1 - 0.3, 0.2]} /></mesh>
          <mesh position={[-W / 2 + 0.1, H1 / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H1 - 0.3, D]} /></mesh>
          <mesh position={[W / 2 - 0.1, H1 / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H1 - 0.3, D]} /></mesh>

          {(renderFrontWall || isDollhouse) && (
            <group position={[0, H1 / 2, D / 2 - 0.1]}>
              <mesh material={materials.blackFrame}><boxGeometry args={[W, H1 - 0.3, 0.08]} /></mesh>
              {showDetailsAndGlass && <mesh material={materials.glass}><boxGeometry args={[W - 0.4, H1 - 0.5, 0.02]} /></mesh>}
            </group>
          )}

          <mesh position={[-1.8, H1 / 2, -2.8]} material={materials.interiorWall} castShadow receiveShadow><boxGeometry args={[3.2, H1 - 0.3, 0.12]} /></mesh>
          <mesh position={[-0.2, H1 / 2, -4.2]} material={materials.interiorWall} castShadow receiveShadow><boxGeometry args={[0.12, H1 - 0.3, 2.7]} /></mesh>

          {showInteriors && (
            <group name="L1_Furniture">
              <group position={[1.8, 0.28, -3.8]}>
                <mesh position={[0, 0.45, 0]} material={materials.kitchenCabinet} castShadow receiveShadow><boxGeometry args={[3.2, 0.9, 0.7]} /></mesh>
                <mesh position={[0, 0.92, 0]} material={materials.stainlessSteel}><boxGeometry args={[3.2, 0.04, 0.72]} /></mesh>
                <mesh position={[0, 2.1, -0.1]} material={materials.kitchenCabinet} castShadow receiveShadow><boxGeometry args={[3.2, 0.8, 0.5]} /></mesh>
                <mesh position={[-1.8, 1.0, 0]} material={materials.stainlessSteel} castShadow><boxGeometry args={[0.8, 2.0, 0.7]} /></mesh>
                {(interiorLightsOn || timeOfDay === 'night') && <pointLight position={[0, 1.6, 0.2]} intensity={2.5} color="#ffaa44" distance={3.5} />}
              </group>

              <group position={[1.5, 0.28, -0.8]}>
                <mesh position={[0, 0.4, 0]} material={materials.kitchenCabinet} castShadow receiveShadow><boxGeometry args={[1.5, 0.75, 1.5]} /></mesh>
                {[-0.9, 0, 0.9].map((x, i) => (
                  <React.Fragment key={`chair-${i}`}>
                    <mesh position={[x * 0.75, 0.25, -0.9]} material={materials.blackFrame} castShadow><boxGeometry args={[0.45, 0.5, 0.45]} /></mesh>
                    <mesh position={[x * 0.75, 0.25, 0.9]} material={materials.blackFrame} castShadow><boxGeometry args={[0.45, 0.5, 0.45]} /></mesh>
                  </React.Fragment>
                ))}
              </group>

              <group position={[-1.6, 0.28, 1.8]}>
                <mesh position={[0, 0.02, 0]} material={materials.rugFabric} receiveShadow><boxGeometry args={[3.5, 0.02, 4.2]} /></mesh>
                <mesh position={[-1.0, 0.3, 0]} material={materials.sofaFabric} castShadow receiveShadow><boxGeometry args={[1.1, 0.55, 3.4]} /></mesh>
                <mesh position={[-0.2, 0.3, 1.2]} material={materials.sofaFabric} castShadow receiveShadow><boxGeometry args={[2.2, 0.55, 1.0]} /></mesh>
                <mesh position={[-1.4, 0.55, 0]} material={materials.sofaFabric} castShadow><boxGeometry args={[0.3, 0.5, 3.4]} /></mesh>
                <mesh position={[-1.1, 0.62, -1.0]} material={materials.sofaPillows}><boxGeometry args={[0.35, 0.35, 0.35]} /></mesh>
                <mesh position={[-1.1, 0.62, 0.2]} material={materials.sofaPillows}><boxGeometry args={[0.35, 0.35, 0.35]} /></mesh>
                <mesh position={[0.2, 0.22, -0.2]} material={materials.coffeeTableGlass} castShadow><boxGeometry args={[1.4, 0.38, 0.8]} /></mesh>
                <group position={[-1.5, 0, -1.8]}>
                  <mesh position={[0, 0.9, 0]} material={materials.brassAccent}><cylinderGeometry args={[0.02, 0.02, 1.8, 8]} /></mesh>
                  <mesh position={[0.4, 1.8, 0]} material={materials.brassAccent}><sphereGeometry args={[0.2, 16, 16]} /></mesh>
                  {(interiorLightsOn || timeOfDay === 'night') && <pointLight position={[0.4, 1.7, 0]} intensity={3.0} color="#ffcc77" distance={4} />}
                </group>
              </group>

              <group position={[-2.4, 0.28, -4.2]}>
                <mesh position={[0, 0.45, 0]} material={materials.kitchenCabinet} castShadow><boxGeometry args={[1.0, 0.4, 0.5]} /></mesh>
                <mesh position={[0, 0.7, 0]} material={materials.concreteSlab}><cylinderGeometry args={[0.2, 0.18, 0.15, 16]} /></mesh>
                <mesh position={[-0.8, 0.25, 0]} material={materials.concreteSlab}><boxGeometry args={[0.4, 0.45, 0.6]} /></mesh>
              </group>
            </group>
          )}
        </group>
      )}

      {showL2 && showSlabsAndWalls && (
        <group name="Level_2">
          <mesh position={[0, H1 + 0.1, 0]} material={materials.concreteSlab} castShadow receiveShadow><boxGeometry args={[W, 0.25, D]} /></mesh>
          <mesh position={[0, H1 + 0.24, 0]} material={materials.interiorWalnut} receiveShadow><boxGeometry args={[W - 0.2, 0.02, D - 0.2]} /></mesh>

          <group position={[0, H1 + 0.12, D / 2 + 0.8]}>
            <mesh material={materials.woodDeck} castShadow receiveShadow><boxGeometry args={[W, 0.18, 1.8]} /></mesh>
            <group position={[0, 0.5, 0]}>
              <mesh position={[0, 0.4, 0.85]} material={materials.blackFrame}><boxGeometry args={[W, 0.06, 0.06]} /></mesh>
              <mesh position={[-W / 2 + 0.05, 0.2, 0.85]} material={materials.blackFrame}><boxGeometry args={[0.06, 0.5, 0.06]} /></mesh>
              <mesh position={[W / 2 - 0.05, 0.2, 0.85]} material={materials.blackFrame}><boxGeometry args={[0.06, 0.5, 0.06]} /></mesh>
              {[0.1, 0.22, 0.34].map((rY, idx) => (
                <mesh key={`rail-${idx}`} position={[0, rY, 0.85]} material={materials.blackFrame}><boxGeometry args={[W - 0.1, 0.02, 0.02]} /></mesh>
              ))}
            </group>
          </group>

          <mesh position={[0, H1 + (H2 - H1) / 2, -D / 2 + 0.1]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[W, H2 - H1 - 0.25, 0.2]} /></mesh>
          <mesh position={[-W / 2 + 0.1, H1 + (H2 - H1) / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H2 - H1 - 0.25, D]} /></mesh>
          <mesh position={[W / 2 - 0.1, H1 + (H2 - H1) / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H2 - H1 - 0.25, D]} /></mesh>

          {(renderFrontWall || isDollhouse) && (
            <group position={[0, H1 + (H2 - H1) / 2, D / 2 - 0.1]}>
              <mesh material={materials.blackFrame}><boxGeometry args={[W, H2 - H1 - 0.25, 0.08]} /></mesh>
              {showDetailsAndGlass && <mesh material={materials.glass}><boxGeometry args={[W - 0.4, H2 - H1 - 0.4, 0.02]} /></mesh>}
            </group>
          )}

          {showInteriors && (
            <group name="L2_Interiors">
              <mesh position={[-1.8, H1 + (H2 - H1) / 2, -3.2]} material={materials.interiorWall} castShadow receiveShadow><boxGeometry args={[3.2, H2 - H1 - 0.25, 0.12]} /></mesh>
              <mesh position={[-0.2, H1 + (H2 - H1) / 2, -4.4]} material={materials.interiorWall} castShadow receiveShadow><boxGeometry args={[0.12, H2 - H1 - 0.25, 2.2]} /></mesh>

              <group position={[0.5, H1 + 0.26, 0.5]}>
                <mesh position={[0, 0.35, -1.2]} material={materials.kitchenCabinet} castShadow><boxGeometry args={[2.1, 0.7, 0.15]} /></mesh>
                <mesh position={[0, 0.3, -0.2]} material={materials.bedSheet} castShadow receiveShadow><boxGeometry args={[2.0, 0.45, 2.1]} /></mesh>
                <mesh position={[-0.55, 0.58, -1.0]} material={materials.bedPillow}><boxGeometry args={[0.7, 0.15, 0.4]} /></mesh>
                <mesh position={[0.55, 0.58, -1.0]} material={materials.bedPillow}><boxGeometry args={[0.7, 0.15, 0.4]} /></mesh>
                {[-1.3, 1.3].map((x, idx) => (
                  <group key={`nightstand-${idx}`} position={[x, 0, -1.1]}>
                    <mesh position={[0, 0.25, 0]} material={materials.kitchenCabinet} castShadow><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>
                    <mesh position={[0, 0.6, 0]} material={materials.lampEmitter}><cylinderGeometry args={[0.12, 0.16, 0.25, 12]} /></mesh>
                    {(interiorLightsOn || timeOfDay === 'night') && <pointLight position={[0, 0.7, 0]} intensity={2.0} color="#ffcc77" distance={3} />}
                  </group>
                ))}
                <mesh position={[0, 0.01, 0]} material={materials.rugFabric} receiveShadow><boxGeometry args={[2.8, 0.02, 2.8]} /></mesh>
              </group>

              <group position={[-2.2, H1 + 0.26, -4.2]}>
                <mesh position={[0, 0.01, 0]} material={materials.bathroomTile} receiveShadow><boxGeometry args={[2.4, 0.02, 2.4]} /></mesh>
                <mesh position={[-0.6, 1.0, -0.6]} material={materials.glass}><boxGeometry args={[1.1, 2.0, 1.1]} /></mesh>
                <mesh position={[0.5, 0.4, 0.5]} material={materials.woodDeck} castShadow><boxGeometry args={[1.2, 0.4, 0.5]} /></mesh>
                <mesh position={[0.2, 0.65, 0.5]} material={materials.concreteSlab}><cylinderGeometry args={[0.18, 0.15, 0.12, 16]} /></mesh>
                <mesh position={[0.8, 0.65, 0.5]} material={materials.concreteSlab}><cylinderGeometry args={[0.18, 0.15, 0.12, 16]} /></mesh>
                {(interiorLightsOn || timeOfDay === 'night') && <pointLight position={[0, 1.8, 0]} intensity={1.8} color="#ffddaa" distance={2.5} />}
              </group>
            </group>
          )}
        </group>
      )}

      {showL3 && showSlabsAndWalls && (
        <group name="Level_3">
          <mesh position={[0, H2 + 0.1, 0]} material={materials.concreteSlab} castShadow receiveShadow><boxGeometry args={[W, 0.25, D]} /></mesh>
          <mesh position={[0, H2 + 0.24, 0]} material={materials.interiorWalnut} receiveShadow><boxGeometry args={[W - 0.2, 0.02, D - 0.2]} /></mesh>

          <group position={[0, H2 + 0.12, D / 2 + 1.2]}>
            <mesh material={materials.woodDeck} castShadow receiveShadow><boxGeometry args={[W, 0.18, 2.4]} /></mesh>
            <group position={[0, 0.5, 0]}>
              <mesh position={[0, 0.4, 1.15]} material={materials.blackFrame}><boxGeometry args={[W, 0.06, 0.06]} /></mesh>
              <mesh position={[-W / 2 + 0.05, 0.2, 1.15]} material={materials.blackFrame}><boxGeometry args={[0.06, 0.5, 0.06]} /></mesh>
              <mesh position={[W / 2 - 0.05, 0.2, 1.15]} material={materials.blackFrame}><boxGeometry args={[0.06, 0.5, 0.06]} /></mesh>
              {[0.1, 0.22, 0.34].map((rY, idx) => (
                <mesh key={`urail-${idx}`} position={[0, rY, 1.15]} material={materials.blackFrame}><boxGeometry args={[W - 0.1, 0.02, 0.02]} /></mesh>
              ))}
            </group>
          </group>

          <mesh position={[-W / 2 + 0.1, H2 + (H3 - H2) / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H3 - H2 - 0.25, D]} /></mesh>
          <mesh position={[W / 2 - 0.1, H2 + (H3 - H2) / 2, 0]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[0.2, H3 - H2 - 0.25, D]} /></mesh>
          <mesh position={[0, H2 + (H3 - H2) / 2, -D / 2 + 0.1]} material={materials.darkPanel} castShadow receiveShadow><boxGeometry args={[W, H3 - H2 - 0.25, 0.2]} /></mesh>

          {(renderFrontWall || isDollhouse) && (
            <group position={[0, H2 + (H3 - H2) / 2, D / 2 - 0.1]}>
              <mesh material={materials.blackFrame}><boxGeometry args={[W, H3 - H2 - 0.25, 0.08]} /></mesh>
              {showDetailsAndGlass && <mesh material={materials.glass}><boxGeometry args={[W - 0.4, H3 - H2 - 0.4, 0.02]} /></mesh>}
            </group>
          )}

          {showInteriors && (
            <group name="L3_Interiors" position={[0, H2 + 0.26, 0]}>
              <mesh position={[1.5, 0.38, 1.2]} material={materials.kitchenCabinet} castShadow><boxGeometry args={[1.6, 0.75, 0.8]} /></mesh>
              <mesh position={[1.5, 0.45, 0.4]} material={materials.blackFrame} castShadow><boxGeometry args={[0.6, 0.9, 0.6]} /></mesh>
              <mesh position={[-1.8, 0.35, 1.0]} material={materials.sofaFabric} castShadow><boxGeometry args={[1.0, 0.7, 1.0]} /></mesh>
              <mesh position={[-2.2, 1.0, -2.5]} material={materials.kitchenCabinet} castShadow><boxGeometry args={[1.2, 2.0, 0.4]} /></mesh>
              {(interiorLightsOn || timeOfDay === 'night') && <pointLight position={[0, 2.2, 0]} intensity={2.5} color="#ffeecc" distance={5} />}
            </group>
          )}
        </group>
      )}

      {renderRoof && (
        <group name="Pitched_Gable_Roof" position={[0, H3, 0]}>
          <mesh
            position={[-W / 4, (H_PEAK - H3) / 2, 0]}
            rotation={[0, 0, Math.atan2(H_PEAK - H3, W / 2)]}
            material={materials.roofZinc}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[Math.sqrt(Math.pow(W / 2, 2) + Math.pow(H_PEAK - H3, 2)) + 0.6, 0.15, D + 0.8]} />
          </mesh>
          <mesh
            position={[W / 4, (H_PEAK - H3) / 2, 0]}
            rotation={[0, 0, -Math.atan2(H_PEAK - H3, W / 2)]}
            material={materials.roofZinc}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[Math.sqrt(Math.pow(W / 2, 2) + Math.pow(H_PEAK - H3, 2)) + 0.6, 0.15, D + 0.8]} />
          </mesh>
          <group position={[0, 0.8, D / 2 + 0.02]}>
            <mesh material={materials.blackFrame}><boxGeometry args={[W, 0.1, 0.08]} /></mesh>
            {showDetailsAndGlass && <mesh position={[0, 0.3, 0]} material={materials.glass}><boxGeometry args={[W - 0.6, 1.2, 0.02]} /></mesh>}
          </group>
        </group>
      )}

      {showLandscaping && showFoundation && (
        <group name="Landscaping_And_Trees">
          <mesh position={[-W / 2 - 0.3, 0.35, D / 2 + 1.8]} material={materials.planterDark} castShadow receiveShadow><boxGeometry args={[0.5, 0.5, 3.8]} /></mesh>
          <mesh position={[W / 2 + 0.3, 0.35, D / 2 + 1.8]} material={materials.planterDark} castShadow receiveShadow><boxGeometry args={[0.5, 0.5, 3.8]} /></mesh>
          <mesh position={[0, 0.35, D / 2 + 3.8]} material={materials.planterDark} castShadow receiveShadow><boxGeometry args={[W + 1.1, 0.5, 0.5]} /></mesh>

          <group position={[-2.0, 0.28, D / 2 + 1.8]}>
            <mesh position={[0, 0.15, 0]} material={materials.planterDark} castShadow><cylinderGeometry args={[0.5, 0.55, 0.3, 16]} /></mesh>
            <mesh position={[0, 0.22, 0]} material={materials.firePitEmber}><cylinderGeometry args={[0.42, 0.42, 0.05, 16]} /></mesh>
            <pointLight position={[0, 0.35, 0]} intensity={timeOfDay === 'night' ? 4.0 : 1.5} color="#ff6611" distance={4} />
            <mesh position={[0.9, 0.22, 0.2]} material={materials.woodDeck} castShadow><boxGeometry args={[0.65, 0.45, 0.65]} /></mesh>
          </group>

          <group position={[-W / 2 - 1.2, 0.25, D / 2 + 0.8]}>
            <mesh position={[0, 1.8, 0]} material={materials.trunkWood} castShadow><cylinderGeometry args={[0.12, 0.22, 3.6, 12]} /></mesh>
            <mesh position={[0, 3.8, 0]} material={materials.foliageGreen} castShadow><sphereGeometry args={[1.5, 16, 16]} /></mesh>
            <mesh position={[-0.5, 4.4, 0.3]} material={materials.foliageGreen} castShadow><sphereGeometry args={[1.1, 16, 16]} /></mesh>
            <mesh position={[0.4, 4.2, -0.4]} material={materials.foliageGreen} castShadow><sphereGeometry args={[1.2, 16, 16]} /></mesh>
          </group>

          <group position={[W / 2 + 1.1, 0.25, D / 2 + 2.2]}>
            <mesh position={[0, 1.2, 0]} material={materials.trunkWood} castShadow><cylinderGeometry args={[0.1, 0.16, 2.4, 12]} /></mesh>
            <mesh position={[0, 2.2, 0]} material={materials.foliageGreen} castShadow><coneGeometry args={[1.1, 2.2, 12]} /></mesh>
            <mesh position={[0, 3.2, 0]} material={materials.foliageGreen} castShadow><coneGeometry args={[0.8, 1.8, 12]} /></mesh>
          </group>
        </group>
      )}
    </group>
  );
};
