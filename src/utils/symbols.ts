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
  '🍎': '#00FF00', // bright matrix green
  '🍐': '#39FF14', // neon green
  '🍊': '#32CD32', // lime green
  '🍋': '#98FB98', // pale green
  '🍇': '#90EE90', // light green
  '🍉': '#7CFF00', // lawn green
  '🍓': '#00FF7F', // spring green
  '🍒': '#7FFF00', // chartreuse
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
