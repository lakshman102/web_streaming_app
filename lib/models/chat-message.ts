import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessage extends Document {
  platform: 'youtube' | 'twitch' | 'facebook'
  streamSessionId: string
  userId: string
  username: string
  userAvatar?: string
  message: string
  timestamp: Date
  isModerator: boolean
  isBroadcaster: boolean
  isVerified: boolean
  isDeleted: boolean
  createdAt: Date
}

const chatMessageSchema = new Schema({
  platform: {
    type: String,
    enum: ['youtube', 'twitch', 'facebook'],
    required: true,
  },
  streamSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'StreamSession',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userAvatar: String,
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isModerator: {
    type: Boolean,
    default: false,
  },
  isBroadcaster: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

export const ChatMessage =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)
