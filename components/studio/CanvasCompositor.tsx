'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { useStreamStore } from '@/lib/store/stream-store'
import { mediaManager } from '@/lib/services/media-manager'

interface CompositorSource {
  type: 'screen' | 'webcam'
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export function CanvasCompositor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map())
  
  const { activeSceneId, scenes, screenShareActive, webcamActive } = useStreamStore()
  const currentScene = scenes.find((s) => s.id === activeSceneId)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas resolution
    const width = 1920
    const height = 1080

    canvas.width = width
    canvas.height = height

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Render compositor
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const screenStream = mediaManager.getScreenStream()
    const webcamStream = mediaManager.getWebcamStream()

    // Get video elements or create them
    const getVideoElement = (key: string, stream: MediaStream): HTMLVideoElement => {
      if (!videoElementsRef.current.has(key)) {
        const video = document.createElement('video')
        video.srcObject = stream
        video.autoplay = true
        video.muted = true
        video.playsInline = true
        video.crossOrigin = 'anonymous'
        videoElementsRef.current.set(key, video)
      }
      return videoElementsRef.current.get(key)!
    }

    const render = () => {
      // Clear canvas with background color
      ctx.fillStyle = '#0a0e27'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw sources based on scene layout
      if (screenStream) {
        const screenVideo = getVideoElement('screen', screenStream)
        if (screenVideo.readyState === 4) {
          // Full canvas with screen
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height)
        }
      }

      // Draw webcam as picture-in-picture (bottom right)
      if (webcamStream) {
        const webcamVideo = getVideoElement('webcam', webcamStream)
        if (webcamVideo.readyState === 4) {
          const pipWidth = 320
          const pipHeight = 240
          const pipX = canvas.width - pipWidth - 20
          const pipY = canvas.height - pipHeight - 20

          // Draw border around PiP
          ctx.strokeStyle = '#00d4ff'
          ctx.lineWidth = 2
          ctx.strokeRect(pipX - 2, pipY - 2, pipWidth + 4, pipHeight + 4)

          // Draw webcam
          ctx.drawImage(webcamVideo, pipX, pipY, pipWidth, pipHeight)
        }
      }

      // Draw grid overlay for composition guide (optional)
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)'
      ctx.lineWidth = 1
      const gridSize = 192 // 10th of width
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [screenShareActive, webcamActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      videoElementsRef.current.forEach((video) => {
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks()
          tracks.forEach((track) => track.stop())
        }
      })
      videoElementsRef.current.clear()
    }
  }, [])

  return (
    <div className="relative h-full w-full bg-sidebar">
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain"
        style={{
          background: '#0a0e27',
          display: 'block',
        }}
      />
      {!screenShareActive && !webcamActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              No sources active
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start screen or webcam capture to begin
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
