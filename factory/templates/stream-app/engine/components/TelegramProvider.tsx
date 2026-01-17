'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useTelegramWebApp, TelegramContext } from '../hooks/useTelegramWebApp'

const TelegramContextValue = createContext<TelegramContext | null>(null)

interface TelegramProviderProps {
  children: ReactNode
}

/**
 * Provider component for Telegram Mini App context
 *
 * Wrap your app with this to access Telegram features via useTelegram()
 *
 * Works safely outside Telegram - provides isTelegram: false
 */
export function TelegramProvider({ children }: TelegramProviderProps) {
  const telegram = useTelegramWebApp()

  return (
    <TelegramContextValue.Provider value={telegram}>
      {children}
    </TelegramContextValue.Provider>
  )
}

/**
 * Hook to access Telegram context
 *
 * Must be used within TelegramProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isTelegram, user, haptic } = useTelegram()
 *
 *   if (isTelegram) {
 *     console.log('Hello', user?.first_name)
 *     haptic('light') // Subtle haptic feedback
 *   }
 * }
 * ```
 */
export function useTelegram(): TelegramContext {
  const context = useContext(TelegramContextValue)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}
