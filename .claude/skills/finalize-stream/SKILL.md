---
name: finalize-stream
description: Create the final Next.js stream app from generated visual assets. Use after generating frames to assemble the complete runnable stream.
---

# Finalize Stream - Create Next.js App

## Goal
Take generated frame assets and create a complete, runnable Next.js stream application.

## When to Use
- After completing frame extraction in stream-production pipeline
- Visual assets exist in `streams/{id}/public/frames/`
- Ready to create the final viewable stream

## Prerequisites
- Frames extracted to `streams/{stream-id}/public/frames/{segment}/`
- `streams/{stream-id}/production.json` with:
  - `sections[]` containing `text_content`, `segment_ids`, `text_type`, `dialogue_markers`
  - `segments[]` with frame generation details
  - `visual_direction` for theme colors

---

## CRITICAL RULE

**NEVER MODIFY THE ORIGINAL TEXT.**

When creating `content.tsx`:
- Copy the EXACT text character-for-character
- Keep all original titles (h1, h2)
- Keep all original section structure
- Keep all formatting (dialogue blocks, emphasis)
- Do NOT add new titles or section headers
- Do NOT reorganize or "improve" the text
- Do NOT change any words, punctuation, or formatting

---

## STEP-BY-STEP PROCESS

### Step 1: Create Directory Structure

```bash
mkdir -p stream-{id}/app
mkdir -p stream-{id}/public/frames
```

### Step 2: Copy Frames

```bash
cp -r streams/{id}/public/frames/* stream-{id}/public/frames/
```

Verify:
```bash
ls stream-{id}/public/frames/
# Should show: 1/ 2/ 3/ 4/ 5/ (one folder per segment)

ls stream-{id}/public/frames/1/ | wc -l
# Should show frame count (e.g., 141)
```

### Step 3: Create config.tsx from production.json

1. Get actual frame counts from extracted frames:
```bash
for dir in stream-{id}/public/frames/*/; do
  segment=$(basename $dir)
  count=$(ls "$dir" | wc -l)
  echo "Segment $segment: $count frames"
done
```

2. Read from `streams/{id}/production.json`:
   - `stream.id`, `stream.title` → config id, title
   - `segments[]` → config segments (use actual frame counts)
   - `sections[]` → config sections (use segment_ids)
   - `visual_direction.color_palette` → config theme.colors

Create `stream-{id}/config.tsx`:

```tsx
import type { StreamConfig } from '../packages/engine/src'
import { IntroContent, MainStoryContent, EpilogueContent } from './content'

// Generated from: streams/{id}/production.json

export const streamConfig: StreamConfig = {
  id: '{stream.id}',           // from production.json
  title: '{stream.title}',     // from production.json
  type: 'story',

  // From production.json segments[] + actual frame counts
  segments: [
    { id: 1, frameCount: 141 },  // Actual count from extraction
    { id: 2, frameCount: 141 },
    { id: 3, frameCount: 141 },
    { id: 4, frameCount: 141 },
    { id: 5, frameCount: 141 },
  ],

  // From production.json sections[] - use segment_ids for mapping
  sections: [
    {
      id: 'intro',                 // sections[0].id
      segments: [1],               // sections[0].segment_ids
      layout: 'side-by-side',      // sections[0].layout
      content: {
        custom: <IntroContent />   // Generated from sections[0].text_content
      }
    },
    {
      id: 'main-story',            // sections[1].id
      segments: [2, 3, 4],         // sections[1].segment_ids
      layout: 'side-by-side',
      content: {
        custom: <MainStoryContent />
      }
    },
    {
      id: 'epilogue',              // sections[2].id
      segments: [5],               // sections[2].segment_ids
      layout: 'side-by-side',
      content: {
        custom: <EpilogueContent />
      }
    }
  ],

  // From production.json visual_direction.color_palette
  theme: {
    colors: {
      background: '#0a0a0f',       // visual_direction.color_palette.background
      text: '#c9b8a8',             // visual_direction.color_palette.secondary
      accent: '#d4a056',           // visual_direction.color_palette.primary
      muted: '#6b4423'             // visual_direction.color_palette.accent
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }
  }
}
```

**Section Structure (already defined in production.json):**
- Sections and segment_ids come directly from production.json
- The agent has already grouped segments appropriately
- Just map section.segment_ids to config.sections[].segments

### Step 4: Create content.tsx from production.json

**Generate from `production.json` sections. Text is preserved exactly as stored.**

1. Read sections from `streams/{id}/production.json`
2. For each section, create a content component
3. Apply text_type and dialogue_markers for formatting

```tsx
/**
 * Content components for {Stream Title}
 * AUTO-GENERATED from production.json sections
 * Text preserved exactly as stored in text_content
 */

function Dialogue({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontStyle: 'italic',
      marginLeft: '0.5rem',
      borderLeft: '2px solid var(--ds-color-muted)',
      paddingLeft: '1rem',
      margin: '1.5rem 0 1.5rem 0.5rem'
    }}>
      {children}
    </div>
  )
}

// Transform text_content based on text_type and dialogue_markers
function formatContent(text: string, textType: string, dialogueMarkers?: string[]) {
  // Split into paragraphs
  const paragraphs = text.split('\n\n')

  return paragraphs.map((para, i) => {
    // Check if this is dialogue (starts with a dialogue marker)
    const isDialogue = dialogueMarkers?.some(m => para.trimStart().startsWith(m))

    if (isDialogue) {
      return <Dialogue key={i}><p>{para}</p></Dialogue>
    }

    // Check if this is a heading (short line, often title case)
    if (para.length < 50 && !para.includes('.') && textType !== 'poetry') {
      return <h2 key={i}>{para}</h2>
    }

    return <p key={i}>{para}</p>
  })
}

// Example generated from production.json sections:
export function IntroContent() {
  // From production.json: sections[0].text_content
  return (
    <>
      {/* Exact text from sections[0].text_content */}
    </>
  )
}

export function MainStoryContent() {
  // From production.json: sections[1].text_content
  return (
    <>
      {/* Exact text from sections[1].text_content */}
    </>
  )
}

export function EpilogueContent() {
  // From production.json: sections[2].text_content
  return (
    <>
      {/* Exact text from sections[2].text_content */}
    </>
  )
}
```

**Mapping from production.json:**
```
production.json:                    →  content.tsx:
sections[0].id: "intro"             →  IntroContent()
sections[0].text_content: "..."     →  Component body
sections[0].text_type: "prose"      →  Formatting rules
sections[0].dialogue_markers: ["–"] →  Dialogue detection
```

### Step 5: Create app/page.tsx

```tsx
'use client'

import { StreamEngine } from '../../packages/engine/src'
import { streamConfig } from '../config'

export default function StreamPage() {
  return <StreamEngine config={streamConfig} />
}
```

### Step 6: Create app/layout.tsx

```tsx
import './globals.css'

export const metadata = {
  title: '{Stream Title} - DownStream',
  description: '{Brief description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="{language-code}">
      <body>{children}</body>
    </html>
  )
}
```

### Step 7: Create app/globals.css

Copy from existing stream or use:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: #0a0a0f;
  color: #c9b8a8;
  font-family: 'Georgia', serif;
  overflow-x: hidden;
  min-height: 100%;
  width: 100%;
  overscroll-behavior: none;  /* Prevents drag/rubber-band effect on mobile */
}

/* ... rest of styles from stream-az-ehseg/app/globals.css */
```

### Step 8: Create package.json

```json
{
  "name": "stream-{id}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "25.0.3",
    "@types/react": "19.2.7",
    "typescript": "5.9.3"
  }
}
```

### Step 9: Create tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [{"name": "next"}]
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 10: Create next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### Step 11: Install Dependencies

```bash
cd stream-{id}
npm install
```

### Step 12: Test

```bash
npm run dev
# Opens at http://localhost:3001
```

Verify:
- [ ] Stream loads without errors
- [ ] Animation plays on scroll
- [ ] Text displays correctly
- [ ] All segments have frames
- [ ] Text flows continuously (no large gaps)

---

## COMMON MISTAKES TO AVOID

### 1. Creating Too Many Sections
**Wrong:** 5 segments → 5 sections → gaps between text

**Right:** 5 segments → 3 sections (intro, main, epilogue) → continuous text

### 2. Modifying Text Content
**Wrong:** Adding new titles, reformatting, "improving" text

**Right:** Copy character-for-character from original source

### 3. Wrong Frame Count
**Wrong:** Using planned frame count from production.json

**Right:** Count actual extracted frames:
```bash
ls stream-{id}/public/frames/1/ | wc -l
```

### 4. Missing Dialogue Helper
If original has dialogue formatting, include the Dialogue component.

---

## COPYING FROM EXISTING STREAM

If recreating visuals for an existing stream, copy these files unchanged:
- `content.tsx` - NEVER modify
- Text sections from `config.tsx`

Only update:
- `segments` array with new frame counts
- Visual references in comments

---

## OUTPUT

After completion:

```
stream-{id}/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── public/
│   └── frames/
│       ├── 1/
│       │   ├── frame_0001.webp
│       │   └── ... (141 frames)
│       ├── 2/
│       └── ...
├── config.tsx
├── content.tsx
├── package.json
├── tsconfig.json
├── next.config.js
└── node_modules/
```

Run with:
```bash
cd stream-{id} && npm run dev
```
