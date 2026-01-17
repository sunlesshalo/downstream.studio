---
name: generate-carousel
description: Generate Instagram/Facebook carousel images from DownStream streams. Creates swipeable social posts with text overlays.
---

# Generate Carousel

## Overview

Converts a stream into Instagram/Facebook-ready carousel images. Each slide combines a keyframe with text overlay, creating a swipeable story experience on social media.

## Quick Start

```bash
# Using the downstream venv (has Pillow installed)
/Users/ferenczcsuszner/Coding/2026/downstream/.venv/bin/python \
  pipeline/execution/generate_carousel.py \
  --stream demo-the-loop

# Or activate venv first
source /Users/ferenczcsuszner/Coding/2026/downstream/.venv/bin/activate
python pipeline/execution/generate_carousel.py --stream demo-the-loop
```

## Output

Creates `carousel/{format}/` folder in the stream directory:
```
pipeline/streams/{stream-id}/carousel/
├── portrait/
│   ├── 01_title.jpg       # Hook slide with stream title
│   ├── 02_scene_01.jpg    # Content slides...
│   ├── 03_scene_02.jpg
│   ├── ...
│   └── XX_cta.jpg         # Call-to-action slide
└── square/
    └── ...
```

---

## Formats

| Format | Dimensions | Aspect | Best For |
|--------|------------|--------|----------|
| `portrait` | 1080×1350 | 4:5 | Instagram feed (recommended) |
| `square` | 1080×1080 | 1:1 | Instagram feed, Facebook |
| `story` | 1080×1920 | 9:16 | Instagram/Facebook Stories |

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--stream, -s` | Stream ID (required) | - |
| `--format, -f` | Output format | `portrait` |
| `--max-slides, -m` | Max content slides | 10 |
| `--no-title` | Skip title slide | false |
| `--no-cta` | Skip CTA slide | false |
| `--cta` | Custom CTA text | "Read the full story →" |
| `--text-position, -p` | Text position (top/center/bottom) | `bottom` |
| `--full-text` | Use full text instead of excerpts | false |
| `--output, -o` | Custom output directory | stream/carousel/ |

---

## Examples

### Basic Portrait Carousel
```bash
python generate_carousel.py --stream my-story
```

### All Formats
```bash
python generate_carousel.py --stream my-story --format portrait
python generate_carousel.py --stream my-story --format square
python generate_carousel.py --stream my-story --format story
```

### Custom CTA
```bash
python generate_carousel.py --stream my-story \
  --cta "Link in bio for full experience"
```

### Maximum Slides (Instagram allows 20)
```bash
python generate_carousel.py --stream my-story --max-slides 18
```
Note: 18 content slides + title + CTA = 20 total (Instagram max)

### Minimal (No Title/CTA)
```bash
python generate_carousel.py --stream my-story --no-title --no-cta --max-slides 10
```

---

## Slide Types

### 1. Title Slide
- Uses first keyframe as background (darkened)
- Stream title with accent color
- Subtitle: "A DownStream Story"
- Sets the hook for the carousel

### 2. Content Slides
- Keyframe as full background
- Gradient overlay for text readability
- Text excerpt from segment
- Proper text wrapping and shadows

### 3. CTA Slide
- Solid background (matches stream theme)
- Stream title + custom CTA text
- "← Swipe to read" indicator
- Drives action (link in bio, etc.)

---

## Text Handling

**Default (excerpts):** Uses `text_excerpt` from production.json — short, punchy lines.

**Full text:** Use `--full-text` to include complete segment text (may require smaller font).

**Position options:**
- `bottom` (default): Text at bottom with upward gradient
- `top`: Text at top with downward gradient
- `center`: Text centered with vignette

---

## Instagram Best Practices

1. **First slide is the hook** — make it visually striking
2. **10 slides is optimal** — enough story, not too long
3. **CTA on last slide** — "Link in bio" or website
4. **Portrait format (4:5)** — takes up more screen space than square
5. **Add caption with context** — what is this story about?
6. **Use relevant hashtags** — but not too many (5-10)

---

## Posting Workflow

1. Generate carousel: `python generate_carousel.py --stream my-story`
2. Transfer to phone (AirDrop, email, cloud)
3. Create new Instagram post → select multiple images
4. Select all carousel images in order
5. Write caption with stream URL or "Link in bio"
6. Post!

---

## Dependencies

- Python 3.x
- Pillow (`pip install Pillow`)

The downstream venv at `/Users/ferenczcsuszner/Coding/2026/downstream/.venv/` has Pillow installed.

---

## Related Skills

- `create-marketing-clip` — Video clips for Reels/TikTok
- `telegram-mini-app` — Full interactive experience in Telegram
