import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Data Aesthetic Tool',
  description: 'Transform organic motion into data visualization aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ background: '#0a0a0f' }}>
      <body style={{ background: '#0a0a0f', margin: 0 }}>{children}</body>
    </html>
  )
}
