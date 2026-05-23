import mongoose from 'mongoose'

interface IStreamDestination {
  streamSessionId: string
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
  platformIntegrationId: string
  isActive: boolean
  streamKey?: string
  rtmpUrl?: string
  liveEventId?: string // YouTube
  channelId?: string // Twitch
  pageId?: string // Facebook
  status: 'idle' | 'connecting' | 'live' | 'stopped' | 'error'
  viewers?: number
  bitrate?: number
  uptime?: number // in seconds
  errorMessage?: string
  startedAt?: Date
  stoppedAt?: Date
  statistics: {
    totalViewers: number
    peakViewers: number
    avgBitrate: number
    drops: number
  }
  createdAt: Date
  updatedAt: Date
}

const streamDestinationSchema = new mongoose.Schema<IStreamDestination>(
  {
    streamSessionId: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'twitch', 'facebook', 'custom'],
      required: true,
    },
    platformIntegrationId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    streamKey: String,
    rtmpUrl: String,
    liveEventId: String,
    channelId: String,
    pageId: String,
    status: {
      type: String,
      enum: ['idle', 'connecting', 'live', 'stopped', 'error'],
      default: 'idle',
    },
    viewers: Number,
    bitrate: Number,
    uptime: Number,
    errorMessage: String,
    startedAt: Date,
    stoppedAt: Date,
    statistics: {
      totalViewers: { type: Number, default: 0 },
      peakViewers: { type: Number, default: 0 },
      avgBitrate: { type: Number, default: 0 },
      drops: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
streamDestinationSchema.index({ streamSessionId: 1, platform: 1 })

export const StreamDestination =
  mongoose.models.StreamDestination ||
  mongoose.model<IStreamDestination>('StreamDestination', streamDestinationSchema)

export type { IStreamDestination }
