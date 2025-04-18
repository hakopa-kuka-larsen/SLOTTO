import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
} from 'three'
import { Text } from '@react-three/drei'
import { SYMBOLS, SYMBOL_COLORS, Symbol } from '../utils/symbols'
import { REEL } from '../utils/constants'
import { weightedShuffle } from '../utils/probability'

interface ReelProps {
  position: [number, number, number]
  initialSpeed: number
  isSpinning: boolean
  onComplete?: () => void
  reelIndex: number
  onSymbolSelected?: (symbol: Symbol, reelIndex: number) => void
  selectedSymbol?: Symbol | null
}

const SEGMENTS = 20 // Number of sides in the prism
const SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS // Angle between each segment
const SPIN_COOLDOWN = 500 // Half a second cooldown between spins

/**
 * Normalizes an angle to be between 0 and 2π
 */
const normalizeAngle = (angle: number): number => {
  return ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
}

/**
 * Creates a prism geometry with the specified number of sides
 */
const createPrismGeometry = (
  radius: number,
  height: number,
  segments: number
) => {
  const geometry = new BufferGeometry()
  const vertices = []
  const indices = []

  // Create vertices for top and bottom faces
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)

    // Bottom vertex
    vertices.push(x, -height / 2, z)
    // Top vertex
    vertices.push(x, height / 2, z)
  }

  // Create center vertices for top and bottom
  const bottomCenter = vertices.length / 3
  vertices.push(0, -height / 2, 0)
  const topCenter = vertices.length / 3
  vertices.push(0, height / 2, 0)

  // Create faces
  for (let i = 0; i < segments; i++) {
    const current = i * 2
    const next = ((i + 1) % segments) * 2

    // Side face (two triangles)
    indices.push(current, current + 1, next)
    indices.push(current + 1, next + 1, next)

    // Bottom face
    indices.push(current, next, bottomCenter)

    // Top face
    indices.push(current + 1, topCenter, next + 1)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Reel component that displays a spinning wheel with symbols
 */
const Reel: React.FC<ReelProps> = ({
  position,
  initialSpeed,
  isSpinning,
  onComplete,
  reelIndex,
  onSymbolSelected,
  selectedSymbol,
}) => {
  const reelRef = useRef<Mesh>(null)
  const spinSpeed = useRef(0)
  const isSnapping = useRef(false)
  const snapAnimationProgress = useRef(0)
  const snapStartRotation = useRef(0)
  const reelSymbols = useRef(weightedShuffle([...SYMBOLS]))
  const hasCompletedSnap = useRef(false)
  const lineRef = useRef<Line>(null)
  const [canSpin, setCanSpin] = useState(true)
  const [lastSelectedSymbol, setLastSelectedSymbol] = useState<Symbol | null>(
    null
  )

  useEffect(() => {
    if (isSpinning && canSpin) {
      spinSpeed.current = initialSpeed
      isSnapping.current = false
      snapAnimationProgress.current = 0
      hasCompletedSnap.current = false
      setCanSpin(false)
    }
  }, [isSpinning, initialSpeed, canSpin])

  const getHighestBlueAxisSymbol = () => {
    if (!reelRef.current) return { symbol: SYMBOLS[0], targetRotation: 0 }

    const rotation = reelRef.current.rotation.x
    const normalizedRotation = normalizeAngle(rotation)

    // Find the symbol that intersects with the horizontal line (z = 0)
    const nearestSegmentIndex = Math.round(normalizedRotation / SEGMENT_ANGLE)
    const symbol = SYMBOLS[Math.abs(nearestSegmentIndex % SYMBOLS.length)]

    if (onSymbolSelected) {
      onSymbolSelected(symbol, reelIndex)
    }

    return {
      symbol,
      targetRotation: nearestSegmentIndex * SEGMENT_ANGLE,
    }
  }

  useEffect(() => {
    if (!isSpinning && reelRef.current) {
      const { symbol } = getHighestBlueAxisSymbol()
      setLastSelectedSymbol(symbol)
    }
  }, [isSpinning])

  useEffect(() => {
    if (isSpinning) {
      spinSpeed.current = initialSpeed
    } else {
      spinSpeed.current = 0
      const { symbol } = getHighestBlueAxisSymbol()
      setLastSelectedSymbol(symbol)
    }
  }, [isSpinning, initialSpeed])

  useFrame((_, delta) => {
    if (!reelRef.current) return

    if (isSpinning) {
      if (isSnapping.current) {
        snapAnimationProgress.current += delta * 5
        const progress = Math.min(snapAnimationProgress.current, 1)
        const easeProgress = 1 - (1 - progress) * (1 - progress)
        const currentRotation = snapStartRotation.current

        const { targetRotation } = getHighestBlueAxisSymbol()

        // Ensure we snap to the closest full segment
        reelRef.current.rotation.x =
          currentRotation + (targetRotation - currentRotation) * easeProgress

        if (progress === 1 && !hasCompletedSnap.current) {
          isSnapping.current = false
          hasCompletedSnap.current = true
          // Get final symbol after snapping is complete
          const { symbol } = getHighestBlueAxisSymbol()
          setLastSelectedSymbol(symbol)
          if (onComplete) {
            onComplete()
          }
          // Start cooldown timer
          setTimeout(() => {
            setCanSpin(true)
          }, SPIN_COOLDOWN)
        }
      } else {
        spinSpeed.current *= REEL.SPIN.DECELERATION
        reelRef.current.rotation.x += spinSpeed.current * delta

        if (spinSpeed.current < REEL.SPIN.MIN_SPEED) {
          isSnapping.current = true
          snapStartRotation.current = reelRef.current.rotation.x
          snapAnimationProgress.current = 0
        }
      }
    }

    // Update the purple line position
    if (lineRef.current) {
      const reelRotation = reelRef.current.rotation.x
      const points = []

      // Find the two outermost points (highest blue axis value)
      for (let i = 0; i < SEGMENTS; i++) {
        const angle = (i / SEGMENTS) * Math.PI * 2
        const x = REEL.RADIUS * Math.cos(angle)
        const z = REEL.RADIUS * Math.sin(angle)

        // Transform point based on reel rotation
        const rotatedX = x
        const rotatedZ = z * Math.cos(reelRotation)
        const rotatedY = z * Math.sin(reelRotation)

        points.push(new Vector3(rotatedX, rotatedY, rotatedZ))
      }

      // Sort points by Y value (blue axis) and take the highest two
      points.sort((a, b) => b.y - a.y)
      const highestPoints = points.slice(0, 2)

      // Update line geometry
      const lineGeometry = new BufferGeometry().setFromPoints(highestPoints)
      lineRef.current.geometry = lineGeometry
    }
  })

  return (
    <group position={new Vector3(...position)}>
      <mesh ref={reelRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer prism */}
        <primitive
          object={createPrismGeometry(REEL.RADIUS, REEL.THICKNESS, SEGMENTS)}
        />
        <meshBasicMaterial
          color="white"
          wireframe={true}
          wireframeLinewidth={2}
        />

        {/* Inner prism */}
        <mesh>
          <primitive
            object={createPrismGeometry(
              REEL.RADIUS - 0.1,
              REEL.THICKNESS - 0.05,
              SEGMENTS
            )}
          />
          <meshBasicMaterial
            color="#2a2a2a"
            wireframe={true}
            wireframeLinewidth={1}
          />
        </mesh>

        {/* Symbols on each face */}
        {reelSymbols.current.map((symbol, index) => {
          // Calculate angle for each symbol to ensure equidistant placement
          const angle = (index / SEGMENTS) * Math.PI * 2
          // Calculate position on the circumference
          const x = REEL.RADIUS * Math.cos(angle)
          const z = REEL.RADIUS * Math.sin(angle)
          const isSelected = !isSpinning && symbol === selectedSymbol

          return (
            <group key={index} position={[x, 0, z]} rotation={[0, 0, -angle]}>
              <Text
                position={[0, 0, 0.01]}
                rotation={[0, 0, angle]}
                fontSize={REEL.SYMBOL.SIZE}
                color={isSelected ? '#00FF00' : SYMBOL_COLORS[symbol]}
                anchorX="center"
                anchorY="middle"
                renderOrder={1}
                fillOpacity={isSelected ? 1 : 0.8}
                outlineWidth={isSelected ? 0.02 : 0}
                outlineColor="#00FF00"
                outlineOpacity={isSelected ? 0.5 : 0}
              >
                {symbol}
              </Text>
            </group>
          )
        })}

        {/* Purple line through outermost symbols */}
        <primitive
          object={
            new Line(
              new BufferGeometry(),
              new LineBasicMaterial({ color: 'purple', linewidth: 2 })
            )
          }
          ref={lineRef}
        />
      </mesh>
    </group>
  )
}

export default Reel
