import React from 'react'
import SlotMachine from './components/SlotMachine'
import './App.css'

/**
 * Main App component that renders the slot machine game
 */
const App: React.FC = () => {
  return (
    <div className="app-container">
      <SlotMachine />
    </div>
  )
}

export default App
