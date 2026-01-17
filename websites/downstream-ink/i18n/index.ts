import en from './en.json'
import hu from './hu.json'
import ro from './ro.json'

export const locales = ['en', 'hu', 'ro'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

const translations = { en, hu, ro }

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hu: 'Magyar',
  ro: 'Română'
}

export const demoUrls: Record<Locale, string> = {
  en: 'https://the-loop-demo.vercel.app',
  hu: 'https://the-loop-hu.vercel.app',
  ro: 'https://the-loop-ro.vercel.app'
}
