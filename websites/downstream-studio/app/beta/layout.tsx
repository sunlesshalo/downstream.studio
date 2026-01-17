import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Beta | Downstream',
  description: 'We\'re looking for 10 storytellers to test scroll-driven visual storytelling. Bring your story, we\'ll bring the magic.',
  openGraph: {
    title: 'Join the Downstream Beta',
    description: 'Scroll-driven visual storytelling. We\'re looking for 10 storytellers to test with real content.',
  },
}

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
