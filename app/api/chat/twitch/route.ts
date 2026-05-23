import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { ChatMessage } from '@/lib/models/chat-message'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')

    if (!channel) {
      return NextResponse.json({ error: 'Channel required' }, { status: 400 })
    }

    await connectDB()

    const messages = await ChatMessage.find({
      platform: 'twitch',
    })
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] Twitch chat error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}
