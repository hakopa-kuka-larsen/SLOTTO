import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh } from 'three'
import { LEVER } from '../utils/constants'

interface LeverProps {
  position: [number, number, number]
  onPull: () => void
  isSpinning: boolean
}

/**
 * Lever component that can be pulled to trigger the slot machine
 */
const Lever: React.FC<LeverProps> = ({ position, onPull, isSpinning }) => {
  const leverRef = useRef<Mesh>(null)
  const [isPulling, setIsPulling] = useState(false)
  const pullProgress = useRef(0)
  const springEffect = useRef(0)

  // Handle lever animation
  useFrame((_, delta) => {
    if (!leverRef.current) return

    if (isPulling) {
      // Slow start (first 20% of the pull)
      if (pullProgress.current < 0.2) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 0.3
      }
      // Acceleration in the middle (20-80% of the pull)
      else if (pullProgress.current < 0.8) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 1.5
      }
      // Spring effect at the end (80-100% of the pull)
      else if (pullProgress.current < 1) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 2.5
      }

      if (pullProgress.current >= 1) {
        pullProgress.current = 0
        setIsPulling(false)
        onPull()
      }

      // Apply spring effect at the end of the pull
      if (pullProgress.current > 0.9) {
        springEffect.current =
          Math.sin((pullProgress.current - 0.9) * 10) * 0.05
      }

      // Rotate from start angle to end angle with spring effect
      leverRef.current.rotation.x =
        LEVER.ROTATION.START +
        (Math.PI / 2) * pullProgress.current +
        springEffect.current
    } else if (!isSpinning) {
      // Return to original position at the original speed
      const currentRotation = leverRef.current.rotation.x
      const targetRotation = LEVER.ROTATION.START
      leverRef.current.rotation.x +=
        (targetRotation - currentRotation) * LEVER.ROTATION.RETURN_SPEED
    }
  })

  // Handle pointer down event
  const handlePointerDown = () => {
    // Only allow pulling when the lever is at its starting position
    if (
      !isSpinning &&
      !isPulling &&
      leverRef.current &&
      Math.abs(leverRef.current.rotation.x - LEVER.ROTATION.START) < 0.05
    ) {
      setIsPulling(true)
      pullProgress.current = 0
      springEffect.current = 0
    }
  }

  return (
    <group position={new Vector3(...position)}>
      <group rotation={[0, 0, 0]}>
        <mesh
          ref={leverRef}
          onPointerDown={handlePointerDown}
          rotation={[LEVER.ROTATION.START, 0, 0]}
        >
          {/* Lever base */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry
              args={[
                LEVER.BASE.radius,
                LEVER.BASE.radius,
                LEVER.BASE.height,
                32,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <meshStandardMaterial color={LEVER.COLORS.BASE} />
          </mesh>

          {/* Lever arm */}
          <mesh position={[0, 0, 1]}>
            <boxGeometry
              args={[LEVER.ARM.width, LEVER.ARM.height, LEVER.ARM.length]}
            />
            <meshStandardMaterial color={LEVER.COLORS.ARM} />
          </mesh>

          {/* Lever handle */}
          <mesh position={[0, 0, 2]}>
            <sphereGeometry args={[LEVER.HANDLE.radius, 32, 32]} />
            <meshStandardMaterial color={LEVER.COLORS.HANDLE} />
          </mesh>
        </mesh>
      </group>
    </group>
  )
}

export default Lever
