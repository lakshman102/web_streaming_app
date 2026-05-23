import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ChatMessage } from '@/lib/models/chat-message'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 })
    }

    await dbConnect()

    // Fetch recent messages from database
    const messages = await ChatMessage.find({
      platform: 'youtube',
    })
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] YouTube chat error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}
