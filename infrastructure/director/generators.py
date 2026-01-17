"""
Generation functions for keyframes, videos, and app finalization.
Called by the background task queue.
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Optional


# Get project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
PIPELINE_DIR = PROJECT_ROOT / "pipeline"
EXECUTION_DIR = PIPELINE_DIR / "execution"


def get_python():
    """Get the Python executable path."""
    # Use the venv python if running in venv
    venv_python = Path(__file__).parent / ".venv" / "bin" / "python"
    if venv_python.exists():
        return str(venv_python)
    return sys.executable


def generate_keyframe(
    stream_id: str,
    segment_num: int,
    prompt: str,
    negative_prompt: str = "",
    reference_image: Optional[str] = None
) -> str:
    """
    Generate a single keyframe for a segment.

    Returns the path to the generated keyframe.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    keyframes_dir = streams_dir / "keyframes"
    keyframes_dir.mkdir(parents=True, exist_ok=True)

    output_path = keyframes_dir / f"segment_{segment_num}_keyframe.png"

    cmd = [
        get_python(),
        str(EXECUTION_DIR / "generate_frame.py"),
        "--prompt", prompt,
        "--output", str(output_path),
    ]

    if negative_prompt:
        cmd.extend(["--negative", negative_prompt])

    if reference_image and Path(reference_image).exists():
        cmd.extend(["--reference", reference_image])

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(PROJECT_ROOT),
        env={**subprocess.os.environ, "PYTHONPATH": str(PROJECT_ROOT)}
    )

    if result.returncode != 0:
        raise Exception(f"Keyframe generation failed: {result.stderr}")

    return str(output_path)


def generate_all_keyframes(stream_id: str, mode: str = "all") -> dict:
    """
    Generate keyframes for all segments in a stream.

    Args:
        stream_id: Stream identifier
        mode: 'all' to regenerate all, 'missing' to only generate missing

    Returns dict with results per segment.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    production_path = streams_dir / "production.json"

    if not production_path.exists():
        raise Exception(f"No production.json found for stream {stream_id}")

    with open(production_path) as f:
        production = json.load(f)

    sections = production.get("sections", [])
    results = {}

    for section in sections:
        segment_num = section.get("segment", section.get("id", 0))
        prompt = section.get("keyframe_prompt", section.get("image_prompt", ""))

        if not prompt:
            results[segment_num] = {"status": "skipped", "reason": "No prompt"}
            continue

        keyframe_path = streams_dir / "keyframes" / f"segment_{segment_num}_keyframe.png"

        # Skip if exists and mode is 'missing'
        if mode == "missing" and keyframe_path.exists():
            results[segment_num] = {"status": "exists", "path": str(keyframe_path)}
            continue

        try:
            output = generate_keyframe(
                stream_id=stream_id,
                segment_num=segment_num,
                prompt=prompt,
                negative_prompt=section.get("negative_prompt", "")
            )
            results[segment_num] = {"status": "generated", "path": output}
        except Exception as e:
            results[segment_num] = {"status": "failed", "error": str(e)}

    return results


def generate_video(
    stream_id: str,
    segment_num: int,
    keyframe_path: str,
    motion_prompt: str = ""
) -> str:
    """
    Generate a video from a keyframe.

    Returns the path to the generated video.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    videos_dir = streams_dir / "videos"
    videos_dir.mkdir(parents=True, exist_ok=True)

    output_path = videos_dir / f"segment_{segment_num}.mp4"

    cmd = [
        get_python(),
        str(EXECUTION_DIR / "generate_video.py"),
        "--input", keyframe_path,
        "--output", str(output_path),
    ]

    if motion_prompt:
        cmd.extend(["--prompt", motion_prompt])

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(PROJECT_ROOT),
        env={**subprocess.os.environ, "PYTHONPATH": str(PROJECT_ROOT)}
    )

    if result.returncode != 0:
        raise Exception(f"Video generation failed: {result.stderr}")

    return str(output_path)


def generate_all_videos(stream_id: str, mode: str = "all") -> dict:
    """
    Generate videos for all segments that have keyframes.

    Args:
        stream_id: Stream identifier
        mode: 'all' to regenerate all, 'missing' to only generate missing

    Returns dict with results per segment.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    production_path = streams_dir / "production.json"
    keyframes_dir = streams_dir / "keyframes"

    if not production_path.exists():
        raise Exception(f"No production.json found for stream {stream_id}")

    with open(production_path) as f:
        production = json.load(f)

    sections = production.get("sections", [])
    results = {}

    for section in sections:
        segment_num = section.get("segment", section.get("id", 0))
        keyframe_path = keyframes_dir / f"segment_{segment_num}_keyframe.png"

        if not keyframe_path.exists():
            results[segment_num] = {"status": "skipped", "reason": "No keyframe"}
            continue

        video_path = streams_dir / "videos" / f"segment_{segment_num}.mp4"

        # Skip if exists and mode is 'missing'
        if mode == "missing" and video_path.exists():
            results[segment_num] = {"status": "exists", "path": str(video_path)}
            continue

        try:
            motion_prompt = section.get("motion_prompt", section.get("animation_prompt", ""))
            output = generate_video(
                stream_id=stream_id,
                segment_num=segment_num,
                keyframe_path=str(keyframe_path),
                motion_prompt=motion_prompt
            )
            results[segment_num] = {"status": "generated", "path": output}
        except Exception as e:
            results[segment_num] = {"status": "failed", "error": str(e)}

    return results


def extract_frames(stream_id: str, segment_num: int) -> dict:
    """
    Extract webp frames from a video for scroll animation.

    Returns dict with frame count and directory.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    video_path = streams_dir / "videos" / f"segment_{segment_num}.mp4"
    frames_dir = streams_dir / "frames" / f"segment_{segment_num}"

    if not video_path.exists():
        raise Exception(f"Video not found: {video_path}")

    frames_dir.mkdir(parents=True, exist_ok=True)

    # Use generate_video.py's extract function or ffmpeg directly
    cmd = [
        get_python(),
        str(EXECUTION_DIR / "generate_video.py"),
        "--extract-only",
        "--input", str(video_path),
        "--frames-dir", str(frames_dir),
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(PROJECT_ROOT),
        env={**subprocess.os.environ, "PYTHONPATH": str(PROJECT_ROOT)}
    )

    if result.returncode != 0:
        # Fallback to direct ffmpeg
        import shutil
        if shutil.which("ffmpeg"):
            # Extract as PNG first, then convert to webp
            png_pattern = str(frames_dir / "frame_%04d.png")
            ffmpeg_cmd = [
                "ffmpeg", "-y", "-i", str(video_path),
                "-vf", "fps=30",
                png_pattern
            ]
            subprocess.run(ffmpeg_cmd, capture_output=True)

            # Convert PNGs to webp
            for png in frames_dir.glob("*.png"):
                webp_path = png.with_suffix(".webp")
                convert_cmd = ["convert", str(png), str(webp_path)]
                subprocess.run(convert_cmd, capture_output=True)
                png.unlink()  # Remove PNG after conversion

    # Count frames
    frame_count = len(list(frames_dir.glob("*.webp")))

    return {
        "segment": segment_num,
        "frames_dir": str(frames_dir),
        "frame_count": frame_count
    }


def finalize_stream(stream_id: str) -> dict:
    """
    Generate the Next.js app for a stream.

    Returns dict with app path.
    """
    streams_dir = PIPELINE_DIR / "streams" / stream_id
    production_path = streams_dir / "production.json"

    if not production_path.exists():
        raise Exception(f"No production.json found for stream {stream_id}")

    # Use generate_app.py if it exists, otherwise manual generation
    generate_app_script = EXECUTION_DIR / "generate_app.py"

    if generate_app_script.exists():
        cmd = [
            get_python(),
            str(generate_app_script),
            "--stream", stream_id,
        ]

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(PROJECT_ROOT),
            env={**subprocess.os.environ, "PYTHONPATH": str(PROJECT_ROOT)}
        )

        if result.returncode != 0:
            raise Exception(f"App generation failed: {result.stderr}")

    # The app should be created in the project root as stream-{stream_id}/
    app_dir = PROJECT_ROOT / f"stream-{stream_id}"

    return {
        "stream_id": stream_id,
        "app_dir": str(app_dir),
        "status": "finalized" if app_dir.exists() else "pending"
    }
