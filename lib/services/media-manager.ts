export class MediaManager {
  private screenStream: MediaStream | null = null
  private webcamStream: MediaStream | null = null
  private audioStream: MediaStream | null = null
  private animationFrameId: number | null = null

  async captureScreen(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      })

      // Handle stream stop via browser stop button
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.screenStream = null
      }

      return this.screenStream
    } catch (error) {
      console.error('[v0] Screen capture failed:', error)
      throw error
    }
  }

  async captureWebcam(): Promise<MediaStream> {
    try {
      this.webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      return this.webcamStream
    } catch (error) {
      console.error('[v0] Webcam capture failed:', error)
      throw error
    }
  }

  async captureAudio(): Promise<MediaStream> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      return this.audioStream
    } catch (error) {
      console.error('[v0] Audio capture failed:', error)
      throw error
    }
  }

  renderStreamToCanvas(
    canvas: HTMLCanvasElement,
    stream: MediaStream,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const video = document.createElement('video')
    video.srcObject = stream
    video.autoplay = true
    video.muted = true
    video.onloadedmetadata = () => {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const renderFrame = () => {
          ctx.drawImage(video, x, y, width, height)
          this.animationFrameId = requestAnimationFrame(renderFrame)
        }
        renderFrame()
      }
    }
  }

  compositeStreams(
    canvas: HTMLCanvasElement,
    streams: Array<{
      stream: MediaStream
      x: number
      y: number
      width: number
      height: number
    }>
  ): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const videos: HTMLVideoElement[] = []

    // Create video elements for each stream
    streams.forEach((item) => {
      const video = document.createElement('video')
      video.srcObject = item.stream
      video.autoplay = true
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        const render = () => {
          // Clear canvas
          ctx.fillStyle = '#0a0e27'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw all streams
          streams.forEach((s, index) => {
            if (videos[index] && videos[index].readyState === 4) {
              ctx.drawImage(videos[index], s.x, s.y, s.width, s.height)
            }
          })

          this.animationFrameId = requestAnimationFrame(render)
        }

        render()
      }

      videos.push(video)
    })
  }

  stopAllCaptures(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop())
      this.screenStream = null
    }

    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach((track) => track.stop())
      this.webcamStream = null
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop())
      this.audioStream = null
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream
  }

  getWebcamStream(): MediaStream | null {
    return this.webcamStream
  }

  getAudioStream(): MediaStream | null {
    return this.audioStream
  }
}

export const mediaManager = new MediaManager()
