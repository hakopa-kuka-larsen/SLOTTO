import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ExplosionEffectProps {
  position: [number, number, number]
  intensity?: number
  duration?: number
  particleSize?: number
  active?: boolean
}

const ExplosionEffect: React.FC<ExplosionEffectProps> = ({
  position,
  intensity = 1,
  duration = 1,
  particleSize = 0.05,
  active = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<
    { position: THREE.Vector3; velocity: THREE.Vector3; color: THREE.Color }[]
  >([])
  const startTime = useRef<number>(0)
  const isActive = useRef<boolean>(false)

  // Rainbow colors
  const colors = useMemo(
    () => [
      new THREE.Color('#ff0000'), // Red
      new THREE.Color('#ff7f00'), // Orange
      new THREE.Color('#ffff00'), // Yellow
      new THREE.Color('#00ff00'), // Green
      new THREE.Color('#0000ff'), // Blue
      new THREE.Color('#4b0082'), // Indigo
      new THREE.Color('#9400d3'), // Violet
    ],
    []
  )

  // Create particle geometry
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(100 * 3)
    const colors = new Float32Array(100 * 3)

    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * intensity
      const speed = 1 + Math.random() * 2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      particlesRef.current.push({
        position: new THREE.Vector3(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2]
        ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * speed
        ),
        color: color.clone(),
      })
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return geometry
  }, [intensity])

  // Create particle material
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    })
  }, [particleSize])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    if (active && !isActive.current) {
      isActive.current = true
      startTime.current = performance.now()
    }

    if (!active && isActive.current) {
      isActive.current = false
      material.opacity = 0
      return
    }

    if (!isActive.current) return

    const elapsed = (performance.now() - startTime.current) / 1000
    const progress = Math.min(elapsed / duration, 1)

    // Update opacity based on progress
    material.opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array
    const colors = pointsRef.current.geometry.attributes.color
      .array as Float32Array

    for (let i = 0; i < particlesRef.current.length; i++) {
      const particle = particlesRef.current[i]

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta))

      // Update geometry
      positions[i * 3] = particle.position.x
      positions[i * 3 + 1] = particle.position.y
      positions[i * 3 + 2] = particle.position.z

      // Fade color
      const fade = 1 - progress
      colors[i * 3] = particle.color.r * fade
      colors[i * 3 + 1] = particle.color.g * fade
      colors[i * 3 + 2] = particle.color.b * fade
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <group position={new THREE.Vector3(...position)}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}

export default ExplosionEffect
