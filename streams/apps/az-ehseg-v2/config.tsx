import type { StreamConfig } from './engine/types'
import { IntroContent, MainStoryContent, EpilogueContent } from './content'

// Generated from: streams/az-ehseg-v2/production.json

export const streamConfig: StreamConfig = {
  id: 'az-ehseg-v2',
  title: 'Az Éhség (The Hunger) - Recreated',
  type: 'story',

  segments: [
    { id: 1, frameCount: 141 },
    { id: 2, frameCount: 141 },
    { id: 3, frameCount: 141 },
    { id: 4, frameCount: 141 },
    { id: 5, frameCount: 141 },
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
