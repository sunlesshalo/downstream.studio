'use client'

import { useRef, useState, useEffect } from 'react'

interface AnimatedBackgroundProps {
  className?: string
  src?: string
}

export default function AnimatedBackground({
  className,
  src = '/background-loop.mp4'
}: AnimatedBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fallback: show video after 500ms even if not fully loaded
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      onLoadedData={() => setIsLoaded(true)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(16px) grayscale(0.7) brightness(0.4)',
        opacity: isLoaded ? 0.8 : 0,
        transition: 'opacity 0.3s ease-out',
        pointerEvents: 'none',
      }}
    />
  )
}
