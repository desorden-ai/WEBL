import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TOUCH } from 'three'
import ExteriorModel from './ExteriorModel.jsx'

export default function Experience() {
  return (
    <div className="viewer" aria-label="Visor exterior 3D">
      <Canvas
        shadows
        dpr={[1, 2.5]}
        camera={{ position: [15, 11, 15], fov: 38, near: 0.1, far: 150 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#ffffff']} />
        <hemisphereLight args={['#ffffff', '#c8c8c8', 1.35]} />
        <directionalLight
          castShadow
          position={[10, 16, 8]}
          intensity={3.2}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-bias={-0.00015}
        />

        <ExteriorModel />

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={11}
          maxDistance={34}
          minPolarAngle={0.38}
          maxPolarAngle={1.48}
          target={[0, 2.8, 0]}
          touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        />
      </Canvas>
    </div>
  )
}
