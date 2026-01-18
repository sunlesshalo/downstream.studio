import type { StreamConfig } from './engine/types'
import { WelcomeContent, TheTableContent, JoinUsContent } from './content'

// Generated from: streams/demo-restaurant-mediterranean/production.json

export const streamConfig: StreamConfig = {
  id: 'demo-restaurant-mediterranean',
  title: 'LIMANI',
  type: 'story',

  segments: [
    { id: 1, frameCount: 141 },
    { id: 2, frameCount: 141 },
    { id: 3, frameCount: 141 },
  ],

  sections: [
    {
      id: 'welcome',
      segments: [1],
      layout: 'side-by-side',
      content: {
        custom: <WelcomeContent />
      }
    },
    {
      id: 'the-table',
      segments: [2],
      layout: 'side-by-side',
      content: {
        custom: <TheTableContent />
      }
    },
    {
      id: 'join-us',
      segments: [3],
      layout: 'side-by-side',
      content: {
        custom: <JoinUsContent />
      }
    },
  ],

  theme: {
    colors: {
      background: '#faf8f5',
      text: '#2d4a3e',
      accent: '#c4a77d',
      muted: '#d4a574'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
