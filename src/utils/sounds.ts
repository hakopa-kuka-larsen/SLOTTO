// Sound effects for the slot machine
export const SOUNDS = {
  LEVER_PULL: '/sounds/lever-pull.mp3',
  REEL_SPIN: '/sounds/reel-spin.mp3',
  REEL_STOP: '/sounds/reel-stop.mp3',
  WIN: '/sounds/win.mp3',
  JACKPOT: '/sounds/jackpot.mp3',
  BACKGROUND: '/sounds/background.mp3',
}

// Sound manager class
class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {}
  private backgroundMusic: HTMLAudioElement | null = null
  private isMuted: boolean = true
  private volume: number = 0.5
  private isInitialized: boolean = false

  constructor() {
    // Preload all sounds
    Object.entries(SOUNDS).forEach(([key, path]) => {
      if (key !== 'BACKGROUND') {
        this.sounds[key] = new Audio(path)
        this.sounds[key].volume = this.volume
        this.sounds[key].muted = true
      }
    })

    // Initialize background music
    this.backgroundMusic = new Audio(SOUNDS.BACKGROUND)
    this.backgroundMusic.loop = true
    this.backgroundMusic.volume = this.volume * 0.3
    this.backgroundMusic.muted = true
  }

  async initialize() {
    if (this.isInitialized) return

    // Create a temporary audio context and resume it
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    await audioContext.resume()
    this.isInitialized = true
  }

  async play(soundName: keyof typeof SOUNDS): Promise<void> {
    if (this.isMuted) return

    // Initialize audio context if not already done
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (soundName === 'BACKGROUND') {
      if (this.backgroundMusic) {
        try {
          await this.backgroundMusic.play()
        } catch (err) {
          console.log('Background music play failed:', err)
        }
      }
    } else if (this.sounds[soundName]) {
      // Clone the audio to allow overlapping sounds
      const sound = this.sounds[soundName].cloneNode() as HTMLAudioElement
      sound.volume = this.volume
      try {
        await sound.play()
      } catch (err) {
        console.log(`Sound ${soundName} play failed:`, err)
      }
    }
  }

  stopBackground(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted

    // Update all sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.muted = this.isMuted
    })

    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))

    // Update all sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume
    })

    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volume * 0.3
    }
  }

  isSoundMuted(): boolean {
    return this.isMuted
  }
}

// Create a singleton instance
const soundManager = new SoundManager()

export default soundManager
