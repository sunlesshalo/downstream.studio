#!/usr/bin/env python3
"""
Extract frames from videos in dual quality tiers.

Creates both high-quality (140 frames) and performance (40 frames) versions
from the same source videos.

Usage:
    python extract_frames_dual.py --stream-id my-stream
    python extract_frames_dual.py --stream-id my-stream --tier high
    python extract_frames_dual.py --stream-id my-stream --tier performance
    python extract_frames_dual.py --stream-id my-stream --segment 1,3,5
"""

import os
import sys
import json
import re
import argparse
import subprocess
import shutil
from pathlib import Path
from typing import List, Dict, Optional

# Project root
project_root = Path(__file__).parent.parent.parent


def sanitize_stream_id(stream_id: str) -> str:
    """Sanitize stream_id to prevent path traversal attacks."""
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        raise ValueError(f"Invalid stream_id: {stream_id}")
    return stream_id


def get_video_duration(video_path: Path) -> float:
    """Get video duration in seconds using ffprobe."""
    cmd = [
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        str(video_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")
    return float(result.stdout.strip())


def extract_frames(
    video_path: Path,
    output_dir: Path,
    target_frames: int,
    quality: int = 80
) -> int:
    """Extract frames from video to target count."""

    # Get video duration
    duration = get_video_duration(video_path)

    # Calculate FPS to hit target frame count
    # frames = duration * fps, so fps = frames / duration
    fps = target_frames / duration

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Clear existing frames
    for old_frame in output_dir.glob("frame_*.webp"):
        old_frame.unlink()
    for old_frame in output_dir.glob("frame_*.jpg"):
        old_frame.unlink()

    # Extract frames
    cmd = [
        'ffmpeg', '-y', '-i', str(video_path),
        '-vf', f'fps={fps}',
        '-c:v', 'libwebp',
        '-quality', str(quality),
        str(output_dir / 'frame_%04d.webp')
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Warning: ffmpeg stderr: {result.stderr}", file=sys.stderr)

    # Count extracted frames
    frames = list(output_dir.glob("frame_*.webp"))
    return len(frames)


def extract_dual_tiers(
    stream_id: str,
    tiers: List[str] = None,
    segments: List[int] = None,
    frame_targets: Dict[str, int] = None
) -> Dict:
    """Extract frames for specified tiers and segments."""

    stream_id = sanitize_stream_id(stream_id)
    stream_path = project_root / f"pipeline/streams/{stream_id}"
    videos_dir = stream_path / "videos"

    if not videos_dir.exists():
        raise FileNotFoundError(f"Videos directory not found: {videos_dir}")

    # Default frame targets
    if frame_targets is None:
        frame_targets = {
            "high": 140,
            "performance": 40
        }

    # Default to both tiers
    if tiers is None:
        tiers = ["high", "performance"]

    # Find all video files
    video_files = sorted(videos_dir.glob("segment_*.mp4"))
    if not video_files:
        raise FileNotFoundError(f"No video files found in {videos_dir}")

    # Filter segments if specified
    if segments:
        video_files = [
            v for v in video_files
            if int(v.stem.replace("segment_", "")) in segments
        ]

    results = {
        "stream_id": stream_id,
        "tiers_extracted": [],
        "segments": {}
    }

    for tier in tiers:
        if tier not in frame_targets:
            print(f"Warning: Unknown tier '{tier}', skipping", file=sys.stderr)
            continue

        target_frames = frame_targets[tier]

        # Output directory for this tier
        if tier == "high":
            frames_base = stream_path / "public" / "frames"
        else:
            frames_base = stream_path / "public" / f"frames-{tier}"

        print(f"\n{'='*60}")
        print(f"Extracting {tier} quality ({target_frames} frames/segment)")
        print(f"Output: {frames_base}")
        print(f"{'='*60}\n")

        tier_results = []

        for video_path in video_files:
            segment_id = int(video_path.stem.replace("segment_", ""))
            output_dir = frames_base / str(segment_id)

            print(f"  Segment {segment_id}: ", end="", flush=True)

            try:
                frame_count = extract_frames(
                    video_path,
                    output_dir,
                    target_frames
                )
                print(f"{frame_count} frames")

                tier_results.append({
                    "segment_id": segment_id,
                    "frame_count": frame_count,
                    "output_dir": str(output_dir)
                })

                if segment_id not in results["segments"]:
                    results["segments"][segment_id] = {}
                results["segments"][segment_id][tier] = frame_count

            except Exception as e:
                print(f"ERROR: {e}")
                tier_results.append({
                    "segment_id": segment_id,
                    "error": str(e)
                })

        results["tiers_extracted"].append({
            "tier": tier,
            "target_frames": target_frames,
            "output_base": str(frames_base),
            "segments": tier_results
        })

    return results


def update_production_spec(stream_id: str, results: Dict):
    """Update production.json with actual frame counts."""

    stream_id = sanitize_stream_id(stream_id)
    spec_path = project_root / f"pipeline/streams/{stream_id}/production.json"

    if not spec_path.exists():
        print(f"Warning: production.json not found, skipping update")
        return

    with open(spec_path) as f:
        spec = json.load(f)

    # Update segment frame counts (use high quality as reference)
    for segment in spec.get("segments", []):
        seg_id = segment.get("id")
        if seg_id in results["segments"]:
            # Use high quality frame count if available
            if "high" in results["segments"][seg_id]:
                segment["frame_count"] = results["segments"][seg_id]["high"]
            elif "performance" in results["segments"][seg_id]:
                segment["frame_count"] = results["segments"][seg_id]["performance"]

    # Update production settings with actual frame counts
    if "production_settings" not in spec:
        spec["production_settings"] = {}

    spec["production_settings"]["extracted_frame_counts"] = results["segments"]
    spec["production_settings"]["quality_tiers_extracted"] = [
        t["tier"] for t in results["tiers_extracted"]
    ]

    with open(spec_path, 'w') as f:
        json.dump(spec, f, indent=2)

    print(f"\nUpdated production.json with frame counts")


def main():
    parser = argparse.ArgumentParser(description="Extract frames in dual quality tiers")
    parser.add_argument("--stream-id", required=True, help="Stream ID")
    parser.add_argument("--tier", help="Specific tier to extract (high, performance, or both)")
    parser.add_argument("--segment", help="Specific segments to extract (comma-separated)")
    parser.add_argument("--high-frames", type=int, default=140, help="Target frames for high quality")
    parser.add_argument("--perf-frames", type=int, default=40, help="Target frames for performance")
    parser.add_argument("--no-update-spec", action="store_true", help="Don't update production.json")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")

    args = parser.parse_args()

    # Parse tiers
    tiers = None
    if args.tier:
        if args.tier == "both":
            tiers = ["high", "performance"]
        else:
            tiers = [args.tier]

    # Parse segments
    segments = None
    if args.segment:
        segments = [int(s.strip()) for s in args.segment.split(",")]

    # Frame targets
    frame_targets = {
        "high": args.high_frames,
        "performance": args.perf_frames
    }

    try:
        results = extract_dual_tiers(
            args.stream_id,
            tiers=tiers,
            segments=segments,
            frame_targets=frame_targets
        )

        if not args.no_update_spec:
            update_production_spec(args.stream_id, results)

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"\n{'='*60}")
            print("Extraction Complete")
            print(f"{'='*60}")
            for tier_result in results["tiers_extracted"]:
                tier = tier_result["tier"]
                total = sum(s.get("frame_count", 0) for s in tier_result["segments"])
                print(f"  {tier}: {total} total frames")

        return 0

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
