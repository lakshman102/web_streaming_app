import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { EncodingManager } from '@/lib/services/encoding-manager'

const encodingManager = new EncodingManager()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { streamSessionId, platforms, profile } = await request.json()

    if (!streamSessionId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'streamSessionId and platforms required' },
        { status: 400 }
      )
    }

    await connectDB()

    const jobId = await encodingManager.startEncoding(
      streamSessionId,
      user._id,
      platforms,
      profile || '1080p60'
    )

    return NextResponse.json({
      success: true,
      jobId,
      message: `Encoding started for ${platforms.length} platform(s)`,
    })
  } catch (error) {
    console.error('[v0] Encoding start error:', error)
    return NextResponse.json(
      { error: 'Failed to start encoding' },
      { status: 500 }
    )
  }
}
