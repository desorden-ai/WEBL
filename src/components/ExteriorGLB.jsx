import { useEffect, useMemo } from 'react'
import { Box3, Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'
import { PROJECT } from '../config/project.js'

function withinTolerance(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance
}

export default function ExteriorGLB() {
  const { scene } = useGLTF(PROJECT.assets.exteriorModel)
  const platformTop = PROJECT.dimensions.platform.thickness / 2

  const bounds = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const min = box.min.clone()
    return { size, min }
  }, [scene])

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })

    const expected = PROJECT.dimensions.building
    const tolerance = PROJECT.validation.exteriorModelTolerance
    const checks = {
      width: withinTolerance(bounds.size.x, expected.maxWidth, tolerance.width),
      depth: withinTolerance(bounds.size.z, expected.maxDepth, tolerance.depth),
      height: withinTolerance(bounds.size.y, expected.targetHeight, tolerance.height),
      ground: Math.abs(bounds.min.y) <= 0.05,
    }

    if (!Object.values(checks).every(Boolean)) {
      console.warn('DESWEB3D GLB contract mismatch', {
        checks,
        measuredMeters: {
          width: bounds.size.x,
          depth: bounds.size.z,
          height: bounds.size.y,
          groundY: bounds.min.y,
        },
        expectedMeters: {
          width: expected.maxWidth,
          depth: expected.maxDepth,
          height: expected.targetHeight,
          groundY: 0,
        },
        contract: PROJECT.coordinates.glbContract,
      })
    }
  }, [bounds, scene])

  return (
    <group position={[0, platformTop, 0]}>
      <primitive object={scene} />
    </group>
  )
}
