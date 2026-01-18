import type { StreamConfig } from './engine/types'
import { IntroContent, MainStoryContent, EpilogueContent } from './content'

// Performance variant: 47 frames per segment (vs 141 original)
// Total: 235 frames (~5MB) vs 705 frames (~34MB)

export const streamConfig: StreamConfig = {
  id: 'the-hunger-perf',
  title: 'The Hunger',
  type: 'story',

  segments: [
    { id: 1, frameCount: 47 },
    { id: 2, frameCount: 47 },
    { id: 3, frameCount: 47 },
    { id: 4, frameCount: 47 },
    { id: 5, frameCount: 47 },
  ],

  sections: [
    {
      id: 'intro',
      segments: [1],
      layout: 'side-by-side',
      content: {
        custom: <IntroContent />
      }
    },
    {
      id: 'main-story',
      segments: [2, 3, 4],
      layout: 'side-by-side',
      content: {
        custom: <MainStoryContent />
      }
    },
    {
      id: 'epilogue',
      segments: [5],
      layout: 'side-by-side',
      content: {
        custom: <EpilogueContent />
      }
    },
  ],

  theme: {
    colors: {
      background: '#0a0a0f',
      text: '#c9b8a8',
      accent: '#d4a056',
      muted: '#6b2a2a'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
