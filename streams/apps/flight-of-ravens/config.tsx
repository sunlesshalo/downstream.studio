import type { StreamConfig } from './engine/types'
import { Part1Content, Part2Content, Part3Content } from './content'

// Transposed from Hollókröpte (Hungarian) to Flight of Ravens (English)

export const streamConfig: StreamConfig = {
  id: 'flight-of-ravens',
  title: 'Flight of Ravens',
  type: 'story',

  // 10 segments, 141 frames each (same as Hungarian original)
  segments: [
    { id: 1, frameCount: 141 },
    { id: 2, frameCount: 141 },
    { id: 3, frameCount: 141 },
    { id: 4, frameCount: 141 },
    { id: 5, frameCount: 141 },
    { id: 6, frameCount: 141 },
    { id: 7, frameCount: 141 },
    { id: 8, frameCount: 141 },
    { id: 9, frameCount: 141 },
    { id: 10, frameCount: 141 },
  ],

  sections: [
    {
      id: 'part-1-the-quiet-apocalypse',
      segments: [1, 2, 3],
      layout: 'side-by-side',
      content: {
        custom: <Part1Content />
      }
    },
    {
      id: 'part-2-the-voyage',
      segments: [4, 5, 6, 7],
      layout: 'side-by-side',
      content: {
        custom: <Part2Content />
      }
    },
    {
      id: 'part-3-the-fool-and-the-raven',
      segments: [8, 9, 10],
      layout: 'side-by-side',
      content: {
        custom: <Part3Content />
      }
    },
  ],

  theme: {
    colors: {
      background: '#0a0a0f',
      text: '#c9b8a8',
      accent: '#d4a056',
      muted: '#6b4423'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
