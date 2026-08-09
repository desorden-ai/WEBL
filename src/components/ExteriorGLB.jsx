import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { PROJECT } from '../config/project.js'

export default function ExteriorGLB() {
  const { scene } = useGLTF(PROJECT.assets.exteriorModel)

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return <primitive object={scene} />
}
