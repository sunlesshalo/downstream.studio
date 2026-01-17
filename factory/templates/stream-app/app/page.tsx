'use client'

import { useEffect } from 'react'
import { StreamEngine } from '../engine/StreamEngine'
import config from '../stream.config.json'

/**
 * Initialize Telegram Mini App if running inside Telegram
 */
function useTelegramInit() {
  useEffect(() => {
    // Check if Telegram SDK is available
    const tg = (window as any).Telegram?.WebApp

    if (tg?.initData) {
      // We're inside Telegram
      console.log('[Telegram] Mini App detected, platform:', tg.platform)

      // Tell Telegram we're ready to display
      tg.ready()

      // Expand to full height
      tg.expand()

      // Apply Telegram theme colors as CSS variables
      if (tg.themeParams) {
        const root = document.documentElement
        Object.entries(tg.themeParams).forEach(([key, value]) => {
          root.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value as string)
        })
      }

      // Log user info for debugging
      if (tg.initDataUnsafe?.user) {
        console.log('[Telegram] User:', tg.initDataUnsafe.user.first_name)
      }
    }
  }, [])
}

export default function StreamPage() {
  useTelegramInit()

  return <StreamEngine config={config as any} />
}
