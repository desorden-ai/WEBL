import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSolPbrTextures } from '../materials/useSolPbrTextures';

interface HouseBlockoutProps {
  wireframeMode?: boolean;
}

export const HouseBlockout: React.FC<HouseBlockoutProps> = ({ wireframeMode = false }) => {
  // Charcoal facade PBR textures (restrained microtexture, dark charcoal)
  const facadePbr = useSolPbrTextures('04_charcoal_facade', [0.6, 0.6]);
  const facadeNormalScale = useMemo(() => new THREE.Vector2(0.14, 0.14), []);

  // Dark roof PBR textures calibrated at [1.0, 1.0] repeat for uniform dark graphite mineral surface
  const roofPbr = useSolPbrTextures('05_dark_roof', {
    repeat: [1.0, 1.0],
    enableNormal: false,
  });

  return (
    <group position={[0, 0, 0]} name="CASA_01_Massing">
      {/* Seated Deck & Foundation Platform */}
      <mesh position={[0, 0.1, 0.4]} receiveShadow castShadow>
        <boxGeometry args={[15.2, 0.2, 8.2]} />
        <meshStandardMaterial
          color="#242a29"
          roughness={0.72}
          metalness={0.05}
          wireframe={wireframeMode}
        />
      </mesh>

      {/* Main Base Floor Slab (Slim profile) */}
      <mesh position={[0, 0.25, 0.0]} receiveShadow castShadow>
        <boxGeometry args={[14.4, 0.15, 6.8]} />
        <meshStandardMaterial
          color="#1b2021"
          roughness={0.72}
          metalness={0.05}
          wireframe={wireframeMode}
        />
      </mesh>

      {/*
        Primary front glazing.
        IMPORTANT: this is intentionally a thin facade pane, not a full-depth glass box.
        The previous 5.8 m-deep transmissive volume darkened/occluded the entire interior and
        made every lighting workaround fail. The front face remains at the exact same Z≈3.10 m.
      */}
      <group name="Primary_Glazed_Living_Facade_Shell">
        {/* Front pane: preserves the original outer front face at Z = 3.10 m. */}
        <mesh
          name="Primary_Glazed_Living_Front"
          position={[0.6, 1.6, 3.075]}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[12.8, 2.5, 0.05]} />
          <meshPhysicalMaterial
            color="#3a484d"
            roughness={0.16}
            metalness={0.0}
            transmission={0.88}
            transparent={true}
            opacity={1.0}
            ior={1.47}
            reflectivity={0.28}
            clearcoat={0.12}
            clearcoatRoughness={0.20}
            thickness={0.05}
            emissive="#000000"
            emissiveIntensity={0.0}
            depthWrite={false}
            wireframe={wireframeMode}
          />
        </mesh>

        {/* Right return pane: keeps the original glazed envelope readable in the 3/4 Hero view without filling the room with glass. */}
        <mesh
          name="Primary_Glazed_Living_Right_Return"
          position={[6.975, 1.6, 0.2]}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[0.05, 2.5, 5.8]} />
          <meshPhysicalMaterial
            color="#3a484d"
            roughness={0.16}
            metalness={0.0}
            transmission={0.88}
            transparent={true}
            opacity={1.0}
            ior={1.47}
            reflectivity={0.28}
            clearcoat={0.12}
            clearcoatRoughness={0.20}
            thickness={0.05}
            emissive="#000000"
            emissiveIntensity={0.0}
            depthWrite={false}
            wireframe={wireframeMode}
          />
        </mesh>
      </group>

      {/*
        Warm interior light now works on the existing floor / roof underside / opaque volumes.
        Three.js PointLight uses physically-correct candela-like intensity: values around 1–2
        were effectively negligible. These lights stay short-range and fully inside CASA so
        they create visible warm interior depth without spilling onto the exterior site.
      */}
      {!wireframeMode && (
        <group name="Interior_Illumination_System">
          <pointLight
            name="Interior_Warm_Key"
            position={[2.3, 1.45, 0.7]}
            color="#ffad66"
            intensity={42}
            distance={2.4}
            decay={2}
            castShadow={false}
          />

          <pointLight
            name="Interior_Warm_Fill"
            position={[0.2, 1.35, -0.7]}
            color="#ff9252"
            intensity={28}
            distance={2.2}
            decay={2}
            castShadow={false}
          />
        </group>
      )}

      {/* Rear & Side Dark Opaque Architectural Wall Volume (04_charcoal_facade PBR) */}
      <mesh position={[-3.2, 1.6, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 2.5, 4.0]} />
        <meshStandardMaterial
          map={facadePbr.map}
          normalMap={facadePbr.normalMap}
          normalScale={facadeNormalScale}
          roughnessMap={facadePbr.roughnessMap}
          roughness={0.76}
          metalness={0.04}
          wireframe={wireframeMode}
        />
      </mesh>

      {/* Vertical Architectural Chimney Stack (04_charcoal_facade PBR) */}
      <mesh position={[3.6, 2.2, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 4.2, 1.8]} />
        <meshStandardMaterial
          map={facadePbr.map}
          normalMap={facadePbr.normalMap}
          normalScale={facadeNormalScale}
          roughnessMap={facadePbr.roughnessMap}
          roughness={0.76}
          metalness={0.03}
          wireframe={wireframeMode}
        />
      </mesh>

      {/* Slim Flat Roof Slab (05_dark_roof PBR) */}
      <mesh position={[0, 2.92, 0.2]} receiveShadow castShadow>
        <boxGeometry args={[15.0, 0.18, 7.4]} />
        <meshStandardMaterial
          map={roofPbr.map}
          normalMap={null}
          roughnessMap={roofPbr.roughnessMap}
          roughness={0.72}
          metalness={0.05}
          wireframe={wireframeMode}
        />
      </mesh>

      {/* Slender Dark Steel Columns Supporting Front Overhang */}
      {[
        [-6.8, 1.6, 3.6],
        [6.8, 1.6, 3.6],
        [-6.8, 1.6, -3.0],
        [6.8, 1.6, -3.0],
      ].map(([x, y, z], index) => (
        <mesh key={`col-${index}`} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 2.5, 12]} />
          <meshStandardMaterial
            color="#0c1011"
            roughness={0.38}
            metalness={0.55}
            wireframe={wireframeMode}
          />
        </mesh>
      ))}

      {/* Crisp Roof Edge Profile */}
      <mesh position={[0, 3.0, 3.88]}>
        <boxGeometry args={[15.02, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#0c1011"
          roughness={0.38}
          metalness={0.55}
          wireframe={wireframeMode}
        />
      </mesh>
    </group>
  );
};
