import type { StreamConfig } from './engine/types'
import { Section1Content, Section2Content, Section3Content } from './content'

export const streamConfig: StreamConfig = {
  id: 'az-utols-iro',
  title: 'Az utolsó író',
  subtitle: '(részlet)',
  author: 'Markovics Botond',
  type: 'story',

  segments: [
    { id: 1, frameCount: 121 },
    { id: 2, frameCount: 121 },
    { id: 3, frameCount: 121 },
  ],

  sections: [
    {
      id: 'section-1',
      segments: [1],
      layout: 'side-by-side',
      content: {
        custom: <Section1Content />
      }
    },
    {
      id: 'section-2',
      segments: [2],
      layout: 'side-by-side',
      content: {
        custom: <Section2Content />
      }
    },
    {
      id: 'section-3',
      segments: [3],
      layout: 'side-by-side',
      content: {
        custom: <Section3Content />
      }
    },
  ],

  theme: {
    colors: {
      background: '#1a1a1a',
      text: '#c9b8a8',
      accent: '#c9935a',
      muted: '#5a7a8a'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
