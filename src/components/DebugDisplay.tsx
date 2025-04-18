import React from 'react'

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
      Reel {reelIndex + 1}: {symbol || 'No symbol'}
    </div>
  )
}

export default DebugDisplay
