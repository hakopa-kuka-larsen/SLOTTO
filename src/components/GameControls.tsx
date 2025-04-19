import React, { useState, useRef, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import '../styles/animations.css'
import soundManager from '../utils/sounds'
import { setVolume, toggleMute } from '../utils/music'

interface ToggleProps {
  isActive: boolean
  onClick: () => void
  activeColor?: string
  label: string
}

const Toggle: React.FC<ToggleProps> = ({
  isActive,
  onClick,
  activeColor = '#00ff00',
  label,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        onClick={onClick}
        style={{
          width: '50px',
          height: '26px',
          backgroundColor: isActive ? activeColor : '#666666',
          borderRadius: '13px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: isActive ? '27px' : '3px',
            transition: 'left 0.3s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>
      <span
        style={{
          color: isActive ? activeColor : '#666666',
          fontFamily: 'monospace',
          fontSize: '14px',
          transition: 'color 0.3s ease',
        }}
      >
        {label}
      </span>
    </div>
  )
}

const GameControls: React.FC = () => {
  const {
    theme,
    screenShakeEnabled,
    cameraMode,
    setTheme,
    setScreenShakeEnabled,
    setCameraMode,
  } = useGame()
  const [isExpanded, setIsExpanded] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)
  const buttonSize = 48 // Size of the circular button
  const margin = 20 // Margin from the edge of the screen
  const [isMuted, setIsMuted] = React.useState(true) // Set muted to true by default
  const [volume, setVolumeState] = React.useState(0.5)

  // Initialize mute state on component mount
  useEffect(() => {
    // Ensure both sound systems are muted by default
    soundManager.toggleMute() // This will set isMuted to true in soundManager
    toggleMute() // This will set isMuted to true in music system
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolumeState(newVolume)
    soundManager.setVolume(newVolume)
    setVolume(newVolume)
  }

  const handleMuteToggle = () => {
    const newMuteState = !isMuted
    setIsMuted(newMuteState)
    soundManager.toggleMute() // Toggle sound manager mute state
    toggleMute() // Toggle music system mute state
  }

  const toggleTheme = () => {
    setTheme(theme === 'matrix' ? 'default' : 'matrix')
  }

  return (
    <div
      ref={controlsRef}
      style={{
        position: 'absolute',
        top: margin,
        right: margin,
        zIndex: 1000,
        display: 'flex',
        gap: '10px',
      }}
    >
      {/* Mute Button */}
      <button
        onClick={handleMuteToggle}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
          backgroundColor: '#00ff00',
          border: 'none',
          cursor: 'pointer',
          display: isExpanded ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 255, 0, 0.3)',
          transition: 'transform 0.3s ease',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isMuted ? (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </>
          ) : (
            <>
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </>
          )}
        </svg>
      </button>

      {/* Settings Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: isExpanded ? '15px' : '0',
          borderRadius: '24px',
          border: '1px solid rgba(0, 255, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden',
          transform: isExpanded
            ? 'scale(1) translateY(0)'
            : 'scale(0.5) translateY(-20px)',
          transformOrigin: 'top right',
          width: isExpanded ? '220px' : buttonSize + 'px',
          height: isExpanded ? 'auto' : buttonSize + 'px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            opacity: isExpanded ? 1 : 0,
            transition: 'opacity 0.2s ease',
            transitionDelay: isExpanded ? '0.1s' : '0s',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          <Toggle
            isActive={theme === 'matrix'}
            onClick={toggleTheme}
            label={theme === 'matrix' ? 'Matrix Theme' : 'Default Theme'}
          />
          <Toggle
            isActive={screenShakeEnabled}
            onClick={() => setScreenShakeEnabled(!screenShakeEnabled)}
            label={screenShakeEnabled ? 'Screen Shake On' : 'Screen Shake Off'}
          />
          <Toggle
            isActive={cameraMode === 'free'}
            onClick={() =>
              setCameraMode(cameraMode === 'free' ? 'fixed' : 'free')
            }
            label={cameraMode === 'free' ? 'Free Camera' : 'Fixed Camera'}
          />

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            >
              Volume
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                flex: 1,
                height: '4px',
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, #00ff00 ${
                  volume * 100
                }%, #666666 ${volume * 100}%)`,
                borderRadius: '2px',
                outline: 'none',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.7'
              }}
            />
          </div>
        </div>
      </div>

      {/* Circular Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: '50%',
          backgroundColor: '#00ff00',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 255, 0, 0.3)',
          transition: 'transform 0.3s ease',
          transform: isExpanded
            ? 'rotate(180deg) scale(0)'
            : 'rotate(0) scale(1)',
          opacity: isExpanded ? 0 : 1,
          pointerEvents: isExpanded ? 'none' : 'auto',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  )
}

export default GameControls
