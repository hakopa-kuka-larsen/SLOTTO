import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Vector3,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
} from 'three'
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
import TrailEffect from './TrailEffect'
import ExplosionEffect from './ExplosionEffect'

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

const SEGMENTS = 8 // Reduced number of sides for a more solid look
const SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS
const SPIN_COOLDOWN = 500
const SYMBOL_SPACING = 2
const SNAP_DURATION = 0.5

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
  const [showExplosion, setShowExplosion] = useState(false)

  // Create an array of exactly 20 symbols with weighted distribution
  const createWeightedSymbols = (): Symbol[] => {
    const weightedPool: Symbol[] = []
    SYMBOLS.forEach((symbol, index) => {
      const weight = SYMBOL_WEIGHTS[index]
      for (let i = 0; i < weight; i++) {
        weightedPool.push(symbol)
      }
    })

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
      setShowExplosion(false)
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
      const targetRotation = Math.atan2(closestPosition.z, 1)

      setSnapProgress((prev) => {
        const newProgress = Math.min(prev + delta / SNAP_DURATION, 1)
        const easedProgress = 1 - Math.pow(1 - newProgress, 3)
        if (reelRef.current) {
          reelRef.current.rotation.x = targetRotation * easedProgress
        }
        return newProgress
      })

      // When snap is complete, record the selected symbol and show explosion
      if (
        snapProgress >= 0.99 &&
        !lastSelectedSymbol &&
        !hasCompletedRef.current &&
        reelRef.current
      ) {
        hasCompletedRef.current = true
        setShowExplosion(true)

        const currentRotation = normalizeAngle(reelRef.current.rotation.x)
        const selectedIndex =
          Math.floor((currentRotation / (Math.PI * 2)) * SEGMENTS) % SEGMENTS
        const selectedSymbol = reelSymbols.current[selectedIndex]

        setLastSelectedSymbol(selectedSymbol)
        if (onSymbolSelected) {
          onSymbolSelected(selectedSymbol, reelIndex)
        }
        if (onComplete) {
          onComplete()
        }
      }
    }
  })

  // Create materials
  const outerMaterial = new MeshStandardMaterial({
    color: theme === 'matrix' ? '#00ff00' : '#ffffff',
    metalness: 0.5,
    roughness: 0.5,
    wireframe: theme === 'matrix',
    transparent: true,
    opacity: 0.8,
  })

  const innerMaterial = new MeshStandardMaterial({
    color: theme === 'matrix' ? '#00ff00' : '#e0e0e0',
    metalness: 0.3,
    roughness: 0.7,
    wireframe: theme === 'matrix',
    transparent: true,
    opacity: 0.6,
  })

  return (
    <group position={new Vector3(...position)}>
      {/* Trail effect when spinning */}
      {isSpinning && reelRef.current && (
        <TrailEffect
          target={reelRef.current}
          length={10}
          color={theme === 'matrix' ? '#00ff00' : '#ffffff'}
          width={0.05}
        />
      )}

      {/* Explosion effect when stopping */}
      {showExplosion && (
        <ExplosionEffect
          position={[0, 0, REFERENCE_LINE_Z]}
          intensity={1.5}
          duration={1}
          particleSize={0.1}
          active={true}
        />
      )}

      {/* Outer prism */}
      <mesh ref={reelRef} material={outerMaterial}>
        <primitive
          object={createPrismGeometry(REEL.RADIUS, REEL.THICKNESS, SEGMENTS)}
        />
      </mesh>

      {/* Inner prism */}
      <mesh material={innerMaterial}>
        <primitive
          object={createPrismGeometry(
            REEL.RADIUS - 0.1,
            REEL.THICKNESS - 0.05,
            SEGMENTS
          )}
        />
      </mesh>

      {/* Symbols */}
      {reelSymbols.current.map((symbol, index) => {
        const angle = (index / SEGMENTS) * Math.PI * 2
        const x = Math.cos(angle) * (REEL.RADIUS - 0.2)
        const z = Math.sin(angle) * (REEL.RADIUS - 0.2)

        return (
          <group key={index} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <Text
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              fontSize={0.3}
              color={SYMBOL_COLORS[symbol]}
              anchorX="center"
              anchorY="middle"
            >
              {symbol}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

export default Reel
