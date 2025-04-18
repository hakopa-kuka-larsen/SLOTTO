import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, Mesh, BufferGeometry, Float32BufferAttribute } from 'three'
import { Text } from '@react-three/drei'
import {
  SYMBOLS,
  SYMBOL_COLORS,
  SYMBOL_WEIGHTS,
  Symbol,
  SYMBOL_COUNT,
} from '../utils/symbols'
import { REEL } from '../utils/constants'
import { weightedShuffle } from '../utils/probability'
import { normalizeAngle } from '../utils/geometry'
import { useGame } from '../context/GameContext'
import { getRandomInt } from '../utils/random'

// Reference line position for scoring
const REFERENCE_LINE_Z = 2.2

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
const SYMBOL_SPACING = 2 // Space between symbols
const SNAP_DURATION = 0.5 // Duration of snap animation in seconds

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
  const hasCompletedSnap = useRef(false)
  const hasCompletedRef = useRef(false)
  const { theme } = useGame()
  const [rotation, setRotation] = useState(0)
  const [snapProgress, setSnapProgress] = useState(0)
  const [lastSelectedSymbol, setLastSelectedSymbol] = useState<Symbol | null>(
    null
  )

  // Create an array of exactly 20 symbols with weighted distribution
  const createWeightedSymbols = (): Symbol[] => {
    // Create a weighted pool of symbols based on SYMBOL_WEIGHTS
    const weightedPool: Symbol[] = []
    SYMBOLS.forEach((symbol, index) => {
      const weight = SYMBOL_WEIGHTS[index]
      for (let i = 0; i < weight; i++) {
        weightedPool.push(symbol)
      }
    })

    // Create array of 20 symbols by randomly selecting from the weighted pool
    return Array(20)
      .fill(null)
      .map(() => {
        const randomIndex = Math.floor(Math.random() * weightedPool.length)
        return weightedPool[randomIndex]
      })
  }

  const reelSymbols = useRef<Symbol[]>(createWeightedSymbols())

  // Calculate fixed positions for symbols
  const symbolPositions = SYMBOLS.map((_, index) => ({
    z: index * SYMBOL_SPACING - (SYMBOLS.length * SYMBOL_SPACING) / 2,
  }))

  // Find the closest position to the reference line
  const getClosestPosition = () => {
    return symbolPositions.reduce((closest, current) => {
      const currentDistance = Math.abs(current.z - REFERENCE_LINE_Z)
      const closestDistance = Math.abs(closest.z - REFERENCE_LINE_Z)
      return currentDistance < closestDistance ? current : closest
    })
  }

  // Reset state when spinning starts
  useEffect(() => {
    if (isSpinning) {
      setSnapProgress(0)
      setLastSelectedSymbol(null)
      hasCompletedRef.current = false
    }
  }, [isSpinning])

  // Prevent initial selection
  useEffect(() => {
    setLastSelectedSymbol(null)
    hasCompletedRef.current = false
  }, [])

  useFrame((_, delta) => {
    if (!reelRef.current) return

    if (isSpinning) {
      // Spinning animation
      reelRef.current.rotation.x += delta * 10
    } else if (snapProgress < 1) {
      // Snap animation
      const closestPosition = getClosestPosition()
      const targetRotation = Math.atan2(closestPosition.z, 1) // Calculate exact angle to center

      setSnapProgress((prev) => {
        const newProgress = Math.min(prev + delta / SNAP_DURATION, 1)
        const easedProgress = 1 - Math.pow(1 - newProgress, 3) // Cubic ease-out
        if (reelRef.current) {
          reelRef.current.rotation.x = targetRotation * easedProgress
        }
        return newProgress
      })

      // When snap is complete, record the selected symbol
      if (
        snapProgress >= 0.99 &&
        !lastSelectedSymbol &&
        !hasCompletedRef.current &&
        reelRef.current
      ) {
        hasCompletedRef.current = true // Set this first to prevent multiple selections

        // Calculate the selected symbol index based on the current rotation
        const currentRotation = normalizeAngle(reelRef.current.rotation.x)
        const selectedIndex =
          Math.floor((currentRotation / (Math.PI * 2)) * SEGMENTS) % SEGMENTS
        const selectedSymbol = reelSymbols.current[selectedIndex]

        // Use setTimeout to make the selection asynchronous
        setTimeout(() => {
          setLastSelectedSymbol(selectedSymbol)
          if (onSymbolSelected) {
            onSymbolSelected(selectedSymbol, reelIndex)
          }
          if (onComplete) {
            onComplete()
          }
        }, 100) // Small delay to ensure smooth animation

        // Reset rotation after a delay
        setTimeout(() => {
          if (reelRef.current) {
            reelRef.current.rotation.x = 0
          }
        }, SPIN_COOLDOWN)
      }
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
          color={theme === 'matrix' ? 'white' : '#ffffff'}
          wireframe={theme === 'matrix'}
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
            color={theme === 'matrix' ? '#2a2a2a' : '#333333'}
            wireframe={theme === 'matrix'}
            wireframeLinewidth={1}
          />
        </mesh>

        {/* Black outline */}
        <mesh>
          <primitive
            object={createPrismGeometry(
              REEL.RADIUS + 0.02,
              REEL.THICKNESS + 0.02,
              SEGMENTS
            )}
          />
          <meshBasicMaterial
            color="#000000"
            wireframe={true}
            wireframeLinewidth={3}
          />
        </mesh>

        {/* Symbols on each face */}
        {reelSymbols.current.map((symbol, index) => {
          // Calculate angle for each symbol to ensure equidistant placement
          // Each symbol should be exactly 18 degrees apart (360° ÷ 20 segments)
          const angle = (index / 20) * Math.PI * 2 // Use 20 for exact spacing
          // Calculate position on the circumference
          const x = REEL.RADIUS * Math.cos(angle)
          const z = REEL.RADIUS * Math.sin(angle)
          const isSelected = !isSpinning && symbol === lastSelectedSymbol

          return (
            <group key={index} position={[x, 0, z]}>
              {/* Rotate the group to position the symbol on the reel surface */}
              <group rotation={[0, 0, Math.PI / 2]}>
                {/* Rotate the symbol to face the center of the reel and match the curvature */}
                <group rotation={[angle, 0, 0]}>
                  <Text
                    position={[0, 0, 0.001]}
                    fontSize={REEL.SYMBOL.SIZE}
                    color={
                      isSelected
                        ? '#00FF00'
                        : theme === 'matrix'
                        ? SYMBOL_COLORS[symbol]
                        : '#000000'
                    }
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={1}
                    fillOpacity={isSelected ? 1 : 0.9}
                    outlineWidth={isSelected ? 0.02 : 0.01}
                    outlineColor={theme === 'matrix' ? '#00FF00' : '#000000'}
                    outlineOpacity={isSelected ? 0.5 : 0.3}
                    // Apply additional rotation to make symbols follow the curvature
                    // Offset by 90 degrees (Math.PI/2) to make symbols face the right way
                    rotation={[0, 0, -angle + Math.PI / 2]}
                  >
                    {symbol}
                  </Text>
                </group>
              </group>
            </group>
          )
        })}

        {/* Black horizontal lines between segments */}
        {Array.from({ length: 20 }).map((_, index) => {
          const angle = (index / 20) * Math.PI * 2
          const x = REEL.RADIUS * Math.cos(angle)
          const z = REEL.RADIUS * Math.sin(angle)

          // Calculate the width of the line based on the segment spacing
          const lineWidth = ((Math.PI * 2 * REEL.RADIUS) / 20) * 0.8 // 80% of segment width

          return (
            <group key={`line-${index}`} position={[x, 0, z]}>
              {/* Rotate the group to position the line on the reel surface */}
              <group rotation={[0, 0, Math.PI / 2]}>
                {/* Rotate the line to face the center of the reel */}
                <group rotation={[angle, 0, 0]}>
                  <mesh position={[0, 0, 0.002]}>
                    <planeGeometry args={[lineWidth, 0.02]} />
                    <meshBasicMaterial color="#000000" />
                  </mesh>
                </group>
              </group>
            </group>
          )
        })}
      </mesh>
    </group>
  )
}

export default Reel
