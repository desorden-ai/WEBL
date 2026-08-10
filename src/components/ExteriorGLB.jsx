import { useEffect, useMemo } from 'react'
import { Box3, Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'
import { PROJECT } from '../config/project.js'
import {
  formatExteriorValidationError,
  validateExteriorBounds,
} from '../utils/exteriorValidation.js'

export default function ExteriorGLB() {
  const { scene } = useGLTF(PROJECT.assets.exteriorModel)
  const platformTop = PROJECT.dimensions.platform.thickness / 2

  const validation = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const expected = PROJECT.dimensions.building

    return validateExteriorBounds(
      {
        width: size.x,
        depth: size.z,
        height: size.y,
        groundY: box.min.y,
      },
      {
        width: expected.maxWidth,
        depth: expected.maxDepth,
        height: expected.targetHeight,
        groundY: 0,
      },
      PROJECT.validation.exteriorModelTolerance,
    )
  }, [scene])

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })

  }, [scene])

  if (!validation.valid) {
    const error = new Error(formatExteriorValidationError(validation))
    error.name = 'ExteriorValidationError'
    error.validation = validation
    error.contract = PROJECT.coordinates.glbContract
    throw error
  }

  return (
    <group position={[0, platformTop, 0]}>
      <primitive object={scene} />
    </group>
  )
}
