'use client'

import React from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { CanvasCompositor } from './CanvasCompositor'
import { MediaControls } from './MediaControls'

export function CanvasPreview() {
  const { activeSceneId, scenes } = useStreamStore()
  const currentScene = scenes.find((s) => s.id === activeSceneId)

  return (
    <div className="flex h-full w-full gap-4 bg-sidebar p-4">
      {/* Canvas compositor - main video area */}
      <div className="flex-1 flex flex-col rounded-lg border border-sidebar-border overflow-hidden bg-black">
        <CanvasCompositor />
      </div>

      {/* Media controls panel - right sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <MediaControls />
      </div>
    </div>
  )
}
