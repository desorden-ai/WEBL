import { PROJECT } from '../config/project.js'

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

export default function ExteriorBlockout() {
  const { platform, building } = PROJECT.dimensions
  const lowerHeight = building.floorToFloor
  const upperHeight = building.floorToFloor
  const parapetHeight = building.parapetHeight
  const platformTop = platform.thickness / 2

  return (
    <group>
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[platform.width, platform.thickness, platform.depth]} />
        <meshStandardMaterial color="#b9b9b7" roughness={0.92} />
      </mesh>

      <group position={[0, platformTop, 0]}>
        <mesh
          castShadow
          receiveShadow
          position={[0, lowerHeight / 2, building.lower.centerDepth]}
        >
          <boxGeometry args={[building.lower.width, lowerHeight, building.lower.depth]} />
          <meshStandardMaterial color="#8f735e" roughness={0.76} />
        </mesh>

        <mesh
          castShadow
          receiveShadow
          position={[0, lowerHeight + upperHeight / 2, building.upper.centerDepth]}
        >
          <boxGeometry args={[building.upper.width, upperHeight, building.upper.depth]} />
          <meshStandardMaterial color="#efefec" roughness={0.62} />
        </mesh>

        <mesh
          castShadow
          receiveShadow
          position={[
            0,
            lowerHeight + upperHeight + parapetHeight / 2,
            building.upper.centerDepth,
          ]}
        >
          <boxGeometry args={[building.upper.width, parapetHeight, building.upper.depth]} />
          <meshStandardMaterial color="#e9e9e6" roughness={0.68} />
        </mesh>

        {/* Norte + Oeste: fachadas observadas. Huecos provisionales hasta GLB aprobado. */}
        <Window position={[-3.2, 1.6, 3.84]} scale={[3.5, 2.0, 1]} />
        <Window
          position={[-5.44, 1.6, 2.1]}
          scale={[3.4, 2.0, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Window position={[-2.6, 4.72, 4.84]} scale={[2.8, 1.7, 1]} />
        <Window position={[1.15, 4.72, 4.84]} scale={[2.6, 1.85, 1]} />
        <Window
          position={[-5.44, 4.72, 0.9]}
          scale={[2.2, 1.7, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </group>
    </group>
  )
}
