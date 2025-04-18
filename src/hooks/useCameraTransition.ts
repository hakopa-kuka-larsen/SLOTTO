import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGame } from '../context/GameContext'
import { CAMERA } from '../utils/constants'

export const useCameraTransition = () => {
  const { cameraMode } = useGame()
  const controlsRef = useRef<any>()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionProgress = useRef(0)
  const startPosition = useRef<Vector3 | null>(null)
  const startRotation = useRef<[number, number, number] | null>(null)

  useEffect(() => {
    if (cameraMode === 'fixed' && controlsRef.current) {
      startPosition.current = new Vector3(
        controlsRef.current.object.position.x,
        controlsRef.current.object.position.y,
        controlsRef.current.object.position.z
      )
      startRotation.current = [
        controlsRef.current.object.rotation.x,
        controlsRef.current.object.rotation.y,
        controlsRef.current.object.rotation.z,
      ]
      setIsTransitioning(true)
      transitionProgress.current = 0
    }
  }, [cameraMode])

  useFrame((state, delta) => {
    if (isTransitioning && startPosition.current && startRotation.current) {
      transitionProgress.current += delta / 0.2

      if (transitionProgress.current >= 1) {
        setIsTransitioning(false)
        transitionProgress.current = 1
        startPosition.current = null
        startRotation.current = null
      }

      const progress = Math.min(transitionProgress.current, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      state.camera.position.x = CAMERA.POSITION[0] * easeProgress
      state.camera.position.y = CAMERA.POSITION[1] * easeProgress
      state.camera.position.z = CAMERA.POSITION[2] * easeProgress

      state.camera.rotation.x = 0
      state.camera.rotation.y = 0
      state.camera.rotation.z = 0
    }
  })

  return { controlsRef, cameraMode }
}
