// Slot Machine Dimensions
export const SLOT_MACHINE = {
  FRAME: {
    OUTER: { width: 8, height: 5, depth: 2.5 },
    INNER: { width: 7.8, height: 4.8, depth: 2.3 },
    BORDER: {
      OUTER: { width: 8.2, height: 5.2, depth: 2.6 },
      INNER: { width: 8.0, height: 5.0, depth: 2.4 },
    },
  },
  COLORS: {
    FRAME: '#1B4D3E',
    BORDER: '#143832',
  },
}

// Reel Configuration
export const REEL = {
  RADIUS: 1.8,
  HEIGHT: 0.6,
  SYMBOL: {
    SIZE: 0.5,
    OFFSET: 1.8,
  },
  SPIN: {
    INITIAL_SPEED: 15,
    DECELERATION: 0.99,
    MIN_SPEED: 0.05,
    SNAP_SPEED: 5, // Speed at which the reel snaps to the final position
  },
}

// Lever Configuration
export const LEVER = {
  BASE: { radius: 0.2, height: 0.1 },
  ARM: { width: 0.1, height: 0.1, length: 2 },
  HANDLE: { radius: 0.2 },
  ROTATION: {
    START: -Math.PI / 4, // -45 degrees
    END: Math.PI / 4, // 45 degrees
    RETURN_SPEED: 0.2,
    PULL_SPEED: 3,
  },
  COLORS: {
    BASE: '#666666',
    ARM: '#888888',
    HANDLE: '#aa0000',
  },
}

// Camera Configuration
export const CAMERA = {
  ANGLE: Math.PI / 4,
  DISTANCE: 10,
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: [0, 0, 5] as [number, number, number],
} as const

interface PointLight {
  position: [number, number, number]
  intensity: number
  distance: number
  decay: number
}

interface DirectionalLight {
  position: [number, number, number]
  intensity: number
  castShadow: boolean
}

interface LightingConfig {
  AMBIENT: {
    intensity: number
  }
  POINT: PointLight[]
  DIRECTIONAL: DirectionalLight[]
}

export const LIGHTING: LightingConfig = {
  AMBIENT: {
    intensity: 0.5,
  },
  POINT: [
    {
      position: [5, 5, 5],
      intensity: 0.8,
      distance: 20,
      decay: 2,
    },
  ],
  DIRECTIONAL: [
    {
      position: [5, 5, 5],
      intensity: 0.5,
      castShadow: true,
    },
  ],
}

// Reel Spinning Configuration
export const REEL_SPINNING = {
  MIN_DURATION: 2,
  MAX_DURATION: 4,
  DELAY_BETWEEN_REELS: 200,
}
