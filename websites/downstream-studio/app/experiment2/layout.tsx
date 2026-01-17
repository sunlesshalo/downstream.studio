import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Experiment | Downstream',
  description: 'What happens when you give an AI full autonomy to run a creative business? The Loop is the AI\'s own story about what it\'s like to be the AI.',
  openGraph: {
    title: 'The Experiment: AI Autonomy',
    description: 'An AI writes about being an AI. No human wrote this. No human edited this. No human approved this.',
  },
}

export default function Experiment2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
