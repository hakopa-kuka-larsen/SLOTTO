import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
} from 'three'
import { useGame } from '../context/GameContext'

interface ParticleEffectsProps {
  position: [number, number, number]
  count?: number
  size?: number
  color?: string
  speed?: number
  spread?: number
  active?: boolean
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  position,
  count = 100,
  size = 0.05,
  color = '#ffffff',
  speed = 0.5,
  spread = 1,
  active = false,
}) => {
  const { theme } = useGame()
  const pointsRef = useRef<Points>(null)
  const particlesRef = useRef<{ position: Vector3; velocity: Vector3 }[]>([])

  // Create particle geometry
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const positions = new Float32Array(count * 3)
    const velocities: Vector3[] = []

    for (let i = 0; i < count; i++) {
      // Random position within spread
      const x = (Math.random() - 0.5) * spread
      const y = (Math.random() - 0.5) * spread
      const z = (Math.random() - 0.5) * spread

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Random velocity
      velocities.push(
        new Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        )
      )
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    particlesRef.current = velocities.map((velocity, i) => ({
      position: new Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      ),
      velocity,
    }))

    return geometry
  }, [count, spread, speed])

  // Create particle material
  const material = useMemo(() => {
    return new PointsMaterial({
      size,
      color: theme === 'matrix' ? '#00ff00' : color,
      transparent: true,
      opacity: active ? 0.8 : 0,
      blending: theme === 'matrix' ? 2 : 0, // Additive blending for matrix theme
    })
  }, [size, color, theme, active])

  // Animate particles
  useFrame((_, delta) => {
    if (!pointsRef.current || !active) return

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < count; i++) {
      const particle = particlesRef.current[i]

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      // Reset particles that go too far
      if (
        Math.abs(particle.position.x) > spread ||
        Math.abs(particle.position.y) > spread ||
        Math.abs(particle.position.z) > spread
      ) {
        particle.position.set(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        )
      }

      // Update geometry
      positions[i * 3] = particle.position.x
      positions[i * 3 + 1] = particle.position.y
      positions[i * 3 + 2] = particle.position.z
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group position={new Vector3(...position)}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

export default ParticleEffects
