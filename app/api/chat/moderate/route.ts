import { NextRequest, NextResponse } from 'next/server'
import { ChatMessage } from '@/lib/models/chat-message'
import { connectDB } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action, platforms } = await request.json()

    if (!userId || !action || !platforms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    if (action === 'delete') {
      await ChatMessage.updateMany(
        { userId, platform: { $in: platforms } },
        { isDeleted: true }
      )
    } else if (action === 'ban' || action === 'timeout') {
      // Note: Actual ban/timeout implementation would require platform API calls
      // This is a placeholder that archives the action
      await ChatMessage.updateMany(
        { userId, platform: { $in: platforms } },
        { isDeleted: true }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Moderation error:', error)
    return NextResponse.json(
      { error: 'Moderation failed' },
      { status: 500 }
    )
  }
}
