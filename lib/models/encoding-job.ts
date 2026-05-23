import mongoose, { Schema, Document } from 'mongoose'

export interface IEncodingJob extends Document {
  streamSessionId: string
  userId: string
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom'
  rtmpUrl: string
  status: 'starting' | 'running' | 'stopping' | 'failed' | 'completed'
  metrics: {
    fps: number
    bitrate: number
    framesDropped: number
    memory: number
    cpu: number
  }
  encoding: {
    preset: 'ultrafast' | 'veryfast' | 'fast' | 'medium'
    resolution: string
    bitrate: number
    fps: number
  }
  startedAt: Date
  endedAt?: Date
  error?: string
  createdAt: Date
  updatedAt: Date
}

const encodingJobSchema = new Schema({
  streamSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'StreamSession',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['youtube', 'twitch', 'facebook', 'custom'],
    required: true,
  },
  rtmpUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['starting', 'running', 'stopping', 'failed', 'completed'],
    default: 'starting',
    index: true,
  },
  metrics: {
    fps: Number,
    bitrate: Number,
    framesDropped: Number,
    memory: Number,
    cpu: Number,
  },
  encoding: {
    preset: String,
    resolution: String,
    bitrate: Number,
    fps: Number,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  error: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export const EncodingJob =
  mongoose.models.EncodingJob || mongoose.model<IEncodingJob>('EncodingJob', encodingJobSchema)
