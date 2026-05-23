import { NextRequest, NextResponse } from 'next/server'
import { ChatMessage } from '@/lib/models/chat-message'
import { dbConnect } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, platforms } = await request.json()

    if (!message || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Message and platforms required' },
        { status: 400 }
      )
    }

    await dbConnect()

    for (const platform of platforms) {
      await ChatMessage.create({
        platform,
        streamSessionId: null,
        userId: user._id,
        username: user.email,
        message,
        isBroadcaster: true,
        isModerator: false,
        isVerified: true,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Chat send error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
