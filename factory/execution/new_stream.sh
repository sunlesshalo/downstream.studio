#!/bin/bash
#
# new_stream.sh - Create folder structure for a new stream
#
# Usage: ./new_stream.sh <stream-name>
#
# Creates:
#   stream-<name>/
#     app/
#       page.tsx
#       layout.tsx
#       globals.css
#     public/
#       frames/
#     config.tsx
#     content.tsx
#     package.json
#     next.config.js
#     tsconfig.json
#

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <stream-name>"
    echo "Example: $0 my-client"
    exit 1
fi

NAME="$1"
DIR="stream-$NAME"

# Check if already exists
if [ -d "$DIR" ]; then
    echo "Error: Directory '$DIR' already exists"
    exit 1
fi

echo "Creating stream: $NAME"

# Create directory structure
mkdir -p "$DIR/app"
mkdir -p "$DIR/public/frames"

# package.json
cat > "$DIR/package.json" << 'EOF'
{
  "name": "stream-STREAM_NAME",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
EOF
sed -i '' "s/STREAM_NAME/$NAME/g" "$DIR/package.json"

# next.config.js
cat > "$DIR/next.config.js" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
EOF

# tsconfig.json
cat > "$DIR/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# app/globals.css
cat > "$DIR/app/globals.css" << 'EOF'
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}
EOF

# app/layout.tsx
cat > "$DIR/app/layout.tsx" << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STREAM_TITLE',
  description: 'A DownStream experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF
sed -i '' "s/STREAM_TITLE/$NAME/g" "$DIR/app/layout.tsx"

# app/page.tsx
cat > "$DIR/app/page.tsx" << 'EOF'
import { StreamEngine } from '../../packages/engine/src'
import { streamConfig } from '../config'

export default function Home() {
  return <StreamEngine config={streamConfig} />
}
EOF

# config.tsx (skeleton)
cat > "$DIR/config.tsx" << 'EOF'
import type { StreamConfig } from '../packages/engine/src'
import { Section1Content, Section2Content, Section3Content, Section4Content, Section5Content } from './content'

/**
 * Stream Configuration
 *
 * TODO: Update segments with actual frame counts after extraction
 * Run: ./execution/count_frames.sh stream-STREAM_NAME/public/frames
 */
export const streamConfig: StreamConfig = {
  id: 'STREAM_NAME',
  title: 'STREAM_TITLE',
  type: 'marketing',

  // TODO: Update frameCount values after extracting frames
  segments: [
    { id: 1, frameCount: 0 },
    { id: 2, frameCount: 0 },
    { id: 3, frameCount: 0 },
    { id: 4, frameCount: 0 },
    { id: 5, frameCount: 0 },
  ],

  sections: [
    {
      id: 'section-1',
      segments: [1],
      layout: 'side-by-side',
      content: { custom: <Section1Content /> }
    },
    {
      id: 'section-2',
      segments: [2],
      layout: 'side-by-side',
      content: { custom: <Section2Content /> }
    },
    {
      id: 'section-3',
      segments: [3],
      layout: 'side-by-side',
      content: { custom: <Section3Content /> }
    },
    {
      id: 'section-4',
      segments: [4],
      layout: 'side-by-side',
      content: { custom: <Section4Content /> }
    },
    {
      id: 'section-5',
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
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif'
    }
  }
}
EOF
sed -i '' "s/STREAM_NAME/$NAME/g" "$DIR/config.tsx"
sed -i '' "s/STREAM_TITLE/$NAME/g" "$DIR/config.tsx"

# content.tsx (skeleton)
cat > "$DIR/content.tsx" << 'EOF'
/**
 * Content components for stream sections
 *
 * TODO: Replace placeholder content with actual copy
 */

export function Section1Content() {
  return (
    <>
      <h1>Section 1 Headline</h1>
      <p>
        Replace this with your opening content. This is the hook that draws
        readers into your story.
      </p>
    </>
  )
}

export function Section2Content() {
  return (
    <>
      <h2>Section 2 Headline</h2>
      <p>
        Replace this with your second section content. Build on the opening
        and develop the narrative.
      </p>
    </>
  )
}

export function Section3Content() {
  return (
    <>
      <h2>Section 3 Headline</h2>
      <p>
        Replace this with your third section content. This is often where
        tension or the core message lives.
      </p>
    </>
  )
}

export function Section4Content() {
  return (
    <>
      <h2>Section 4 Headline</h2>
      <p>
        Replace this with your fourth section content. Begin resolving
        or demonstrating the solution.
      </p>
    </>
  )
}

export function Section5Content() {
  return (
    <>
      <h2>Section 5 Headline</h2>
      <p>
        Replace this with your closing content. Include your call-to-action
        or final message here.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a
          href="#"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--ds-color-accent)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 500
          }}
        >
          Call to Action
        </a>
      </div>
    </>
  )
}
EOF

echo ""
echo "Created stream structure at: $DIR/"
echo ""
echo "Next steps:"
echo "  1. Add MP4 videos to a temp folder"
echo "  2. Run: ./execution/batch_extract.sh <videos_folder> $DIR/public/frames"
echo "  3. Run: ./execution/count_frames.sh $DIR/public/frames"
echo "  4. Update config.tsx with frame counts"
echo "  5. Update content.tsx with actual copy"
echo "  6. cd $DIR && npm install && npm run dev"
echo ""
