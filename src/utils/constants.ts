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
  RADIUS: 2,
  THICKNESS: 0.8,
  SYMBOL: {
    SIZE: 0.5,
    OFFSET: 2, // Same as REEL.RADIUS for centering
  },
  SPIN: {
    INITIAL_SPEED: 15,
    DECELERATION: 0.98,
    MIN_SPEED: 0.1,
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
    RETURN_SPEED: 0.1,
    PULL_SPEED: 2,
  },
  COLORS: {
    BASE: '#666666',
    ARM: '#888888',
    HANDLE: '#aa0000',
  },
}

// Camera Configuration
export const CAMERA = {
  ANGLE: (2.5 * Math.PI) / 180,
  DISTANCE: 36,
  FOV: 400,
  NEAR: 0.1,
  FAR: 1000,
}

// Lighting Configuration
export const LIGHTING = {
  AMBIENT: { intensity: 1.0 },
  POINT: [
    { position: [0, 0, 0], intensity: 0.8 }, // Will be calculated dynamically
    { position: [0, 5, 5], intensity: 0.5 },
    { position: [0, -5, 5], intensity: 0.5 },
  ],
}

// Reel Spinning Configuration
export const REEL_SPINNING = {
  MIN_DURATION: 2,
  MAX_DURATION: 4,
  DELAY_BETWEEN_REELS: 200,
}
