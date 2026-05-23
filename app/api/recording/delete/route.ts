import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { RecordingManager } from '@/lib/services/recording-manager'

const recordingManager = new RecordingManager()

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recordingId } = await request.json()

    if (!recordingId) {
      return NextResponse.json(
        { error: 'recordingId required' },
        { status: 400 }
      )
    }

    await dbConnect()
    await recordingManager.deleteRecording(recordingId)

    return NextResponse.json({
      success: true,
      message: 'Recording deleted',
    })
  } catch (error) {
    console.error('[v0] Delete recording error:', error)
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    )
  }
}
