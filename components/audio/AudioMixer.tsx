'use client'

import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Volume2, VolumeX, Music } from 'lucide-react'

interface AudioTrackUI {
  id: string
  name: string
  volume: number
  isMuted: boolean
  level: number
}

export function AudioMixer() {
  const [tracks, setTracks] = useState<AudioTrackUI[]>([])
  const [masterVolume, setMasterVolume] = useState(1)
  const [masterLevel, setMasterLevel] = useState(0)

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    setTracks((prevTracks) =>
      prevTracks.map((t) =>
        t.id === trackId ? { ...t, volume } : t
      )
    )
  }

  const handleMuteTrack = (trackId: string) => {
    setTracks((prevTracks) =>
      prevTracks.map((t) =>
        t.id === trackId ? { ...t, isMuted: !t.isMuted } : t
      )
    )
  }

  return (
    <Card className="w-full bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Audio Mixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Volume */}
        <div className="rounded-lg border border-border bg-sidebar p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Master</h3>
            <div className="text-sm text-muted-foreground">
              {(masterVolume * 100).toFixed(0)}%
            </div>
          </div>
          <Slider
            value={[masterVolume]}
            onValueChange={(v) => setMasterVolume(v[0])}
            max={1}
            step={0.01}
            className="mb-4"
          />
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${masterLevel * 100}%` }}
            />
          </div>
        </div>

        {/* Individual Tracks */}
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="rounded-lg border border-border bg-sidebar p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-foreground">{track.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(track.volume * 100).toFixed(0)}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMuteTrack(track.id)}
                    className="h-8 w-8 p-0"
                  >
                    {track.isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Slider
                value={[track.volume]}
                onValueChange={(v) => handleTrackVolumeChange(track.id, v[0])}
                max={1}
                step={0.01}
                className="mb-3"
              />
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${track.level * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {tracks.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No audio tracks connected yet. Capture screen or webcam to add audio.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
