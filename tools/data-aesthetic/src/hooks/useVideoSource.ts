import { useState, useRef, useCallback, useEffect } from 'react'

export interface VideoSourceState {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  error: string | null
}

export function useVideoSource() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [state, setState] = useState<VideoSourceState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    error: null,
  })

  // Initialize video element
  useEffect(() => {
    const video = document.createElement('video')
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    videoRef.current = video

    video.addEventListener('loadedmetadata', () => {
      setState(prev => ({
        ...prev,
        duration: video.duration,
        isLoaded: true,
        error: null,
      }))
    })

    video.addEventListener('timeupdate', () => {
      setState(prev => ({
        ...prev,
        currentTime: video.currentTime,
      }))
    })

    video.addEventListener('error', () => {
      setState(prev => ({
        ...prev,
        error: 'Failed to load video',
        isLoaded: false,
      }))
    })

    video.addEventListener('play', () => {
      setState(prev => ({ ...prev, isPlaying: true }))
    })

    video.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    })

    return () => {
      video.pause()
      video.src = ''
      videoRef.current = null
    }
  }, [])

  const loadVideo = useCallback((file: File | string) => {
    const video = videoRef.current
    if (!video) return

    setState(prev => ({ ...prev, isLoaded: false, error: null }))

    if (typeof file === 'string') {
      video.src = file
    } else {
      video.src = URL.createObjectURL(file)
    }

    video.load()
  }, [])

  const play = useCallback(() => {
    videoRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  const getVideoElement = useCallback(() => {
    return videoRef.current
  }, [])

  return {
    ...state,
    loadVideo,
    play,
    pause,
    seek,
    getVideoElement,
  }
}
