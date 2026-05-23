import { useEffect, useRef, useState } from 'react'

export const useScreenCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  const startScreenCapture = async () => {
    try {
      setError(null)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      })

      setStream(displayStream)
      setIsActive(true)

      // Handle stream stop via browser stop button
      displayStream.getVideoTracks()[0].onended = () => {
        setStream(null)
        setIsActive(false)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Screen capture permission denied')
      } else {
        setError('Failed to capture screen')
      }
      setIsActive(false)
    }
  }

  const stopScreenCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsActive(false)
    }
  }

  return {
    stream,
    error,
    isActive,
    startScreenCapture,
    stopScreenCapture,
  }
}

export const useWebcamCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  const startWebcamCapture = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsActive(true)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Webcam permission denied')
      } else {
        setError('Failed to access webcam')
      }
      setIsActive(false)
    }
  }

  const stopWebcamCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsActive(false)
    }
  }

  return {
    stream,
    error,
    isActive,
    startWebcamCapture,
    stopWebcamCapture,
  }
}

export const useAudioCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  const startAudioCapture = async () => {
    try {
      setError(null)
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      setStream(audioStream)
      setIsActive(true)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Microphone permission denied')
      } else {
        setError('Failed to access microphone')
      }
      setIsActive(false)
    }
  }

  const stopAudioCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsActive(false)
    }
  }

  return {
    stream,
    error,
    isActive,
    startAudioCapture,
    stopAudioCapture,
  }
}
