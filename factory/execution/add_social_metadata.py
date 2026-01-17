#!/usr/bin/env python3
"""
Add social media preview metadata to existing stream apps.

Creates og-image.jpg and updates layout.tsx with Open Graph + Twitter Card metadata.

Usage:
    python factory/execution/add_social_metadata.py                    # Update all
    python factory/execution/add_social_metadata.py --stream-id bolyai # Update one
    python factory/execution/add_social_metadata.py --dry-run          # Preview changes
"""

import os
import sys
import re
import json
import argparse
import subprocess
import shutil
from pathlib import Path

# Project root
project_root = Path(__file__).parent.parent.parent


def get_stream_apps() -> list[Path]:
    """Get all stream app directories."""
    apps_dir = project_root / "streams/apps"
    if not apps_dir.exists():
        return []

    apps = []
    for app_dir in sorted(apps_dir.iterdir()):
        if app_dir.is_dir() and (app_dir / "app/layout.tsx").exists():
            apps.append(app_dir)
    return apps


def generate_og_image(app_dir: Path) -> str | None:
    """Generate og-image.jpg from first frame."""
    # Find first frame
    frames_dir = app_dir / "public/frames/1"
    if not frames_dir.exists():
        # Check for frames directly in public (some apps have different structure)
        frames_dir = app_dir / "public/frames"
        if not frames_dir.exists():
            return None

    frames = sorted(frames_dir.glob("frame_*.webp")) or sorted(frames_dir.glob("frame_*.jpg"))
    if not frames:
        # Try segment subdirectories
        for seg_dir in sorted(frames_dir.iterdir()):
            if seg_dir.is_dir():
                frames = sorted(seg_dir.glob("frame_*.webp")) or sorted(seg_dir.glob("frame_*.jpg"))
                if frames:
                    break

    if not frames:
        return None

    source_frame = frames[0]
    og_image_path = app_dir / "public/og-image.jpg"

    try:
        # Resize to 1200x630 (optimal for social)
        result = subprocess.run([
            "ffmpeg", "-y",
            "-i", str(source_frame),
            "-vf", "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630",
            "-q:v", "2",
            str(og_image_path)
        ], capture_output=True, text=True)

        if result.returncode == 0:
            return "/og-image.jpg"
        else:
            # Fallback: just copy
            shutil.copy(source_frame, og_image_path)
            return "/og-image.jpg"
    except FileNotFoundError:
        # ffmpeg not available
        shutil.copy(source_frame, og_image_path)
        return "/og-image.jpg"
    except Exception as e:
        print(f"  Error generating og-image: {e}")
        return None


def get_stream_title(app_dir: Path) -> str:
    """Extract stream title from config or layout."""
    # Try config.tsx
    config_path = app_dir / "config.tsx"
    if config_path.exists():
        content = config_path.read_text()
        match = re.search(r"title:\s*['\"]([^'\"]+)['\"]", content)
        if match:
            return match.group(1)

    # Try stream.config.json
    config_json = app_dir / "stream.config.json"
    if config_json.exists():
        try:
            data = json.loads(config_json.read_text())
            if data.get("metadata", {}).get("title"):
                return data["metadata"]["title"]
        except:
            pass

    # Try existing layout.tsx
    layout_path = app_dir / "app/layout.tsx"
    if layout_path.exists():
        content = layout_path.read_text()
        match = re.search(r"title:\s*['\"]([^'\"]+)['\"]", content)
        if match:
            title = match.group(1)
            # Remove " - DownStream" suffix if present
            return re.sub(r'\s*-\s*DownStream$', '', title)

    return app_dir.name


def get_stream_description(app_dir: Path) -> str:
    """Extract or generate stream description."""
    # Try content.tsx for first paragraph
    content_path = app_dir / "content.tsx"
    if content_path.exists():
        content = content_path.read_text()
        # Find first paragraph content
        match = re.search(r'<p>([^<]+)</p>', content)
        if match:
            excerpt = match.group(1).strip()
            if len(excerpt) > 150:
                return excerpt[:147] + "..."
            return excerpt

    return "A scroll-driven visual story by DownStream"


def get_stream_language(app_dir: Path) -> str:
    """Detect stream language from layout."""
    layout_path = app_dir / "app/layout.tsx"
    if layout_path.exists():
        content = layout_path.read_text()
        match = re.search(r'<html\s+lang=["\']([^"\']+)["\']', content)
        if match:
            return match.group(1)
    return "en"


def update_layout(app_dir: Path, og_image_path: str | None, dry_run: bool = False) -> bool:
    """Update layout.tsx with social metadata."""
    layout_path = app_dir / "app/layout.tsx"
    if not layout_path.exists():
        return False

    title = get_stream_title(app_dir)
    description = get_stream_description(app_dir)
    language = get_stream_language(app_dir)

    # Escape for JS strings
    safe_title = title.replace("'", "\\'")
    safe_description = description.replace("'", "\\'").replace("\n", " ")[:200]

    # Build og:image section
    og_image_meta = ""
    if og_image_path:
        og_image_meta = f"""
    images: [
      {{
        url: '{og_image_path}',
        width: 1200,
        height: 630,
        alt: '{safe_title}',
      }},
    ],"""

    # Build Twitter images
    twitter_images = f"\n    images: ['{og_image_path}']," if og_image_path else ""

    # Read current layout to preserve scripts
    current_content = layout_path.read_text()

    # Extract body content (scripts, children, etc.)
    body_match = re.search(r'<body[^>]*>(.*?)</body>', current_content, re.DOTALL)
    body_content = body_match.group(1) if body_match else '{children}'

    # Check if there's a head section with scripts
    head_scripts = ""
    head_match = re.search(r'<head>(.*?)</head>', current_content, re.DOTALL)
    if head_match:
        head_scripts = head_match.group(1)

    # Generate new layout
    new_content = f'''import './globals.css'
import Script from 'next/script'
import type {{ Metadata }} from 'next'

// Determine base URL for metadata (og:image, etc.)
const getBaseUrl = () => {{
  if (process.env.VERCEL_URL) return `https://${{process.env.VERCEL_URL}}`
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  return 'https://downstream.ink'
}}

export const metadata: Metadata = {{
  metadataBase: new URL(getBaseUrl()),
  title: '{safe_title}',
  description: '{safe_description}',
  keywords: ['visual story', 'scroll-driven', 'animation', 'downstream'],
  openGraph: {{
    title: '{safe_title}',
    description: '{safe_description}',
    type: 'website',
    siteName: 'DownStream',{og_image_meta}
  }},
  twitter: {{
    card: 'summary_large_image',
    title: '{safe_title}',
    description: '{safe_description}',{twitter_images}
  }},
  robots: {{
    index: true,
    follow: true,
  }},
}}

export default function RootLayout({{
  children,
}}: {{
  children: React.ReactNode
}}) {{
  return (
    <html lang="{language}">
      <head>
{head_scripts}
      </head>
      <body>
{body_content}
      </body>
    </html>
  )
}}
'''

    if dry_run:
        print(f"\n  Would update layout.tsx with:")
        print(f"    title: {title}")
        print(f"    description: {description[:50]}...")
        print(f"    og:image: {og_image_path}")
        return True

    layout_path.write_text(new_content)
    return True


def process_stream(app_dir: Path, dry_run: bool = False) -> dict:
    """Process a single stream app."""
    result = {
        "name": app_dir.name,
        "og_image": False,
        "layout_updated": False,
        "error": None
    }

    print(f"\nProcessing: {app_dir.name}")

    # Check if og-image already exists
    og_image_exists = (app_dir / "public/og-image.jpg").exists()

    if not og_image_exists:
        print("  Generating og-image.jpg...")
        if not dry_run:
            og_image_path = generate_og_image(app_dir)
            result["og_image"] = og_image_path is not None
            if og_image_path:
                print(f"  Created: public/og-image.jpg")
        else:
            # Check if we can find source frames
            frames_dir = app_dir / "public/frames/1"
            if frames_dir.exists():
                print("  Would create og-image.jpg from frames")
                result["og_image"] = True
            else:
                print("  No frames found for og-image")
        og_image_path = "/og-image.jpg" if result["og_image"] or og_image_exists else None
    else:
        print("  og-image.jpg already exists")
        og_image_path = "/og-image.jpg"
        result["og_image"] = True

    # Update layout.tsx
    print("  Updating layout.tsx...")
    try:
        result["layout_updated"] = update_layout(app_dir, og_image_path, dry_run)
        if result["layout_updated"] and not dry_run:
            print("  Updated: app/layout.tsx")
    except Exception as e:
        result["error"] = str(e)
        print(f"  Error: {e}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="Add social media metadata to stream apps"
    )
    parser.add_argument(
        "--stream-id", "-s",
        type=str,
        help="Process only this stream ID"
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Preview changes without writing files"
    )

    args = parser.parse_args()

    if args.dry_run:
        print("DRY RUN - No files will be modified")

    # Get apps to process
    if args.stream_id:
        app_dir = project_root / f"streams/apps/{args.stream_id}"
        if not app_dir.exists():
            print(f"Error: Stream app not found: {args.stream_id}")
            sys.exit(1)
        apps = [app_dir]
    else:
        apps = get_stream_apps()

    print(f"Found {len(apps)} stream apps")

    # Process each app
    results = []
    for app_dir in apps:
        result = process_stream(app_dir, args.dry_run)
        results.append(result)

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)

    og_count = sum(1 for r in results if r["og_image"])
    layout_count = sum(1 for r in results if r["layout_updated"])
    error_count = sum(1 for r in results if r["error"])

    print(f"Total apps: {len(results)}")
    print(f"OG images: {og_count}")
    print(f"Layouts updated: {layout_count}")
    if error_count:
        print(f"Errors: {error_count}")
        for r in results:
            if r["error"]:
                print(f"  - {r['name']}: {r['error']}")

    if args.dry_run:
        print("\nRun without --dry-run to apply changes")


if __name__ == "__main__":
    main()
