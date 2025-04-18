import React from 'react'
import { SLOT_MACHINE } from '../utils/constants'

/**
 * Component that renders the frame of the slot machine
 */
const SlotMachineFrame: React.FC = () => {
  return (
    <>
      {/* Slot machine frame - thick wireframe */}
      <group position={[0, 0, -0.5]}>
        {/* Outer wireframe */}
        <mesh>
          <boxGeometry
            args={[
              SLOT_MACHINE.FRAME.OUTER.width,
              SLOT_MACHINE.FRAME.OUTER.height,
              SLOT_MACHINE.FRAME.OUTER.depth,
            ]}
          />
          <meshLambertMaterial
            color={SLOT_MACHINE.COLORS.FRAME}
            wireframe={true}
            wireframeLinewidth={10}
          />
        </mesh>
        {/* Inner solid edges */}
        <mesh>
          <boxGeometry
            args={[
              SLOT_MACHINE.FRAME.INNER.width,
              SLOT_MACHINE.FRAME.INNER.height,
              SLOT_MACHINE.FRAME.INNER.depth,
            ]}
          />
          <meshBasicMaterial
            color={SLOT_MACHINE.COLORS.FRAME}
            wireframe={true}
            wireframeLinewidth={1}
          />
        </mesh>
      </group>

      {/* Frame border - thick wireframe */}
      <group position={[0, 0, -0.4]}>
        {/* Outer wireframe */}
        <mesh>
          <boxGeometry
            args={[
              SLOT_MACHINE.FRAME.BORDER.OUTER.width,
              SLOT_MACHINE.FRAME.BORDER.OUTER.height,
              SLOT_MACHINE.FRAME.BORDER.OUTER.depth,
            ]}
          />
          <meshBasicMaterial
            color={SLOT_MACHINE.COLORS.BORDER}
            wireframe={true}
            wireframeLinewidth={2}
          />
        </mesh>
        {/* Inner solid edges */}
        <mesh>
          <boxGeometry
            args={[
              SLOT_MACHINE.FRAME.BORDER.INNER.width,
              SLOT_MACHINE.FRAME.BORDER.INNER.height,
              SLOT_MACHINE.FRAME.BORDER.INNER.depth,
            ]}
          />
          <meshBasicMaterial
            color={SLOT_MACHINE.COLORS.BORDER}
            wireframe={true}
            wireframeLinewidth={1}
          />
        </mesh>
      </group>
    </>
  )
}

export default SlotMachineFrame
