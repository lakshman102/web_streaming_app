// Chat Manager - Handles live chat from multiple platforms
export interface ChatMessage {
  _id?: string
  platform: 'youtube' | 'twitch' | 'facebook'
  userId: string
  username: string
  userAvatar?: string
  message: string
  timestamp: Date
  isModerator: boolean
  isBroadcaster: boolean
  isVerified: boolean
}

export class ChatManager {
  private messages: ChatMessage[] = []
  private listeners: Set<(message: ChatMessage) => void> = new Set()
  private youtubeChatId: string | null = null
  private twitchChannel: string | null = null
  private facebookStreamId: string | null = null
  private pollInterval: number | null = null

  setYouTubeChatId(chatId: string) {
    this.youtubeChatId = chatId
    this.startPollingYouTube()
  }

  setTwitchChannel(channel: string) {
    this.twitchChannel = channel
    this.startPollingTwitch()
  }

  setFacebookStreamId(streamId: string) {
    this.facebookStreamId = streamId
    this.startPollingFacebook()
  }

  private startPollingYouTube() {
    if (!this.youtubeChatId) return
    this.pollInterval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/youtube?chatId=${this.youtubeChatId}`)
        const data = await response.json()
        if (data.messages) {
          data.messages.forEach((msg: ChatMessage) => {
            this.addMessage(msg)
          })
        }
      } catch (error) {
        console.error('[v0] YouTube chat polling error:', error)
      }
    }, 3000)
  }

  private startPollingTwitch() {
    if (!this.twitchChannel) return
    this.pollInterval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/twitch?channel=${this.twitchChannel}`)
        const data = await response.json()
        if (data.messages) {
          data.messages.forEach((msg: ChatMessage) => {
            this.addMessage(msg)
          })
        }
      } catch (error) {
        console.error('[v0] Twitch chat polling error:', error)
      }
    }, 3000)
  }

  private startPollingFacebook() {
    if (!this.facebookStreamId) return
    this.pollInterval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/facebook?streamId=${this.facebookStreamId}`)
        const data = await response.json()
        if (data.messages) {
          data.messages.forEach((msg: ChatMessage) => {
            this.addMessage(msg)
          })
        }
      } catch (error) {
        console.error('[v0] Facebook chat polling error:', error)
      }
    }, 3000)
  }

  addMessage(message: ChatMessage) {
    this.messages.push(message)
    if (this.messages.length > 500) {
      this.messages.shift()
    }
    this.listeners.forEach((listener) => listener(message))
  }

  subscribe(listener: (message: ChatMessage) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getMessages(platform?: string, limit: number = 50): ChatMessage[] {
    if (platform) {
      return this.messages.filter((m) => m.platform === platform).slice(-limit)
    }
    return this.messages.slice(-limit)
  }

  async sendMessage(message: string, platforms: string[]): Promise<void> {
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, platforms }),
      })
    } catch (error) {
      console.error('[v0] Send message error:', error)
    }
  }

  async moderateUser(userId: string, action: 'ban' | 'timeout' | 'delete', platforms: string[]): Promise<void> {
    try {
      await fetch('/api/chat/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, platforms }),
      })
    } catch (error) {
      console.error('[v0] Moderation error:', error)
    }
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  dispose() {
    this.stopPolling()
    this.listeners.clear()
    this.messages = []
  }
}

export const createChatManager = () => new ChatManager()
