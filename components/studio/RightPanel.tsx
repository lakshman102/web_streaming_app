'use client'

import React from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2 } from 'lucide-react'

export function RightPanel() {
  const { activeSceneId, scenes, addSourceToScene, removeSourceFromScene, encoding, updateStreamSettings } =
    useStreamStore()
  const currentScene = scenes.find((s) => s.id === activeSceneId)
  const [showNewSource, setShowNewSource] = React.useState(false)
  const [sourceType, setSourceType] = React.useState<'screen' | 'webcam' | 'image' | 'browser'>('screen')

  const handleAddSource = () => {
    if (currentScene) {
      addSourceToScene(currentScene.id, sourceType)
      setShowNewSource(false)
    }
  }

  const handleResolution = (width: number, height: number, fps: number) => {
    updateStreamSettings({
      resolution: `${width}x${height}`,
      fps,
    })
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Streaming Settings */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-sidebar-foreground">Stream Settings</h3>
            <Tabs defaultValue="quality" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quality" className="text-xs">Quality</TabsTrigger>
                <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
              </TabsList>
              <TabsContent value="quality" className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Resolution & FPS</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={encoding.resolution === '1920x1080' && encoding.fps === 60 ? 'default' : 'outline'}
                      onClick={() => handleResolution(1920, 1080, 60)}
                      className="text-xs"
                    >
                      1080p 60fps
                    </Button>
                    <Button
                      size="sm"
                      variant={encoding.resolution === '1280x720' && encoding.fps === 60 ? 'default' : 'outline'}
                      onClick={() => handleResolution(1280, 720, 60)}
                      className="text-xs"
                    >
                      720p 60fps
                    </Button>
                    <Button
                      size="sm"
                      variant={encoding.resolution === '1920x1080' && encoding.fps === 30 ? 'default' : 'outline'}
                      onClick={() => handleResolution(1920, 1080, 30)}
                      className="text-xs"
                    >
                      1080p 30fps
                    </Button>
                    <Button
                      size="sm"
                      variant={encoding.resolution === '1280x720' && encoding.fps === 30 ? 'default' : 'outline'}
                      onClick={() => handleResolution(1280, 720, 30)}
                      className="text-xs"
                    >
                      720p 30fps
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Bitrate</label>
                  <Input
                    type="number"
                    placeholder="6000"
                    defaultValue={encoding.bitrate}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">in kbps (6000 for 1080p recommended)</p>
                </div>
              </TabsContent>
              <TabsContent value="audio" className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Microphone</label>
                  <Input
                    type="number"
                    placeholder="128"
                    defaultValue="128"
                    min="64"
                    max="320"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Audio bitrate in kbps</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sources */}
          {currentScene && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-sidebar-foreground">Sources</h3>
                <span className="text-xs text-muted-foreground">{currentScene.sources.length}</span>
              </div>

              {showNewSource ? (
                <div className="space-y-2 rounded-lg bg-card/50 p-3">
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="screen">Screen Capture</option>
                    <option value="webcam">Webcam</option>
                    <option value="image">Image</option>
                    <option value="browser">Browser Window</option>
                  </select>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddSource}
                      className="flex-1 text-xs"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewSource(false)}
                      className="flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowNewSource(true)}
                  className="w-full text-xs"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Source
                </Button>
              )}

              {/* Sources List */}
              <div className="mt-3 space-y-2">
                {currentScene.sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-lg bg-card p-2"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground capitalize">
                        {source.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {source.position.width}x{source.position.height}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSourceFromScene(currentScene.id, source.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
