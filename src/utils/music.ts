import * as Tone from 'tone'
import { Symbol } from './symbols'

// Create a reverb effect
const reverb = new Tone.Reverb({
  decay: 0.3,
  wet: 0.2,
}).toDestination()

// Create a synth with plucky envelope
const synth = new Tone.Synth({
  oscillator: {
    type: 'sine',
  },
  envelope: {
    attack: 0.001, // Extremely short attack
    decay: 0.05, // Very short decay
    sustain: 0.1, // Low sustain
    release: 0.05, // Very short release
  },
}).chain(reverb)

// Base frequency for microtones (A4 = 440Hz)
const BASE_FREQUENCY = 440

// State for volume and mute
let currentVolume = 0.5
let isMuted = false

// Function to generate a random microtone frequency
const getRandomMicrotone = () => {
  // Generate a random number of semitones (including microtones)
  // Range from -12 to +12 semitones from base frequency
  const semitones = Math.random() * 24 - 12

  // Convert semitones to frequency using the formula: f = f0 * 2^(n/12)
  // where f0 is the base frequency and n is the number of semitones
  return BASE_FREQUENCY * Math.pow(2, semitones / 12)
}

// Map symbols to random microtone generators
const SYMBOL_TO_FREQUENCY_GENERATOR: Record<Symbol, () => number> = {
  '🍎': () => getRandomMicrotone(),
  '🍐': () => getRandomMicrotone(),
  '🍊': () => getRandomMicrotone(),
  '🍋': () => getRandomMicrotone(),
  '🍇': () => getRandomMicrotone(),
  '🍉': () => getRandomMicrotone(),
  '🍓': () => getRandomMicrotone(),
  '🍒': () => getRandomMicrotone(),
}

// Function to play a note for a symbol
export const playSymbolNote = (symbol: Symbol) => {
  if (isMuted) return
  const getFrequency = SYMBOL_TO_FREQUENCY_GENERATOR[symbol]
  if (getFrequency) {
    const frequency = getFrequency()
    synth.volume.value = Tone.gainToDb(currentVolume)
    synth.triggerAttackRelease(frequency, '8n') // Very short note duration
  }
}

// Function to stop all sounds
export const stopAllSounds = () => {
  synth.disconnect()
  reverb.disconnect()
}

// Function to set volume
export const setVolume = (volume: number) => {
  currentVolume = Math.max(0, Math.min(1, volume))
  if (!isMuted) {
    synth.volume.value = Tone.gainToDb(currentVolume)
  }
}

// Function to toggle mute
export const toggleMute = () => {
  isMuted = !isMuted
  synth.volume.value = isMuted ? -Infinity : Tone.gainToDb(currentVolume)
}

// Function to initialize audio context (must be called after user interaction)
export const initAudio = async () => {
  await Tone.start()
  synth.volume.value = Tone.gainToDb(currentVolume)
  console.log('Audio context started')
}

export default {
  playSymbolNote,
  stopAllSounds,
  initAudio,
  setVolume,
  toggleMute,
}
