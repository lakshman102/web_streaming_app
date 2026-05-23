import mongoose, { Schema, Document } from 'mongoose'

export interface IRecording extends Document {
  streamSessionId: string
  userId: string
  title: string
  description?: string
  filename: string
  fileUrl?: string
  fileSize: number
  duration: number
  quality: '1080p' | '720p' | '480p'
  format: 'mp4' | 'mkv'
  status: 'recording' | 'processing' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  error?: string
  isPublic: boolean
  views: number
  createdAt: Date
  updatedAt: Date
}

const recordingSchema = new Schema({
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
  title: {
    type: String,
    required: true,
  },
  description: String,
  filename: {
    type: String,
    required: true,
  },
  fileUrl: String,
  fileSize: Number,
  duration: Number,
  quality: {
    type: String,
    enum: ['1080p', '720p', '480p'],
    default: '720p',
  },
  format: {
    type: String,
    enum: ['mp4', 'mkv'],
    default: 'mp4',
  },
  status: {
    type: String,
    enum: ['recording', 'processing', 'completed', 'failed'],
    default: 'recording',
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  error: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
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

export const Recording =
  mongoose.models.Recording || mongoose.model<IRecording>('Recording', recordingSchema)
