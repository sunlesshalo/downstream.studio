import type { StreamConfig } from '../packages/engine/src'
import { Section1Content, Section2Content, Section3Content, Section4Content, Section5Content } from './content'

/**
 * DownStream Launch Campaign - Romania January 2026
 *
 * Sales letter structure:
 * 1. Mirror + problema pasivității
 * 2. Povestea celor două cafenele
 * 3. De ce nu merg soluțiile clasice
 * 4. DownStream — noul mecanism
 * 5. Oferta + CTA
 *
 * TODO: Update segments with actual frame counts after extraction
 * Run: ./execution/count_frames.sh stream-downstream-launch/public/frames
 */
export const streamConfig: StreamConfig = {
  id: 'downstream-launch',
  title: 'DownStream — Lansare România',
  type: 'marketing',

  // TODO: Update frameCount values after extracting frames
  segments: [
    { id: 1, frameCount: 96 },  // Static site, cursor leaves, tab closes
    { id: 2, frameCount: 96 },  // Two cafes: empty vs. full, Miguel
    { id: 3, frameCount: 72 },  // Text ignored → video play button ignored
    { id: 4, frameCount: 120 }, // Transformation: static becomes alive
    { id: 5, frameCount: 96 },  // Door opens, invitation, light
  ],

  sections: [
    {
      id: 'mirror',
      segments: [1],
      layout: 'side-by-side',
      content: { custom: <Section1Content /> }
    },
    {
      id: 'story-cafenele',
      segments: [2],
      layout: 'side-by-side',
      content: { custom: <Section2Content /> }
    },
    {
      id: 'solutii-clasice',
      segments: [3],
      layout: 'side-by-side',
      content: { custom: <Section3Content /> }
    },
    {
      id: 'downstream-mecanism',
      segments: [4],
      layout: 'side-by-side',
      content: { custom: <Section4Content /> }
    },
    {
      id: 'oferta-cta',
      segments: [5],
      layout: 'side-by-side',
      content: { custom: <Section5Content /> }
    },
  ],

  theme: {
    colors: {
      background: '#0a0a0a',
      text: '#fafafa',
      accent: '#3b82f6',
      muted: '#71717a'
    },
    fonts: {
      heading: 'system-ui, -apple-system, sans-serif',
      body: 'system-ui, -apple-system, sans-serif'
    }
  }
}
