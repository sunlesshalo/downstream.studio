'use client'

import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

const CONSENT_KEY = 'ds-privacy-acknowledged'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if user has already acknowledged
    const acknowledged = localStorage.getItem(CONSENT_KEY)
    if (!acknowledged) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p>
          We use privacy-focused analytics (no cookies, no tracking across sites).
          <a href="/privacy"> Learn more</a>
        </p>
        <button onClick={handleAccept} className={styles.button}>
          Got it
        </button>
      </div>
    </div>
  )
}
