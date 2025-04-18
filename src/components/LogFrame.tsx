import React from 'react'
import { Vector3 } from 'three'

interface LogFrameProps {
  position?: [number, number, number]
  width?: number
  height?: number
  depth?: number
  logThickness?: number
}

/**
 * Log-style frame component that surrounds the reels like logs glued together at right angles
 */
const LogFrame: React.FC<LogFrameProps> = ({
  position = [0, 0, -1.0],
  width = 8,
  height = 4,
  depth = 0.5,
  logThickness = 0.3,
}) => {
  return (
    <group position={new Vector3(...position)}>
      {/* Top log */}
      <mesh position={[0, height / 2 + logThickness / 2, 0]}>
        <boxGeometry args={[width + logThickness * 2, logThickness, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Bottom log */}
      <mesh position={[0, -height / 2 - logThickness / 2, 0]}>
        <boxGeometry args={[width + logThickness * 2, logThickness, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Left log */}
      <mesh position={[-width / 2 - logThickness / 2, 0, 0]}>
        <boxGeometry args={[logThickness, height + logThickness * 2, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Right log */}
      <mesh position={[width / 2 + logThickness / 2, 0, 0]}>
        <boxGeometry args={[logThickness, height + logThickness * 2, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Corner joints - top left */}
      <mesh
        position={[
          -width / 2 - logThickness / 2,
          height / 2 + logThickness / 2,
          0,
        ]}
      >
        <boxGeometry args={[logThickness, logThickness, depth]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Corner joints - top right */}
      <mesh
        position={[
          width / 2 + logThickness / 2,
          height / 2 + logThickness / 2,
          0,
        ]}
      >
        <boxGeometry args={[logThickness, logThickness, depth]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Corner joints - bottom left */}
      <mesh
        position={[
          -width / 2 - logThickness / 2,
          -height / 2 - logThickness / 2,
          0,
        ]}
      >
        <boxGeometry args={[logThickness, logThickness, depth]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Corner joints - bottom right */}
      <mesh
        position={[
          width / 2 + logThickness / 2,
          -height / 2 - logThickness / 2,
          0,
        ]}
      >
        <boxGeometry args={[logThickness, logThickness, depth]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  )
}

export default LogFrame
