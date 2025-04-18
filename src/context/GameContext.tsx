import React, { createContext, useContext, useState } from 'react'

type Theme = 'matrix' | 'minimal'
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
  const [theme, setTheme] = useState<Theme>('matrix')
  const [screenShakeEnabled, setScreenShakeEnabled] = useState(true)
  const [cameraMode, setCameraMode] = useState<CameraMode>('fixed')

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
