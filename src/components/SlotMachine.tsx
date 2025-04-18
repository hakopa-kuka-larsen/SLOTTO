import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Reel from './Reel'
import Lever from './Lever'
import SlotMachineFrame from './SlotMachineFrame'
import AxisHelper from './AxisHelper'
import LogFrame from './LogFrame'
import GeometricLine from './GeometricLine'
import ParticleEffects from './ParticleEffects'
import { CAMERA, LIGHTING, REEL_SPINNING, REEL } from '../utils/constants'
import { bellCurve } from '../utils/probability'
import { Symbol, SYMBOLS, SYMBOL_POINTS } from '../utils/symbols'
import { useGame } from '../context/GameContext'
import GameControls from './GameControls'
import { Vector3 } from 'three'
import { useCameraTransition } from '../hooks/useCameraTransition'
import soundManager from '../utils/sounds'

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
  const completedReelsRef = useRef<Set<number>>(new Set())
  const [selectedSymbols, setSelectedSymbols] = useState<Symbol[]>(
    Array(5).fill(SYMBOLS[0])
  )
  const [totalScore, setTotalScore] = useState(0)
  const isDragging = useRef(false)
  const shakeRef = useRef<HTMLDivElement>(null)
  const [showParticles, setShowParticles] = useState(false)
  const [particleColor, setParticleColor] = useState('#FFD700') // Gold color for wins

  // Start background music when component mounts
  useEffect(() => {
    soundManager.play('BACKGROUND')
    return () => {
      soundManager.stopBackground()
    }
  }, [])

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

    // Reset completed reels tracking
    completedReelsRef.current.clear()

    // Reset selected symbols
    setSelectedSymbols(Array(5).fill(SYMBOLS[0]))

    // Generate random initial speeds for each reel using bell curve
    const speeds = Array(5)
      .fill(0)
      .map(() =>
        bellCurve(REEL.SPIN.INITIAL_SPEED * 0.8, REEL.SPIN.INITIAL_SPEED * 1.2)
      )

    // Delay the spin start until the lever is at the bottom of its arc
    // This creates a more satisfying interaction
    setTimeout(() => {
      setIsSpinning(true)

      // Start all reels spinning at the same time with different speeds
      setReelStates(speeds)

      // Stagger the stopping of reels with shorter intervals for faster animation
      setTimeout(() => setReelStates([0, ...speeds.slice(1)]), 800)
      setTimeout(() => setReelStates([0, 0, ...speeds.slice(2)]), 1600)
      setTimeout(() => setReelStates([0, 0, 0, ...speeds.slice(3)]), 2400)
      setTimeout(() => setReelStates([0, 0, 0, 0, speeds[4]]), 3600)
      setTimeout(() => {
        setReelStates([0, 0, 0, 0, 0])
        setIsSpinning(false)

        // Trigger small shudder when stopping
        if (screenShakeEnabled && shakeRef.current) {
          shakeRef.current.style.animation = 'none'
          shakeRef.current.offsetHeight // Trigger reflow
          shakeRef.current.style.animation =
            'shudder 0.3s cubic-bezier(.36,.07,.19,.97)'
        }

        // Calculate total score based on selected symbols
        const score = selectedSymbols.reduce((total, symbol) => {
          return total + SYMBOL_POINTS[symbol]
        }, 0)
        setTotalScore(score)

        console.log('\nFinal Results:')
        console.log('-------------')
        selectedSymbols.forEach((symbol, index) => {
          console.log(
            `Reel ${index + 1}: ${symbol} (${SYMBOL_POINTS[symbol]} points)`
          )
        })
        console.log(`Total Score: ${score}`)
        console.log('-------------')

        // Show particles for wins
        if (score > 0) {
          setParticleColor(score >= 100 ? '#FF0000' : '#FFD700') // Red for jackpot, gold for regular wins
          setShowParticles(true)
          soundManager.play(score >= 100 ? 'JACKPOT' : 'WIN')

          // Hide particles after 3 seconds
          setTimeout(() => {
            setShowParticles(false)
          }, 3000)
        }
      }, 4000)
    }, 300) // Reduced delay to 300ms for faster lever animation
  }

  /**
   * Handle when a reel completes its spinning animation
   */
  const handleReelComplete = (index: number) => {
    if (completedReelsRef.current.has(index)) return

    completedReelsRef.current.add(index)
    soundManager.play('REEL_STOP')

    // Check if all reels have completed
    if (completedReelsRef.current.size === 5) {
      setIsSpinning(false)

      // Calculate total score
      const score = selectedSymbols.reduce((total, symbol) => {
        return total + SYMBOL_POINTS[symbol]
      }, 0)

      setTotalScore(score)

      // Show particles for wins
      if (score > 0) {
        setParticleColor(score >= 100 ? '#FF0000' : '#FFD700') // Red for jackpot, gold for regular wins
        setShowParticles(true)
        soundManager.play(score >= 100 ? 'JACKPOT' : 'WIN')

        // Hide particles after 3 seconds
        setTimeout(() => {
          setShowParticles(false)
        }, 3000)
      }
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
        style={{
          background: theme === 'matrix' ? '#000000' : '#ffffff',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
        }}
      >
        <CameraController />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <AxisHelper position={[-5, 0, 0]} size={2} />

        <group>
          {/* Log-style frame around the reels */}
          <LogFrame
            position={[0, 0, -1.0]}
            width={8}
            height={5}
            depth={2.5}
            logThickness={0.3}
          />

          {/* Lever on the right side */}
          <Lever
            position={[4.5, 0, 0]}
            onPull={handleLeverPull}
            isSpinning={isSpinning}
          />

          {/* Reels */}
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Reel
                key={index}
                position={[-4 + index * 2, 0, 0]}
                initialSpeed={reelStates[index]}
                isSpinning={isSpinning}
                onComplete={() => handleReelComplete(index)}
                reelIndex={index}
                onSymbolSelected={handleSymbolSelected}
                selectedSymbol={selectedSymbols[index]}
              />
            ))}
        </group>

        {/* Purple geometric line for scoring reference */}
        <GeometricLine
          position={[0, 0, 2.2]}
          length={10}
          segments={20}
          color="#800080"
          lineWidth={0.05}
          animationSpeed={2}
        />

        {/* Particle effects */}
        <ParticleEffects
          position={[0, 0, 0]}
          count={200}
          size={0.1}
          color={particleColor}
          speed={1}
          spread={3}
          active={showParticles}
        />
      </Canvas>

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
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
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          Score: {totalScore}
        </div>
        {selectedSymbols.map((symbol, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            Reel {index + 1}: {symbol} ({SYMBOL_POINTS[symbol]} pts)
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
