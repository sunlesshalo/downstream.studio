#!/usr/bin/env python3
"""
Marketing Clip Generator for DownStream

Creates promotional video clips from stream animation frames.
Supports multiple formats, montages, and text overlays.

Usage:
    python generate_marketing_clip.py --stream <stream-id> [options]

Examples:
    # Single segment, portrait format (Reels/TikTok)
    python generate_marketing_clip.py --stream stream-xxx --segments 10 --format portrait

    # Montage of best segments
    python generate_marketing_clip.py --stream stream-xxx --segments 4,6,10 --format portrait

    # With text overlay
    python generate_marketing_clip.py --stream stream-xxx --segments 10 --title "Hollók röpte" --subtitle "Interactive story"

    # All formats at once
    python generate_marketing_clip.py --stream stream-xxx --segments 10 --format all
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional, Dict, Any

# Format presets
FORMATS = {
    'portrait': {  # Reels, TikTok, Stories
        'width': 1080,
        'height': 1920,
        'suffix': 'portrait'
    },
    'landscape': {  # YouTube, Twitter
        'width': 1920,
        'height': 1080,
        'suffix': 'landscape'
    },
    'square': {  # Instagram feed
        'width': 1080,
        'height': 1080,
        'suffix': 'square'
    }
}


def get_stream_path(stream_id: str) -> Path:
    """Get the path to a stream's directory."""
    base = Path(__file__).parent.parent / "streams"
    stream_path = base / stream_id
    if not stream_path.exists():
        raise FileNotFoundError(f"Stream not found: {stream_id}")
    return stream_path


def get_segment_frames(stream_path: Path, segment_num: int) -> Path:
    """Get the path to a segment's frames directory."""
    frames_path = stream_path / "public" / "frames" / str(segment_num)
    if not frames_path.exists():
        raise FileNotFoundError(f"Segment {segment_num} frames not found")
    return frames_path


def count_frames(frames_path: Path) -> int:
    """Count the number of frames in a directory."""
    return len(list(frames_path.glob("frame_*.webp")))


def load_production_json(stream_path: Path) -> Dict[str, Any]:
    """Load the production.json for segment metadata."""
    prod_path = stream_path / "production.json"
    if prod_path.exists():
        with open(prod_path) as f:
            return json.load(f)
    return {}


def get_segment_info(production: Dict, segment_num: int) -> Dict[str, Any]:
    """Get metadata for a specific segment."""
    for section in production.get('sections', []):
        for segment in section.get('segments', []):
            if segment.get('segmentNumber') == segment_num:
                return segment
    return {}


def create_segment_video(
    frames_path: Path,
    output_path: Path,
    format_config: Dict,
    fps: int = 24,
    speed: float = 1.0
) -> Path:
    """Convert segment frames to video with specified format."""

    frame_count = count_frames(frames_path)
    if frame_count == 0:
        raise ValueError(f"No frames found in {frames_path}")

    width = format_config['width']
    height = format_config['height']

    # Build ffmpeg filter for scaling and padding
    vf_filters = [
        f"scale={width}:{height}:force_original_aspect_ratio=decrease",
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:black"
    ]

    # Apply speed change if needed
    if speed != 1.0:
        vf_filters.append(f"setpts={1/speed}*PTS")

    vf = ",".join(vf_filters)

    cmd = [
        'ffmpeg', '-y',
        '-framerate', str(fps),
        '-i', str(frames_path / 'frame_%04d.webp'),
        '-vf', vf,
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        str(output_path)
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def create_montage(
    segment_videos: List[Path],
    output_path: Path,
    transition_frames: int = 12  # Half second at 24fps
) -> Path:
    """Concatenate multiple segment videos into a montage."""

    # Create a concat file
    concat_file = output_path.parent / "concat.txt"
    with open(concat_file, 'w') as f:
        for video in segment_videos:
            f.write(f"file '{video}'\n")

    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_file),
        '-c', 'copy',
        str(output_path)
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    concat_file.unlink()  # Clean up

    return output_path


def add_text_overlay(
    video_path: Path,
    output_path: Path,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    position: str = 'bottom'  # 'top', 'center', 'bottom'
) -> Path:
    """Add text overlay to video."""

    if not title and not subtitle:
        return video_path

    # Font settings
    font_path = "/System/Library/Fonts/Helvetica.ttc"  # macOS default

    filters = []

    # Position calculations
    if position == 'top':
        title_y = 100
        subtitle_y = 180
    elif position == 'center':
        title_y = "(h-text_h)/2-40"
        subtitle_y = "(h-text_h)/2+40"
    else:  # bottom
        title_y = "h-200"
        subtitle_y = "h-120"

    if title:
        filters.append(
            f"drawtext=text='{title}':fontfile={font_path}:fontsize=64:"
            f"fontcolor=white:x=(w-text_w)/2:y={title_y}:"
            f"shadowcolor=black:shadowx=2:shadowy=2"
        )

    if subtitle:
        filters.append(
            f"drawtext=text='{subtitle}':fontfile={font_path}:fontsize=36:"
            f"fontcolor=white:x=(w-text_w)/2:y={subtitle_y}:"
            f"shadowcolor=black:shadowx=1:shadowy=1"
        )

    if not filters:
        return video_path

    cmd = [
        'ffmpeg', '-y',
        '-i', str(video_path),
        '-vf', ','.join(filters),
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '18',
        '-c:a', 'copy',
        str(output_path)
    ]

    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def create_gif(
    video_path: Path,
    output_path: Path,
    max_width: int = 480,
    fps: int = 12,
    duration: float = 5.0
) -> Path:
    """Create a GIF preview from video."""

    # Two-pass GIF creation for better quality
    palette_path = output_path.parent / "palette.png"

    # Generate palette
    cmd1 = [
        'ffmpeg', '-y',
        '-i', str(video_path),
        '-t', str(duration),
        '-vf', f"fps={fps},scale={max_width}:-1:flags=lanczos,palettegen",
        str(palette_path)
    ]
    subprocess.run(cmd1, check=True, capture_output=True)

    # Create GIF using palette
    cmd2 = [
        'ffmpeg', '-y',
        '-i', str(video_path),
        '-i', str(palette_path),
        '-t', str(duration),
        '-filter_complex', f"fps={fps},scale={max_width}:-1:flags=lanczos[x];[x][1:v]paletteuse",
        str(output_path)
    ]
    subprocess.run(cmd2, check=True, capture_output=True)

    palette_path.unlink()  # Clean up
    return output_path


def generate_marketing_clip(
    stream_id: str,
    segments: List[int],
    format_name: str = 'portrait',
    output_dir: Optional[str] = None,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    fps: int = 24,
    speed: float = 1.0,
    create_gif_preview: bool = True
) -> Dict[str, Path]:
    """
    Main function to generate marketing clips.

    Returns dict with paths to generated files.
    """

    stream_path = get_stream_path(stream_id)
    production = load_production_json(stream_path)

    # Set up output directory
    if output_dir:
        out_path = Path(output_dir)
    else:
        out_path = Path("/tmp/marketing-clips")
    out_path.mkdir(parents=True, exist_ok=True)

    # Get format(s) to generate
    if format_name == 'all':
        formats_to_generate = list(FORMATS.keys())
    else:
        formats_to_generate = [format_name]

    results = {}

    for fmt in formats_to_generate:
        format_config = FORMATS[fmt]

        print(f"\nGenerating {fmt} format...")

        # Generate individual segment videos
        segment_videos = []
        for seg_num in segments:
            print(f"  Processing segment {seg_num}...")

            frames_path = get_segment_frames(stream_path, seg_num)
            seg_output = out_path / f"segment_{seg_num}_{format_config['suffix']}.mp4"

            create_segment_video(
                frames_path,
                seg_output,
                format_config,
                fps=fps,
                speed=speed
            )
            segment_videos.append(seg_output)

        # Create final output
        if len(segment_videos) == 1:
            final_video = segment_videos[0]
        else:
            # Montage
            montage_output = out_path / f"montage_{format_config['suffix']}.mp4"
            final_video = create_montage(segment_videos, montage_output)

        # Add text overlay if specified
        if title or subtitle:
            text_output = out_path / f"{stream_id}_{format_config['suffix']}_text.mp4"
            final_video = add_text_overlay(final_video, text_output, title, subtitle)

        # Rename to final name
        final_name = f"{stream_id}_{format_config['suffix']}.mp4"
        final_path = out_path / final_name
        if final_video != final_path:
            final_video.rename(final_path)

        results[f'{fmt}_video'] = final_path
        print(f"  Created: {final_path}")

        # Create GIF preview
        if create_gif_preview:
            gif_path = out_path / f"{stream_id}_{format_config['suffix']}.gif"
            create_gif(final_path, gif_path)
            results[f'{fmt}_gif'] = gif_path
            print(f"  Created: {gif_path}")

    # Clean up intermediate files
    for f in out_path.glob("segment_*.mp4"):
        f.unlink()
    for f in out_path.glob("montage_*.mp4"):
        if f not in results.values():
            f.unlink()

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Generate marketing clips from stream animations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )

    parser.add_argument('--stream', required=True, help='Stream ID')
    parser.add_argument('--segments', required=True,
                        help='Segment numbers (comma-separated, e.g., "4,6,10")')
    parser.add_argument('--format', default='portrait',
                        choices=['portrait', 'landscape', 'square', 'all'],
                        help='Output format (default: portrait)')
    parser.add_argument('--output', help='Output directory')
    parser.add_argument('--title', help='Title text overlay')
    parser.add_argument('--subtitle', help='Subtitle text overlay')
    parser.add_argument('--fps', type=int, default=24, help='Frames per second')
    parser.add_argument('--speed', type=float, default=1.0,
                        help='Playback speed multiplier (e.g., 0.5 for slow-mo)')
    parser.add_argument('--no-gif', action='store_true',
                        help='Skip GIF preview generation')

    args = parser.parse_args()

    # Parse segments
    segments = [int(s.strip()) for s in args.segments.split(',')]

    try:
        results = generate_marketing_clip(
            stream_id=args.stream,
            segments=segments,
            format_name=args.format,
            output_dir=args.output,
            title=args.title,
            subtitle=args.subtitle,
            fps=args.fps,
            speed=args.speed,
            create_gif_preview=not args.no_gif
        )

        print("\n" + "="*50)
        print("Generated files:")
        for key, path in results.items():
            size_mb = path.stat().st_size / (1024 * 1024)
            print(f"  {key}: {path} ({size_mb:.1f} MB)")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
