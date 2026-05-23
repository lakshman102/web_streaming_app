import { EncodingJob } from '@/lib/models/encoding-job'
import { PlatformAdapter } from '@/lib/services/platform-adapters'

export interface EncodingConfig {
  resolution: string
  fps: number
  bitrate: number
  preset: 'ultrafast' | 'veryfast' | 'fast' | 'medium'
}

const ENCODING_PROFILES: Record<string, EncodingConfig> = {
  '1080p60': {
    resolution: '1920x1080',
    fps: 60,
    bitrate: 6000,
    preset: 'veryfast',
  },
  '720p30': {
    resolution: '1280x720',
    fps: 30,
    bitrate: 3500,
    preset: 'fast',
  },
  '480p30': {
    resolution: '854x480',
    fps: 30,
    bitrate: 1500,
    preset: 'fast',
  },
}

export class EncodingManager {
  private activeJobs: Map<string, any> = new Map()

  async startEncoding(
    streamSessionId: string,
    userId: string,
    platforms: string[],
    profile: keyof typeof ENCODING_PROFILES = '1080p60'
  ): Promise<string> {
    const config = ENCODING_PROFILES[profile]
    const jobId = `${streamSessionId}-${Date.now()}`

    try {
      // Get platform-specific RTMP URLs
      const rtmpUrls = await Promise.all(
        platforms.map((platform) => PlatformAdapter.getRtmpUrl(platform, userId))
      )

      // Create encoding jobs for each platform
      for (const rtmpUrl of rtmpUrls) {
        const job = await EncodingJob.create({
          streamSessionId,
          userId,
          platform: 'youtube', // Will be set per-platform in actual implementation
          rtmpUrl,
          status: 'starting',
          encoding: config,
        })

        this.activeJobs.set(job._id.toString(), {
          jobId: job._id,
          process: null,
          startTime: Date.now(),
        })
      }

      console.log(`[v0] Encoding started for stream ${streamSessionId}`)
      return jobId
    } catch (error) {
      console.error('[v0] Encoding start error:', error)
      throw error
    }
  }

  async stopEncoding(streamSessionId: string): Promise<void> {
    try {
      await EncodingJob.updateMany(
        { streamSessionId },
        {
          status: 'completed',
          endedAt: new Date(),
        }
      )

      console.log(`[v0] Encoding stopped for stream ${streamSessionId}`)
    } catch (error) {
      console.error('[v0] Encoding stop error:', error)
      throw error
    }
  }

  async updateEncodingMetrics(jobId: string, metrics: any): Promise<void> {
    try {
      await EncodingJob.findByIdAndUpdate(jobId, {
        metrics,
        status: 'running',
      })
    } catch (error) {
      console.error('[v0] Metrics update error:', error)
    }
  }

  async getEncodingStatus(streamSessionId: string): Promise<any> {
    try {
      const jobs = await EncodingJob.find({ streamSessionId })
      return {
        streamSessionId,
        jobs,
        isActive: jobs.some((j) => j.status === 'running'),
      }
    } catch (error) {
      console.error('[v0] Status fetch error:', error)
      return null
    }
  }

  async handleEncodingError(jobId: string, error: string): Promise<void> {
    try {
      await EncodingJob.findByIdAndUpdate(jobId, {
        status: 'failed',
        error,
        endedAt: new Date(),
      })

      console.error(`[v0] Encoding job ${jobId} failed:`, error)
    } catch (err) {
      console.error('[v0] Error update failed:', err)
    }
  }

  getActiveJobs(): number {
    return this.activeJobs.size
  }

  dispose(): void {
    this.activeJobs.clear()
  }
}

export const createEncodingManager = () => new EncodingManager()
