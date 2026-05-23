// Audio Manager - Web Audio API wrapper for professional audio mixing
export interface AudioTrack {
  id: string
  name: string
  source: MediaStreamAudioSourceNode | OscillatorNode | null
  gain: GainNode
  analyser: AnalyserNode
  volume: number
  isMuted: boolean
  isSolo: boolean
  levels: number[]
}

export class AudioManager {
  private audioContext: AudioContext
  private masterGain: GainNode
  private masterAnalyser: AnalyserNode
  private tracks: Map<string, AudioTrack> = new Map()
  private dataArray: Uint8Array
  private animationFrameId: number | null = null

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.audioContext.createGain()
    this.masterAnalyser = this.audioContext.createAnalyser()
    this.masterGain.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.audioContext.destination)
    this.masterAnalyser.fftSize = 256
    this.dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount)
  }

  async addTrack(id: string, name: string, stream: MediaStream): Promise<AudioTrack> {
    const source = this.audioContext.createMediaStreamAudioSource(stream)
    const gain = this.audioContext.createGain()
    const analyser = this.audioContext.createAnalyser()

    source.connect(gain)
    gain.connect(analyser)
    analyser.connect(this.masterGain)

    const track: AudioTrack = {
      id,
      name,
      source,
      gain,
      analyser,
      volume: 1,
      isMuted: false,
      isSolo: false,
      levels: [],
    }

    this.tracks.set(id, track)
    return track
  }

  updateTrackVolume(trackId: string, volume: number) {
    const track = this.tracks.get(trackId)
    if (track) {
      track.volume = volume
      track.gain.gain.setValueAtTime(volume, this.audioContext.currentTime)
    }
  }

  muteTrack(trackId: string, muted: boolean) {
    const track = this.tracks.get(trackId)
    if (track) {
      track.isMuted = muted
      track.gain.gain.setValueAtTime(muted ? 0 : track.volume, this.audioContext.currentTime)
    }
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime)
  }

  getTrackLevels(trackId: string): number {
    const track = this.tracks.get(trackId)
    if (!track) return 0
    track.analyser.getByteFrequencyData(this.dataArray)
    return (
      this.dataArray.reduce((a, b) => a + b, 0) /
      this.dataArray.length /
      255
    )
  }

  getMasterLevels(): number {
    this.masterAnalyser.getByteFrequencyData(this.dataArray)
    return (
      this.dataArray.reduce((a, b) => a + b, 0) /
      this.dataArray.length /
      255
    )
  }

  removeTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (track) {
      track.source?.disconnect()
      track.gain.disconnect()
      track.analyser.disconnect()
      this.tracks.delete(trackId)
    }
  }

  dispose() {
    this.tracks.forEach((track) => this.removeTrack(track.id))
    this.masterGain.disconnect()
    this.masterAnalyser.disconnect()
  }
}

export const createAudioManager = () => new AudioManager()
