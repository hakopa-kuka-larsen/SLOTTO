import React from 'react'
import { Vector3 } from 'three'

interface ReelFrameProps {
  position?: [number, number, number]
  width?: number
  height?: number
  depth?: number
}

/**
 * Simple dark grey frame component to place behind the reels
 */
const ReelFrame: React.FC<ReelFrameProps> = ({
  position = [0, 0, -300],
  width = 800,
  height = 400,
  depth = 200,
}) => {
  return (
    <group position={new Vector3(...position)}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}

export default ReelFrame
