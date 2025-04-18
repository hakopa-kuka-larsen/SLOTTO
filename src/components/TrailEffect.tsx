import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TrailEffectProps {
  target: THREE.Object3D
  length?: number
  fadeSpeed?: number
  color?: string
  width?: number
}

const TrailEffect: React.FC<TrailEffectProps> = ({
  target,
  length = 20,
  fadeSpeed = 0.1,
  color = '#00ff00',
  width = 0.1,
}) => {
  const points = useRef<THREE.Vector3[]>([])
  const lineRef = useRef<THREE.Line>(null)

  useEffect(() => {
    // Initialize points array with target's current position
    const initialPosition = target.position.clone()
    points.current = Array(length)
      .fill(null)
      .map(() => initialPosition.clone())
  }, [length, target])

  useFrame(() => {
    if (!lineRef.current) return

    // Add current position to the front
    points.current.unshift(target.position.clone())
    // Remove last position
    if (points.current.length > length) {
      points.current.pop()
    }

    // Update line geometry
    const geometry = lineRef.current.geometry as THREE.BufferGeometry
    const positions = new Float32Array(points.current.length * 3)

    points.current.forEach((point, i) => {
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    })

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        linewidth={width}
      />
    </line>
  )
}

export default TrailEffect
