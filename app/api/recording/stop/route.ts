import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { RecordingManager } from '@/lib/services/recording-manager'

const recordingManager = new RecordingManager()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recordingId, duration } = await request.json()

    if (!recordingId || !duration) {
      return NextResponse.json(
        { error: 'recordingId and duration required' },
        { status: 400 }
      )
    }

    await dbConnect()
    await recordingManager.stopRecording(recordingId, duration)

    return NextResponse.json({
      success: true,
      message: 'Recording stopped',
    })
  } catch (error) {
    console.error('[v0] Recording stop error:', error)
    return NextResponse.json(
      { error: 'Failed to stop recording' },
      { status: 500 }
    )
  }
}
