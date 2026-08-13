import { TimeOfDay } from '@/data/casa01Canonical';

type Props = {
  timeOfDay: TimeOfDay;
};

function foliageColor(timeOfDay: TimeOfDay) {
  if (timeOfDay === 'day') return '#31573d';
  if (timeOfDay === 'sunset') return '#2a4031';
  return '#1a3027';
}

function ForegroundCluster({
  position,
  rotation,
  scale,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}) {
  const sprays = [
    [-0.7, 4.35, 0.08, 1.1, -0.62],
    [0.5, 4.7, -0.12, 0.95, 0.48],
    [-0.25, 3.55, 0.18, 0.88, -0.25],
    [0.82, 3.8, 0.02, 0.76, 0.72],
  ] as const;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 2.65, 0]} rotation={[0.08, 0, -0.2]}>
        <cylinderGeometry args={[0.075, 0.12, 5.5, 6]} />
        <meshStandardMaterial color="#292a25" roughness={1} />
      </mesh>

      {sprays.map(([x, y, z, sprayScale, yaw], index) => (
        <group key={index} position={[x, y, z]} rotation={[0.18, yaw, index * 0.12]}>
          <mesh scale={[sprayScale, sprayScale * 1.7, sprayScale]}>
            <coneGeometry args={[0.65, 1.9, 6]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
          <mesh
            position={[0.18, -0.45, 0.08]}
            rotation={[0.08, 0.6, 0.18]}
            scale={[sprayScale * 0.72, sprayScale * 1.2, sprayScale * 0.72]}
          >
            <coneGeometry args={[0.55, 1.55, 6]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Casa01CinematicEnvironment({ timeOfDay }: Props) {
  const color = foliageColor(timeOfDay);

  return (
    <group name="Casa01CinematicEnvironment">
      <ForegroundCluster
        position={[-9.4, 0, 10.5]}
        rotation={[0, 0.35, -0.08]}
        scale={0.78}
        color={color}
      />
      <ForegroundCluster
        position={[9.8, 0, -5.5]}
        rotation={[0, -0.55, 0.06]}
        scale={0.63}
        color={color}
      />
    </group>
  );
}
