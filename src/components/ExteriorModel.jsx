function Window({ position, scale, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow>
      <boxGeometry args={[1, 1, 0.08]} />
      <meshPhysicalMaterial
        color="#172027"
        roughness={0.2}
        metalness={0.05}
        transmission={0.15}
        transparent
        opacity={0.92}
      />
    </mesh>
  )
}

export default function ExteriorModel() {
  return (
    <group>
      {/* Platform V0.1: 16 x 16 m */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[16, 0.18, 16]} />
        <meshStandardMaterial color="#b9b9b7" roughness={0.92} />
      </mesh>

      {/* Temporary dimensional blockout. Replaced by approved exterior GLB. */}
      <group position={[0, 0.18, 0]}>
        <mesh castShadow receiveShadow position={[0, 1.55, 0]}>
          <boxGeometry args={[10.8, 3.1, 9.6]} />
          <meshStandardMaterial color="#9b806a" roughness={0.72} />
        </mesh>

        <mesh castShadow receiveShadow position={[0, 4.65, 0]}>
          <boxGeometry args={[10.3, 3.1, 9.1]} />
          <meshStandardMaterial color="#ecebe7" roughness={0.66} />
        </mesh>

        <mesh castShadow position={[0, 6.5, 0]}>
          <boxGeometry args={[10.45, 0.6, 9.25]} />
          <meshStandardMaterial color="#e6e5e1" roughness={0.7} />
        </mesh>

        {/* South/front */}
        <Window position={[0, 1.62, 4.84]} scale={[7.2, 2.05, 1]} />
        <Window position={[2.1, 4.72, 4.59]} scale={[5.2, 1.9, 1]} />

        {/* West/east temporary openings. Rotated 90° so they sit on side façades. */}
        <Window position={[-5.44, 1.62, 0.5]} scale={[3.4, 2.0, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Window position={[5.19, 4.72, -0.7]} scale={[3.1, 1.85, 1]} rotation={[0, Math.PI / 2, 0]} />
      </group>
    </group>
  )
}
