'use client'

import React from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Copy } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function ScenesPanel() {
  const { scenes, createScene, deleteScene, duplicateScene, activeSceneId, setActiveScene } =
    useStreamStore()
  const [newSceneName, setNewSceneName] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  const handleCreateScene = () => {
    if (newSceneName.trim()) {
      createScene(newSceneName)
      setNewSceneName('')
      setIsCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-sidebar p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-sidebar-foreground">Scenes</h2>
        <p className="text-xs text-muted-foreground">Manage your streaming scenes</p>
      </div>

      {/* New Scene Input */}
      {isCreating && (
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Scene name..."
            value={newSceneName}
            onChange={(e) => setNewSceneName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateScene()}
            autoFocus
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateScene}
              className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90"
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsCreating(false)
                setNewSceneName('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Create Button */}
      {!isCreating && (
        <Button
          onClick={() => setIsCreating(true)}
          className="mb-4 w-full bg-sidebar-primary hover:bg-sidebar-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Scene
        </Button>
      )}

      {/* Scenes List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sidebar-border p-6 text-center">
              <p className="text-sm text-muted-foreground">No scenes yet</p>
              <p className="text-xs text-muted-foreground">Create one to get started</p>
            </div>
          ) : (
            scenes.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  'group rounded-lg border-2 p-3 transition-all',
                  activeSceneId === scene.id
                    ? 'border-sidebar-primary bg-sidebar-primary/10'
                    : 'border-sidebar-border hover:border-sidebar-accent'
                )}
              >
                <button
                  onClick={() => setActiveScene(scene.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sidebar-foreground">{scene.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {scene.sources.length} source{scene.sources.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {activeSceneId === scene.id && (
                      <div className="h-2 w-2 rounded-full bg-sidebar-primary" />
                    )}
                  </div>
                </button>

                {/* Action Buttons */}
                <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => duplicateScene(scene.id)}
                    className="flex-1 h-7 text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteScene(scene.id)}
                    className="flex-1 h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
