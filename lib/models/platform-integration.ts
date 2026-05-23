import mongoose from 'mongoose'

interface IPlatformIntegration {
  userId: string
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
  accessToken: string // Encrypted
  refreshToken?: string // Encrypted
  expiresAt?: Date
  isEnabled: boolean
  createdAt: Date
  updatedAt: Date
  channelId?: string // YouTube
  channelName?: string // Twitch/Facebook
  customRtmpUrl?: string
  customRtmpKey?: string // Encrypted
}

const platformIntegrationSchema = new mongoose.Schema<IPlatformIntegration>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'twitch', 'facebook', 'custom'],
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: String,
    expiresAt: Date,
    isEnabled: {
      type: Boolean,
      default: true,
    },
    channelId: String,
    channelName: String,
    customRtmpUrl: String,
    customRtmpKey: String,
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
platformIntegrationSchema.index({ userId: 1, platform: 1 }, { unique: true })

export const PlatformIntegration =
  mongoose.models.PlatformIntegration ||
  mongoose.model<IPlatformIntegration>('PlatformIntegration', platformIntegrationSchema)

export type { IPlatformIntegration }
