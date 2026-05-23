import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { EncodingManager } from '@/lib/services/encoding-manager'

const encodingManager = new EncodingManager()

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
    const status = await encodingManager.getEncodingStatus(streamSessionId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('[v0] Encoding status error:', error)
    return NextResponse.json(
      { error: 'Failed to get encoding status' },
      { status: 500 }
    )
  }
}
