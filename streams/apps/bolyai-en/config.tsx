import type { StreamConfig } from './engine/types'
import { Chapter1Content, Chapter2Content, Chapter3_4Content, Chapter5_6Content } from './content'

// English version of Bolyai stream

export const streamConfig: StreamConfig = {
  id: 'bolyai-en',
  title: 'The Two-Thousand-Year Riddle: Bolyai and Curved Space',
  type: 'story',

  // Same frame counts as Hungarian version (121 each)
  segments: [
    { id: 1, frameCount: 121 },
    { id: 2, frameCount: 121 },
    { id: 3, frameCount: 121 },
    { id: 4, frameCount: 121 },
    { id: 5, frameCount: 121 },
  ],

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
