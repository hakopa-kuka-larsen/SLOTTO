/**
 * Generates a random number following a bell curve distribution
 * @param min Minimum value
 * @param max Maximum value
 * @param skew How many random numbers to average (higher = more normal distribution)
 */
export const bellCurve = (min: number, max: number, skew = 6) => {
  let sum = 0
  for (let i = 0; i < skew; i++) {
    sum += Math.random()
  }
  // Average and scale to our desired range
  return min + (sum / skew) * (max - min)
}

/**
 * Shuffles array using Fisher-Yates algorithm with bell curve weighting
 */
export const weightedShuffle = <T>(array: T[]): T[] => {
  const result = [...array]
  const weights = array.map(() => bellCurve(0, 1))

  // Sort based on weights
  return result.sort((_, __) => bellCurve(-1, 1))
}
