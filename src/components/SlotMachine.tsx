import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Reel from './Reel'
import Lever from './Lever'
import AxisHelper from './AxisHelper'
import SlotMachineFrame from './SlotMachineFrame'
import { CAMERA, LIGHTING, REEL_SPINNING, REEL } from '../utils/constants'
import { bellCurve } from '../utils/probability'
import { Symbol, SYMBOLS } from '../utils/symbols'
import { useGame } from '../context/GameContext'
import GameControls from './GameControls'
import { Vector3 } from 'three'
import { useCameraTransition } from '../hooks/useCameraTransition'

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

const CameraController: React.FC = () => {
  const { controlsRef, cameraMode } = useCameraTransition()

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={cameraMode === 'free'}
      enablePan={cameraMode === 'free'}
      enableRotate={cameraMode === 'free'}
      enabled={cameraMode === 'free'}
    />
  )
}

/**
 * Main SlotMachine component that orchestrates the slot machine game
 */
const SlotMachine: React.FC = () => {
  const { theme, screenShakeEnabled } = useGame()
  const [isSpinning, setIsSpinning] = useState(false)
  const [reelStates, setReelStates] = useState([0, 0, 0])
  const completedReels = useRef<Set<number>>(new Set())
  const [selectedSymbols, setSelectedSymbols] = useState<Symbol[]>(
    Array(5).fill(SYMBOLS[0])
  )
  const isDragging = useRef(false)
  const shakeRef = useRef<HTMLDivElement>(null)

  /**
   * Handle the lever pull event
   */
  const handleLeverPull = () => {
    if (isSpinning) return

    // Trigger screen shake when spinning starts
    if (screenShakeEnabled && shakeRef.current) {
      shakeRef.current.style.animation = 'none'
      shakeRef.current.offsetHeight // Trigger reflow
      shakeRef.current.style.animation =
        'shake 0.5s cubic-bezier(.36,.07,.19,.97)'
    }

    setIsSpinning(true)
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

    setReelStates([1, 1, 1])
    setTimeout(() => setReelStates([0, 1, 1]), 1000)
    setTimeout(() => setReelStates([0, 0, 1]), 2000)
    setTimeout(() => {
      setReelStates([0, 0, 0])
      setIsSpinning(false)

      // Trigger small shudder when stopping
      if (screenShakeEnabled && shakeRef.current) {
        shakeRef.current.style.animation = 'none'
        shakeRef.current.offsetHeight // Trigger reflow
        shakeRef.current.style.animation =
          'shudder 0.3s cubic-bezier(.36,.07,.19,.97)'
      }
    }, 3000)
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

  return (
    <div
      ref={shakeRef}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
    >
      <style>
        {`
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
          @keyframes shudder {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(1px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
            40%, 60% { transform: translate3d(2px, 0, 0); }
          }
        `}
      </style>
      <GameControls />
      <Canvas
        camera={{ position: CAMERA.POSITION, fov: CAMERA.FOV }}
        onClick={handleLeverPull}
        style={{
          background: theme === 'matrix' ? '#000000' : '#ffffff',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
        }}
      >
        <CameraController />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group>
          {selectedSymbols.map((symbol, index) => (
            <Reel
              key={index}
              position={[index * 1.2 - 2.4, 0, 0]}
              initialSpeed={reelStates[index] === 1 ? 5 : 0}
              isSpinning={reelStates[index] === 1}
              onComplete={() => handleReelComplete(index)}
              reelIndex={index}
              onSymbolSelected={handleSymbolSelected}
              selectedSymbol={symbol}
            />
          ))}

          <Lever
            position={[4, 0, 0]}
            onPull={handleLeverPull}
            isSpinning={isSpinning}
          />
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
        {isSpinning ? 'Spinning...' : 'Pull the lever to spin...'}
      </div>
    </div>
  )
}

export default SlotMachine
