// Slot machine symbols with their weights and colors
export const SYMBOLS = [
  '🍎', // apple
  '🍐', // pear
  '🍊', // orange
  '🍋', // lemon
  '🍇', // grapes
  '🍉', // watermelon
  '🍓', // strawberry
  '🍒', // cherries
] as const

// Define type for symbols
export type Symbol = (typeof SYMBOLS)[number]

// Colors for each symbol (same order as SYMBOLS)
export const SYMBOL_COLORS: Record<Symbol, string> = {
  '🍎': '#E83B3B', // bright red
  '🍐': '#7FBA4C', // sage green
  '🍊': '#F5A742', // warm orange
  '🍋': '#F5E642', // warm yellow
  '🍇': '#9649CC', // grape purple
  '🍉': '#FF6B7A', // watermelon pink
  '🍓': '#FF4365', // strawberry red
  '🍒': '#D1262E', // cherry red
}

// Weights for each symbol (same order as SYMBOLS)
export const SYMBOL_WEIGHTS = [
  2, // apple
  2, // pear
  2, // orange
  2, // lemon
  3, // grapes
  3, // watermelon
  4, // strawberry
  5, // cherries
]

export const SYMBOL_COUNT = SYMBOLS.length
