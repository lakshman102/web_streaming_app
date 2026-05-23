import { NextRequest, NextResponse } from 'next/server'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { encryptionService } from '@/lib/services/encryption'
import { connectDB } from '@/lib/db'
import axios from 'axios'

/**
 * Facebook OAuth Callback Handler
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

    console.log('[v0] Exchanging Facebook auth code for tokens')

    // Exchange code for tokens
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/facebook/callback`,
          code,
        },
      }
    )

    const { access_token } = tokenResponse.data

    // Get user pages
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        params: {
          fields: 'id,name,category',
          access_token,
        },
      }
    )

    const pageId = pagesResponse.data.data[0]?.id || ''
    const pageName = pagesResponse.data.data[0]?.name || ''

    // Get long-lived token
    const longLivedResponse = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: access_token,
          grant_type: 'fb_exchange_token',
        },
      }
    )

    const long_lived_token = longLivedResponse.data.access_token

    // Encrypt token
    const encryptedAccessToken = encryptionService.encrypt(long_lived_token)

    // Store in database
    const integration = await PlatformIntegration.findOneAndUpdate(
      { userId, platform: 'facebook' },
      {
        userId,
        platform: 'facebook',
        accessToken: encryptedAccessToken,
        isEnabled: true,
        pageId,
        channelName: pageName,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      integration: {
        id: integration._id,
        platform: 'facebook',
        channelName: pageName,
        pageId,
      },
    })
  } catch (error) {
    console.error('[v0] Facebook OAuth error:', error)
    return NextResponse.json(
      { error: 'OAuth failed' },
      { status: 500 }
    )
  }
}
