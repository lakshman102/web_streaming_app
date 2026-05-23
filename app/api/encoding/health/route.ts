import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { EncodingJob } from '@/lib/models/encoding-job'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const streamSessionId = searchParams.get('streamSessionId')

    if (!streamSessionId) {
      return NextResponse.json(
        { error: 'streamSessionId required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const jobs = await EncodingJob.find({
      streamSessionId,
      status: 'running',
    })

    if (jobs.length === 0) {
      return NextResponse.json({
        health: 'offline',
        activeJobs: 0,
        metrics: null,
      })
    }

    // Aggregate metrics
    const avgFps = jobs.reduce((sum, j) => sum + (j.metrics?.fps || 0), 0) / jobs.length
    const avgBitrate = jobs.reduce((sum, j) => sum + (j.metrics?.bitrate || 0), 0) / jobs.length
    const totalDropped = jobs.reduce((sum, j) => sum + (j.metrics?.framesDropped || 0), 0)

    let health = 'excellent'
    if (totalDropped > 100) health = 'poor'
    else if (totalDropped > 50) health = 'fair'
    else if (totalDropped > 10) health = 'good'

    return NextResponse.json({
      health,
      activeJobs: jobs.length,
      metrics: {
        fps: Math.round(avgFps * 10) / 10,
        bitrate: Math.round(avgBitrate),
        framesDropped: totalDropped,
        uptime: Date.now() - (jobs[0]?.startedAt?.getTime() || 0),
      },
    })
  } catch (error) {
    console.error('[v0] Health check error:', error)
    return NextResponse.json(
      { error: 'Failed to get health status' },
      { status: 500 }
    )
  }
}
