import { NextRequest, NextResponse } from 'next/server'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { encryptionService } from '@/lib/services/encryption'
import { dbConnect } from '@/lib/db'
import axios from 'axios'

/**
 * Twitch OAuth Callback Handler
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { code, userId } = await req.json()

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing code or userId' },
        { status: 400 }
      )
    }

    console.log('[v0] Exchanging Twitch auth code for tokens')

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/twitch/callback`,
      }
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Get user info
    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${access_token}`,
      },
    })

    const twitchUserId = userResponse.data.data[0]?.id || ''
    const channelName = userResponse.data.data[0]?.login || ''

    // Encrypt tokens
    const encryptedAccessToken = encryptionService.encrypt(access_token)
    const encryptedRefreshToken = refresh_token
      ? encryptionService.encrypt(refresh_token)
      : undefined

    // Store in database
    const integration = await PlatformIntegration.findOneAndUpdate(
      { userId, platform: 'twitch' },
      {
        userId,
        platform: 'twitch',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        isEnabled: true,
        channelId: twitchUserId,
        channelName,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      integration: {
        id: integration._id,
        platform: 'twitch',
        channelName,
        channelId: twitchUserId,
      },
    })
  } catch (error) {
    console.error('[v0] Twitch OAuth error:', error)
    return NextResponse.json(
      { error: 'OAuth failed' },
      { status: 500 }
    )
  }
}
