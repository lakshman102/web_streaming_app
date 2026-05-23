import { NextRequest, NextResponse } from 'next/server'
import { StreamSession } from '@/lib/models/stream-session'
import { StreamDestination } from '@/lib/models/stream-destination'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { encryptionService } from '@/lib/services/encryption'
import { getRTMPManager } from '@/lib/services/rtmp-manager'
import {
  YouTubeAdapter,
  TwitchAdapter,
  FacebookAdapter,
  CustomRTMPAdapter,
} from '@/lib/services/platform-adapters'
import { dbConnect } from '@/lib/db'

/**
 * Start streaming to multiple platforms
 * POST /api/stream/start
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { streamSessionId, destinations } = await req.json()

    if (!streamSessionId || !destinations || destinations.length === 0) {
      return NextResponse.json(
        { error: 'Missing streamSessionId or destinations' },
        { status: 400 }
      )
    }

    console.log('[v0] Starting stream to platforms:', destinations.map((d: any) => d.platform))

    const rtmpManager = getRTMPManager()
    const streamSession = await StreamSession.findById(streamSessionId)

    if (!streamSession) {
      return NextResponse.json({ error: 'Stream session not found' }, { status: 404 })
    }

    const results: any[] = []

    for (const destination of destinations) {
      try {
        const integration = await PlatformIntegration.findById(destination.integrationId)

        if (!integration) {
          results.push({
            platform: destination.platform,
            success: false,
            error: 'Integration not found',
          })
          continue
        }

        let rtmpUrl = ''
        let streamKey = ''
        let liveEventId = ''

        // Get credentials for each platform
        if (destination.platform === 'youtube') {
          const decryptedToken = encryptionService.decrypt(integration.accessToken)
          const adapter = new YouTubeAdapter(decryptedToken)
          const result = await adapter.createLiveStream(
            streamSession.title,
            streamSession.description
          )
          rtmpUrl = result.rtmpUrl
          streamKey = result.streamKey
          liveEventId = result.liveEventId
        } else if (destination.platform === 'twitch') {
          const decryptedToken = encryptionService.decrypt(integration.accessToken)
          const adapter = new TwitchAdapter(decryptedToken, process.env.TWITCH_CLIENT_ID, integration.channelId)
          const result = await adapter.getStreamKey()
          rtmpUrl = result.rtmpUrl
          streamKey = result.streamKey
        } else if (destination.platform === 'facebook') {
          const decryptedToken = encryptionService.decrypt(integration.accessToken)
          const adapter = new FacebookAdapter(decryptedToken, integration.pageId)
          const result = await adapter.createLiveVideo(
            streamSession.title,
            streamSession.description
          )
          rtmpUrl = result.rtmpUrl
          streamKey = result.streamKey
        } else if (destination.platform === 'custom') {
          rtmpUrl = integration.customRtmpUrl || ''
          streamKey = integration.customRtmpKey
            ? encryptionService.decrypt(integration.customRtmpKey)
            : ''
        }

        // Start RTMP stream
        const started = await rtmpManager.startStream(
          streamSessionId,
          destination.integrationId,
          {
            platform: destination.platform,
            rtmpUrl,
            streamKey,
            bitrate: streamSession.encoding.bitrate,
            fps: streamSession.encoding.fps,
            resolution: streamSession.encoding.resolution,
          }
        )

        if (started) {
          // Save destination to database
          const streamDestination = new StreamDestination({
            streamSessionId,
            platform: destination.platform,
            platformIntegrationId: destination.integrationId,
            isActive: true,
            streamKey,
            rtmpUrl,
            liveEventId,
            channelId: integration.channelId,
            pageId: integration.pageId,
            status: 'connecting',
          })

          await streamDestination.save()

          results.push({
            platform: destination.platform,
            success: true,
            destinationId: streamDestination._id,
          })
        } else {
          results.push({
            platform: destination.platform,
            success: false,
            error: 'Failed to start stream',
          })
        }
      } catch (error) {
        console.error(`[v0] Error starting ${destination.platform} stream:`, error)
        results.push({
          platform: destination.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: results.some((r) => r.success),
      results,
    })
  } catch (error) {
    console.error('[v0] Stream start error:', error)
    return NextResponse.json(
      { error: 'Failed to start stream' },
      { status: 500 }
    )
  }
}
