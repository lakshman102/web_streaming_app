import { Recording } from '@/lib/models/recording'

export interface RecordingOptions {
  title: string
  description?: string
  quality: '1080p' | '720p' | '480p'
  format: 'mp4' | 'mkv'
  isPublic: boolean
}

export class RecordingManager {
  private activeRecordings: Map<string, any> = new Map()

  async startRecording(
    streamSessionId: string,
    userId: string,
    options: RecordingOptions
  ): Promise<string> {
    try {
      const filename = `recording-${streamSessionId}-${Date.now()}.${options.format}`

      const recording = await Recording.create({
        streamSessionId,
        userId,
        title: options.title,
        description: options.description,
        filename,
        quality: options.quality,
        format: options.format,
        isPublic: options.isPublic,
        status: 'recording',
        startedAt: new Date(),
      })

      this.activeRecordings.set(recording._id.toString(), {
        recordingId: recording._id,
        startTime: Date.now(),
        chunks: [],
      })

      console.log(`[v0] Recording started: ${recording._id}`)
      return recording._id.toString()
    } catch (error) {
      console.error('[v0] Recording start error:', error)
      throw error
    }
  }

  async stopRecording(recordingId: string, duration: number): Promise<void> {
    try {
      await Recording.findByIdAndUpdate(recordingId, {
        status: 'processing',
        duration,
        completedAt: new Date(),
      })

      this.activeRecordings.delete(recordingId)
      console.log(`[v0] Recording stopped: ${recordingId}`)
    } catch (error) {
      console.error('[v0] Recording stop error:', error)
      throw error
    }
  }

  async completeRecording(recordingId: string, fileUrl: string, fileSize: number): Promise<void> {
    try {
      await Recording.findByIdAndUpdate(recordingId, {
        status: 'completed',
        fileUrl,
        fileSize,
      })

      console.log(`[v0] Recording completed: ${recordingId}`)
    } catch (error) {
      console.error('[v0] Recording completion error:', error)
      throw error
    }
  }

  async failRecording(recordingId: string, error: string): Promise<void> {
    try {
      await Recording.findByIdAndUpdate(recordingId, {
        status: 'failed',
        error,
      })

      this.activeRecordings.delete(recordingId)
      console.error(`[v0] Recording failed: ${recordingId}`, error)
    } catch (err) {
      console.error('[v0] Recording failure update error:', err)
    }
  }

  async getRecordings(userId: string, limit: number = 50): Promise<any[]> {
    try {
      return await Recording.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
    } catch (error) {
      console.error('[v0] Get recordings error:', error)
      return []
    }
  }

  async getRecording(recordingId: string): Promise<any> {
    try {
      return await Recording.findById(recordingId)
    } catch (error) {
      console.error('[v0] Get recording error:', error)
      return null
    }
  }

  async deleteRecording(recordingId: string): Promise<void> {
    try {
      await Recording.findByIdAndDelete(recordingId)
      console.log(`[v0] Recording deleted: ${recordingId}`)
    } catch (error) {
      console.error('[v0] Delete recording error:', error)
      throw error
    }
  }

  async updateRecordingMetadata(recordingId: string, title: string, description?: string): Promise<void> {
    try {
      await Recording.findByIdAndUpdate(recordingId, {
        title,
        description,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('[v0] Update metadata error:', error)
      throw error
    }
  }

  async incrementViews(recordingId: string): Promise<void> {
    try {
      await Recording.findByIdAndUpdate(recordingId, {
        $inc: { views: 1 },
      })
    } catch (error) {
      console.error('[v0] Increment views error:', error)
    }
  }

  getActiveRecordings(): number {
    return this.activeRecordings.size
  }

  dispose(): void {
    this.activeRecordings.clear()
  }
}

export const createRecordingManager = () => new RecordingManager()
