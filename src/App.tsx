import React from 'react'
import { GameProvider } from './context/GameContext'
import SlotMachine from './components/SlotMachine'
import './App.css'

/**
 * Main App component that renders the slot machine game
 */
const App: React.FC = () => {
  return (
    <GameProvider>
      <SlotMachine />
    </GameProvider>
  )
}

export default App
