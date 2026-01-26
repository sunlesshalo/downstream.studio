import './globals.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import CookieConsent from './components/CookieConsent'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.downstream.studio'),
  title: {
    default: 'Downstream Studio',
    template: '%s | Downstream Studio',
  },
  description: 'Transform your text into immersive, scroll-driven visual experiences.',
  keywords: ['scroll animation', 'visual storytelling', 'interactive narrative', 'AI visuals'],
  authors: [{ name: 'Downstream Studio' }],
  creator: 'Downstream Studio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Downstream Studio',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="b4ee11bd-53f2-46bc-ad29-14bde4eeab23"
        />
      </body>
    </html>
  )
}
