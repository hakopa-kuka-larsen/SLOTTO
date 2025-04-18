/**
 * Returns a random integer between min and max (inclusive)
 */
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Returns a random float between min and max
 */
export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random item from an array
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}
