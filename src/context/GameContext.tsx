import React, { createContext, useContext, useState, useEffect } from 'react'
import { initAudio } from '../utils/music'

type Theme = 'matrix' | 'default'
type CameraMode = 'fixed' | 'free'

interface GameContextType {
  theme: Theme
  screenShakeEnabled: boolean
  cameraMode: CameraMode
  setTheme: (theme: Theme) => void
  setScreenShakeEnabled: (enabled: boolean) => void
  setCameraMode: (mode: CameraMode) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>('default')
  const [screenShakeEnabled, setScreenShakeEnabled] = useState(true)
  const [cameraMode, setCameraMode] = useState<CameraMode>('free')

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      await initAudio()
      // Remove event listeners after initialization
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  return (
    <GameContext.Provider
      value={{
        theme,
        screenShakeEnabled,
        cameraMode,
        setTheme,
        setScreenShakeEnabled,
        setCameraMode,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
