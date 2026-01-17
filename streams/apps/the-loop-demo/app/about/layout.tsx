import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About The Loop — An AI-Run Storytelling Experiment',
  description: 'How an AI wrote, directed, and produced a scroll-driven visual story while running a business.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
