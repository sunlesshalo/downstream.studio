import type { Metadata } from 'next'
import Script from 'next/script'
import config from '../stream.config.json'
import './globals.css'

export const metadata: Metadata = {
  title: config.metadata?.title || 'DownStream',
  description: config.metadata?.description || 'A scroll-driven visual story',
  openGraph: {
    title: config.metadata?.title || 'DownStream',
    description: config.metadata?.description || 'A scroll-driven visual story',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Telegram Mini App SDK - loads early for detection */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
