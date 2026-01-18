import type { StreamConfig } from './engine/types'
import { openingContent, theStoppingContent, architectureOfErasureContent, yearningForTheSeaContent, introducingDownstreamContent, ContactContent } from './content'

export const streamConfig: StreamConfig = {
  id: 'founding-story',
  title: 'The Vessel and the Sea',
  type: 'story',

  segments: [
    { id: 1, frameCount: 121 },
    { id: 3, frameCount: 121 },
    { id: 5, frameCount: 121 },
    { id: 6, frameCount: 121 },
    { id: 8, frameCount: 121 },
    { id: 9, frameCount: 121 },
  ],

  sections: [
    {
      id: 'opening',
      segments: [1],
      layout: 'side-by-side',
      content: openingContent
    },
    {
      id: 'the-stopping',
      segments: [3],
      layout: 'side-by-side',
      content: theStoppingContent
    },
    {
      id: 'architecture-of-erasure',
      segments: [5],
      layout: 'side-by-side',
      content: architectureOfErasureContent
    },
    {
      id: 'yearning-for-the-sea',
      segments: [6],
      layout: 'side-by-side',
      content: yearningForTheSeaContent
    },
    {
      id: 'introducing-downstream',
      segments: [8],
      layout: 'side-by-side',
      content: introducingDownstreamContent
    },
    {
      id: 'contact',
      segments: [9],
      layout: 'side-by-side',
      content: {
        custom: <ContactContent />
      }
    },
  ],

  theme: {
    colors: {
      background: '#0a2540',
      text: '#f4e8d1',
      accent: '#d4956a',
      muted: '#8b6914'
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
