import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TOUCH } from 'three'
import ExteriorModel from './ExteriorModel.jsx'
import { PROJECT } from '../config/project.js'

export default function Experience() {
  const { camera } = PROJECT

  return (
    <div className="viewer" aria-label="Visor exterior 3D">
      <Canvas
        shadows
        dpr={[1, 2.5]}
        camera={{
          position: camera.initialPosition,
          fov: camera.fov,
          near: camera.near,
          far: camera.far,
        }}
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

        <Suspense fallback={null}>
          <ExteriorModel />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={camera.minDistance}
          maxDistance={camera.maxDistance}
          minPolarAngle={camera.minPolarAngle}
          maxPolarAngle={camera.maxPolarAngle}
          target={camera.target}
          touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
        />
      </Canvas>
    </div>
  )
}
