import mongoose, { Schema, Document } from 'mongoose'

export interface IStreamSession extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  status: 'idle' | 'live' | 'ended' | 'recording'
  streamKey: string
  sources: {
    scenes: Array<{
      id: string
      name: string
      sources: Array<{
        id: string
        type: 'screen' | 'webcam' | 'image' | 'browser'
        position: { x: number; y: number; width: number; height: number }
        settings?: Record<string, any>
      }>
      isActive: boolean
    }>
  }
  destinations: {
    youtube?: {
      broadcastId?: string
      videoId?: string
      status: 'idle' | 'live' | 'ended'
    }
    twitch?: {
      status: 'idle' | 'live' | 'ended'
      channelId?: string
    }
    facebook?: {
      pageId?: string
      status: 'idle' | 'live' | 'ended'
    }
    customRtmp?: Array<{
      name: string
      status: 'idle' | 'live' | 'ended'
    }>
  }
  audio: {
    masterVolume: number
    sources: Array<{
      id: string
      source: 'microphone' | 'desktop' | 'input'
      volume: number
      muted: boolean
    }>
  }
  encoding: {
    bitrate: number
    fps: number
    resolution: string
    codec: 'h264' | 'vp9'
  }
  chatIntegration: {
    enabled: boolean
    sources: Array<'youtube' | 'twitch' | 'facebook'>
  }
  startTime?: Date
  endTime?: Date
  recordedVideo?: {
    url: string
    duration: number
    size: number
  }
  statistics: {
    peakViewers: number
    totalViewers: number
    duration: number
  }
  createdAt: Date
  updatedAt: Date
}

const streamSessionSchema = new Schema<IStreamSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['idle', 'live', 'ended', 'recording'],
      default: 'idle',
    },
    streamKey: { type: String, unique: true, required: true },
    sources: {
      scenes: [
        {
          id: String,
          name: String,
          sources: [
            {
              id: String,
              type: {
                type: String,
                enum: ['screen', 'webcam', 'image', 'browser'],
              },
              position: {
                x: Number,
                y: Number,
                width: Number,
                height: Number,
              },
              settings: Schema.Types.Mixed,
            },
          ],
          isActive: Boolean,
        },
      ],
    },
    destinations: {
      youtube: {
        broadcastId: String,
        videoId: String,
        status: {
          type: String,
          enum: ['idle', 'live', 'ended'],
          default: 'idle',
        },
      },
      twitch: {
        status: {
          type: String,
          enum: ['idle', 'live', 'ended'],
          default: 'idle',
        },
        channelId: String,
      },
      facebook: {
        pageId: String,
        status: {
          type: String,
          enum: ['idle', 'live', 'ended'],
          default: 'idle',
        },
      },
      customRtmp: [
        {
          name: String,
          status: {
            type: String,
            enum: ['idle', 'live', 'ended'],
            default: 'idle',
          },
        },
      ],
    },
    audio: {
      masterVolume: { type: Number, default: 1 },
      sources: [
        {
          id: String,
          source: {
            type: String,
            enum: ['microphone', 'desktop', 'input'],
          },
          volume: Number,
          muted: Boolean,
        },
      ],
    },
    encoding: {
      bitrate: { type: Number, default: 6000 },
      fps: { type: Number, default: 60 },
      resolution: { type: String, default: '1080p' },
      codec: { type: String, enum: ['h264', 'vp9'], default: 'h264' },
    },
    chatIntegration: {
      enabled: { type: Boolean, default: false },
      sources: [String],
    },
    startTime: Date,
    endTime: Date,
    recordedVideo: {
      url: String,
      duration: Number,
      size: Number,
    },
    statistics: {
      peakViewers: { type: Number, default: 0 },
      totalViewers: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
)

export const StreamSession =
  mongoose.models.StreamSession ||
  mongoose.model<IStreamSession>('StreamSession', streamSessionSchema)
