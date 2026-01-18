'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * Telegram WebApp SDK types
 * @see https://core.telegram.org/bots/webapps
 */
interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  platform: string
  version: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  viewportHeight: number
  viewportStableHeight: number
  isExpanded: boolean
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    start_param?: string
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  sendData: (data: string) => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
}

interface TelegramGlobal {
  WebApp: TelegramWebApp
}

declare global {
  interface Window {
    Telegram?: TelegramGlobal
  }
}

export interface TelegramContext {
  /** Whether we're running inside Telegram WebView */
  isTelegram: boolean
  /** Whether the SDK is loaded and ready */
  isReady: boolean
  /** The Telegram WebApp instance (null if not in Telegram) */
  webApp: TelegramWebApp | null
  /** User info from Telegram (if available) */
  user: TelegramWebApp['initDataUnsafe']['user'] | null
  /** Current color scheme */
  colorScheme: 'light' | 'dark'
  /** Theme colors from Telegram */
  themeColors: TelegramWebApp['themeParams'] | null
  /** Viewport height (updates dynamically) */
  viewportHeight: number
  /** Close the Mini App */
  close: () => void
  /** Show haptic feedback */
  haptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => void
  /** Open external link (in browser) */
  openLink: (url: string) => void
  /** Share to Telegram */
  shareToTelegram: (url: string) => void
}

/**
 * Hook for Telegram Mini App integration
 *
 * Detects if running inside Telegram and provides:
 * - Initialization (ready, expand)
 * - Theme integration
 * - Viewport tracking
 * - User info
 * - Haptic feedback
 *
 * Safe to use outside Telegram - returns isTelegram: false
 */
export function useTelegramWebApp(): TelegramContext {
  const [isReady, setIsReady] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  // Check if we're in Telegram
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null
  const isTelegram = !!webApp?.initData

  // Initialize on mount
  useEffect(() => {
    if (!webApp || !isTelegram) {
      setIsReady(true) // Mark ready even outside Telegram
      return
    }

    // Tell Telegram we're ready
    webApp.ready()

    // Expand to full height
    webApp.expand()

    setIsReady(true)

    // Track viewport changes
    const handleViewportChange = () => {
      setViewportHeight(webApp.viewportStableHeight || webApp.viewportHeight)
    }

    webApp.onEvent('viewportChanged', handleViewportChange)
    handleViewportChange() // Initial value

    return () => {
      webApp.offEvent('viewportChanged', handleViewportChange)
    }
  }, [webApp, isTelegram])

  // Apply Telegram theme colors as CSS variables
  useEffect(() => {
    if (!webApp?.themeParams || !isTelegram) return

    const root = document.documentElement
    const params = webApp.themeParams

    if (params.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', params.bg_color)
    }
    if (params.text_color) {
      root.style.setProperty('--tg-theme-text-color', params.text_color)
    }
    if (params.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', params.hint_color)
    }
    if (params.link_color) {
      root.style.setProperty('--tg-theme-link-color', params.link_color)
    }
    if (params.button_color) {
      root.style.setProperty('--tg-theme-button-color', params.button_color)
    }
    if (params.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', params.button_text_color)
    }
    if (params.secondary_bg_color) {
      root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color)
    }
  }, [webApp?.themeParams, isTelegram])

  // Haptic feedback helper
  const haptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') => {
    if (!webApp?.HapticFeedback) return

    if (type === 'success' || type === 'error' || type === 'warning') {
      webApp.HapticFeedback.notificationOccurred(type)
    } else {
      webApp.HapticFeedback.impactOccurred(type)
    }
  }, [webApp])

  // Close Mini App
  const close = useCallback(() => {
    if (webApp) {
      webApp.close()
    }
  }, [webApp])

  // Open external link
  const openLink = useCallback((url: string) => {
    if (webApp) {
      webApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }, [webApp])

  // Share to Telegram
  const shareToTelegram = useCallback((url: string) => {
    if (webApp) {
      webApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}`)
    }
  }, [webApp])

  return {
    isTelegram,
    isReady,
    webApp,
    user: webApp?.initDataUnsafe?.user ?? null,
    colorScheme: webApp?.colorScheme ?? 'dark',
    themeColors: webApp?.themeParams ?? null,
    viewportHeight,
    close,
    haptic,
    openLink,
    shareToTelegram,
  }
}
