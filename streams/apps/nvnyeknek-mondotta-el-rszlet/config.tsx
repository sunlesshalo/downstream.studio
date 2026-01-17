import type { StreamConfig } from './engine/types'
import { Section1Content, Section2Content, Section3Content, Section4Content, Section5Content } from './content'

export const streamConfig: StreamConfig = {
  id: 'nvnyeknek-mondotta-el-rszlet',
  title: 'Növényeknek mondotta el (részlet)',
  type: 'story',

  segments: [
    { id: 1, frameCount: 121 },
    { id: 2, frameCount: 121 },
    { id: 3, frameCount: 121 },
    { id: 4, frameCount: 121 },
    { id: 5, frameCount: 121 },
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
    {
      id: 'section-4',
      segments: [4],
      layout: 'side-by-side',
      content: {
        custom: <Section4Content />
      }
    },
    {
      id: 'section-5',
      segments: [5],
      layout: 'side-by-side',
      content: {
        custom: <Section5Content />
      }
    },
  ],

  theme: {
    colors: {
      background: '#F5F0E6',
      text: '#3d3d3d',
      accent: '#5B8C5A',
      muted: '#E8A87C'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
