import React from 'react'
import { Text } from '@react-three/drei'
import { Vector3 } from 'three'

interface AxisHelperProps {
  position?: [number, number, number]
  size?: number
}

/**
 * AxisHelper component that displays a colored XYZ axis with labels
 */
const AxisHelper: React.FC<AxisHelperProps> = ({
  position = [-5, 0, 0],
  size = 2,
}) => {
  return (
    <group position={new Vector3(...position)}>
      {/* X axis (red) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, size, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="red" linewidth={2} />
      </line>

      {/* Y axis (green) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, size, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="green" linewidth={2} />
      </line>

      {/* Z axis (blue) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, size])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="blue" linewidth={2} />
      </line>

      {/* Labels */}
      <Text
        position={[size + 0.2, 0, 0]}
        fontSize={0.3}
        color="red"
        anchorX="left"
        anchorY="middle"
      >
        X
      </Text>

      <Text
        position={[0, size + 0.2, 0]}
        fontSize={0.3}
        color="green"
        anchorX="center"
        anchorY="bottom"
      >
        Y
      </Text>

      <Text
        position={[0, 0, size + 0.2]}
        fontSize={0.3}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>
    </group>
  )
}

export default AxisHelper
