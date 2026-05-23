import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { EncodingManager } from '@/lib/services/encoding-manager'

const encodingManager = new EncodingManager()

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { streamSessionId } = await request.json()

    if (!streamSessionId) {
      return NextResponse.json(
        { error: 'streamSessionId required' },
        { status: 400 }
      )
    }

    await dbConnect()
    await encodingManager.stopEncoding(streamSessionId)

    return NextResponse.json({
      success: true,
      message: 'Encoding stopped',
    })
  } catch (error) {
    console.error('[v0] Encoding stop error:', error)
    return NextResponse.json(
      { error: 'Failed to stop encoding' },
      { status: 500 }
    )
  }
}
