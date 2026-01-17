#!/usr/bin/env python3
"""
Carousel Export Tool for DownStream Streams

Generates Instagram/Facebook-ready carousel images from streams.
Takes keyframes and overlays text content for swipeable social posts.

Usage:
    python generate_carousel.py --stream demo-the-loop
    python generate_carousel.py --stream demo-the-loop --format portrait --max-slides 10
    python generate_carousel.py --stream demo-the-loop --add-cta "Read full story"

Output:
    Creates carousel/ folder in stream directory with numbered images.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Optional
from textwrap import wrap

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("Error: Pillow not installed. Install with: pip install Pillow")
    sys.exit(1)

# Project paths
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent
STREAMS_DIR = PROJECT_ROOT / "pipeline" / "streams"

# Format presets
FORMATS = {
    "square": {
        "width": 1080,
        "height": 1080,
        "aspect": "1:1",
        "description": "Instagram feed square"
    },
    "portrait": {
        "width": 1080,
        "height": 1350,
        "aspect": "4:5",
        "description": "Instagram feed portrait (recommended)"
    },
    "story": {
        "width": 1080,
        "height": 1920,
        "aspect": "9:16",
        "description": "Instagram/Facebook Stories"
    }
}

# Font paths (macOS)
FONT_PATHS = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/SF-Pro-Display-Bold.otf",
    "/System/Library/Fonts/SFNSDisplay.ttf",
    "/Library/Fonts/Arial.ttf",
]


def find_font(size: int = 48, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Find an available system font."""
    for font_path in FONT_PATHS:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue
    # Fallback to default
    return ImageFont.load_default()


def sanitize_stream_id(stream_id: str) -> str:
    """Sanitize stream_id to prevent path traversal."""
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        raise ValueError(f"Invalid stream_id: {stream_id}")
    return stream_id


def load_stream_data(stream_id: str) -> tuple[dict, dict]:
    """Load production.json and input.json for a stream."""
    stream_id = sanitize_stream_id(stream_id)
    stream_dir = STREAMS_DIR / stream_id

    if not stream_dir.exists():
        raise FileNotFoundError(f"Stream not found: {stream_id}")

    production_path = stream_dir / "production.json"
    input_path = stream_dir / "input.json"

    production = {}
    input_data = {}

    if production_path.exists():
        with open(production_path) as f:
            production = json.load(f)

    if input_path.exists():
        with open(input_path) as f:
            input_data = json.load(f)

    return production, input_data


def find_keyframes(stream_id: str) -> list[Path]:
    """Find keyframe images for a stream."""
    stream_id = sanitize_stream_id(stream_id)
    stream_dir = STREAMS_DIR / stream_id
    keyframes_dir = stream_dir / "keyframes"

    if not keyframes_dir.exists():
        # Try frames folder (first frame of each segment)
        frames_dir = stream_dir / "frames"
        if frames_dir.exists():
            keyframes = []
            for segment_dir in sorted(frames_dir.iterdir()):
                if segment_dir.is_dir():
                    first_frame = segment_dir / "frame_0001.webp"
                    if first_frame.exists():
                        keyframes.append(first_frame)
            return keyframes
        return []

    # Get keyframes sorted by name
    keyframes = sorted(
        [f for f in keyframes_dir.iterdir() if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')],
        key=lambda x: x.name
    )
    return keyframes


def create_text_overlay(
    image: Image.Image,
    text: str,
    position: str = "bottom",
    font_size: int = 48,
    max_width_ratio: float = 0.85,
    padding: int = 60,
    text_color: str = "#ffffff",
    shadow_color: str = "#000000",
    gradient_overlay: bool = True
) -> Image.Image:
    """Add text overlay to an image with proper styling."""
    img = image.copy()
    width, height = img.size

    # Add gradient overlay for readability
    if gradient_overlay:
        gradient = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        gradient_draw = ImageDraw.Draw(gradient)

        if position == "bottom":
            # Bottom gradient (stronger at bottom)
            for y in range(height // 2, height):
                alpha = int(180 * ((y - height // 2) / (height // 2)))
                gradient_draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
        elif position == "top":
            # Top gradient
            for y in range(0, height // 2):
                alpha = int(180 * (1 - y / (height // 2)))
                gradient_draw.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
        elif position == "center":
            # Full vignette
            for y in range(height):
                dist_from_center = abs(y - height // 2) / (height // 2)
                alpha = int(100 + 80 * dist_from_center)
                gradient_draw.line([(0, y), (width, y)], fill=(0, 0, 0, min(alpha, 200)))

        img = Image.alpha_composite(img.convert('RGBA'), gradient)

    draw = ImageDraw.Draw(img)
    font = find_font(font_size)

    # Wrap text to fit width
    max_chars = int((width * max_width_ratio) / (font_size * 0.5))
    wrapped_lines = []
    for paragraph in text.split('\n'):
        wrapped_lines.extend(wrap(paragraph, width=max_chars) or [''])

    # Calculate text block dimensions
    line_height = font_size * 1.4
    total_text_height = len(wrapped_lines) * line_height

    # Position text
    if position == "bottom":
        y_start = height - padding - total_text_height
    elif position == "top":
        y_start = padding
    else:  # center
        y_start = (height - total_text_height) / 2

    # Draw text with shadow
    for i, line in enumerate(wrapped_lines):
        # Get text bounding box for centering
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) / 2
        y = y_start + i * line_height

        # Draw shadow (multiple passes for blur effect)
        shadow_offsets = [(2, 2), (3, 3), (1, 1)]
        for offset_x, offset_y in shadow_offsets:
            draw.text(
                (x + offset_x, y + offset_y),
                line,
                font=font,
                fill=shadow_color
            )

        # Draw main text
        draw.text((x, y), line, font=font, fill=text_color)

    return img


def create_cta_slide(
    width: int,
    height: int,
    cta_text: str,
    stream_title: str,
    background_color: str = "#0a0a0f",
    accent_color: str = "#f4e4c1"
) -> Image.Image:
    """Create a call-to-action slide."""
    img = Image.new('RGB', (width, height), background_color)
    draw = ImageDraw.Draw(img)

    # Title
    title_font = find_font(56)
    title_bbox = draw.textbbox((0, 0), stream_title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    draw.text(
        ((width - title_width) / 2, height * 0.35),
        stream_title,
        font=title_font,
        fill=accent_color
    )

    # CTA text
    cta_font = find_font(40)
    cta_bbox = draw.textbbox((0, 0), cta_text, font=cta_font)
    cta_width = cta_bbox[2] - cta_bbox[0]
    draw.text(
        ((width - cta_width) / 2, height * 0.55),
        cta_text,
        font=cta_font,
        fill="#ffffff"
    )

    # Swipe indicator
    indicator_font = find_font(28)
    indicator_text = "← Swipe to read"
    indicator_bbox = draw.textbbox((0, 0), indicator_text, font=indicator_font)
    indicator_width = indicator_bbox[2] - indicator_bbox[0]
    draw.text(
        ((width - indicator_width) / 2, height * 0.75),
        indicator_text,
        font=indicator_font,
        fill="#666666"
    )

    return img


def create_title_slide(
    width: int,
    height: int,
    title: str,
    subtitle: Optional[str] = None,
    keyframe: Optional[Image.Image] = None,
    background_color: str = "#0a0a0f",
    accent_color: str = "#f4e4c1"
) -> Image.Image:
    """Create a title/hook slide."""
    if keyframe:
        # Use keyframe as background
        img = keyframe.copy()
        img = img.resize((width, height), Image.Resampling.LANCZOS)

        # Add dark overlay
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 160))
        img = Image.alpha_composite(img.convert('RGBA'), overlay)
    else:
        img = Image.new('RGB', (width, height), background_color)

    draw = ImageDraw.Draw(img)

    # Title
    title_font = find_font(72)

    # Wrap title if too long
    max_chars = int(width * 0.8 / (72 * 0.5))
    title_lines = wrap(title, width=max_chars) or [title]

    line_height = 72 * 1.3
    total_height = len(title_lines) * line_height
    y_start = (height - total_height) / 2 - 40

    for i, line in enumerate(title_lines):
        bbox = draw.textbbox((0, 0), line, font=title_font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) / 2
        y = y_start + i * line_height

        # Shadow
        draw.text((x + 3, y + 3), line, font=title_font, fill="#000000")
        draw.text((x, y), line, font=title_font, fill=accent_color)

    # Subtitle
    if subtitle:
        sub_font = find_font(32)
        sub_bbox = draw.textbbox((0, 0), subtitle, font=sub_font)
        sub_width = sub_bbox[2] - sub_bbox[0]
        draw.text(
            ((width - sub_width) / 2, y_start + total_height + 30),
            subtitle,
            font=sub_font,
            fill="#aaaaaa"
        )

    return img


def generate_carousel(
    stream_id: str,
    format_name: str = "portrait",
    max_slides: int = 10,
    add_title_slide: bool = True,
    add_cta_slide: bool = True,
    cta_text: str = "Read the full story →",
    output_dir: Optional[str] = None,
    text_position: str = "bottom",
    use_excerpts: bool = True
) -> list[Path]:
    """
    Generate carousel images from a stream.

    Args:
        stream_id: The stream identifier
        format_name: Output format (square, portrait, story)
        max_slides: Maximum number of content slides (excluding title/CTA)
        add_title_slide: Add a title slide at the beginning
        add_cta_slide: Add a CTA slide at the end
        cta_text: Text for the CTA slide
        output_dir: Custom output directory (default: stream/carousel/)
        text_position: Where to place text (top, center, bottom)
        use_excerpts: Use short excerpts instead of full text

    Returns:
        List of paths to generated images
    """
    stream_id = sanitize_stream_id(stream_id)

    if format_name not in FORMATS:
        raise ValueError(f"Unknown format: {format_name}. Available: {list(FORMATS.keys())}")

    fmt = FORMATS[format_name]
    width, height = fmt["width"], fmt["height"]

    print(f"Generating {format_name} carousel for: {stream_id}")
    print(f"Dimensions: {width}x{height} ({fmt['aspect']})")

    # Load stream data
    production, input_data = load_stream_data(stream_id)
    keyframes = find_keyframes(stream_id)

    if not keyframes:
        print(f"Error: No keyframes found for {stream_id}")
        sys.exit(1)

    print(f"Found {len(keyframes)} keyframes")

    # Get stream metadata
    stream_title = production.get("stream", {}).get("title", input_data.get("title", stream_id))
    segments = production.get("segments", [])

    # Get visual direction colors
    visual_dir = production.get("visual_direction", {})
    color_palette = visual_dir.get("color_palette", {})
    bg_color = color_palette.get("void", color_palette.get("background", "#0a0a0f"))
    accent_color = color_palette.get("emergence", color_palette.get("primary", "#f4e4c1"))

    # Setup output directory
    if output_dir:
        out_path = Path(output_dir)
    else:
        out_path = STREAMS_DIR / stream_id / "carousel" / format_name

    out_path.mkdir(parents=True, exist_ok=True)

    # Clear existing files
    for f in out_path.glob("*.jpg"):
        f.unlink()

    generated_files = []
    slide_number = 1

    # Title slide
    if add_title_slide and keyframes:
        print("Creating title slide...")
        first_keyframe = Image.open(keyframes[0])
        title_img = create_title_slide(
            width, height,
            title=stream_title,
            subtitle="A DownStream Story",
            keyframe=first_keyframe,
            background_color=bg_color,
            accent_color=accent_color
        )

        output_path = out_path / f"{slide_number:02d}_title.jpg"
        title_img.convert('RGB').save(output_path, "JPEG", quality=95)
        generated_files.append(output_path)
        slide_number += 1

    # Content slides
    content_slides = min(len(keyframes), max_slides)

    for i in range(content_slides):
        print(f"Creating content slide {i + 1}/{content_slides}...")

        # Load and resize keyframe
        keyframe = Image.open(keyframes[i])

        # Crop/resize to target dimensions
        # Use center crop to maintain aspect ratio
        kf_width, kf_height = keyframe.size
        target_ratio = width / height
        kf_ratio = kf_width / kf_height

        if kf_ratio > target_ratio:
            # Keyframe is wider, crop sides
            new_width = int(kf_height * target_ratio)
            left = (kf_width - new_width) // 2
            keyframe = keyframe.crop((left, 0, left + new_width, kf_height))
        else:
            # Keyframe is taller, crop top/bottom
            new_height = int(kf_width / target_ratio)
            top = (kf_height - new_height) // 2
            keyframe = keyframe.crop((0, top, kf_width, top + new_height))

        keyframe = keyframe.resize((width, height), Image.Resampling.LANCZOS)

        # Get text for this segment
        text = ""
        if i < len(segments):
            segment = segments[i]
            if use_excerpts:
                text = segment.get("text_excerpt", segment.get("name", ""))
            else:
                text = segment.get("text_content", segment.get("text_excerpt", ""))

        # Add text overlay
        if text:
            slide_img = create_text_overlay(
                keyframe,
                text,
                position=text_position,
                font_size=42 if len(text) > 100 else 48,
                gradient_overlay=True
            )
        else:
            slide_img = keyframe

        output_path = out_path / f"{slide_number:02d}_scene_{i + 1:02d}.jpg"
        slide_img.convert('RGB').save(output_path, "JPEG", quality=95)
        generated_files.append(output_path)
        slide_number += 1

    # CTA slide
    if add_cta_slide:
        print("Creating CTA slide...")
        cta_img = create_cta_slide(
            width, height,
            cta_text=cta_text,
            stream_title=stream_title,
            background_color=bg_color,
            accent_color=accent_color
        )

        output_path = out_path / f"{slide_number:02d}_cta.jpg"
        cta_img.convert('RGB').save(output_path, "JPEG", quality=95)
        generated_files.append(output_path)

    print(f"\n{'='*50}")
    print(f"Carousel generated: {len(generated_files)} slides")
    print(f"Output: {out_path}")
    print(f"Format: {format_name} ({fmt['description']})")
    print(f"{'='*50}")

    for f in generated_files:
        print(f"  {f.name}")

    return generated_files


def main():
    parser = argparse.ArgumentParser(
        description="Generate Instagram/Facebook carousel from DownStream stream",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("--stream", "-s", required=True,
                        help="Stream ID (e.g., demo-the-loop)")
    parser.add_argument("--format", "-f", default="portrait",
                        choices=list(FORMATS.keys()),
                        help="Output format (default: portrait)")
    parser.add_argument("--max-slides", "-m", type=int, default=10,
                        help="Maximum content slides (default: 10, Instagram max: 20)")
    parser.add_argument("--no-title", action="store_true",
                        help="Skip title slide")
    parser.add_argument("--no-cta", action="store_true",
                        help="Skip CTA slide")
    parser.add_argument("--cta", type=str, default="Read the full story →",
                        help="CTA text (default: 'Read the full story →')")
    parser.add_argument("--output", "-o", type=str,
                        help="Custom output directory")
    parser.add_argument("--text-position", "-p",
                        choices=["top", "center", "bottom"],
                        default="bottom",
                        help="Text overlay position (default: bottom)")
    parser.add_argument("--full-text", action="store_true",
                        help="Use full text instead of excerpts")
    parser.add_argument("--list-formats", action="store_true",
                        help="List available formats and exit")

    args = parser.parse_args()

    if args.list_formats:
        print("Available formats:")
        for name, config in FORMATS.items():
            print(f"  {name}: {config['width']}x{config['height']} ({config['description']})")
        return

    try:
        generate_carousel(
            stream_id=args.stream,
            format_name=args.format,
            max_slides=args.max_slides,
            add_title_slide=not args.no_title,
            add_cta_slide=not args.no_cta,
            cta_text=args.cta,
            output_dir=args.output,
            text_position=args.text_position,
            use_excerpts=not args.full_text
        )
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
