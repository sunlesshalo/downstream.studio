'use client'

import { useEffect, useState } from 'react'
import styles from './demos.module.css'

const STORIES = [
  {
    url: 'https://founding-story-perf.vercel.app/',
    title: 'The Vessel and the Sea',
    description: "A founder's journey told through maritime metaphor. Contemplative, personal, transformative.",
  },
  {
    url: 'https://stream-bolyai.vercel.app/',
    title: 'A kétezer éves rejtély',
    description: 'How a mathematician questioned 2,000 years of certainty and changed how we see the universe.',
  },
]

const BRANDS = [
  {
    url: 'https://demo-club-promo-perf.vercel.app/',
    title: 'Neon Nights',
    description: 'Club promotion that pulses with energy. Dark, electric, immersive.',
  },
  {
    url: 'https://demo-restaurant-mediterranean-perf.vercel.app/',
    title: 'Limani',
    description: 'Mediterranean restaurant brought to life. Fresh, warm, inviting.',
  },
]

const BOOKING_URL = 'https://cal.com/ferencz-csuszner/30min'

export default function DemosPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const renderStream = (stream: typeof STORIES[0], index: number) => (
    <div
      key={stream.url}
      className={styles.streamCard}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.streamFrame}>
        <iframe
          src={stream.url}
          title={stream.title}
          className={styles.iframe}
          allow="autoplay"
        />
      </div>
      <div className={styles.streamInfo}>
        <h3 className={styles.title}>{stream.title}</h3>
        <p className={styles.description}>{stream.description}</p>
        <a
          href={stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fullscreenLink}
        >
          Open Full Experience →
        </a>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${visible ? styles.visible : ''}`}>
        {/* Column Headers */}
        <div className={styles.headerRow}>
          <h2 className={styles.columnTitle}>Történetek</h2>
          <h2 className={styles.columnTitle}>Márkák</h2>
        </div>

        {/* Streams Grid - ensures row alignment */}
        <div className={styles.streamsGrid}>
          {renderStream(STORIES[0], 0)}
          {renderStream(BRANDS[0], 1)}
          {renderStream(STORIES[1], 2)}
          {renderStream(BRANDS[1], 3)}
        </div>
      </div>

      <div className={styles.ctaContainer}>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaButton}
        >
          Beszéljünk
        </a>
        <p className={styles.ctaSubtext}>30 perces hívás foglalása</p>
      </div>
    </div>
  )
}
