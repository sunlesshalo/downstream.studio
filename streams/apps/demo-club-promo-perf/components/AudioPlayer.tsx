'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Background audio player for club promo
 * Uses royalty-free electronic music from Pixabay
 * Starts muted (browser policy), user can unmute
 */
export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Local royalty-free electronic track
  const audioSrc = '/audio.mp3'

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleCanPlay = () => setIsLoaded(true)
    const handleEnded = () => {
      // Loop the track
      audio.currentTime = 0
      audio.play()
    }

    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        loop
      />

      {/* Floating audio toggle button */}
      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Mute audio' : 'Play audio'}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: isPlaying
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.5)',
          color: 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          zIndex: 1000,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
          opacity: isLoaded ? 1 : 0.5,
        }}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        )}
      </button>

      {/* Hint text */}
      {!isPlaying && isLoaded && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '80px',
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            letterSpacing: '0.08em',
            zIndex: 1000,
            lineHeight: 1.4,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          tap for<br />sound
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}
