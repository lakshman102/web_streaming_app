'use client'

import React, { useState } from 'react'
import { useScreenCapture, useWebcamCapture, useAudioCapture } from '@/hooks/useMediaCapture'
import { useStreamStore } from '@/lib/store/stream-store'
import { mediaManager } from '@/lib/services/media-manager'
import { Button } from '@/components/ui/button'
import { Monitor, Video, Mic, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function MediaControls() {
  const { setScreenStream, setWebcamStream, setMicrophoneStream, setScreenShareActive, setWebcamActive } =
    useStreamStore()
  
  const screen = useScreenCapture()
  const webcam = useWebcamCapture()
  const audio = useAudioCapture()

  const [isCapturingScreen, setIsCapturingScreen] = useState(false)
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false)
  const [isCapturingAudio, setIsCapturingAudio] = useState(false)

  const handleScreenCapture = async () => {
    if (screen.isActive) {
      screen.stopScreenCapture()
      setIsCapturingScreen(false)
      setScreenStream(null)
      setScreenShareActive(false)
      mediaManager.stopAllCaptures()
    } else {
      try {
        await screen.startScreenCapture()
        setIsCapturingScreen(true)
        if (screen.stream) {
          setScreenStream(screen.stream)
          setScreenShareActive(true)
          mediaManager.captureScreen()
        }
      } catch (err) {
        console.error('[v0] Screen capture error:', err)
      }
    }
  }

  const handleWebcamCapture = async () => {
    if (webcam.isActive) {
      webcam.stopWebcamCapture()
      setIsCapturingWebcam(false)
      setWebcamStream(null)
      setWebcamActive(false)
    } else {
      try {
        await webcam.startWebcamCapture()
        setIsCapturingWebcam(true)
        if (webcam.stream) {
          setWebcamStream(webcam.stream)
          setWebcamActive(true)
          mediaManager.captureWebcam()
        }
      } catch (err) {
        console.error('[v0] Webcam capture error:', err)
      }
    }
  }

  const handleAudioCapture = async () => {
    if (audio.isActive) {
      audio.stopAudioCapture()
      setIsCapturingAudio(false)
      setMicrophoneStream(null)
    } else {
      try {
        await audio.startAudioCapture()
        setIsCapturingAudio(true)
        if (audio.stream) {
          setMicrophoneStream(audio.stream)
        }
      } catch (err) {
        console.error('[v0] Audio capture error:', err)
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-sidebar-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground">Media Capture</h3>

      {(screen.error || webcam.error || audio.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {screen.error || webcam.error || audio.error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleScreenCapture}
          variant={screen.isActive ? 'default' : 'outline'}
          className={`w-full ${
            screen.isActive ? 'bg-primary text-primary-foreground' : ''
          }`}
          disabled={isCapturingScreen}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {screen.isActive ? 'Stop' : 'Start'} Screen Share
        </Button>

        <Button
          onClick={handleWebcamCapture}
          variant={webcam.isActive ? 'default' : 'outline'}
          className={`w-full ${
            webcam.isActive ? 'bg-primary text-primary-foreground' : ''
          }`}
          disabled={isCapturingWebcam}
        >
          <Video className="mr-2 h-4 w-4" />
          {webcam.isActive ? 'Stop' : 'Start'} Webcam
        </Button>

        <Button
          onClick={handleAudioCapture}
          variant={audio.isActive ? 'default' : 'outline'}
          className={`w-full ${
            audio.isActive ? 'bg-primary text-primary-foreground' : ''
          }`}
          disabled={isCapturingAudio}
        >
          <Mic className="mr-2 h-4 w-4" />
          {audio.isActive ? 'Stop' : 'Start'} Microphone
        </Button>
      </div>

      <div className="mt-4 space-y-2 rounded-lg bg-sidebar p-3">
        <p className="text-xs font-semibold text-foreground">Status</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                screen.isActive ? 'bg-accent' : 'bg-muted'
              }`}
            />
            Screen: {screen.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                webcam.isActive ? 'bg-accent' : 'bg-muted'
              }`}
            />
            Webcam: {webcam.isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                audio.isActive ? 'bg-accent' : 'bg-muted'
              }`}
            />
            Microphone: {audio.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Browser permissions required. You'll be asked to grant access when clicking buttons above.
      </p>
    </div>
  )
}
