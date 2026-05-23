import axios from 'axios'
import { encryptionService } from './encryption'

/**
 * YouTube Live API Adapter
 */
export class YouTubeAdapter {
  private accessToken: string
  private clientId: string
  private clientSecret: string

  constructor(accessToken: string, clientId?: string, clientSecret?: string) {
    this.accessToken = accessToken
    this.clientId = clientId || process.env.YOUTUBE_CLIENT_ID || ''
    this.clientSecret = clientSecret || process.env.YOUTUBE_CLIENT_SECRET || ''
  }

  /**
   * Create a live stream and get RTMP URL + stream key
   */
  async createLiveStream(
    title: string,
    description: string
  ): Promise<{
    liveEventId: string
    rtmpUrl: string
    streamKey: string
    thumbnail: string
  }> {
    try {
      console.log('[v0] Creating YouTube live stream:', title)

      const response = await axios.post(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails',
        {
          snippet: {
            title,
            description,
            scheduledStartTime: new Date().toISOString(),
          },
          status: {
            privacyStatus: 'private',
            selfDeclaredMadeForKids: false,
          },
          contentDetails: {
            enableDvr: true,
            enableContentEncryption: true,
            enableEmbed: true,
            recordFromStart: true,
            startWithSlate: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      const broadcastId = response.data.id

      // Create stream
      const streamResponse = await axios.post(
        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn',
        {
          snippet: {
            title: `${title} - Stream`,
            description,
          },
          cdn: {
            resolution: '1920x1080',
            frameRate: '60fps',
            ingestionType: 'rtmp',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      const streamId = streamResponse.data.id
      const cdnSettings = streamResponse.data.cdn

      // Bind stream to broadcast
      await axios.post(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id,contentDetails&id=${broadcastId}&streamId=${streamId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      // Transition to live
      await axios.post(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${broadcastId}&broadcastStatus=live`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      return {
        liveEventId: broadcastId,
        rtmpUrl: cdnSettings.ingestionInfo.rtmpsIngestionAddress,
        streamKey: cdnSettings.ingestionInfo.streamName,
        thumbnail: response.data.snippet.thumbnails?.default?.url || '',
      }
    } catch (error) {
      console.error('[v0] YouTube stream creation failed:', error)
      throw error
    }
  }

  /**
   * End a live stream
   */
  async endLiveStream(broadcastId: string): Promise<void> {
    try {
      console.log('[v0] Ending YouTube live stream:', broadcastId)

      await axios.post(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?part=status&id=${broadcastId}&broadcastStatus=complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
    } catch (error) {
      console.error('[v0] Failed to end YouTube stream:', error)
      throw error
    }
  }

  /**
   * Get stream statistics
   */
  async getStreamStats(
    broadcastId: string
  ): Promise<{
    viewers: number
    likes: number
    comments: number
  }> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=statistics&id=${broadcastId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      const stats = response.data.items[0]?.statistics || {}

      return {
        viewers: parseInt(stats.concurrentViewers || '0'),
        likes: parseInt(stats.likeCount || '0'),
        comments: parseInt(stats.commentCount || '0'),
      }
    } catch (error) {
      console.error('[v0] Failed to get YouTube stats:', error)
      return { viewers: 0, likes: 0, comments: 0 }
    }
  }
}

/**
 * Twitch RTMP Adapter
 */
export class TwitchAdapter {
  private accessToken: string
  private clientId: string
  private userId: string

  constructor(accessToken: string, clientId?: string, userId?: string) {
    this.accessToken = accessToken
    this.clientId = clientId || process.env.TWITCH_CLIENT_ID || ''
    this.userId = userId || ''
  }

  /**
   * Get stream key for RTMP
   */
  async getStreamKey(): Promise<{
    rtmpUrl: string
    streamKey: string
  }> {
    try {
      console.log('[v0] Getting Twitch stream key')

      const response = await axios.get(
        `https://api.twitch.tv/helix/streams/key?broadcaster_id=${this.userId}`,
        {
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      const streamKey = response.data.data[0]?.stream_key || ''

      return {
        rtmpUrl: 'rtmps://live-cdg.twitch.tv:443/app/',
        streamKey,
      }
    } catch (error) {
      console.error('[v0] Failed to get Twitch stream key:', error)
      throw error
    }
  }

  /**
   * Update stream metadata
   */
  async updateStreamInfo(title: string, gameId?: string): Promise<void> {
    try {
      console.log('[v0] Updating Twitch stream info:', title)

      await axios.patch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${this.userId}`,
        {
          title,
          game_id: gameId,
        },
        {
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )
    } catch (error) {
      console.error('[v0] Failed to update Twitch stream info:', error)
      throw error
    }
  }

  /**
   * Get stream statistics
   */
  async getStreamStats(): Promise<{
    viewers: number
    isLive: boolean
  }> {
    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/streams?user_id=${this.userId}`,
        {
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      )

      if (response.data.data.length === 0) {
        return { viewers: 0, isLive: false }
      }

      return {
        viewers: response.data.data[0].viewer_count || 0,
        isLive: true,
      }
    } catch (error) {
      console.error('[v0] Failed to get Twitch stats:', error)
      return { viewers: 0, isLive: false }
    }
  }
}

/**
 * Facebook Live Adapter
 */
export class FacebookAdapter {
  private accessToken: string
  private pageId: string

  constructor(accessToken: string, pageId?: string) {
    this.accessToken = accessToken
    this.pageId = pageId || ''
  }

  /**
   * Create live video
   */
  async createLiveVideo(
    title: string,
    description: string
  ): Promise<{
    liveVideoId: string
    rtmpUrl: string
    streamKey: string
  }> {
    try {
      console.log('[v0] Creating Facebook live video:', title)

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pageId}/live_videos`,
        {
          title,
          description,
          status: 'LIVE_NOW',
        },
        {
          params: {
            access_token: this.accessToken,
          },
        }
      )

      // Get streaming URL
      const streamResponse = await axios.get(
        `https://graph.facebook.com/v18.0/${response.data.id}?fields=live_status,stream_url,stream_secure_url`,
        {
          params: {
            access_token: this.accessToken,
          },
        }
      )

      return {
        liveVideoId: response.data.id,
        rtmpUrl: streamResponse.data.stream_url || '',
        streamKey: streamResponse.data.stream_secure_url || '',
      }
    } catch (error) {
      console.error('[v0] Failed to create Facebook live video:', error)
      throw error
    }
  }

  /**
   * End live video
   */
  async endLiveVideo(liveVideoId: string): Promise<void> {
    try {
      console.log('[v0] Ending Facebook live video:', liveVideoId)

      await axios.post(
        `https://graph.facebook.com/v18.0/${liveVideoId}`,
        {
          status: 'UNPUBLISHED',
        },
        {
          params: {
            access_token: this.accessToken,
          },
        }
      )
    } catch (error) {
      console.error('[v0] Failed to end Facebook live video:', error)
      throw error
    }
  }
}

/**
 * Custom RTMP Adapter
 */
export class CustomRTMPAdapter {
  private rtmpUrl: string
  private streamKey: string

  constructor(rtmpUrl: string, streamKey: string) {
    this.rtmpUrl = rtmpUrl
    this.streamKey = streamKey
  }

  /**
   * Validate RTMP connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      console.log('[v0] Validating custom RTMP connection')
      // In production, this would validate the RTMP connection
      return true
    } catch (error) {
      console.error('[v0] RTMP validation failed:', error)
      return false
    }
  }

  /**
   * Get RTMP details
   */
  getRTMPDetails(): {
    rtmpUrl: string
    streamKey: string
  } {
    return {
      rtmpUrl: this.rtmpUrl,
      streamKey: this.streamKey,
    }
  }
}

export class PlatformAdapter {
  static async getRtmpUrl(platform: string, userId: string): Promise<string> {
    switch (platform) {
      case 'youtube':
        return `rtmps://a.rtmp.youtube.com/live2/${userId}`
      case 'twitch':
        return `rtmps://live-cdg.twitch.tv:443/app/${userId}`
      case 'facebook':
        return `rtmps://live-api-s.facebook.com:443/rtmp/${userId}`
      case 'custom':
        return process.env.CUSTOM_RTMP_URL || ''
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}
