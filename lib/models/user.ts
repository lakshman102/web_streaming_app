import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  username: string
  password: string
  profile: {
    avatar?: string
    displayName: string
    bio?: string
  }
  streamingChannels?: mongoose.Types.ObjectId[]
  integrations: {
    youtube?: {
      accessToken: string
      refreshToken: string
      channelId: string
      channelName?: string
    }
    twitch?: {
      accessToken: string
      userId: string
      channelId: string
      username?: string
    }
    facebook?: {
      accessToken: string
      pageId: string
      pageName?: string
    }
    customRtmp?: Array<{
      name: string
      url: string
      key: string
    }>
  }
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    expiresAt?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
      avatar: String,
      displayName: { type: String, required: true },
      bio: String,
    },
    streamingChannels: [{ type: Schema.Types.ObjectId, ref: 'StreamSession' }],
    integrations: {
      youtube: {
        accessToken: String,
        refreshToken: String,
        channelId: String,
        channelName: String,
      },
      twitch: {
        accessToken: String,
        userId: String,
        channelId: String,
        username: String,
      },
      facebook: {
        accessToken: String,
        pageId: String,
        pageName: String,
      },
      customRtmp: [
        {
          name: String,
          url: String,
          key: String,
        },
      ],
    },
    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
      expiresAt: Date,
    },
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
