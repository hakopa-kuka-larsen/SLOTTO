import React from 'react'

/**
 * Component that displays XYZ axes for debugging purposes
 */
const AxisHelper: React.FC = () => {
  const length = 5 // Length of Y and Z axes
  const xAxisLength = 20 // Extended length for X axis

  return (
    <group position={[-8, 0, 0]}>
      {/* X axis - Red */}
      <mesh position={[xAxisLength / 2, 0, 0]}>
        <boxGeometry args={[xAxisLength, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {/* Y axis - Green */}
      <mesh position={[0, length / 2, 0]}>
        <boxGeometry args={[0.1, length, 0.1]} />
        <meshBasicMaterial color="green" />
      </mesh>
      {/* Z axis - Blue */}
      <mesh position={[0, 0, length / 2]}>
        <boxGeometry args={[0.1, 0.1, length]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    </group>
  )
}

export default AxisHelper
