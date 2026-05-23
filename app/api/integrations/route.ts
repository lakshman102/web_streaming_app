import { NextRequest, NextResponse } from 'next/server'
import { PlatformIntegration } from '@/lib/models/platform-integration'
import { connectDB } from '@/lib/db'

/**
 * Get user's platform integrations
 * GET /api/integrations?userId=...
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const userId = req.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const integrations = await PlatformIntegration.find({ userId })

    // Remove sensitive data before sending
    const safe_integrations = integrations.map((int) => ({
      _id: int._id,
      platform: int.platform,
      isEnabled: int.isEnabled,
      channelName: int.channelName,
      channelId: int.channelId,
      pageId: int.pageId,
      createdAt: int.createdAt,
    }))

    return NextResponse.json({
      userId,
      integrations: safe_integrations,
    })
  } catch (error) {
    console.error('[v0] Get integrations error:', error)
    return NextResponse.json(
      { error: 'Failed to get integrations' },
      { status: 500 }
    )
  }
}

/**
 * Delete an integration
 * DELETE /api/integrations
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB()

    const { integrationId } = await req.json()

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integrationId' },
        { status: 400 }
      )
    }

    await PlatformIntegration.findByIdAndDelete(integrationId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('[v0] Delete integration error:', error)
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    )
  }
}
