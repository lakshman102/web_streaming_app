import { NextRequest, NextResponse } from 'next/server'
import { getMetrics } from '@/lib/services/monitoring'

export async function GET(request: NextRequest) {
  try {
    const metrics = await getMetrics()
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('[v0] Metrics endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}
