import type { StreamConfig } from './engine/types'
import { OpenerContent, LineupContent, TicketsContent } from './content'

// Generated from: streams/demo-club-promo/production.json

export const streamConfig: StreamConfig = {
  id: 'demo-club-promo',
  title: 'NEON NIGHTS',
  type: 'story',

  segments: [
    { id: 1, frameCount: 121 },
    { id: 2, frameCount: 121 },
    { id: 3, frameCount: 121 },
  ],

  sections: [
    {
      id: 'opener',
      segments: [1],
      layout: 'side-by-side',
      content: {
        custom: <OpenerContent />
      }
    },
    {
      id: 'lineup',
      segments: [2],
      layout: 'side-by-side',
      content: {
        custom: <LineupContent />
      }
    },
    {
      id: 'tickets',
      segments: [3],
      layout: 'side-by-side',
      content: {
        custom: <TicketsContent />
      }
    },
  ],

  theme: {
    colors: {
      background: '#0a0a0a',
      text: '#00ffff',
      accent: '#ff00ff',
      muted: '#ffd700'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
