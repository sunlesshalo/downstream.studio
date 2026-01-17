#!/usr/bin/env python3
"""
Generate Next.js stream app from production.json.
Creates config.tsx, content.tsx, and all boilerplate files.

Usage:
    python execution/generate_app.py --stream-id az-ehseg-v2
    python execution/generate_app.py --stream-id az-ehseg-v2 --skip-install
"""

import os
import sys
import json
import argparse
import subprocess
import shutil
import re
from pathlib import Path
from textwrap import dedent

# Project root
project_root = Path(__file__).parent.parent.parent  # pipeline/execution -> pipeline -> project root


def sanitize_stream_id(stream_id: str) -> str:
    """Sanitize stream_id to prevent path traversal attacks.

    Raises ValueError if stream_id contains invalid characters.
    """
    # Only allow alphanumeric, hyphens, underscores
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        raise ValueError(f"Invalid stream_id: {stream_id}. Only alphanumeric, hyphens, and underscores allowed.")

    # Reject if it looks like a path component
    if stream_id in ('.', '..') or '/' in stream_id or '\\' in stream_id:
        raise ValueError(f"Invalid stream_id: {stream_id}")

    return stream_id


def load_production_spec(stream_id: str) -> dict:
    """Load production.json for a stream."""
    stream_id = sanitize_stream_id(stream_id)
    spec_path = project_root / f"pipeline/streams/{stream_id}/production.json"
    if not spec_path.exists():
        print(f"Error: production.json not found at {spec_path}")
        sys.exit(1)

    with open(spec_path) as f:
        return json.load(f)


def count_frames(stream_id: str, tier: str = "high") -> dict:
    """Count actual frames in each segment folder.

    Args:
        stream_id: The stream identifier.
        tier: Quality tier - "high" (default) or "perf".
    """
    stream_id = sanitize_stream_id(stream_id)
    # High tier uses frames/, perf uses frames-perf/
    frames_folder = "frames" if tier == "high" else "frames-perf"
    frames_base = project_root / f"pipeline/streams/{stream_id}/public/{frames_folder}"
    frame_counts = {}

    if not frames_base.exists():
        print(f"Warning: Frames directory not found: {frames_base}")
        return frame_counts

    for segment_dir in sorted(frames_base.iterdir()):
        if segment_dir.is_dir():
            try:
                segment_id = int(segment_dir.name)
                # Count both .jpg and .webp frames
                frames_jpg = list(segment_dir.glob("frame_*.jpg"))
                frames_webp = list(segment_dir.glob("frame_*.webp"))
                frame_counts[segment_id] = len(frames_jpg) + len(frames_webp)
            except ValueError:
                continue

    return frame_counts


def to_pascal_case(s: str) -> str:
    """Convert string to PascalCase for component names."""
    # Remove special characters, split on spaces/hyphens/underscores
    words = re.split(r'[-_\s]+', s)
    return ''.join(word.capitalize() for word in words if word)


def escape_jsx_text(text: str) -> str:
    """Escape text for JSX (handle special characters).

    Escapes HTML entities and JSX-specific characters to prevent
    content injection and ensure proper rendering.
    """
    # Order matters: escape & first to avoid double-escaping
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    # Replace curly braces which are special in JSX
    text = text.replace('{', '&#123;')
    text = text.replace('}', '&#125;')
    return text


def generate_content_component(section: dict, index: int, stream_id: str = "unknown") -> str:
    """Generate a content component for a section."""
    section_id = section.get("id", f"section{index}")
    component_name = to_pascal_case(section_id) + "Content"
    text_type = section.get("text_type", "prose")

    # Handle form sections
    if text_type == "form":
        form_config = section.get("form", {})
        form_config_json = json.dumps(form_config)
        return f'''export function {component_name}() {{
  return (
    <ContactForm
      config={{{form_config_json}}}
      streamId="{stream_id}"
    />
  )
}}'''

    # Handle prose/text sections
    text_content = section.get("text_content", "")
    dialogue_markers = section.get("dialogue_markers", [])

    # Split into paragraphs
    paragraphs = text_content.split("\n\n")

    # Generate JSX for each paragraph
    jsx_parts = []
    for i, para in enumerate(paragraphs):
        para = para.strip()
        if not para:
            continue

        # Check if it's dialogue
        is_dialogue = any(para.startswith(m) for m in dialogue_markers)

        # Check if it's a heading (short, no period, not poetry)
        is_heading = (
            len(para) < 50 and
            "." not in para and
            text_type != "poetry" and
            not is_dialogue
        )

        escaped_para = escape_jsx_text(para)

        if is_dialogue:
            jsx_parts.append(f'      <Dialogue><p>{escaped_para}</p></Dialogue>')
        elif is_heading:
            jsx_parts.append(f'      <h2>{escaped_para}</h2>')
        else:
            jsx_parts.append(f'      <p>{escaped_para}</p>')

    jsx_content = "\n".join(jsx_parts)

    return f'''export function {component_name}() {{
  return (
    <>
{jsx_content}
    </>
  )
}}'''


def generate_content_tsx(spec: dict) -> str:
    """Generate content.tsx from production.json sections."""
    sections = spec.get("sections", [])
    stream = spec.get("stream", {})
    stream_title = stream.get("title", "Stream")
    stream_id = stream.get("id", "unknown")

    # Check if any section uses a form
    has_form = any(s.get("text_type") == "form" for s in sections)

    # Generate component for each section
    components = []
    for i, section in enumerate(sections):
        components.append(generate_content_component(section, i, stream_id))

    components_code = "\n\n".join(components)

    # Add ContactForm import if needed
    form_import = "import { ContactForm } from './engine/components/ContactForm'\n" if has_form else ""

    return f'''/**
 * Content components for {stream_title}
 * AUTO-GENERATED from production.json - DO NOT EDIT MANUALLY
 */

{form_import}function Dialogue({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <div style={{{{
      fontStyle: 'italic',
      marginLeft: '0.5rem',
      borderLeft: '2px solid var(--ds-color-muted)',
      paddingLeft: '1rem',
      margin: '1.5rem 0 1.5rem 0.5rem'
    }}}}>
      {{children}}
    </div>
  )
}}

{components_code}
'''


def generate_config_tsx(spec: dict, frame_counts: dict) -> str:
    """Generate config.tsx from production.json."""
    stream = spec.get("stream", {})
    sections = spec.get("sections", [])
    segments = spec.get("segments", [])
    visual_direction = spec.get("visual_direction", {})
    color_palette = visual_direction.get("color_palette", {})

    stream_id = stream.get("id", "unknown")
    stream_title = stream.get("title", "Unknown Stream")

    # Generate segments array
    segments_code = []
    for seg in segments:
        seg_id = seg["id"]
        frame_count = frame_counts.get(seg_id, 141)  # Default if not found
        segments_code.append(f"    {{ id: {seg_id}, frameCount: {frame_count} }},")

    segments_str = "\n".join(segments_code)

    # Generate sections array with content components
    sections_code = []
    content_imports = []

    for section in sections:
        section_id = section.get("id", "unknown")
        segment_ids = section.get("segment_ids", [])
        layout = section.get("layout", "side-by-side")

        component_name = to_pascal_case(section_id) + "Content"
        content_imports.append(component_name)

        segments_str_inner = ", ".join(str(s) for s in segment_ids)

        sections_code.append(f'''    {{
      id: '{section_id}',
      segments: [{segments_str_inner}],
      layout: '{layout}',
      content: {{
        custom: <{component_name} />
      }}
    }},''')

    sections_str = "\n".join(sections_code)
    imports_str = ", ".join(content_imports)

    # Theme colors
    bg_color = color_palette.get("background", "#0a0a0f")
    text_color = color_palette.get("secondary", "#c9b8a8")
    accent_color = color_palette.get("primary", "#d4a056")
    muted_color = color_palette.get("accent", "#6b4423")

    return f'''import type {{ StreamConfig }} from './engine/types'
import {{ {imports_str} }} from './content'

// Generated from: streams/{stream_id}/production.json

export const streamConfig: StreamConfig = {{
  id: '{stream_id}',
  title: '{stream_title}',
  type: 'story',

  segments: [
{segments_str}
  ],

  sections: [
{sections_str}
  ],

  theme: {{
    colors: {{
      background: '{bg_color}',
      text: '{text_color}',
      accent: '{accent_color}',
      muted: '{muted_color}'
    }},
    fonts: {{
      heading: 'Georgia, serif',
      body: 'Georgia, serif'
    }}
  }}
}}
'''


def generate_page_tsx() -> str:
    """Generate app/page.tsx."""
    return dedent('''
        'use client'

        import { StreamEngine } from '../engine/components/StreamEngine'
        import { streamConfig } from '../config'

        export default function StreamPage() {
          return <StreamEngine config={streamConfig} />
        }
    ''').strip() + '\n'


def generate_layout_tsx(spec: dict, stream_id: str) -> str:
    """Generate app/layout.tsx with analytics tracking and Telegram Mini App support."""
    stream = spec.get("stream", {})
    title = stream.get("title", "Stream")
    language = spec.get("input", {}).get("language", "en")

    # Analytics endpoint - configurable via environment
    analytics_endpoint = os.environ.get(
        "DS_ANALYTICS_ENDPOINT",
        "https://analytics.downstream.ink"
    )

    # Read and minify tracker script
    tracker_path = project_root / "infrastructure/analytics/tracker.js"
    if tracker_path.exists():
        with open(tracker_path) as f:
            tracker_code = f.read()
        # Replace placeholders
        tracker_code = tracker_code.replace("'__DS_ANALYTICS_ENDPOINT__'", f"'{analytics_endpoint}'")
        tracker_code = tracker_code.replace("'__DS_STREAM_ID__'", f"'{stream_id}'")
        # Basic minification (remove comments and extra whitespace)
        import re
        tracker_code = re.sub(r'/\*\*[\s\S]*?\*/', '', tracker_code)  # Remove block comments
        tracker_code = re.sub(r'//.*$', '', tracker_code, flags=re.MULTILINE)  # Remove line comments
        tracker_code = re.sub(r'\n\s*\n', '\n', tracker_code)  # Remove empty lines
        tracker_code = tracker_code.strip()
    else:
        print(f"\n⚠️  Warning: Analytics tracker not found at {tracker_path}")
        print(f"   Stream will be created WITHOUT tracking. Run 'git pull' to sync.\n")
        tracker_code = "// Analytics tracker not found"

    # Telegram Mini App initialization script
    telegram_init = """
(function() {
  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.initData) {
    console.log('[Telegram] Mini App detected');
    tg.ready();
    tg.expand();
    if (tg.themeParams) {
      var root = document.documentElement;
      Object.keys(tg.themeParams).forEach(function(key) {
        root.style.setProperty('--tg-theme-' + key.replace(/_/g, '-'), tg.themeParams[key]);
      });
    }
  }
})();
""".strip()

    return f'''import './globals.css'
import Script from 'next/script'

export const metadata = {{
  title: '{title} - DownStream',
  description: 'A DownStream visual story',
}}

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode
}}) {{
  return (
    <html lang="{language}">
      <head>
        {{/* Telegram Mini App SDK */}}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {{children}}
        {{/* Telegram initialization */}}
        <Script
          id="telegram-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{{{
            __html: `{telegram_init}`
          }}}}
        />
        {{/* Analytics */}}
        <Script
          id="ds-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{{{
            __html: `{tracker_code}`
          }}}}
        />
      </body>
    </html>
  )
}}
'''


def generate_globals_css(spec: dict) -> str:
    """Generate app/globals.css."""
    visual_direction = spec.get("visual_direction", {})
    color_palette = visual_direction.get("color_palette", {})

    bg_color = color_palette.get("background", "#0a0a0f")
    text_color = color_palette.get("secondary", "#c9b8a8")
    accent_color = color_palette.get("primary", "#d4a056")
    muted_color = color_palette.get("accent", "#6b4423")

    return f'''* {{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}}

:root {{
  --ds-color-background: {bg_color};
  --ds-color-text: {text_color};
  --ds-color-accent: {accent_color};
  --ds-color-muted: {muted_color};
}}

html, body {{
  background: var(--ds-color-background);
  color: var(--ds-color-text);
  font-family: 'Georgia', serif;
  overflow-x: hidden;
  overscroll-behavior: none;
  min-height: 100%;
  width: 100%;
}}

h1, h2, h3, h4, h5, h6 {{
  color: var(--ds-color-accent);
  margin-bottom: 1rem;
}}

p {{
  margin-bottom: 1.5rem;
  line-height: 1.8;
}}

/* Prevent FOUC on load */
html {{
  visibility: visible;
  opacity: 1;
}}
'''


def generate_package_json(stream_id: str, has_form: bool = False) -> str:
    """Generate package.json."""
    deps = {
        "next": "^15.0.0",
        "react": "^19.0.0",
        "react-dom": "^19.0.0"
    }

    # Add form-related dependencies
    if has_form:
        deps["@supabase/supabase-js"] = "^2.39.0"
        deps["resend"] = "^2.1.0"

    return json.dumps({
        "name": f"stream-{stream_id}",
        "version": "1.0.0",
        "private": True,
        "scripts": {
            "dev": "next dev --port 3001",
            "build": "next build",
            "start": "next start --port 3001"
        },
        "dependencies": deps,
        "devDependencies": {
            "@types/node": "^22.0.0",
            "@types/react": "^19.0.0",
            "typescript": "^5.0.0"
        }
    }, indent=2)


def generate_tsconfig() -> str:
    """Generate tsconfig.json."""
    return json.dumps({
        "compilerOptions": {
            "target": "ES2017",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": False,
            "noEmit": True,
            "incremental": True,
            "module": "esnext",
            "esModuleInterop": True,
            "moduleResolution": "node",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "plugins": [{"name": "next"}]
        },
        "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
        "exclude": ["node_modules"]
    }, indent=2)


def generate_next_config() -> str:
    """Generate next.config.js."""
    return '''/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
'''


def generate_contact_api_route() -> str:
    """Generate app/api/contact/route.ts for form submissions."""
    return '''import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize clients (only if env vars are set)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'hello@downstream.ink'
const FROM_EMAIL = process.env.FROM_EMAIL || 'DownStream <hello@downstream.ink>'
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, story, streamId, timestamp } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Store in Supabase if configured
    if (supabase) {
      const { error: dbError } = await supabase
        .from('stream_leads')
        .insert({
          name,
          email,
          story: story || null,
          stream_id: streamId,
          created_at: timestamp || new Date().toISOString(),
          source: 'stream_contact_form'
        })

      if (dbError) {
        console.error('Supabase error:', dbError)
        // Don't fail the request, just log the error
      }
    }

    // Send email notification if configured
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFY_EMAIL,
          subject: `New Stream Interest: ${name}`,
          html: `
            <h2>New Lead from ${streamId}</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${story ? `<p><strong>Their story:</strong></p><p>${story}</p>` : ''}
            <p><small>Submitted at ${timestamp || new Date().toISOString()}</small></p>
          `
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the request, just log the error
      }
    }

    // Send Discord notification (primary notification method)
    if (DISCORD_WEBHOOK_URL) {
      try {
        const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: 'New Stream Lead',
              color: 5763719, // green
              fields: [
                { name: 'Name', value: name, inline: true },
                { name: 'Email', value: email, inline: true },
                { name: 'Stream', value: streamId || 'unknown', inline: true },
                ...(story ? [{ name: 'Their Story', value: story.substring(0, 500) + (story.length > 500 ? '...' : ''), inline: false }] : [])
              ],
              timestamp: new Date().toISOString()
            }]
          })
        })

        if (!discordResponse.ok) {
          console.error('Discord API error:', discordResponse.status)
        }
      } catch (discordErr) {
        console.error('Discord notification error:', discordErr)
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not configured')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
'''


def copy_frames(stream_id: str, app_dir: Path, tier: str = "high") -> int:
    """Copy frames from streams/{id} to stream-{id}/public/frames.

    Args:
        stream_id: The stream identifier.
        app_dir: The target app directory.
        tier: Quality tier - "high" or "perf". Determines source folder.
    """
    stream_id = sanitize_stream_id(stream_id)
    # Source folder based on tier
    source_folder = "frames" if tier == "high" else "frames-perf"
    source = project_root / f"pipeline/streams/{stream_id}/public/{source_folder}"
    # Destination is always "frames" in the app (the app doesn't know about tiers)
    dest = app_dir / "public/frames"

    if not source.exists():
        print(f"Warning: Source frames not found: {source}")
        return 0

    if dest.exists():
        shutil.rmtree(dest)

    shutil.copytree(source, dest)

    # Count total frames
    total = sum(len(list(d.glob("frame_*.webp"))) for d in dest.iterdir() if d.is_dir())
    return total


def generate_app_for_tier(
    stream_id: str,
    spec: dict,
    tier: str,
    skip_install: bool = False,
    skip_frames: bool = False
) -> Path:
    """Generate a Next.js app for a specific quality tier.

    Args:
        stream_id: The stream identifier.
        spec: The production specification.
        tier: Quality tier - "high" or "perf".
        skip_install: Skip npm install.
        skip_frames: Skip copying frames.

    Returns:
        Path to the generated app directory.
    """
    # Determine app directory name based on tier
    suffix = "" if tier == "high" else "-perf"
    app_name = f"stream-{stream_id}{suffix}"
    app_dir = project_root / app_name

    print(f"\n{'='*60}")
    print(f"Generating {tier.upper()} quality app: {app_name}")
    print(f"{'='*60}")

    # Check if stream has a contact form
    sections = spec.get("sections", [])
    has_form = any(s.get("text_type") == "form" for s in sections)

    # Count frames for this tier
    frame_counts = count_frames(stream_id, tier)
    print(f"Frame counts ({tier}): {frame_counts}")

    # Create app directory
    app_dir.mkdir(exist_ok=True)
    (app_dir / "app").mkdir(exist_ok=True)
    (app_dir / "public").mkdir(exist_ok=True)

    # Generate files
    files = {
        "config.tsx": generate_config_tsx(spec, frame_counts),
        "content.tsx": generate_content_tsx(spec),
        "app/page.tsx": generate_page_tsx(),
        "app/layout.tsx": generate_layout_tsx(spec, stream_id),
        "app/globals.css": generate_globals_css(spec),
        "package.json": generate_package_json(stream_id + suffix, has_form),
        "tsconfig.json": generate_tsconfig(),
        "next.config.js": generate_next_config(),
    }

    # Add API route if form is present
    if has_form:
        files["app/api/contact/route.ts"] = generate_contact_api_route()

    for filename, content in files.items():
        filepath = app_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, "w") as f:
            f.write(content)
        print(f"  Created: {filename}")

    # Copy engine from template
    engine_src = project_root / "pipeline/templates/stream-app/engine"
    engine_dest = app_dir / "engine"
    if engine_src.exists():
        if engine_dest.exists():
            shutil.rmtree(engine_dest)
        shutil.copytree(engine_src, engine_dest)
        print(f"  Copied: engine/")
    else:
        print(f"  Warning: Engine template not found at {engine_src}")

    # Copy frames for this tier
    if not skip_frames:
        print(f"\nCopying {tier} tier frames...")
        total_frames = copy_frames(stream_id, app_dir, tier)
        print(f"  Copied {total_frames} frames")
    else:
        print("\nSkipping frame copy (--skip-frames)")

    # Install dependencies
    if not skip_install:
        print("\nInstalling dependencies...")
        result = subprocess.run(
            ["npm", "install"],
            cwd=app_dir,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("  Dependencies installed")
        else:
            print(f"  npm install failed: {result.stderr}")
    else:
        print("\nSkipping npm install (--skip-install)")

    return app_dir


def generate_app(
    stream_id: str,
    skip_install: bool = False,
    skip_frames: bool = False,
    tier: str = "both"
):
    """Generate Next.js app(s) for a stream.

    Args:
        stream_id: The stream identifier.
        skip_install: Skip npm install.
        skip_frames: Skip copying frames.
        tier: Quality tier(s) to generate - "high", "perf", or "both" (default).
    """
    stream_id = sanitize_stream_id(stream_id)
    print(f"Generating app for stream: {stream_id}")
    print(f"Tier: {tier}")

    # Load production spec
    spec = load_production_spec(stream_id)
    stream_title = spec.get("stream", {}).get("title", stream_id)
    print(f"Title: {stream_title}")

    # Check if stream has a contact form
    sections = spec.get("sections", [])
    has_form = any(s.get("text_type") == "form" for s in sections)
    if has_form:
        print("Form section detected - will include API route")

    # Generate app(s) based on tier
    generated_apps = []

    if tier in ("high", "both"):
        app_dir = generate_app_for_tier(stream_id, spec, "high", skip_install, skip_frames)
        generated_apps.append(("high", app_dir))

    if tier in ("perf", "both"):
        app_dir = generate_app_for_tier(stream_id, spec, "perf", skip_install, skip_frames)
        generated_apps.append(("perf", app_dir))

    # Summary
    print("\n" + "="*60)
    print("APP GENERATION COMPLETE")
    print("="*60)

    for tier_name, app_dir in generated_apps:
        print(f"\n{tier_name.upper()} quality app: {app_dir}")
        print(f"  cd {app_dir.name} && npm run dev")
        print(f"  cd {app_dir.name} && vercel")

    if len(generated_apps) == 2:
        print("\nDual-tier deployment:")
        print(f"  High quality:  stream-{stream_id}.vercel.app")
        print(f"  Performance:   stream-{stream_id}-perf.vercel.app")


def main():
    parser = argparse.ArgumentParser(
        description="Generate Next.js app from production.json"
    )
    parser.add_argument(
        "--stream-id", "-s",
        type=str,
        required=True,
        help="Stream ID (e.g., az-ehseg-v2)"
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip npm install"
    )
    parser.add_argument(
        "--skip-frames",
        action="store_true",
        help="Skip copying frames (useful for regenerating code only)"
    )
    parser.add_argument(
        "--tier", "-t",
        type=str,
        choices=["high", "perf", "both"],
        default="both",
        help="Quality tier to generate: high (140 frames), perf (40 frames), or both (default)"
    )

    args = parser.parse_args()
    generate_app(args.stream_id, args.skip_install, args.skip_frames, args.tier)


if __name__ == "__main__":
    main()
