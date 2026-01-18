import type { StreamConfig } from './engine/types'
import { Chapter1Content, Chapter2Content, Chapter3_4Content, Chapter5_6Content } from './content'

// Generated from: pipeline/streams/bolyai/production.json

export const streamConfig: StreamConfig = {
  id: 'bolyai',
  title: 'A kétezer éves rejtély: Bolyai János és a meggörbült tér',
  type: 'story',

  // From production.json segments[] + actual frame counts (121 each)
  segments: [
    { id: 1, frameCount: 121 },
    { id: 2, frameCount: 121 },
    { id: 3, frameCount: 121 },
    { id: 4, frameCount: 121 },
    { id: 5, frameCount: 121 },
  ],

  // From production.json sections[] - use segment_ids for mapping
  sections: [
    {
      id: 'chapter-1',
      segments: [1],
      layout: 'side-by-side',
      content: {
        custom: <Chapter1Content />
      }
    },
    {
      id: 'chapter-2',
      segments: [2],
      layout: 'side-by-side',
      content: {
        custom: <Chapter2Content />
      }
    },
    {
      id: 'chapter-3-4',
      segments: [3, 4],
      layout: 'side-by-side',
      content: {
        custom: <Chapter3_4Content />
      }
    },
    {
      id: 'chapter-5-6',
      segments: [5],
      layout: 'side-by-side',
      content: {
        custom: <Chapter5_6Content />
      }
    }
  ],

  // From production.json visual_direction.color_palette
  theme: {
    colors: {
      background: '#0a0a14',
      text: '#c9b8a8',
      accent: '#c9a656',
      muted: '#4a6d8c'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
