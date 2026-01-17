'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

export interface AmbientAudioProps {
  /** Audio source URL (mp3, wav, ogg) */
  src: string
  /** Whether to loop the audio */
  loop?: boolean
  /** Initial volume (0-1) */
  volume?: number
  /** Auto-play when user interacts (still requires user gesture) */
  autoPlay?: boolean
  /** Show/hide the audio control button */
  showControl?: boolean
  /** Position of the control button */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** Custom className for the control button */
  className?: string
}

/**
 * Ambient audio component for stream background music.
 * Renders a small mute/unmute button for user control.
 *
 * Note: Browsers require user interaction before playing audio.
 * This component handles that by showing a play button initially.
 *
 * @example
 * <StreamEngine config={config}>
 *   <AmbientAudio
 *     src="/audio/ambient-loop.mp3"
 *     loop
 *     volume={0.3}
 *     position="bottom-right"
 *   />
 * </StreamEngine>
 */
export function AmbientAudio({
  src,
  loop = true,
  volume = 0.5,
  autoPlay = false,
  showControl = true,
  position = 'bottom-right',
  className = ''
}: AmbientAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Handle auto-play after user interaction
  useEffect(() => {
    if (autoPlay && hasInteracted && audioRef.current && !isPlaying) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked, user will need to click
      })
    }
  }, [autoPlay, hasInteracted, isPlaying])

  // Listen for any user interaction to enable autoplay
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true)
    }

    if (autoPlay && !hasInteracted) {
      window.addEventListener('click', handleInteraction, { once: true })
      window.addEventListener('scroll', handleInteraction, { once: true })
      window.addEventListener('touchstart', handleInteraction, { once: true })
    }

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [autoPlay, hasInteracted])

  // Hide control after a delay when playing
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying) {
      timeout = setTimeout(() => setIsVisible(false), 3000)
    } else {
      setIsVisible(true)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((err) => {
        console.warn('Audio playback failed:', err)
      })
    }
  }, [isPlaying])

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { bottom: '1.5rem', left: '1.5rem' },
    'bottom-right': { bottom: '1.5rem', right: '1.5rem' },
    'top-left': { top: '1.5rem', left: '1.5rem' },
    'top-right': { top: '1.5rem', right: '1.5rem' },
  }

  if (!showControl) {
    return (
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="auto"
      />
    )
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="auto"
      />

      <div
        className={`ds-audio-control ${className}`}
        style={{
          position: 'fixed',
          zIndex: 1000,
          ...positionStyles[position]
        }}
        onMouseEnter={handleMouseEnter}
      >
        <style jsx>{`
          .ds-audio-control__button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: ${isVisible ? 1 : 0.3};
          }

          .ds-audio-control__button:hover {
            opacity: 1;
            background: rgba(0, 0, 0, 0.8);
            border-color: var(--ds-color-accent, rgba(255, 255, 255, 0.4));
            transform: scale(1.05);
          }

          .ds-audio-control__icon {
            width: 20px;
            height: 20px;
            fill: var(--ds-color-text, white);
          }

          .ds-audio-control__label {
            position: absolute;
            right: 56px;
            white-space: nowrap;
            font-size: 0.75rem;
            padding: 0.4rem 0.8rem;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            color: var(--ds-color-text, white);
          }

          .ds-audio-control__button:hover + .ds-audio-control__label,
          .ds-audio-control:hover .ds-audio-control__label {
            opacity: ${!isPlaying ? 1 : 0};
          }
        `}</style>

        <button
          onClick={togglePlay}
          className="ds-audio-control__button"
          aria-label={isPlaying ? 'Mute audio' : 'Play audio'}
        >
          {isPlaying ? (
            // Speaker icon (playing)
            <svg className="ds-audio-control__icon" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            // Muted speaker icon
            <svg className="ds-audio-control__icon" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          )}
        </button>

        {!isPlaying && (
          <span className="ds-audio-control__label">
            Click to play music
          </span>
        )}
      </div>
    </>
  )
}
