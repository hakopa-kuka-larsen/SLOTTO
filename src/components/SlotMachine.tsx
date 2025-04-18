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
import { Scene } from './Scene'

interface DebugDisplayProps {
  reelIndex: number
  symbol: string | null
  className?: string
}

const DebugDisplay: React.FC<DebugDisplayProps> = ({
  reelIndex,
  symbol,
  className,
}) => {
  return (
    <div className={`debug-display ${className || ''}`}>
      Reel {reelIndex + 1}: {symbol || 'null'}
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        onClick={handleLeverPull}
        style={{
          width: '100%',
          height: '100%',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
        }}
      >
        <Scene />
        <OrbitControls enableZoom={true} enablePan={false} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {selectedSymbols.map((symbol, index) => (
            <Reel
              key={index}
              position={[index * 1.2 - 2.4, 0, 0]}
              initialSpeed={reelSpeeds[index] || 0}
              isSpinning={isSpinning}
              onComplete={() => handleReelComplete(index)}
              reelIndex={index}
              onSymbolSelected={handleSymbolSelected}
              selectedSymbol={symbol}
            />
          ))}
        </group>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 20, 0, 0.8)',
          border: '1px solid #00ff00',
          color: '#00ff00',
          padding: '12px 16px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          textShadow: '0 0 5px #00ff00',
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
          zIndex: 1000,
        }}
      >
        {selectedSymbols.map((symbol, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            Reel {index + 1}: {symbol || 'null'}
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00ff00',
          fontFamily: 'monospace',
          fontSize: '16px',
          textShadow: '0 0 5px #00ff00',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 1000,
        }}
      >
        {isSpinning ? 'Spinning...' : 'Click to spin...'}
      </div>
    </div>
  )
}

export default SlotMachine
