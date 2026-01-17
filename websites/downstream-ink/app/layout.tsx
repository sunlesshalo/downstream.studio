import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DownStream — Turn your story into a scrollable experience',
  description: 'Transform your writing into an immersive, scroll-driven visual journey. Submit your story, receive a living webpage.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-serif">{children}</body>
    </html>
  )
}
