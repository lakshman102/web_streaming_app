'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useStreamStore } from '@/lib/store/stream-store'
import { StudioLayout } from '@/components/studio/StudioLayout'
import { TopBar } from '@/components/studio/TopBar'
import { ScenesPanel } from '@/components/studio/ScenesPanel'
import { CanvasPreview } from '@/components/studio/CanvasPreview'
import { RightPanel } from '@/components/studio/RightPanel'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, activeSceneId, createScene } = useStreamStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Check authentication on mount
    const token = localStorage.getItem('accessToken')
    if (!token || !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  React.useEffect(() => {
    // Create a default scene if none exists
    if (mounted && !activeSceneId) {
      createScene('Scene 1')
    }
  }, [mounted, activeSceneId, createScene])

  if (!mounted) {
    return null
  }

  return (
    <StudioLayout
      topbar={<TopBar />}
      sidebar={<ScenesPanel />}
      rightPanel={<RightPanel />}
    >
      <CanvasPreview />
    </StudioLayout>
  )
}
