import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { RecordingManager } from '@/lib/services/recording-manager'

const recordingManager = new RecordingManager()

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    await connectDB()
    const recordings = await recordingManager.getRecordings(user._id, limit)

    return NextResponse.json({
      success: true,
      recordings,
      count: recordings.length,
    })
  } catch (error) {
    console.error('[v0] Get recordings error:', error)
    return NextResponse.json(
      { error: 'Failed to get recordings' },
      { status: 500 }
    )
  }
}
