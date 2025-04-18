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
  const returnProgress = useRef(0)
  const isReturning = useRef(false)
  const springEffect = useRef(0)
  const pauseTimer = useRef(0)
  const PAUSE_DURATION = 0.3 // Reduced from 0.5 seconds
  const RETURN_DURATION = 0.7 // Reduced from 1.0 seconds

  // Handle lever animation
  useFrame((_, delta) => {
    if (!leverRef.current) return

    if (isPulling) {
      // Very slow start (first 10% of the pull)
      if (pullProgress.current < 0.1) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 0.1
      }
      // Super snappy acceleration in the middle (10-85% of the pull)
      else if (pullProgress.current < 0.85) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 3.5
      }
      // Dramatic KACHONK effect at the end (85-100% of the pull)
      else if (pullProgress.current < 1) {
        pullProgress.current += delta * LEVER.ROTATION.PULL_SPEED * 4.0
      }

      if (pullProgress.current >= 1) {
        pullProgress.current = 1
        setIsPulling(false)
        isReturning.current = true
        returnProgress.current = 0
        pauseTimer.current = 0
        springEffect.current = 0.2 // Stronger initial spring effect

        // The onPull callback is now called from the SlotMachine component
        // after a delay to ensure the lever is at the bottom of its arc
      }

      // Apply dramatic spring effect at the end of the pull
      if (pullProgress.current > 0.85) {
        // Create a more dramatic "KACHONK" effect with multiple oscillations
        springEffect.current =
          Math.sin((pullProgress.current - 0.85) * 20) * 0.15 + // Fast oscillation
          Math.sin((pullProgress.current - 0.85) * 10) * 0.1 // Slower oscillation
      }

      // Rotate from start angle to end angle with spring effect
      leverRef.current.rotation.x =
        LEVER.ROTATION.START +
        (Math.PI / 2) * pullProgress.current +
        springEffect.current
    } else if (isReturning.current) {
      // First pause at the bottom
      if (pauseTimer.current < PAUSE_DURATION) {
        pauseTimer.current += delta
        // Keep the lever at the bottom position during pause
        leverRef.current.rotation.x = LEVER.ROTATION.START + Math.PI / 2
      }
      // Then slowly return to the top over 1 second
      else {
        returnProgress.current += delta / RETURN_DURATION

        if (returnProgress.current >= 1) {
          returnProgress.current = 1
          isReturning.current = false
          // Reset the lever to its starting position
          leverRef.current.rotation.x = LEVER.ROTATION.START
        } else {
          // Smooth return from bottom to top
          leverRef.current.rotation.x =
            LEVER.ROTATION.START + (Math.PI / 2) * (1 - returnProgress.current)
        }
      }
    }
  })

  // Handle pointer down event
  const handlePointerDown = () => {
    // Only allow pulling when the lever is at its starting position
    if (
      !isSpinning &&
      !isPulling &&
      !isReturning.current &&
      leverRef.current &&
      Math.abs(leverRef.current.rotation.x - LEVER.ROTATION.START) < 0.05
    ) {
      setIsPulling(true)
      pullProgress.current = 0
      springEffect.current = 0
      // Call onPull immediately to trigger the lever pull event
      onPull()
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
