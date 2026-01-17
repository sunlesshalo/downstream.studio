import type { StreamConfig } from './engine/types'
import { Section1Content, Section2Content, Section3Content } from './content'

// Generated from: streams/fotoszintezis-demo/production.json

export const streamConfig: StreamConfig = {
  id: 'fotoszintezis-demo',
  title: 'Jöjjön el a fotoszintézis országa',
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
      background: '#0a0d0a',
      text: '#c4cba8',
      accent: '#6B8E23',
      muted: '#4a5d3a'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
