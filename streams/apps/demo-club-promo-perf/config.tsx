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
      text: '#ffffff',
      accent: '#ffffff',
      muted: 'rgba(255, 255, 255, 0.55)'
    },
    fonts: {
      heading: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  }
}
