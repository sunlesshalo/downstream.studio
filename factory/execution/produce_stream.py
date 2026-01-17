#!/usr/bin/env python3
"""
Batch production script for DownStream.
Reads production.json and generates all keyframes, videos, and frames.

Usage:
    python execution/produce_stream.py --stream-id az-ehseg-v2
    python execution/produce_stream.py --stream-id az-ehseg-v2 --stage keyframes
    python execution/produce_stream.py --stream-id az-ehseg-v2 --stage videos
    python execution/produce_stream.py --stream-id az-ehseg-v2 --segments 1,2,3
"""

import sys
import json
import argparse
import time
import re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Project root
project_root = Path(__file__).parent.parent.parent  # pipeline/execution -> pipeline -> project root

# Import the generation functions
sys.path.insert(0, str(project_root / "execution"))
from generate_frame import generate_frame
from generate_video import generate_video, extract_frames


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
    spec_path = project_root / f"streams/{stream_id}/production.json"
    if not spec_path.exists():
        print(f"Error: production.json not found at {spec_path}")
        sys.exit(1)

    with open(spec_path) as f:
        return json.load(f)


def generate_keyframe(segment: dict, stream_id: str, dry_run: bool = False) -> dict:
    """Generate a single keyframe for a segment."""
    segment_id = segment["id"]
    output_path = project_root / f"streams/{stream_id}/keyframes/segment_{segment_id}.jpg"

    result = {
        "segment_id": segment_id,
        "title": segment.get("title", f"Segment {segment_id}"),
        "output_path": str(output_path),
        "success": False,
        "error": None,
    }

    if dry_run:
        print(f"  [DRY RUN] Would generate keyframe for segment {segment_id}")
        result["success"] = True
        return result

    # Check if keyframe already exists
    if output_path.exists():
        print(f"  Keyframe {segment_id} already exists, skipping...")
        result["success"] = True
        result["skipped"] = True
        return result

    print(f"\n  Generating keyframe for segment {segment_id}: {segment.get('title', '')}")

    try:
        image_path = generate_frame(
            prompt=segment["image_prompt"],
            output_path=str(output_path),
            negative_prompt=segment.get("negative_prompt"),
        )
        result["success"] = image_path is not None
        if not result["success"]:
            result["error"] = "Generation returned None"
    except Exception as e:
        result["error"] = str(e)

    return result


def generate_segment_video(
    segment: dict,
    stream_id: str,
    model: str = "minimax",
    dry_run: bool = False
) -> dict:
    """Generate video and extract frames for a segment."""
    segment_id = segment["id"]
    keyframe_path = project_root / f"streams/{stream_id}/keyframes/segment_{segment_id}.jpg"
    video_path = project_root / f"streams/{stream_id}/videos/segment_{segment_id}.mp4"
    frames_dir = project_root / f"streams/{stream_id}/public/frames/{segment_id}"

    result = {
        "segment_id": segment_id,
        "title": segment.get("title", f"Segment {segment_id}"),
        "video_path": str(video_path),
        "frames_dir": str(frames_dir),
        "success": False,
        "frame_count": 0,
        "error": None,
    }

    if dry_run:
        print(f"  [DRY RUN] Would generate video for segment {segment_id}")
        result["success"] = True
        return result

    # Check if keyframe exists
    if not keyframe_path.exists():
        result["error"] = f"Keyframe not found: {keyframe_path}"
        print(f"  Error: {result['error']}")
        return result

    # Check if frames already exist
    if frames_dir.exists():
        existing_frames = list(frames_dir.glob("frame_*.webp"))
        if len(existing_frames) > 100:
            print(f"  Frames for segment {segment_id} already exist ({len(existing_frames)} frames), skipping...")
            result["success"] = True
            result["skipped"] = True
            result["frame_count"] = len(existing_frames)
            return result

    print(f"\n  Generating video for segment {segment_id}: {segment.get('title', '')}")

    try:
        # Generate video
        video_result = generate_video(
            image_path=str(keyframe_path),
            prompt=segment["motion_prompt"],
            output_path=str(video_path),
            model=model,
        )

        if not video_result:
            result["error"] = "Video generation failed"
            return result

        # Extract frames
        print(f"  Extracting frames for segment {segment_id}...")
        frame_count = extract_frames(
            video_path=str(video_path),
            output_dir=str(frames_dir),
            format="webp",
        )

        result["success"] = frame_count > 0
        result["frame_count"] = frame_count

        if not result["success"]:
            result["error"] = "Frame extraction failed"

    except Exception as e:
        result["error"] = str(e)
        import traceback
        traceback.print_exc()

    return result


def produce_keyframes(
    spec: dict,
    stream_id: str,
    segments: list = None,
    parallel: bool = False,
    dry_run: bool = False,
) -> list:
    """Generate all keyframes for a stream."""
    print("\n" + "="*60)
    print("STAGE: KEYFRAME GENERATION")
    print("="*60)

    all_segments = spec["segments"]
    if segments:
        all_segments = [s for s in all_segments if s["id"] in segments]

    print(f"Generating {len(all_segments)} keyframes...")

    results = []

    if parallel and not dry_run:
        # Parallel execution (be careful with API rate limits)
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {
                executor.submit(generate_keyframe, seg, stream_id, dry_run): seg
                for seg in all_segments
            }
            for future in as_completed(futures):
                results.append(future.result())
                # Small delay to avoid rate limits
                time.sleep(2)
    else:
        # Sequential execution
        for segment in all_segments:
            result = generate_keyframe(segment, stream_id, dry_run)
            results.append(result)
            if not dry_run and result["success"] and not result.get("skipped"):
                time.sleep(2)  # Rate limit delay

    # Summary
    success_count = sum(1 for r in results if r["success"])
    print(f"\nKeyframes: {success_count}/{len(results)} successful")

    for r in results:
        status = "OK" if r["success"] else f"FAIL: {r['error']}"
        skipped = " (skipped)" if r.get("skipped") else ""
        print(f"  Segment {r['segment_id']}: {status}{skipped}")

    return results


def produce_videos(
    spec: dict,
    stream_id: str,
    segments: list = None,
    model: str = "minimax",
    dry_run: bool = False,
) -> list:
    """Generate all videos and extract frames for a stream."""
    print("\n" + "="*60)
    print("STAGE: VIDEO GENERATION & FRAME EXTRACTION")
    print("="*60)

    all_segments = spec["segments"]
    if segments:
        all_segments = [s for s in all_segments if s["id"] in segments]

    print(f"Generating {len(all_segments)} videos (sequential, ~3-5 min each)...")

    results = []

    for i, segment in enumerate(all_segments):
        print(f"\n[{i+1}/{len(all_segments)}]")
        result = generate_segment_video(segment, stream_id, model, dry_run)
        results.append(result)

    # Summary
    success_count = sum(1 for r in results if r["success"])
    total_frames = sum(r["frame_count"] for r in results)

    print(f"\nVideos: {success_count}/{len(results)} successful")
    print(f"Total frames: {total_frames}")

    for r in results:
        status = "OK" if r["success"] else f"FAIL: {r['error']}"
        skipped = " (skipped)" if r.get("skipped") else ""
        frames = f" ({r['frame_count']} frames)" if r["frame_count"] > 0 else ""
        print(f"  Segment {r['segment_id']}: {status}{skipped}{frames}")

    return results


def main():
    parser = argparse.ArgumentParser(
        description="Batch production for DownStream streams"
    )
    parser.add_argument(
        "--stream-id", "-s",
        type=str,
        required=True,
        help="Stream ID (e.g., az-ehseg-v2)"
    )
    parser.add_argument(
        "--stage",
        type=str,
        choices=["all", "keyframes", "videos"],
        default="all",
        help="Which stage to run (default: all)"
    )
    parser.add_argument(
        "--segments",
        type=str,
        help="Comma-separated list of segment IDs to process (e.g., 1,2,3)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="minimax",
        choices=["minimax", "kling", "kling-turbo"],
        help="Video model to use (default: minimax)"
    )
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Generate keyframes in parallel (use with caution)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without actually generating"
    )

    args = parser.parse_args()

    # Parse segments if provided
    segments = None
    if args.segments:
        segments = [int(s.strip()) for s in args.segments.split(",")]

    # Load production spec
    print(f"Loading production spec for: {args.stream_id}")
    spec = load_production_spec(args.stream_id)

    stream_info = spec.get("stream", {})
    print(f"Stream: {stream_info.get('title', 'Unknown')}")
    print(f"Segments: {len(spec['segments'])}")

    if args.dry_run:
        print("\n[DRY RUN MODE - No actual generation will occur]")

    # Run stages
    keyframe_results = []
    video_results = []

    if args.stage in ["all", "keyframes"]:
        keyframe_results = produce_keyframes(
            spec, args.stream_id, segments, args.parallel, args.dry_run
        )

    if args.stage in ["all", "videos"]:
        video_results = produce_videos(
            spec, args.stream_id, segments, args.model, args.dry_run
        )

    # Final summary
    print("\n" + "="*60)
    print("PRODUCTION COMPLETE")
    print("="*60)

    if keyframe_results:
        kf_success = sum(1 for r in keyframe_results if r["success"])
        print(f"Keyframes: {kf_success}/{len(keyframe_results)}")

    if video_results:
        vid_success = sum(1 for r in video_results if r["success"])
        total_frames = sum(r["frame_count"] for r in video_results)
        print(f"Videos: {vid_success}/{len(video_results)}")
        print(f"Frames: {total_frames}")

    # Check if all succeeded
    all_success = (
        all(r["success"] for r in keyframe_results) and
        all(r["success"] for r in video_results)
    )

    if all_success:
        print(f"\nAssets ready at: streams/{args.stream_id}/")
        print(f"Next step: python execution/generate_app.py --stream-id {args.stream_id}")
    else:
        print("\nSome stages failed. Check errors above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
