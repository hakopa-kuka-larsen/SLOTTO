import React, { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Reel from './Reel'
import Lever from './Lever'
import AxisHelper from './AxisHelper'
import SlotMachineFrame from './SlotMachineFrame'
import { CAMERA, LIGHTING, REEL_SPINNING, REEL } from '../utils/constants'
import { bellCurve } from '../utils/probability'
import { Symbol, SYMBOLS } from '../utils/symbols'

interface DebugDisplayProps {
  reelIndex: number
  symbol: string | null
}

const DebugDisplay: React.FC<DebugDisplayProps> = ({ reelIndex, symbol }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${20 + reelIndex * 30}px`,
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        borderRadius: '4px',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
      }}
    >
      Reel {reelIndex + 1}: {symbol}
    </div>
  )
}

/**
 * Main SlotMachine component that orchestrates the slot machine game
 */
const SlotMachine: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelSpeeds, setReelSpeeds] = useState<number[]>([])
  const completedReels = useRef<Set<number>>(new Set())
  const [selectedSymbols, setSelectedSymbols] = useState<Symbol[]>(
    Array(5).fill(SYMBOLS[0])
  )
  const isDragging = useRef(false)
  const mouseDownTime = useRef(0)

  /**
   * Handle the lever pull event
   */
  const handleLeverPull = () => {
    if (isSpinning) return

    // Reset completed reels tracking
    completedReels.current.clear()

    // Reset selected symbols
    setSelectedSymbols(Array(5).fill(SYMBOLS[0]))

    // Generate random initial speeds for each reel using bell curve
    const speeds = Array(5)
      .fill(0)
      .map(() =>
        bellCurve(REEL.SPIN.INITIAL_SPEED * 0.8, REEL.SPIN.INITIAL_SPEED * 1.2)
      )

    setReelSpeeds(speeds)
    setIsSpinning(true)
  }

  /**
   * Handle when a reel completes its spinning animation
   */
  const handleReelComplete = (index: number) => {
    completedReels.current.add(index)

    // If all reels have completed, stop spinning and log final symbols
    if (completedReels.current.size === 5) {
      setIsSpinning(false)
      console.log('\nFinal Results:')
      console.log('-------------')
      selectedSymbols.forEach((symbol, index) => {
        console.log(`Reel ${index + 1}: ${symbol}`)
      })
      console.log('-------------')
    }
  }

  const handleSymbolSelected = (symbol: Symbol, reelIndex: number) => {
    if (symbol) {
      // Only update if we have a valid symbol
      setSelectedSymbols((prev) => {
        const newSymbols = [...prev]
        newSymbols[reelIndex] = symbol
        return newSymbols
      })
    }
  }

  // Calculate camera position
  const cameraX = Math.sin(CAMERA.ANGLE) * CAMERA.DISTANCE
  const cameraZ = Math.cos(CAMERA.ANGLE) * CAMERA.DISTANCE

  // Calculate dynamic lighting position
  const dynamicLighting = [...LIGHTING.POINT]
  dynamicLighting[0].position = [cameraX, 0, cameraZ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Canvas
        camera={{
          position: [cameraX, 0, cameraZ],
          fov: CAMERA.FOV,
          near: CAMERA.NEAR,
          far: CAMERA.FAR,
        }}
        dpr={[1, 2]}
        onPointerDown={(event) => {
          mouseDownTime.current = Date.now()
        }}
        onPointerUp={(event) => {
          // If the pointer has moved significantly or we held for more than 200ms, it's a drag
          const wasShortClick = Date.now() - mouseDownTime.current < 200
          if (wasShortClick && !isDragging.current) {
            handleLeverPull()
          }
          // Reset drag state
          isDragging.current = false
        }}
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          onStart={() => {
            isDragging.current = true
          }}
        />
        <AxisHelper />

        {/* Lighting setup */}
        <ambientLight intensity={LIGHTING.AMBIENT.intensity} />
        {dynamicLighting.map((light, index) => (
          <pointLight
            key={index}
            position={light.position}
            intensity={light.intensity}
          />
        ))}

        {/* Slot machine frame */}
        <SlotMachineFrame />

        {/* Decorative Lever */}
        <Lever
          position={[4, -1, 0]}
          onPull={() => {}}
          isSpinning={isSpinning}
        />

        {/* Reels */}
        {[...Array(5)].map((_, index) => (
          <Reel
            key={index}
            position={[index * 1.2 - 2.4, 0, 0]}
            initialSpeed={reelSpeeds[index] || 0}
            isSpinning={isSpinning}
            onComplete={() => handleReelComplete(index)}
            reelIndex={index}
            onSymbolSelected={handleSymbolSelected}
            selectedSymbol={selectedSymbols[index]}
          />
        ))}
      </Canvas>

      {/* Debug displays */}
      {selectedSymbols.map((symbol, index) => (
        <DebugDisplay key={index} reelIndex={index} symbol={symbol} />
      ))}
    </div>
  )
}

export default SlotMachine
