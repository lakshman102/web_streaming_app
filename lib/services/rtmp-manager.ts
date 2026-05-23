import { EventEmitter } from 'events'

export type StreamStatus = 'idle' | 'connecting' | 'live' | 'stopped' | 'error'

export interface StreamDestinationConfig {
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
  rtmpUrl: string
  streamKey: string
  bitrate: number
  fps: number
  resolution: string
}

export interface StreamStatistics {
  status: StreamStatus
  viewers?: number
  bitrate?: number
  uptime: number
  errors: number
}

/**
 * RTMP Manager - Handles FFmpeg RTMP streaming to multiple platforms
 * In production, this would spawn FFmpeg processes
 * For MVP, we'll simulate and prepare the structure
 */
export class RTMPManager extends EventEmitter {
  private activeStreams: Map<string, StreamStatistics> = new Map()
  private streamConfigs: Map<string, StreamDestinationConfig> = new Map()
  private startTimes: Map<string, Date> = new Map()

  /**
   * Start streaming to a single destination
   */
  async startStream(
    streamId: string,
    destinationId: string,
    config: StreamDestinationConfig
  ): Promise<boolean> {
    try {
      console.log(`[v0] Starting RTMP stream: ${streamId} -> ${config.platform}`)

      const key = `${streamId}:${destinationId}`
      this.streamConfigs.set(key, config)
      this.startTimes.set(key, new Date())

      // Initialize stats
      this.activeStreams.set(key, {
        status: 'connecting',
        uptime: 0,
        errors: 0,
      })

      // Simulate connection
      await this.simulateConnection(key)

      // Emit connection event
      this.emit('stream:status', {
        streamId,
        destinationId,
        status: 'live',
        timestamp: new Date(),
      })

      // Start uptime tracking
      this.trackUptime(key)

      return true
    } catch (error) {
      console.error(`[v0] Failed to start stream ${streamId}:`, error)
      this.emit('stream:error', {
        streamId,
        destinationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    }
  }

  /**
   * Stop streaming to a destination
   */
  async stopStream(streamId: string, destinationId: string): Promise<boolean> {
    try {
      console.log(`[v0] Stopping RTMP stream: ${streamId} -> ${destinationId}`)

      const key = `${streamId}:${destinationId}`

      if (this.activeStreams.has(key)) {
        this.activeStreams.delete(key)
        this.streamConfigs.delete(key)
        this.startTimes.delete(key)

        this.emit('stream:status', {
          streamId,
          destinationId,
          status: 'stopped',
          timestamp: new Date(),
        })
      }

      return true
    } catch (error) {
      console.error(`[v0] Failed to stop stream ${streamId}:`, error)
      return false
    }
  }

  /**
   * Get stream statistics
   */
  getStreamStats(streamId: string, destinationId: string): StreamStatistics | null {
    const key = `${streamId}:${destinationId}`
    return this.activeStreams.get(key) || null
  }

  /**
   * Get all active streams for a session
   */
  getActiveStreams(streamId: string): Array<{ destinationId: string; stats: StreamStatistics }> {
    const result: Array<{ destinationId: string; stats: StreamStatistics }> = []

    this.activeStreams.forEach((stats, key) => {
      if (key.startsWith(streamId)) {
        const destinationId = key.split(':')[1]
        result.push({ destinationId, stats })
      }
    })

    return result
  }

  /**
   * Simulate connection for MVP
   */
  private async simulateConnection(key: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = this.activeStreams.get(key)
        if (stats) {
          stats.status = 'live'
          stats.viewers = Math.floor(Math.random() * 100)
          stats.bitrate = 5000 + Math.floor(Math.random() * 1000)
        }
        resolve()
      }, 2000)
    })
  }

  /**
   * Track uptime and emit periodic updates
   */
  private trackUptime(key: string): void {
    const interval = setInterval(() => {
      if (!this.activeStreams.has(key)) {
        clearInterval(interval)
        return
      }

      const stats = this.activeStreams.get(key)
      const startTime = this.startTimes.get(key)

      if (stats && startTime) {
        stats.uptime = Math.floor((Date.now() - startTime.getTime()) / 1000)
        stats.viewers = Math.floor(Math.random() * 500) // Simulate viewer changes
        stats.bitrate = 5000 + Math.floor(Math.random() * 1000)

        // Simulate occasional errors
        if (Math.random() < 0.05) {
          stats.errors++
        }

        this.emit('stream:stats', { key, stats })
      }
    }, 5000) // Update every 5 seconds
  }

  /**
   * Cleanup - stop all streams
   */
  async cleanup(): Promise<void> {
    const keys = Array.from(this.activeStreams.keys())

    for (const key of keys) {
      const [streamId, destinationId] = key.split(':')
      await this.stopStream(streamId, destinationId)
    }

    this.activeStreams.clear()
    this.streamConfigs.clear()
    this.startTimes.clear()
  }
}

// Singleton instance
let rtmpManager: RTMPManager | null = null

export const getRTMPManager = (): RTMPManager => {
  if (!rtmpManager) {
    rtmpManager = new RTMPManager()
  }
  return rtmpManager
}
