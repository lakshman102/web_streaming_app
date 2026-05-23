import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { RecordingManager } from '@/lib/services/recording-manager'

const recordingManager = new RecordingManager()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { streamSessionId, title, description, quality, format, isPublic } = await request.json()

    if (!streamSessionId || !title) {
      return NextResponse.json(
        { error: 'streamSessionId and title required' },
        { status: 400 }
      )
    }

    await connectDB()

    const recordingId = await recordingManager.startRecording(streamSessionId, user._id, {
      title,
      description,
      quality: quality || '720p',
      format: format || 'mp4',
      isPublic: isPublic || false,
    })

    return NextResponse.json({
      success: true,
      recordingId,
      message: 'Recording started',
    })
  } catch (error) {
    console.error('[v0] Recording start error:', error)
    return NextResponse.json(
      { error: 'Failed to start recording' },
      { status: 500 }
    )
  }
}
