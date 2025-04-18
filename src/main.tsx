import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Remove strict mode as it can cause issues with Three.js
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
