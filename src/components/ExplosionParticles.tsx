import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
} from 'three'
import { useGame } from '../context/GameContext'

interface ExplosionParticlesProps {
  position: [number, number, number]
  count?: number
  size?: number
  color?: string
  speed?: number
  spread?: number
  onComplete?: () => void
}

const ExplosionParticles: React.FC<ExplosionParticlesProps> = ({
  position,
  count = 200,
  size = 0.05,
  color = '#ffffff',
  speed = 2,
  spread = 1,
  onComplete,
}) => {
  const { theme } = useGame()
  const pointsRef = useRef<Points>(null)
  const particlesRef = useRef<
    { position: Vector3; velocity: Vector3; opacity: number }[]
  >([])
  const [startTime] = useState(Date.now())
  const [isActive, setIsActive] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  // Create particle geometry
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities: Vector3[] = []

    for (let i = 0; i < count; i++) {
      // Start all particles at the center
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0

      // Random velocity outward
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      const r = speed * (0.8 + Math.random() * 0.4) // Random speed variation

      velocities.push(
        new Vector3(
          r * Math.sin(theta) * Math.cos(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(theta)
        )
      )
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    particlesRef.current = velocities.map((velocity) => ({
      position: new Vector3(0, 0, 0),
      velocity,
      opacity: 1,
    }))

    return geometry
  }, [count, speed])

  // Create particle material
  const material = useMemo(() => {
    return new PointsMaterial({
      size,
      color: theme === 'matrix' ? '#00ff00' : color,
      transparent: true,
      opacity: 1,
      blending: theme === 'matrix' ? 2 : 0, // Additive blending for matrix theme
    })
  }, [size, color, theme])

  // Set up cleanup timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(false)
      if (onComplete) {
        onComplete()
      }
    }, 1500) // Remove after 1.5 seconds

    return () => clearTimeout(timer)
  }, [onComplete])

  // Animate particles
  useFrame((_, delta) => {
    if (!pointsRef.current || !isActive || !shouldRender) return

    const elapsedTime = (Date.now() - startTime) / 1000 // Convert to seconds
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      const particle = particlesRef.current[i]

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      // Update opacity based on time - faster fade out
      particle.opacity = Math.max(0, 1 - elapsedTime / 1.5) // Fade out over 1.5 seconds

      // Update geometry
      positions[i * 3] = particle.position.x
      positions[i * 3 + 1] = particle.position.y
      positions[i * 3 + 2] = particle.position.z
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    material.opacity = particlesRef.current[0]?.opacity || 0

    // Check if animation is complete
    if (elapsedTime >= 1.5) {
      setIsActive(false)
    }
  })

  if (!shouldRender) return null

  return (
    <group position={new Vector3(...position)}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

export default ExplosionParticles
