import { NextRequest, NextResponse } from 'next/server'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { encryptionService } from '@/lib/services/encryption'
import { connectDB } from '@/lib/db'
import axios from 'axios'

/**
 * YouTube OAuth Callback Handler
 * Exchange auth code for access token
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { code, userId } = await req.json()

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing code or userId' },
        { status: 400 }
      )
    }

    console.log('[v0] Exchanging YouTube auth code for tokens')

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`,
        grant_type: 'authorization_code',
      }
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Get channel info
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )

    const channelId = channelResponse.data.items[0]?.id || ''
    const channelName = channelResponse.data.items[0]?.snippet?.title || ''

    // Encrypt tokens
    const encryptedAccessToken = encryptionService.encrypt(access_token)
    const encryptedRefreshToken = refresh_token
      ? encryptionService.encrypt(refresh_token)
      : undefined

    // Store in database
    const integration = await PlatformIntegration.findOneAndUpdate(
      { userId, platform: 'youtube' },
      {
        userId,
        platform: 'youtube',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        isEnabled: true,
        channelId,
        channelName,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      integration: {
        id: integration._id,
        platform: 'youtube',
        channelName,
        channelId,
      },
    })
  } catch (error) {
    console.error('[v0] YouTube OAuth error:', error)
    return NextResponse.json(
      { error: 'OAuth failed' },
      { status: 500 }
    )
  }
}
