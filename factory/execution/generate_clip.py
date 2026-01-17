#!/usr/bin/env python3
"""
Marketing Clip Generator for DownStream

Generates shareable video clips from streams with soundscapes.
Supports multiple formats: Reels (9:16), Shorts (9:16), Square (1:1), YouTube (16:9)

Usage:
    python generate_clip.py --stream stream-1767890796051-fhmnte --format reels --duration 30
    python generate_clip.py --stream demo-the-loop --format youtube --duration 60 --start 0 --end 3

Prerequisites:
    - Node.js with Playwright installed
    - ffmpeg installed
    - Stream must be built (npm run build) or dev server running
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import signal
import urllib.error
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DOWNSTREAM_ROOT = Path("/Users/ferenczcsuszner/Coding/2026/downstream")
RECORDINGS_DIR = DOWNSTREAM_ROOT / "recordings"
CAPTURE_SCRIPT = RECORDINGS_DIR / "capture-frames.js"

# Format configurations
FORMATS = {
    "reels": {
        "type": "reels",  # 1080x1920 vertical capture
        "width": 1080,
        "height": 1920,
        "aspect": "9:16",
        "max_duration": 90,
        "description": "Instagram Reels / TikTok"
    },
    "shorts": {
        "type": "reels",  # 1080x1920 vertical capture
        "width": 1080,
        "height": 1920,
        "aspect": "9:16",
        "max_duration": 60,
        "description": "YouTube Shorts"
    },
    "square": {
        "type": "desktop",  # Capture 16:9, crop to 1:1
        "width": 1080,
        "height": 1080,
        "aspect": "1:1",
        "max_duration": 60,
        "description": "Instagram/Facebook Square"
    },
    "youtube": {
        "type": "desktop",
        "width": 1920,
        "height": 1080,
        "aspect": "16:9",
        "max_duration": 180,
        "description": "YouTube / Web"
    }
}


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


def find_stream_path(stream_id: str) -> Path:
    """Find the stream directory."""
    stream_id = sanitize_stream_id(stream_id)
    # Check AIrunBusiness pipeline streams
    aib_path = PROJECT_ROOT / "pipeline" / "streams" / stream_id
    if aib_path.exists():
        return aib_path

    # Check downstream streams
    ds_path = DOWNSTREAM_ROOT / "streams" / stream_id
    if ds_path.exists():
        return ds_path

    # Try with stream- prefix
    if not stream_id.startswith("stream-"):
        return find_stream_path(f"stream-{stream_id}")

    raise FileNotFoundError(f"Stream not found: {stream_id}")


def find_app_path(stream_path: Path) -> Path:
    """Find the Next.js app directory for the stream."""
    # Check for app subfolder
    app_path = stream_path / "app"
    if app_path.exists() and (app_path / "package.json").exists():
        return app_path

    # Check if stream_path itself is the app
    if (stream_path / "package.json").exists():
        return stream_path

    raise FileNotFoundError(f"No Next.js app found in {stream_path}")


def generate_soundscape(stream_path: Path, output_path: Path, duration: int) -> Path:
    """Generate soundscape for the stream."""
    production_json = stream_path / "production.json"

    if not production_json.exists():
        print(f"Warning: No production.json found, using default mood")
        mood_args = ["--mood", "dark"]
    else:
        mood_args = ["-p", str(production_json)]

    soundscape_script = SCRIPT_DIR / "generate_soundscape.py"
    venv_python = DOWNSTREAM_ROOT / ".venv" / "bin" / "python"

    cmd = [
        str(venv_python),
        str(soundscape_script),
        *mood_args,
        "-o", str(output_path),
        "-d", str(duration)
    ]

    print(f"Generating soundscape ({duration}s)...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Soundscape generation failed: {result.stderr}")
        raise RuntimeError("Soundscape generation failed")

    print(result.stdout)
    return output_path


def start_dev_server(app_path: Path, port: int = 3003) -> subprocess.Popen:
    """Start the Next.js dev server."""
    print(f"Starting dev server on port {port}...")

    # Check if already running
    try:
        import urllib.request
        urllib.request.urlopen(f"http://localhost:{port}", timeout=2)
        print(f"Server already running on port {port}")
        return None  # Server is already running
    except (urllib.error.URLError, OSError):
        pass  # Server not running, need to start it

    # Start the server
    env = os.environ.copy()
    env["PORT"] = str(port)

    proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "-p", str(port)],
        cwd=str(app_path),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        preexec_fn=os.setsid  # Create new process group for clean shutdown
    )

    # Wait for server to be ready
    print("Waiting for server to start...")
    for i in range(30):  # Wait up to 30 seconds
        time.sleep(1)
        try:
            import urllib.request
            urllib.request.urlopen(f"http://localhost:{port}", timeout=2)
            print(f"Server ready on port {port}")
            return proc
        except (urllib.error.URLError, OSError):
            if proc.poll() is not None:
                raise RuntimeError("Dev server failed to start")
            print(".", end="", flush=True)

    raise RuntimeError("Dev server did not start in time")


def stop_dev_server(proc: subprocess.Popen):
    """Stop the dev server."""
    if proc is None:
        return

    print("Stopping dev server...")
    try:
        # Kill the process group
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait(timeout=5)
    except (OSError, subprocess.TimeoutExpired):
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except OSError:
            pass  # Process already dead


def get_deployed_url(stream_path: Path) -> str:
    """Get the deployed URL from deployment.json if available."""
    deployment_json = stream_path / "deployment.json"
    if deployment_json.exists():
        with open(deployment_json) as f:
            data = json.load(f)
            return data.get("stream_url")
    return None


def capture_video(
    format_name: str,
    duration: int,
    url: str,
    output_dir: Path,
    name: str,
    start_section: str = None,
    end_section: str = None
) -> Path:
    """Capture video using Playwright."""
    fmt = FORMATS[format_name]

    # Determine capture type
    capture_type = fmt["type"]

    # Build command
    cmd = [
        "node",
        str(CAPTURE_SCRIPT),
        capture_type,
        "--duration", str(duration),
        "--url", url,
        "--name", name
    ]

    if start_section is not None:
        cmd.extend(["--start", str(start_section)])
    if end_section is not None:
        cmd.extend(["--end", str(end_section)])

    print(f"Capturing {format_name} video ({duration}s)...")
    print(f"  Type: {capture_type}, Resolution: {fmt['width']}x{fmt['height']}")
    print(f"  URL: {url}")

    # Run capture script from recordings directory
    result = subprocess.run(
        cmd,
        cwd=str(RECORDINGS_DIR),
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"Capture failed: {result.stderr}")
        raise RuntimeError("Video capture failed")

    print(result.stdout)

    # Find the output video
    video_path = RECORDINGS_DIR / f"{name}.mp4"
    if not video_path.exists():
        raise FileNotFoundError(f"Expected video not found: {video_path}")

    return video_path


def merge_audio_video(video_path: Path, audio_path: Path, output_path: Path):
    """Merge audio and video using ffmpeg."""
    print(f"Merging audio and video...")

    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-i", str(audio_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(output_path)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Merge failed: {result.stderr}")
        raise RuntimeError("Audio/video merge failed")

    print(f"Created: {output_path}")


def crop_to_format(input_path: Path, output_path: Path, target_format: str):
    """Crop video to target format if needed."""
    fmt = FORMATS[target_format]

    # Only square format needs cropping from 16:9
    if target_format != "square":
        # Just copy if no cropping needed
        if input_path != output_path:
            import shutil
            shutil.copy(input_path, output_path)
        return

    print(f"Cropping to {fmt['aspect']}...")

    # Crop center 1:1 from 16:9
    # 1920x1080 -> crop 1080x1080 from center
    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", "crop=ih:ih:(iw-ih)/2:0",  # Crop to height x height, centered
        "-c:a", "copy",
        str(output_path)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Crop failed: {result.stderr}")
        raise RuntimeError("Video cropping failed")

    print(f"Cropped: {output_path}")


def generate_clip(
    stream_id: str,
    format_name: str,
    duration: int,
    output_dir: Path,
    start_section: str = None,
    end_section: str = None,
    port: int = 3003,
    url: str = None
):
    """Generate a complete marketing clip."""

    if format_name not in FORMATS:
        raise ValueError(f"Unknown format: {format_name}. Available: {list(FORMATS.keys())}")

    fmt = FORMATS[format_name]
    if duration > fmt["max_duration"]:
        print(f"Warning: Duration {duration}s exceeds max for {format_name} ({fmt['max_duration']}s)")

    # Find stream
    stream_path = find_stream_path(stream_id)

    print(f"Stream: {stream_path}")
    print(f"Format: {format_name} ({fmt['description']})")

    # Determine capture URL
    capture_url = url
    use_local_server = False
    app_path = None

    if not capture_url:
        # Try to get deployed URL
        capture_url = get_deployed_url(stream_path)
        if capture_url:
            print(f"Using deployed URL: {capture_url}")
        else:
            # Fall back to local dev server
            try:
                app_path = find_app_path(stream_path)
                capture_url = f"http://localhost:{port}"
                use_local_server = True
                print(f"Using local dev server: {capture_url}")
            except FileNotFoundError:
                raise RuntimeError(
                    f"No deployed URL and no local app found for {stream_id}. "
                    "Either deploy the stream or provide --url parameter."
                )

    # Create output directory
    clips_dir = output_dir / "clips"
    clips_dir.mkdir(parents=True, exist_ok=True)

    # Generate clip name
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    clip_name = f"{stream_id}-{format_name}-{timestamp}"

    # Step 1: Generate soundscape
    soundscape_path = clips_dir / f"{clip_name}-audio.wav"
    generate_soundscape(stream_path, soundscape_path, duration)

    # Step 2: Start dev server if needed
    server_proc = None
    try:
        if use_local_server:
            server_proc = start_dev_server(app_path, port)

        # Step 3: Capture video
        raw_video_path = capture_video(
            format_name,
            duration,
            capture_url,
            clips_dir,
            clip_name,
            start_section,
            end_section
        )

        # Move captured video to clips dir
        video_in_clips = clips_dir / f"{clip_name}-video.mp4"
        if raw_video_path.parent != clips_dir:
            import shutil
            shutil.move(str(raw_video_path), str(video_in_clips))
        else:
            video_in_clips = raw_video_path

        # Step 4: Merge audio and video
        merged_path = clips_dir / f"{clip_name}-merged.mp4"
        merge_audio_video(video_in_clips, soundscape_path, merged_path)

        # Step 5: Crop to final format if needed
        final_path = clips_dir / f"{clip_name}.mp4"
        crop_to_format(merged_path, final_path, format_name)

        # Clean up intermediate files
        for f in [soundscape_path, video_in_clips, merged_path]:
            if f.exists() and f != final_path:
                f.unlink()

        # Create metadata
        metadata = {
            "stream_id": stream_id,
            "format": format_name,
            "duration": duration,
            "aspect_ratio": fmt["aspect"],
            "resolution": f"{fmt['width']}x{fmt['height']}",
            "created": timestamp,
            "start_section": start_section,
            "end_section": end_section,
            "source_url": capture_url,
            "file": str(final_path.name)
        }

        metadata_path = clips_dir / f"{clip_name}-metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"\n{'='*50}")
        print(f"Clip generated successfully!")
        print(f"  Output: {final_path}")
        print(f"  Format: {format_name} ({fmt['aspect']})")
        print(f"  Duration: {duration}s")
        print(f"  Size: {final_path.stat().st_size / 1024 / 1024:.1f} MB")
        print(f"{'='*50}")

        return final_path

    finally:
        stop_dev_server(server_proc)


def main():
    parser = argparse.ArgumentParser(
        description="Generate marketing clips from DownStream streams"
    )
    parser.add_argument("--stream", "-s", required=True, help="Stream ID")
    parser.add_argument("--format", "-f", default="reels",
                        choices=list(FORMATS.keys()),
                        help="Output format (default: reels)")
    parser.add_argument("--duration", "-d", type=int, default=30,
                        help="Duration in seconds (default: 30)")
    parser.add_argument("--start", help="Start section ID or index")
    parser.add_argument("--end", help="End section ID or index")
    parser.add_argument("--output", "-o", default=".",
                        help="Output directory (default: current)")
    parser.add_argument("--port", "-p", type=int, default=3003,
                        help="Dev server port for local streams (default: 3003)")
    parser.add_argument("--url", "-u",
                        help="URL to capture (overrides deployed URL and local server)")

    args = parser.parse_args()

    output_dir = Path(args.output).resolve()

    try:
        generate_clip(
            stream_id=args.stream,
            format_name=args.format,
            duration=args.duration,
            output_dir=output_dir,
            start_section=args.start,
            end_section=args.end,
            port=args.port,
            url=args.url
        )
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
