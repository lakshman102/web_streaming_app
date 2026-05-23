'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileVideo, Play, Download, Trash2, Circle } from 'lucide-react'

interface RecordingItem {
  id: string
  title: string
  duration: number
  fileSize: number
  quality: '1080p' | '720p' | '480p'
  status: 'recording' | 'processing' | 'completed' | 'failed'
  createdAt: Date
}

export function RecordingPanel() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTitle, setRecordingTitle] = useState('Stream Recording')
  const [recordings, setRecordings] = useState<RecordingItem[]>([])
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p'>('720p')

  const handleStartRecording = async () => {
    if (isRecording) return

    try {
      setIsRecording(true)
      // Simulate recording start
      console.log('[v0] Recording started with title:', recordingTitle)
    } catch (error) {
      console.error('[v0] Recording start error:', error)
      setIsRecording(false)
    }
  }

  const handleStopRecording = async () => {
    if (!isRecording) return

    try {
      setIsRecording(false)
      // Simulate recording completion
      const newRecording: RecordingItem = {
        id: `rec-${Date.now()}`,
        title: recordingTitle,
        duration: Math.floor(Math.random() * 3600) + 60,
        fileSize: Math.floor(Math.random() * 5000) + 100,
        quality: selectedQuality,
        status: 'completed',
        createdAt: new Date(),
      }
      setRecordings([newRecording, ...recordings])
      console.log('[v0] Recording completed')
    } catch (error) {
      console.error('[v0] Recording stop error:', error)
    }
  }

  const handleDeleteRecording = (recordingId: string) => {
    setRecordings(recordings.filter((r) => r.id !== recordingId))
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? hours + ':' : ''}${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="h-5 w-5" />
          Recording
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {/* Recording Controls */}
        <div className="border-b border-border p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Recording Title
            </label>
            <Input
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="Enter recording title"
              className="mt-1"
              disabled={isRecording}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Quality
            </label>
            <div className="mt-1 flex gap-2">
              {(['1080p', '720p', '480p'] as const).map((quality) => (
                <Button
                  key={quality}
                  size="sm"
                  variant={selectedQuality === quality ? 'default' : 'outline'}
                  onClick={() => setSelectedQuality(quality)}
                  disabled={isRecording}
                  className="flex-1"
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={isRecording ? 'w-full bg-destructive hover:bg-destructive/90' : 'w-full'}
          >
            <Circle className={`mr-2 h-4 w-4 ${isRecording ? 'fill-current' : ''}`} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>

        {/* Recordings List */}
        <ScrollArea className="flex-1 p-4">
          {recordings.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No recordings yet
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-sidebar p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {recording.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          recording.status === 'completed'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {recording.status}
                      </span>
                      <span>{recording.quality}</span>
                      <span>{formatDuration(recording.duration)}</span>
                      <span>{formatFileSize(recording.fileSize * 1024 * 1024)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRecording(recording.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
