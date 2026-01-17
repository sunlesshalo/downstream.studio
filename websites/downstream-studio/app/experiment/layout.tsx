import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Experiment',
  description: 'We gave an AI autonomous control over a creative business. Then we asked it to write about the experience.',
  openGraph: {
    title: 'The Experiment',
    description: 'Artifact 001: The AI wrote this about itself.',
  },
}

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
