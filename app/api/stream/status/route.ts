import { NextRequest, NextResponse } from 'next/server'
import { StreamDestination } from '@/lib/models/stream-destination'
import { getRTMPManager } from '@/lib/services/rtmp-manager'
import { dbConnect } from '@/lib/db'

/**
 * Get real-time stream status
 * GET /api/stream/status?streamSessionId=...
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const streamSessionId = req.nextUrl.searchParams.get('streamSessionId')

    if (!streamSessionId) {
      return NextResponse.json(
        { error: 'Missing streamSessionId' },
        { status: 400 }
      )
    }

    const rtmpManager = getRTMPManager()

    // Get destinations from database
    const destinations = await StreamDestination.find({
      streamSessionId,
    })

    const status: any[] = []

    for (const destination of destinations) {
      const stats = rtmpManager.getStreamStats(streamSessionId, destination.platformIntegrationId)

      status.push({
        platform: destination.platform,
        isActive: destination.isActive,
        status: stats?.status || destination.status,
        viewers: stats?.viewers,
        bitrate: stats?.bitrate,
        uptime: stats?.uptime,
        errors: stats?.errors,
        startedAt: destination.startedAt,
      })
    }

    return NextResponse.json({
      streamSessionId,
      status,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('[v0] Stream status error:', error)
    return NextResponse.json(
      { error: 'Failed to get stream status' },
      { status: 500 }
    )
  }
}
