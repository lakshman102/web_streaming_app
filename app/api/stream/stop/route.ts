import { NextRequest, NextResponse } from 'next/server'
import { StreamDestination } from '@/lib/models/stream-destination'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { encryptionService } from '@/lib/services/encryption'
import { getRTMPManager } from '@/lib/services/rtmp-manager'
import {
  YouTubeAdapter,
  TwitchAdapter,
  FacebookAdapter,
} from '@/lib/services/platform-adapters'
import { connectDB } from '@/lib/db'

/**
 * Stop streaming to multiple platforms
 * POST /api/stream/stop
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { streamSessionId } = await req.json()

    if (!streamSessionId) {
      return NextResponse.json(
        { error: 'Missing streamSessionId' },
        { status: 400 }
      )
    }

    console.log('[v0] Stopping stream:', streamSessionId)

    const rtmpManager = getRTMPManager()

    // Get all active destinations for this stream
    const destinations = await StreamDestination.find({
      streamSessionId,
      isActive: true,
    })

    const results: any[] = []

    for (const destination of destinations) {
      try {
        // Stop RTMP stream
        await rtmpManager.stopStream(streamSessionId, destination.platformIntegrationId)

        // End stream on platform
        if (destination.platform === 'youtube' && destination.liveEventId) {
          const integration = await PlatformIntegration.findById(
            destination.platformIntegrationId
          )
          if (integration) {
            const decryptedToken = encryptionService.decrypt(integration.accessToken)
            const adapter = new YouTubeAdapter(decryptedToken)
            await adapter.endLiveStream(destination.liveEventId)
          }
        } else if (destination.platform === 'facebook' && destination.liveEventId) {
          const integration = await PlatformIntegration.findById(
            destination.platformIntegrationId
          )
          if (integration) {
            const decryptedToken = encryptionService.decrypt(integration.accessToken)
            const adapter = new FacebookAdapter(decryptedToken)
            await adapter.endLiveVideo(destination.liveEventId)
          }
        }

        // Update destination
        destination.isActive = false
        destination.status = 'stopped'
        destination.stoppedAt = new Date()
        await destination.save()

        results.push({
          platform: destination.platform,
          success: true,
        })
      } catch (error) {
        console.error(`[v0] Error stopping ${destination.platform} stream:`, error)
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
    console.error('[v0] Stream stop error:', error)
    return NextResponse.json(
      { error: 'Failed to stop stream' },
      { status: 500 }
    )
  }
}
