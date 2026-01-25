#!/usr/bin/env python3
"""
DownStream Director Dashboard
Web UI for artistic director to manage production pipeline
"""

import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict

from fastapi import FastAPI, Request, Form, HTTPException, Depends, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import auth, tasks


def trigger_job_processor(job_id: str):
    """
    Trigger Claude Code to process a job immediately.
    Runs in background so the API can return quickly.
    """
    import subprocess
    import threading

    project_dir = Path(__file__).parent.parent.parent
    jobs_dir = project_dir / "infrastructure" / "jobs"
    job_file = jobs_dir / "pending" / f"{job_id}.json"

    if not job_file.exists():
        return  # Job already picked up or doesn't exist

    def run_processor():
        try:
            # Read job to get type and stream_id
            with open(job_file) as f:
                job_data = json.load(f)

            job_type = job_data.get("type", "unknown")
            stream_id = job_data.get("stream_id", "unknown")

            # Move to processing
            processing_dir = jobs_dir / "processing"
            processing_dir.mkdir(parents=True, exist_ok=True)
            processing_file = processing_dir / f"{job_id}.json"
            job_file.rename(processing_file)

            # Common messaging instructions for all jobs
            messaging_instructions = """
DIRECTOR COMMUNICATION:
You can send messages to the director via the dashboard API. Use curl to communicate:

To send a message:
curl -X POST http://127.0.0.1:8080/messages -H "Content-Type: application/json" -d '{"stream_id": "STREAM_ID", "job_id": "JOB_ID", "message_type": "info", "content": "Your message here"}'

To ask for approval (will show buttons in dashboard):
curl -X POST http://127.0.0.1:8080/messages -H "Content-Type: application/json" -d '{"stream_id": "STREAM_ID", "job_id": "JOB_ID", "message_type": "approval_request", "content": "Should I generate warm/cold variants? Extra cost: ~$0.25", "options": ["Approve", "Deny"]}'

To poll for response:
curl http://127.0.0.1:8080/messages/MESSAGE_ID/poll

IMPORTANT RULES:
- NEVER generate variants (cold/warm, alt versions) without asking first via approval_request
- Report progress for long tasks
- Report any issues or suggestions
- Stick to canonical file naming: segment_N_keyframe.png, segment_N.mp4
"""

            # Build prompt based on job type
            prompts = {
                "generate-keyframes": f"""You are processing a keyframe generation job for DownStream.

Job file: {processing_file}
Stream ID: {stream_id}

TASK: Generate keyframes for all segments in this stream.
1. Read the job file to get stream_path and mode
2. Read production.json from the stream
3. For each segment, generate EXACTLY ONE keyframe using the keyframe_prompt
4. Save keyframes to {{stream_path}}/keyframes/segment_{{n}}_keyframe.png
5. If you think variants would be valuable, ASK via approval_request first
6. Move job to completed/ when done

Use the generate_frame.py script.
{messaging_instructions}""",

                "generate-videos": f"""You are processing a video generation job for DownStream.

Job file: {processing_file}
Stream ID: {stream_id}

TASK: Generate videos from keyframes for this stream.
1. Read the job file to get stream_path and mode
2. For each segment with a keyframe, generate EXACTLY ONE video
3. Save videos to {{stream_path}}/videos/segment_{{n}}.mp4
4. Extract frames in DUAL TIERS using extract_frames_dual.py:
   - High quality (121+ frames): {{stream_path}}/public/frames/{{n}}/
   - Performance (40 frames): {{stream_path}}/public/frames-perf/{{n}}/
5. If you see variant keyframes (e.g., _cold, _warm), ASK which to use
6. Move job to completed/ when done

Use the generate_video.py script for video generation.
Use extract_frames_dual.py for frame extraction (BOTH tiers mandatory).
{messaging_instructions}""",

                "finalize-stream": f"""You are processing a stream finalization job for DownStream.

Job file: {processing_file}
Stream ID: {stream_id}

TASK: Build BOTH Next.js apps (high quality + performance) for this stream.

1. Read the job file to get stream_path
2. Read production.json for stream configuration
3. Generate BOTH apps using: python generate_app.py {{stream_id}} --tier both
   - This creates: streams/apps/{{stream_id}}/ (high, 121+ frames)
   - And: streams/apps/{{stream_id}}-perf/ (perf, 40 frames)
4. Deploy BOTH to Vercel:
   - cd streams/apps/{{stream_id}} && vercel --prod
   - cd streams/apps/{{stream_id}}-perf && vercel --prod
5. Archive assets to Google Drive: infrastructure/archival/archive_assets.sh {{stream_id}}
6. Move job to completed/ when done

CRITICAL: You MUST create and deploy BOTH tiers. Single-tier deployment is not acceptable.
{messaging_instructions}""",

                "production-spec": f"""You are processing a production spec job for DownStream.

Job file: {processing_file}
Stream ID: {stream_id}

TASK: Create production.json from input.json.
1. Read the job file to get input_path and output_path
2. Read input.json (story text, title, style preferences)
3. Create production.json breaking the story into visual segments
4. Each segment needs: text_content, keyframe_prompt, motion_prompt, duration
5. Move job to completed/ when done

Use the create-production-spec skill from pipeline/skills/.
{messaging_instructions}"""
            }

            prompt = prompts.get(job_type, f"Process job: {processing_file}")

            # Write prompt to temp file to avoid shell escaping issues
            import tempfile
            prompt_file = f"/tmp/claude_prompt_{job_id}.txt"
            with open(prompt_file, "w") as f:
                f.write(prompt)
            os.chmod(prompt_file, 0o644)

            # Spawn Claude Code as downstream user (root can't use --dangerously-skip-permissions)
            result = subprocess.run(
                ["su", "-", "downstream", "-c",
                 f"cd '{project_dir}' && claude -p \"$(cat {prompt_file})\" --dangerously-skip-permissions"],
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )

            # Clean up prompt file
            try:
                os.remove(prompt_file)
            except:
                pass

            # Move to completed or failed
            completed_dir = jobs_dir / "completed"
            failed_dir = jobs_dir / "failed"
            completed_dir.mkdir(parents=True, exist_ok=True)
            failed_dir.mkdir(parents=True, exist_ok=True)

            if result.returncode == 0:
                processing_file.rename(completed_dir / f"{job_id}.json")
            else:
                # Add error to job data
                with open(processing_file) as f:
                    job_data = json.load(f)
                job_data["error"] = result.stderr or "Unknown error"
                job_data["status"] = "failed"
                with open(processing_file, "w") as f:
                    json.dump(job_data, f, indent=2)
                processing_file.rename(failed_dir / f"{job_id}.json")

        except Exception as e:
            # Log error but don't crash
            print(f"Job processor error for {job_id}: {e}")

    # Run in background thread
    thread = threading.Thread(target=run_processor, daemon=True)
    thread.start()


# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(title="DownStream Director Dashboard")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Templates and static files
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))
app.mount("/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")


# Database helpers
def get_db() -> sqlite3.Connection:
    """Get database connection with row factory."""
    conn = sqlite3.connect(tasks.get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database from schema."""
    schema_path = Path(__file__).parent / "schema.sql"
    if schema_path.exists():
        db = get_db()
        with open(schema_path, "r") as f:
            db.executescript(f.read())
        db.commit()
        db.close()


# Dependency: get current user from session
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None)
) -> Dict:
    """Get current authenticated user from session cookie."""
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    user = auth.get_session_user(session_token, db)
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Session expired")

    return user


# Optional user (doesn't raise exception if not authenticated)
async def get_optional_user(session_token: Optional[str] = Cookie(None)) -> Optional[Dict]:
    """Get current user if logged in, None otherwise."""
    if not session_token:
        return None

    db = get_db()
    user = auth.get_session_user(session_token, db)
    db.close()

    return user


# Stream helpers
def get_streams_dir() -> Path:
    """Get the streams directory path."""
    # Go up from infrastructure/director to project root, then to streams/specs
    return Path(__file__).parent.parent.parent / "streams" / "specs"


def find_keyframe_file(keyframes_dir: Path, segment_id: int) -> Optional[Path]:
    """Find keyframe file for a segment, checking multiple naming patterns and extensions."""
    if not keyframes_dir.exists():
        return None

    # Try multiple naming patterns
    for ext in ['.png', '.jpg', '.jpeg', '.webp']:
        # Standard segment_N pattern
        keyframe_file = keyframes_dir / f"segment_{segment_id}{ext}"
        if keyframe_file.exists():
            return keyframe_file

        # segment_N_keyframe pattern (from generate_frame.py)
        keyframe_file = keyframes_dir / f"segment_{segment_id}_keyframe{ext}"
        if keyframe_file.exists():
            return keyframe_file

    # Try scene_NN_* pattern (older streams)
    segment_padded = f"{segment_id:02d}"
    for ext in ['.png', '.jpg', '.jpeg', '.webp']:
        matches = list(keyframes_dir.glob(f"scene_{segment_padded}_*{ext}"))
        if matches:
            return matches[0]

    return None


def find_video_file(videos_dir: Path, segment_id: int) -> Optional[Path]:
    """Find video file for a segment, checking multiple naming patterns."""
    if not videos_dir.exists():
        return None

    # Try standard segment_N pattern first
    video_file = videos_dir / f"segment_{segment_id}.mp4"
    if video_file.exists():
        return video_file

    # Try scene_NN_* pattern (older streams) - exclude versions (_v2, _v3, etc)
    segment_padded = f"{segment_id:02d}"
    for match in videos_dir.glob(f"scene_{segment_padded}_*.mp4"):
        # Skip version files like scene_01_platform_v2.mp4
        if '_v' not in match.stem.split('_')[-1]:
            return match

    return None


def calculate_progress(stream: Dict) -> Dict:
    """Calculate progress metrics for a stream."""
    stream_path = Path(stream["path"])
    stream_id = stream.get("id") or Path(stream["path"]).name

    # Load review decisions from database
    review_lookup = {}
    try:
        db = get_db()
        cursor = db.execute(
            """SELECT segment_id, asset_type, decision FROM reviews
               WHERE stream_id = ?
               ORDER BY reviewed_at ASC""",
            (stream_id,)
        )
        for row in cursor.fetchall():
            key = (row[0], row[1])
            # Later reviews override earlier ones, approved takes precedence
            if key not in review_lookup or row[2] == "approved":
                review_lookup[key] = row[2]
        db.close()
    except Exception as e:
        pass  # If DB fails, just return 0 for approved counts

    keyframes_dir = stream_path / "keyframes"
    videos_dir = stream_path / "videos"

    total_segments = 0
    keyframes_generated = 0
    keyframes_approved = 0
    videos_generated = 0
    videos_approved = 0

    if stream.get("production") and "segments" in stream["production"]:
        total_segments = len(stream["production"]["segments"])

        for seg in stream["production"]["segments"]:
            segment_id = seg.get("id")

            # Check keyframe
            keyframe_file = find_keyframe_file(keyframes_dir, segment_id)
            if keyframe_file:
                keyframes_generated += 1
            if review_lookup.get((segment_id, "keyframe")) == "approved":
                keyframes_approved += 1

            # Check video
            video_file = find_video_file(videos_dir, segment_id)
            if video_file:
                videos_generated += 1
            if review_lookup.get((segment_id, "video")) == "approved":
                videos_approved += 1

    # Check if stream has been finalized (stream-{id} folder exists)
    project_root = Path(__file__).parent.parent.parent
    finalized_path = project_root / f"stream-{stream_id}"
    is_finalized = finalized_path.exists() and (finalized_path / "package.json").exists()

    return {
        "total_segments": total_segments,
        "keyframes_generated": keyframes_generated,
        "keyframes_approved": keyframes_approved,
        "videos_generated": videos_generated,
        "videos_approved": videos_approved,
        "cp1_complete": bool(stream.get("input")),
        "cp2_complete": bool(stream.get("production")),
        "cp3_complete": keyframes_approved == total_segments if total_segments > 0 else False,
        "cp4_complete": videos_approved == total_segments if total_segments > 0 else False,
        "cp5_complete": bool(stream.get("deployment")),
        "finalized": is_finalized,
        "finalized_path": str(finalized_path) if is_finalized else None,
    }


def get_keyframe_extension(keyframes_dir: Path) -> str:
    """Detect which extension is used for keyframes in this stream."""
    for ext in ['.png', '.jpg', '.jpeg', '.webp']:
        if list(keyframes_dir.glob(f"segment_*{ext}")) or list(keyframes_dir.glob(f"scene_*{ext}")):
            return ext
    return '.png'  # Default


def list_streams() -> list:
    """List all streams with their status."""
    streams_dir = get_streams_dir()
    if not streams_dir.exists():
        return []

    streams = []
    for stream_path in streams_dir.iterdir():
        if not stream_path.is_dir():
            continue

        stream_id = stream_path.name
        input_file = stream_path / "input.json"
        production_file = stream_path / "production.json"
        deployment_file = stream_path / "deployment.json"

        # Determine status based on what files exist
        status = "unknown"
        title = stream_id

        if input_file.exists():
            try:
                with open(input_file) as f:
                    data = json.load(f)
                    title = data.get("title", stream_id)
            except:
                pass

        # Check keyframes and videos
        keyframes_dir = stream_path / "keyframes"
        videos_dir = stream_path / "videos"
        frames_dir = stream_path / "public" / "frames"

        # Check for keyframes with any supported extension
        has_keyframes = keyframes_dir.exists() and (
            list(keyframes_dir.glob("*.png")) or
            list(keyframes_dir.glob("*.jpg")) or
            list(keyframes_dir.glob("*.jpeg")) or
            list(keyframes_dir.glob("*.webp"))
        )
        has_videos = videos_dir.exists() and list(videos_dir.glob("*.mp4"))
        has_frames = frames_dir.exists() and list(frames_dir.glob("*/*.webp"))

        if deployment_file.exists():
            status = "deployed"
        elif has_frames:
            status = "ready"
        elif has_videos:
            status = "videos_done"
        elif has_keyframes:
            status = "keyframes_done"
        elif production_file.exists():
            status = "spec_ready"
        elif input_file.exists():
            status = "new"

        streams.append({
            "id": stream_id,
            "title": title,
            "status": status,
            "path": str(stream_path)
        })

    # Sort by modification time, newest first
    streams.sort(key=lambda s: Path(s["path"]).stat().st_mtime, reverse=True)

    return streams


def get_stream_data(stream_id: str) -> Optional[Dict]:
    """Get all data for a specific stream."""
    stream_path = get_streams_dir() / stream_id
    if not stream_path.exists():
        return None

    data = {
        "id": stream_id,
        "path": str(stream_path),
        "input": None,
        "production": None,
        "deployment": None
    }

    # Load input.json
    input_file = stream_path / "input.json"
    if input_file.exists():
        with open(input_file) as f:
            data["input"] = json.load(f)

    # Load production.json
    production_file = stream_path / "production.json"
    if production_file.exists():
        with open(production_file) as f:
            data["production"] = json.load(f)
        # Normalize field names: keyframe_prompt -> image_prompt
        # (production spec uses keyframe_prompt, dashboard uses image_prompt)
        if data["production"] and "segments" in data["production"]:
            for seg in data["production"]["segments"]:
                if "keyframe_prompt" in seg and "image_prompt" not in seg:
                    seg["image_prompt"] = seg["keyframe_prompt"]

    # Load deployment.json
    deployment_file = stream_path / "deployment.json"
    if deployment_file.exists():
        with open(deployment_file) as f:
            data["deployment"] = json.load(f)

    return data


def cleanup_old_versions(versions_dir: Path, segment_id: int, extension: str, max_versions: int = 10):
    """
    Clean up old versions, keeping only the most recent N versions.
    STORAGE: Prevents disk space issues from unlimited version history.
    """
    if not versions_dir.exists():
        return

    # Find all versions for this segment
    pattern = f"segment_{segment_id}_*.{extension}"
    version_files = sorted(
        versions_dir.glob(pattern),
        key=lambda p: p.stat().st_mtime,
        reverse=True  # Newest first
    )

    # Keep only the last N versions, delete the rest
    if len(version_files) > max_versions:
        for old_version in version_files[max_versions:]:
            try:
                old_version.unlink()
            except Exception as e:
                # Log but don't fail if cleanup has issues
                print(f"Warning: Failed to delete old version {old_version}: {e}")


def stream_video_file(video_path: Path, request: Request) -> StreamingResponse:
    """
    Stream a video file with range request support.
    PERFORMANCE: Prevents loading entire video into memory.
    """
    file_size = video_path.stat().st_size
    range_header = request.headers.get("range")

    if range_header:
        # Parse range header (format: "bytes=start-end")
        range_match = range_header.replace("bytes=", "").split("-")
        start = int(range_match[0]) if range_match[0] else 0
        end = int(range_match[1]) if len(range_match) > 1 and range_match[1] else file_size - 1

        # Clamp to file size
        end = min(end, file_size - 1)
        chunk_size = end - start + 1

        def iterfile():
            with open(video_path, "rb") as f:
                f.seek(start)
                remaining = chunk_size
                while remaining > 0:
                    chunk = f.read(min(8192, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        return StreamingResponse(
            iterfile(),
            status_code=206,  # Partial Content
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(chunk_size),
                "Content-Type": "video/mp4",
            }
        )
    else:
        # No range header, stream entire file
        def iterfile():
            with open(video_path, "rb") as f:
                while chunk := f.read(8192):
                    yield chunk

        return StreamingResponse(
            iterfile(),
            media_type="video/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(file_size),
            }
        )


# Startup
@app.on_event("startup")
async def startup():
    init_db()
    auth.cleanup_expired_sessions(get_db())


# ===== Routes =====

@app.get("/", response_class=HTMLResponse)
async def index(request: Request, user: Optional[Dict] = Depends(get_optional_user)):
    """Root route - redirect to dashboard or login."""
    if user:
        return RedirectResponse(url="/streams", status_code=302)
    else:
        return RedirectResponse(url="/login", status_code=302)


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Show login form."""
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login")
@limiter.limit("5/minute")  # SECURITY: Rate limit to prevent brute force attacks
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    """Handle login form submission."""
    db = get_db()

    # Find user
    row = db.execute(
        "SELECT * FROM users WHERE username = ?",
        (username,)
    ).fetchone()

    if not row or not auth.verify_password(password, row["password_hash"]):
        return templates.TemplateResponse(
            "login.html",
            {"request": request, "error": "Invalid username or password"},
            status_code=401
        )

    # Update last login
    db.execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (datetime.utcnow().isoformat(), row["id"])
    )
    db.commit()

    # Create session
    token = auth.create_session(row["id"], db)
    db.close()

    # Redirect to dashboard with session cookie
    response = RedirectResponse(url="/streams", status_code=302)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,  # 7 days
        samesite="strict",  # CSRF protection: block all cross-site requests
        secure=False  # Set to True in production with HTTPS
    )
    return response


@app.post("/logout")
async def logout(session_token: Optional[str] = Cookie(None)):
    """Logout and clear session."""
    if session_token:
        db = get_db()
        auth.delete_session(session_token, db)
        db.close()

    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie("session_token")
    return response


@app.get("/streams", response_class=HTMLResponse)
async def dashboard(request: Request, user: Dict = Depends(get_current_user)):
    """Dashboard - list all streams."""
    streams = list_streams()
    return templates.TemplateResponse(
        "dashboard.html",
        {"request": request, "user": user, "streams": streams}
    )


@app.post("/streams/create")
async def create_stream(
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Create a new stream."""
    import re
    from datetime import datetime

    try:
        data = await request.json()
    except:
        return JSONResponse({"status": "error", "error": "Invalid JSON"}, status_code=400)

    # Validate required fields
    stream_id = data.get("stream_id", "").strip()
    title = data.get("title", "").strip()
    story = data.get("story", "").strip()
    language = data.get("language", "en")
    notes = data.get("notes", "").strip()
    segment_count = data.get("segment_count")
    template = data.get("template", "blank")
    author = data.get("author", "").strip()

    # Template-specific validation
    if template == "literature":
        # Literature template requires author and has fixed 3 segments
        if not author:
            return JSONResponse({"status": "error", "error": "Author name is required for literature template"}, status_code=400)
        segment_count = 3  # Fixed for literature demos
    else:
        # Validate segment_count if provided for blank template
        if segment_count is not None:
            try:
                segment_count = int(segment_count)
                if segment_count < 3 or segment_count > 12:
                    return JSONResponse({"status": "error", "error": "Segment count must be between 3 and 12"}, status_code=400)
            except (ValueError, TypeError):
                return JSONResponse({"status": "error", "error": "Invalid segment count"}, status_code=400)

    if not stream_id:
        return JSONResponse({"status": "error", "error": "Stream ID is required"}, status_code=400)
    if not title:
        return JSONResponse({"status": "error", "error": "Title is required"}, status_code=400)
    if not story:
        return JSONResponse({"status": "error", "error": "Story text is required"}, status_code=400)

    # Validate stream_id format (URL-safe)
    if not re.match(r'^[a-zA-Z0-9_-]+$', stream_id):
        return JSONResponse({"status": "error", "error": "Stream ID can only contain letters, numbers, hyphens, and underscores"}, status_code=400)

    # Check for existing stream
    stream_path = get_streams_dir() / stream_id
    if stream_path.exists():
        return JSONResponse({"status": "error", "error": f"Stream '{stream_id}' already exists"}, status_code=409)

    # Create stream directory structure
    try:
        stream_path.mkdir(parents=True, exist_ok=True)
        (stream_path / "keyframes").mkdir(exist_ok=True)
        (stream_path / "videos").mkdir(exist_ok=True)
        (stream_path / "public" / "frames").mkdir(parents=True, exist_ok=True)

        # Create input.json
        input_data = {
            "id": stream_id,
            "title": title,
            "language": language,
            "story": story,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "created_by": user.get("display_name") or user.get("username", "Unknown"),
            "template": template
        }

        # Add segment_count if specified
        if segment_count is not None:
            input_data["segment_count"] = segment_count

        # Add author for literature template
        if template == "literature" and author:
            input_data["author"] = author
            # Literature template preset CTA settings
            input_data["cta"] = {
                "intro_text": "Beszéljünk róla?",
                "button_text": "Beszéljünk",
                "button_url": "https://cal.com/ferencz-csuszner/30-perces-online-beszelgetes",
                "email": "ferencz@pinelines.eu",
                "footer_text": "downstream.studio — scroll-driven storytelling",
                "footer_url": "https://downstream.studio"
            }

        if notes:
            input_data["brief"] = {
                "notes": notes
            }

        input_file = stream_path / "input.json"
        with open(input_file, "w") as f:
            json.dump(input_data, f, indent=2)

        # Fix ownership so Claude Code (running as downstream) can write to this directory
        import subprocess
        subprocess.run(["chown", "-R", "downstream:downstream", str(stream_path)], check=True)

        return JSONResponse({
            "status": "success",
            "stream_id": stream_id,
            "message": f"Stream '{title}' created successfully"
        })

    except Exception as e:
        # Clean up on failure
        import shutil
        if stream_path.exists():
            shutil.rmtree(stream_path)
        return JSONResponse({"status": "error", "error": f"Failed to create stream: {str(e)}"}, status_code=500)


@app.delete("/streams/{stream_id}")
async def delete_stream(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Delete a stream and all its assets."""
    import shutil

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    stream_path = Path(stream["path"])

    try:
        # Delete the stream directory
        if stream_path.exists():
            shutil.rmtree(stream_path)

        return JSONResponse({
            "status": "success",
            "message": f"Stream '{stream_id}' deleted successfully"
        })
    except Exception as e:
        return JSONResponse({"status": "error", "error": f"Failed to delete stream: {str(e)}"}, status_code=500)


@app.get("/streams/{stream_id}", response_class=HTMLResponse)
async def stream_detail(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Stream detail page - single-page workflow."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    # Convert path back to Path for file operations
    stream_path = Path(stream["path"])

    # Get recent tasks for this stream
    stream_tasks = tasks.get_stream_tasks(stream_id, limit=10)

    # PERFORMANCE: Fetch all reviews in a single query instead of one per segment
    db = get_db()
    all_reviews = db.execute(
        """SELECT segment_id, asset_type, decision
           FROM (
               SELECT segment_id, asset_type, decision,
                      ROW_NUMBER() OVER (PARTITION BY segment_id, asset_type ORDER BY reviewed_at DESC) as rn
               FROM reviews
               WHERE stream_id = ?
           )
           WHERE rn = 1""",
        (stream_id,)
    ).fetchall()
    db.close()

    # Build review lookup dict
    review_lookup = {}
    for row in all_reviews:
        key = (row["segment_id"], row["asset_type"])
        review_lookup[key] = row["decision"]

    # Gather all keyframes with status
    keyframes = []
    keyframes_dir = stream_path / "keyframes"
    if keyframes_dir.exists() and stream["production"] and "segments" in stream["production"]:
        for seg in stream["production"]["segments"]:
            segment_id = seg.get("id")
            keyframe_file = find_keyframe_file(keyframes_dir, segment_id)

            keyframes.append({
                "segment_id": segment_id,
                "segment": seg,
                "exists": keyframe_file is not None,
                "path": str(keyframe_file) if keyframe_file else None,
                "decision": review_lookup.get((segment_id, "keyframe"))
            })

    # Gather all videos with status
    videos = []
    videos_dir = stream_path / "videos"
    if stream["production"] and "segments" in stream["production"]:
        for seg in stream["production"]["segments"]:
            segment_id = seg.get("id")
            video_file = find_video_file(videos_dir, segment_id)
            keyframe_file = find_keyframe_file(keyframes_dir, segment_id) if keyframes_dir.exists() else None

            videos.append({
                "segment_id": segment_id,
                "segment": seg,
                "exists": video_file is not None,
                "path": str(video_file) if video_file else None,
                "keyframe_exists": keyframe_file is not None,
                "decision": review_lookup.get((segment_id, "video"))
            })

    # Calculate progress
    total_segments = len(stream["production"]["segments"]) if stream["production"] and "segments" in stream["production"] else 0
    keyframes_generated = sum(1 for kf in keyframes if kf["exists"])
    keyframes_approved = sum(1 for kf in keyframes if kf["decision"] == "approved")
    videos_generated = sum(1 for v in videos if v["exists"])
    videos_approved = sum(1 for v in videos if v["decision"] == "approved")

    # Check if stream has been finalized
    project_root = Path(__file__).parent.parent.parent
    finalized_path = project_root / f"stream-{stream_id}"
    is_finalized = finalized_path.exists() and (finalized_path / "package.json").exists()

    progress = {
        "total_segments": total_segments,
        "keyframes_generated": keyframes_generated,
        "keyframes_approved": keyframes_approved,
        "videos_generated": videos_generated,
        "videos_approved": videos_approved,
        "cp1_complete": bool(stream["input"]),
        "cp2_complete": bool(stream["production"]),
        "cp3_complete": keyframes_approved == total_segments if total_segments > 0 else False,
        "cp4_complete": videos_approved == total_segments if total_segments > 0 else False,
        "cp5_complete": bool(stream["deployment"]),
        "finalized": is_finalized,
        "finalized_path": str(finalized_path) if is_finalized else None,
    }

    return templates.TemplateResponse(
        "stream_workflow.html",
        {
            "request": request,
            "user": user,
            "stream": stream,
            "keyframes": keyframes,
            "videos": videos,
            "progress": progress,
            "tasks": stream_tasks
        }
    )


@app.get("/streams/{stream_id}/preview")
async def preview_stream(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Preview stream - redirect to deployed URL or show local preview."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    # If deployed, redirect to deployed URL (with ds_skip=1 to exclude from analytics)
    if stream.get("deployment") and stream["deployment"].get("stream_url"):
        url = stream["deployment"]["stream_url"]
        skip_url = f"{url}{'&' if '?' in url else '?'}ds_skip=1"
        return RedirectResponse(url=skip_url, status_code=302)

    # Otherwise, return a message that preview isn't available
    return HTMLResponse(
        content=f"""
        <html>
        <head><title>Preview - {stream_id}</title></head>
        <body style="font-family: system-ui; padding: 2rem; background: #1a1a2e; color: #eee;">
            <h1>Preview Not Available</h1>
            <p>This stream hasn't been deployed yet.</p>
            <p>Deploy the stream first to preview it.</p>
            <a href="/streams/{stream_id}" style="color: #6c63ff;">← Back to Stream</a>
        </body>
        </html>
        """,
        status_code=200
    )


@app.get("/streams/{stream_id}/story", response_class=HTMLResponse)
async def view_story(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """View story input (Checkpoint 1)."""
    stream = get_stream_data(stream_id)
    if not stream or not stream["input"]:
        raise HTTPException(status_code=404, detail="Story not found")

    return templates.TemplateResponse(
        "story.html",
        {"request": request, "user": user, "stream": stream}
    )


@app.get("/streams/{stream_id}/spec", response_class=HTMLResponse)
async def view_spec(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """View production spec (Checkpoint 2)."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    return templates.TemplateResponse(
        "spec.html",
        {"request": request, "user": user, "stream": stream}
    )


@app.get("/streams/{stream_id}/keyframes", response_class=HTMLResponse)
async def view_keyframes(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """View keyframe gallery (Checkpoint 3)."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    stream_path = Path(stream["path"])

    # Find all keyframe files
    keyframes_dir = stream_path / "keyframes"
    keyframes = []

    if keyframes_dir.exists():
        # Find keyframes with any supported image extension
        keyframe_ext = get_keyframe_extension(keyframes_dir)
        for keyframe_file in sorted(keyframes_dir.glob(f"segment_*{keyframe_ext}")):
            # Extract segment ID from filename
            segment_id = keyframe_file.stem.replace("segment_", "")
            try:
                segment_id = int(segment_id)
            except ValueError:
                continue

            # Get segment info from production.json
            segment_info = None
            if stream["production"] and "segments" in stream["production"]:
                for seg in stream["production"]["segments"]:
                    if seg.get("id") == segment_id:
                        segment_info = seg
                        break

            # Check if approved
            db = get_db()
            review = db.execute(
                """SELECT decision FROM reviews
                   WHERE stream_id = ? AND segment_id = ? AND asset_type = 'keyframe'
                   ORDER BY reviewed_at DESC LIMIT 1""",
                (stream_id, segment_id)
            ).fetchone()
            db.close()

            decision = review["decision"] if review else None

            keyframes.append({
                "segment_id": segment_id,
                "path": str(keyframe_file),
                "segment": segment_info,
                "decision": decision
            })

    return templates.TemplateResponse(
        "keyframes.html",
        {"request": request, "user": user, "stream": stream, "keyframes": keyframes}
    )


@app.get("/streams/{stream_id}/videos", response_class=HTMLResponse)
async def view_videos(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """View video gallery (Checkpoint 4)."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    stream_path = Path(stream["path"])

    # Find all video files
    videos_dir = stream_path / "videos"
    keyframes_dir = stream_path / "keyframes"
    videos = []

    if stream["production"] and "segments" in stream["production"]:
        for seg in stream["production"]["segments"]:
            segment_id = seg.get("id")
            video_file = find_video_file(videos_dir, segment_id)

            # Get corresponding keyframe
            keyframe_path = find_keyframe_file(keyframes_dir, segment_id) if keyframes_dir.exists() else None

            # Check if approved
            db = get_db()
            review = db.execute(
                """SELECT decision FROM reviews
                   WHERE stream_id = ? AND segment_id = ? AND asset_type = 'video'
                   ORDER BY reviewed_at DESC LIMIT 1""",
                (stream_id, segment_id)
            ).fetchone()
            db.close()

            decision = review["decision"] if review else None

            videos.append({
                "segment_id": segment_id,
                "path": str(video_file) if video_file else None,
                "keyframe_path": str(keyframe_path) if keyframe_path else None,
                "segment": seg,
                "decision": decision,
                "exists": video_file is not None
            })

    return templates.TemplateResponse(
        "videos.html",
        {"request": request, "user": user, "stream": stream, "videos": videos}
    )


@app.post("/streams/{stream_id}/spec/segment/{segment_id}")
async def update_segment(
    request: Request,
    stream_id: str,
    segment_id: int,
    image_prompt: str = Form(...),
    motion_prompt: str = Form(None),
    user: Dict = Depends(get_current_user)
):
    """Update segment prompts."""
    print(f"[DEBUG] update_segment called: stream={stream_id}, segment={segment_id}")
    print(f"[DEBUG] motion_prompt received: {repr(motion_prompt)[:100]}")
    stream = get_stream_data(stream_id)
    if not stream or not stream["production"]:
        raise HTTPException(status_code=404, detail="Production spec not found")

    stream_path = Path(stream["path"])

    # Find and update segment
    segment_found = False
    for seg in stream["production"]["segments"]:
        if seg.get("id") == segment_id:
            seg["image_prompt"] = image_prompt
            if motion_prompt:
                seg["motion_prompt"] = motion_prompt
            segment_found = True
            break

    if not segment_found:
        raise HTTPException(status_code=404, detail="Segment not found")

    # Save production.json
    production_file = stream_path / "production.json"
    with open(production_file, "w") as f:
        json.dump(stream["production"], f, indent=2)

    # Return JSON for AJAX calls or redirect for form submissions
    accept = request.headers.get("accept", "")
    if "application/json" in accept:
        return {"status": "success", "segment_id": segment_id}
    else:
        return RedirectResponse(url=f"/streams/{stream_id}/spec", status_code=303)


@app.post("/streams/{stream_id}/approve/{segment_id}/{asset_type}")
async def approve_asset(
    stream_id: str,
    segment_id: int,
    asset_type: str,
    user: Dict = Depends(get_current_user)
):
    """Approve a keyframe or video."""
    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    db = get_db()
    db.execute(
        """INSERT INTO reviews (stream_id, segment_id, asset_type, decision, reviewed_by, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (stream_id, segment_id, asset_type, "approved", user["id"], datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

    return {"status": "approved", "segment_id": segment_id}


@app.post("/streams/{stream_id}/regenerate/{segment_id}/{asset_type}")
async def regenerate_asset(
    request: Request,
    stream_id: str,
    segment_id: int,
    asset_type: str,
    user: Dict = Depends(get_current_user)
):
    """Request regeneration of a keyframe or video."""
    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    # Record the regeneration request
    db = get_db()
    db.execute(
        """INSERT INTO reviews (stream_id, segment_id, asset_type, decision, reviewed_by, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (stream_id, segment_id, asset_type, "regenerate", user["id"], datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

    # Enqueue generation task
    if asset_type == "keyframe":
        task_id = enqueue_keyframe_generation(stream_id, segment_id, user["id"])
    else:
        task_id = enqueue_video_generation(stream_id, segment_id, user["id"])

    return {"status": "queued", "task_id": task_id, "segment_id": segment_id}


def enqueue_keyframe_generation(stream_id: str, segment_id: int, user_id: int) -> str:
    """Enqueue keyframe generation task."""
    import sys
    from pathlib import Path
    from datetime import datetime
    import shutil

    # Add pipeline/execution to path
    pipeline_path = Path(__file__).parent.parent.parent / "pipeline" / "execution"
    sys.path.insert(0, str(pipeline_path))

    from generate_frame import generate_frame

    stream_path = get_streams_dir() / stream_id
    production_file = stream_path / "production.json"

    def generate():
        # Load production.json
        with open(production_file) as f:
            production = json.load(f)

        # Find segment
        segment = None
        for seg in production["segments"]:
            if seg.get("id") == segment_id:
                segment = seg
                break

        if not segment:
            raise ValueError(f"Segment {segment_id} not found")

        # Archive existing version before generating new one
        output_path = stream_path / "keyframes" / f"segment_{segment_id}.png"
        output_path.parent.mkdir(exist_ok=True)

        versions_dir = stream_path / "keyframes" / "versions"
        versions_dir.mkdir(exist_ok=True)

        if output_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_path = versions_dir / f"segment_{segment_id}_{timestamp}.png"
            shutil.copy2(output_path, archive_path)

            # STORAGE: Clean up old versions to prevent disk space issues
            cleanup_old_versions(versions_dir, segment_id, "png", max_versions=10)

        # Generate new keyframe
        result = generate_frame(
            prompt=segment["image_prompt"],
            output_path=str(output_path),
            negative_prompt=segment.get("negative_prompt")
        )

        return output_path if result else None

    task_id = tasks.enqueue_task(
        stream_id=stream_id,
        task_type="keyframe",
        func=generate,
        segment_id=segment_id,
        user_id=user_id
    )

    return task_id


def enqueue_video_generation(stream_id: str, segment_id: int, user_id: int) -> str:
    """Enqueue video generation task."""
    import sys
    from pathlib import Path
    from datetime import datetime
    import shutil

    # Add pipeline/execution to path
    pipeline_path = Path(__file__).parent.parent.parent / "pipeline" / "execution"
    sys.path.insert(0, str(pipeline_path))

    from generate_video import generate_video

    stream_path = get_streams_dir() / stream_id
    production_file = stream_path / "production.json"
    keyframes_dir = stream_path / "keyframes"
    keyframe_path = find_keyframe_file(keyframes_dir, segment_id) if keyframes_dir.exists() else None

    def generate():
        # Load production.json
        with open(production_file) as f:
            production = json.load(f)

        # Find segment
        segment = None
        for seg in production["segments"]:
            if seg.get("id") == segment_id:
                segment = seg
                break

        if not segment:
            raise ValueError(f"Segment {segment_id} not found")

        if not keyframe_path:
            raise ValueError(f"Keyframe not found for segment {segment_id}")

        # Archive existing version before generating new one
        output_path = stream_path / "videos" / f"segment_{segment_id}.mp4"
        output_path.parent.mkdir(exist_ok=True)

        versions_dir = stream_path / "videos" / "versions"
        versions_dir.mkdir(exist_ok=True)

        if output_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_path = versions_dir / f"segment_{segment_id}_{timestamp}.mp4"
            shutil.copy2(output_path, archive_path)

            # STORAGE: Clean up old versions to prevent disk space issues
            cleanup_old_versions(versions_dir, segment_id, "mp4", max_versions=10)

        # Generate new video
        result = generate_video(
            image_path=str(keyframe_path),
            prompt=segment.get("motion_prompt", ""),
            output_path=str(output_path)
        )

        return output_path if result else None

    task_id = tasks.enqueue_task(
        stream_id=stream_id,
        task_type="video",
        func=generate,
        segment_id=segment_id,
        user_id=user_id
    )

    return task_id


@app.get("/tasks/{task_id}", response_class=HTMLResponse)
async def task_status_partial(
    request: Request,
    task_id: str
):
    """Get task status (for HTMX polling)."""
    task = tasks.get_task_status(task_id)
    if not task:
        return "<div class='text-muted'>Task not found</div>"

    return templates.TemplateResponse(
        "partials/task_status.html",
        {"request": request, "task": task}
    )


@app.post("/tasks/{task_id}/cancel")
async def cancel_task(
    task_id: str,
    user: Dict = Depends(get_current_user)
):
    """Cancel a pending or running task."""
    success = tasks.cancel_task(task_id)
    if success:
        return {"status": "cancelled", "message": "Task cancelled"}
    else:
        raise HTTPException(status_code=400, detail="Task cannot be cancelled")


@app.get("/streams/{stream_id}/assets/keyframe/{segment_id}")
async def serve_keyframe(stream_id: str, segment_id: int, user: Dict = Depends(get_current_user)):
    """Serve keyframe image."""
    from fastapi.responses import FileResponse
    stream_path = get_streams_dir() / stream_id
    keyframes_dir = stream_path / "keyframes"
    keyframe_path = find_keyframe_file(keyframes_dir, segment_id) if keyframes_dir.exists() else None

    if not keyframe_path:
        raise HTTPException(status_code=404, detail="Keyframe not found")

    # Determine media type from extension
    ext = keyframe_path.suffix.lower()
    media_types = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}
    media_type = media_types.get(ext, 'image/png')

    return FileResponse(keyframe_path, media_type=media_type)


@app.get("/streams/{stream_id}/assets/video/{segment_id}")
async def serve_video(
    request: Request,
    stream_id: str,
    segment_id: int,
    user: Dict = Depends(get_current_user)
):
    """Serve video file with streaming support."""
    stream_path = get_streams_dir() / stream_id
    videos_dir = stream_path / "videos"
    video_path = find_video_file(videos_dir, segment_id)

    if not video_path:
        raise HTTPException(status_code=404, detail="Video not found")

    # PERFORMANCE: Stream video to prevent memory issues with large files
    return stream_video_file(video_path, request)


@app.post("/streams/{stream_id}/bulk-approve")
async def bulk_approve(
    stream_id: str,
    segment_ids: str = Form(...),  # Comma-separated list
    asset_type: str = Form(...),
    user: Dict = Depends(get_current_user)
):
    """Approve multiple keyframes or videos at once."""
    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    segment_list = [int(sid.strip()) for sid in segment_ids.split(",") if sid.strip()]

    db = get_db()
    for segment_id in segment_list:
        db.execute(
            """INSERT INTO reviews (stream_id, segment_id, asset_type, decision, reviewed_by, reviewed_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (stream_id, segment_id, asset_type, "approved", user["id"], datetime.utcnow().isoformat())
        )
    db.commit()
    db.close()

    return {"status": "success", "approved": len(segment_list)}


@app.get("/streams/{stream_id}/versions/{segment_id}/{asset_type}")
async def get_versions(
    stream_id: str,
    segment_id: int,
    asset_type: str,
    user: Dict = Depends(get_current_user)
):
    """Get version history for a segment."""
    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    stream_path = get_streams_dir() / stream_id
    extension = "png" if asset_type == "keyframe" else "mp4"
    asset_dir = "keyframes" if asset_type == "keyframe" else "videos"

    versions_dir = stream_path / asset_dir / "versions"
    current_file = stream_path / asset_dir / f"segment_{segment_id}.{extension}"

    versions = []

    # Add current version
    if current_file.exists():
        stat = current_file.stat()
        versions.append({
            "filename": current_file.name,
            "timestamp": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            "is_current": True,
            "size": stat.st_size
        })

    # Add archived versions
    if versions_dir.exists():
        pattern = f"segment_{segment_id}_*.{extension}"
        for version_file in sorted(versions_dir.glob(pattern), reverse=True):
            stat = version_file.stat()
            # Extract timestamp from filename (segment_1_20260114_152030.png)
            parts = version_file.stem.split("_")
            if len(parts) >= 3:
                timestamp_str = f"{parts[-2]} {parts[-1]}"
                try:
                    ts = datetime.strptime(timestamp_str, "%Y%m%d %H%M%S")
                    formatted_ts = ts.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    formatted_ts = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            else:
                formatted_ts = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")

            versions.append({
                "filename": version_file.name,
                "timestamp": formatted_ts,
                "is_current": False,
                "size": stat.st_size
            })

    return {"versions": versions, "segment_id": segment_id, "asset_type": asset_type}


@app.get("/streams/{stream_id}/reviews/{segment_id}/{asset_type}")
async def get_segment_reviews(
    stream_id: str,
    segment_id: int,
    asset_type: str,
    user: Dict = Depends(get_current_user)
):
    """Get all reviews/notes for a specific segment and asset type."""
    db = get_db()
    rows = db.execute(
        """SELECT r.*, u.display_name, u.username
           FROM reviews r
           LEFT JOIN users u ON r.reviewed_by = u.id
           WHERE r.stream_id = ? AND r.segment_id = ? AND r.asset_type = ?
           ORDER BY r.reviewed_at DESC""",
        (stream_id, segment_id, asset_type)
    ).fetchall()
    db.close()

    reviews = []
    for row in rows:
        reviews.append({
            "id": row["id"],
            "decision": row["decision"],
            "notes": row["notes"],
            "reviewed_at": row["reviewed_at"],
            "reviewed_by": row["display_name"] or row["username"]
        })

    return {"reviews": reviews, "segment_id": segment_id, "asset_type": asset_type}


@app.post("/streams/{stream_id}/reviews/{segment_id}/{asset_type}")
async def add_review_note(
    stream_id: str,
    segment_id: int,
    asset_type: str,
    notes: str = Form(...),
    user: Dict = Depends(get_current_user)
):
    """Add a note/comment to a segment without changing approval status."""
    db = get_db()
    db.execute(
        """INSERT INTO reviews (stream_id, segment_id, asset_type, decision, notes, reviewed_by, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (stream_id, segment_id, asset_type, "comment", notes, user["id"], datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

    return {"status": "ok", "message": "Note added"}


@app.get("/streams/{stream_id}/versions/{segment_id}/{asset_type}/{filename}")
async def serve_version(
    request: Request,
    stream_id: str,
    segment_id: int,
    asset_type: str,
    filename: str,
    user: Dict = Depends(get_current_user)
):
    """Serve a specific version of an asset."""
    from fastapi.responses import FileResponse
    import os

    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    # SECURITY: Prevent path traversal attacks
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    stream_path = get_streams_dir() / stream_id
    asset_dir = "keyframes" if asset_type == "keyframe" else "videos"
    extension = "png" if asset_type == "keyframe" else "mp4"

    # SECURITY: Validate filename format
    if not filename.endswith(f".{extension}"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Check if it's the current version or archived
    current_file = stream_path / asset_dir / f"segment_{segment_id}.{extension}"
    if current_file.name == filename and current_file.exists():
        # PERFORMANCE: Stream videos to prevent memory issues
        if asset_type == "video":
            return stream_video_file(current_file, request)
        else:
            return FileResponse(current_file, media_type="image/png")

    # Check archived versions
    versions_dir = stream_path / asset_dir / "versions"
    version_file = versions_dir / filename

    # SECURITY: Ensure file is within versions directory
    try:
        version_file_resolved = version_file.resolve()
        versions_dir_resolved = versions_dir.resolve()
        if not str(version_file_resolved).startswith(str(versions_dir_resolved)):
            raise HTTPException(status_code=403, detail="Access denied")
    except:
        raise HTTPException(status_code=400, detail="Invalid path")

    if not version_file.exists():
        raise HTTPException(status_code=404, detail="Version not found")

    # PERFORMANCE: Stream videos to prevent memory issues
    if asset_type == "video":
        return stream_video_file(version_file, request)
    else:
        return FileResponse(version_file, media_type="image/png")


@app.post("/streams/{stream_id}/restore-version/{segment_id}/{asset_type}")
async def restore_version(
    stream_id: str,
    segment_id: int,
    asset_type: str,
    filename: str = Form(...),
    user: Dict = Depends(get_current_user)
):
    """Restore a previous version as the current version."""
    import shutil

    if asset_type not in ["keyframe", "video"]:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    stream_path = get_streams_dir() / stream_id
    asset_dir = "keyframes" if asset_type == "keyframe" else "videos"
    extension = "png" if asset_type == "keyframe" else "mp4"

    current_file = stream_path / asset_dir / f"segment_{segment_id}.{extension}"
    versions_dir = stream_path / asset_dir / "versions"
    version_file = versions_dir / filename

    if not version_file.exists():
        raise HTTPException(status_code=404, detail="Version not found")

    # Archive current version before restoring
    if current_file.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_path = versions_dir / f"segment_{segment_id}_{timestamp}.{extension}"
        shutil.copy2(current_file, archive_path)

        # STORAGE: Clean up old versions to prevent disk space issues
        cleanup_old_versions(versions_dir, segment_id, extension, max_versions=10)

    # Restore the selected version
    shutil.copy2(version_file, current_file)

    # Record the restore action
    db = get_db()
    db.execute(
        """INSERT INTO reviews (stream_id, segment_id, asset_type, decision, notes, reviewed_by, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (stream_id, segment_id, asset_type, "restored", f"Restored from {filename}", user["id"], datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

    return {"status": "success", "restored_from": filename}


@app.post("/streams/{stream_id}/production-settings")
async def save_production_settings(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Save production settings to production.json."""
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    stream = get_stream_data(stream_id)
    if not stream or not stream["production"]:
        raise HTTPException(status_code=404, detail="Production spec not found")

    stream_path = Path(stream["path"])

    # Update production settings
    stream["production"]["production_settings"] = {
        "text_type": data.get("text_type", "prose"),
        "sync_mode": data.get("sync_mode", "word-count"),
        "scroll_config": data.get("scroll_config", {}),
        "frame_targets": data.get("frame_targets", {"high": 140, "performance": 40}),
        "quality_tiers": ["high", "performance"]
    }

    # Save production.json
    production_file = stream_path / "production.json"
    with open(production_file, "w") as f:
        json.dump(stream["production"], f, indent=2)

    return {"status": "success"}


@app.post("/streams/{stream_id}/analyze-input")
async def analyze_input_endpoint(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Run text analysis on input.json."""
    import sys
    from pathlib import Path

    # Add pipeline/execution to path
    pipeline_path = Path(__file__).parent.parent.parent / "pipeline" / "execution"
    sys.path.insert(0, str(pipeline_path))

    try:
        from analyze_input import analyze_input
        analysis = analyze_input(stream_id)
        return {"status": "success", "analysis": analysis}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/streams/{stream_id}/update-input")
async def update_input(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Update input.json with edited title, story, language, and notes."""
    try:
        data = await request.json()
    except:
        return JSONResponse({"status": "error", "error": "Invalid JSON"}, status_code=400)

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("input"):
        return JSONResponse({"status": "error", "error": "No input.json found"}, status_code=404)

    stream_path = Path(stream["path"])
    input_file = stream_path / "input.json"

    # Update fields
    input_data = stream["input"]
    if data.get("title"):
        input_data["title"] = data["title"].strip()
    if data.get("story"):
        input_data["story"] = data["story"]
    if data.get("language"):
        input_data["language"] = data["language"]

    # Handle notes/brief
    notes = data.get("notes", "").strip()
    if notes:
        if "brief" not in input_data:
            input_data["brief"] = {}
        input_data["brief"]["notes"] = notes
    elif "brief" in input_data and "notes" in input_data["brief"]:
        # Clear notes if empty
        del input_data["brief"]["notes"]
        if not input_data["brief"]:
            del input_data["brief"]

    # Add updated timestamp
    input_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
    input_data["updated_by"] = user.get("display_name") or user.get("username", "Unknown")

    # Save
    with open(input_file, "w") as f:
        json.dump(input_data, f, indent=2, ensure_ascii=False)

    return {"status": "success"}


@app.post("/streams/{stream_id}/generate-spec")
async def generate_production_spec(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Create a job for Claude Code to generate production.json from input.json."""
    import time

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("input"):
        return JSONResponse({"status": "error", "error": "No input.json found - add story text first"}, status_code=400)
    if stream.get("production"):
        return JSONResponse({"status": "error", "error": "Production spec already exists"}, status_code=409)

    # Create job file for Claude Code to process
    jobs_dir = Path(__file__).parent.parent / "jobs" / "pending"
    jobs_dir.mkdir(parents=True, exist_ok=True)

    job_id = f"production-spec-{int(time.time() * 1000)}"
    job_file = jobs_dir / f"{job_id}.json"

    job_data = {
        "type": "production-spec",
        "id": job_id,
        "stream_id": stream_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": user.get("display_name") or user.get("username", "Unknown"),
        "input_path": str(Path(stream["path"]) / "input.json"),
        "output_path": str(Path(stream["path"]) / "production.json"),
        "status": "pending"
    }

    with open(job_file, "w") as f:
        json.dump(job_data, f, indent=2)

    # Trigger immediate processing
    trigger_job_processor(job_id)

    return {"status": "queued", "job_id": job_id}


@app.get("/streams/{stream_id}/check-production")
async def check_production_spec(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Check if production.json exists for a stream."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    has_production = stream.get("production") is not None
    return {"exists": has_production}


@app.post("/streams/{stream_id}/regenerate-spec")
async def regenerate_production_spec(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Create a job for Claude Code to revise production.json with feedback."""
    import time

    try:
        data = await request.json()
    except:
        return JSONResponse({"status": "error", "error": "Invalid JSON"}, status_code=400)

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("production"):
        return JSONResponse({"status": "error", "error": "No production spec to revise"}, status_code=400)

    feedback = data.get("feedback", "").strip()
    presets = data.get("presets", [])

    if not feedback and not presets:
        return JSONResponse({"status": "error", "error": "Please provide feedback or select direction presets"}, status_code=400)

    # Create job file for Claude Code to process
    jobs_dir = Path(__file__).parent.parent / "jobs" / "pending"
    jobs_dir.mkdir(parents=True, exist_ok=True)

    job_id = f"spec-revision-{int(time.time() * 1000)}"
    job_file = jobs_dir / f"{job_id}.json"

    job_data = {
        "type": "production-spec-revision",
        "id": job_id,
        "stream_id": stream_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": user.get("display_name") or user.get("username", "Unknown"),
        "input_path": str(Path(stream["path"]) / "input.json"),
        "production_path": str(Path(stream["path"]) / "production.json"),
        "feedback": feedback,
        "direction_presets": presets,
        "status": "pending"
    }

    with open(job_file, "w") as f:
        json.dump(job_data, f, indent=2)

    trigger_job_processor(job_id)
    return {"status": "queued", "job_id": job_id}


@app.post("/streams/{stream_id}/generate-keyframes")
async def generate_keyframes(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Create a job for Claude Code to generate keyframe images."""
    import time

    try:
        data = await request.json()
    except:
        data = {}

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("production"):
        return JSONResponse({"status": "error", "error": "No production spec found"}, status_code=400)

    mode = data.get("mode", "all")  # 'all' or 'missing'

    # Create job file for Claude Code to process
    jobs_dir = Path(__file__).parent.parent / "jobs" / "pending"
    jobs_dir.mkdir(parents=True, exist_ok=True)

    job_id = f"keyframes-{int(time.time() * 1000)}"
    job_file = jobs_dir / f"{job_id}.json"

    job_data = {
        "type": "generate-keyframes",
        "id": job_id,
        "stream_id": stream_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": user.get("display_name") or user.get("username", "Unknown"),
        "stream_path": stream["path"],
        "production_path": str(Path(stream["path"]) / "production.json"),
        "mode": mode,
        "status": "pending"
    }

    with open(job_file, "w") as f:
        json.dump(job_data, f, indent=2)

    # Trigger immediate processing
    trigger_job_processor(job_id)

    return {"status": "queued", "job_id": job_id}


@app.post("/streams/{stream_id}/generate-videos")
async def generate_videos(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Create a job for Claude Code to generate videos from keyframes."""
    import time

    try:
        data = await request.json()
    except:
        data = {}

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("production"):
        return JSONResponse({"status": "error", "error": "No production spec found"}, status_code=400)

    mode = data.get("mode", "all")  # 'all' or 'missing'

    # Create job file for Claude Code to process
    jobs_dir = Path(__file__).parent.parent / "jobs" / "pending"
    jobs_dir.mkdir(parents=True, exist_ok=True)

    job_id = f"videos-{int(time.time() * 1000)}"
    job_file = jobs_dir / f"{job_id}.json"

    job_data = {
        "type": "generate-videos",
        "id": job_id,
        "stream_id": stream_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": user.get("display_name") or user.get("username", "Unknown"),
        "stream_path": stream["path"],
        "production_path": str(Path(stream["path"]) / "production.json"),
        "mode": mode,
        "status": "pending"
    }

    with open(job_file, "w") as f:
        json.dump(job_data, f, indent=2)

    # Trigger immediate processing
    trigger_job_processor(job_id)

    return {"status": "queued", "job_id": job_id}


@app.post("/streams/{stream_id}/finalize")
async def finalize_stream(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Create a job for Claude Code to finalize the stream into a Next.js app."""
    import time

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")
    if not stream.get("production"):
        return JSONResponse({"status": "error", "error": "No production spec found"}, status_code=400)

    # Check that all videos are approved
    progress = calculate_progress(stream)
    if progress["videos_approved"] < progress["total_segments"]:
        return JSONResponse({
            "status": "error",
            "error": f"Not all videos approved ({progress['videos_approved']}/{progress['total_segments']})"
        }, status_code=400)

    # Create job file for Claude Code to process
    jobs_dir = Path(__file__).parent.parent / "jobs" / "pending"
    jobs_dir.mkdir(parents=True, exist_ok=True)

    job_id = f"finalize-{int(time.time() * 1000)}"
    job_file = jobs_dir / f"{job_id}.json"

    # Output path for the final stream app
    output_path = str(Path(__file__).parent.parent.parent / f"stream-{stream_id}")

    job_data = {
        "type": "finalize-stream",
        "id": job_id,
        "stream_id": stream_id,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "created_by": user.get("display_name") or user.get("username", "Unknown"),
        "stream_path": stream["path"],
        "production_path": str(Path(stream["path"]) / "production.json"),
        "output_path": output_path,
        "status": "pending"
    }

    with open(job_file, "w") as f:
        json.dump(job_data, f, indent=2)

    # Trigger immediate processing
    trigger_job_processor(job_id)

    return {"status": "queued", "job_id": job_id, "output_path": output_path}


@app.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """
    Check the status of a job by looking at job file locations.

    Jobs move through: pending/ → processing/ → completed/ or failed/
    """
    project_root = Path(__file__).parent.parent
    jobs_dir = project_root / "jobs"

    # Check each directory in order of priority
    locations = [
        ("completed", jobs_dir / "completed" / f"{job_id}.json"),
        ("failed", jobs_dir / "failed" / f"{job_id}.json"),
        ("processing", jobs_dir / "processing" / f"{job_id}.json"),
        ("pending", jobs_dir / "pending" / f"{job_id}.json"),
    ]

    for status, path in locations:
        if path.exists():
            try:
                with open(path) as f:
                    job_data = json.load(f)
                return {
                    "status": status,
                    "job_id": job_id,
                    "stream_id": job_data.get("stream_id"),
                    "output_path": job_data.get("output_path"),
                    "error": job_data.get("error"),
                    "completed_at": job_data.get("completed_at"),
                }
            except:
                return {"status": status, "job_id": job_id}

    return {"status": "not_found", "job_id": job_id}


@app.post("/streams/{stream_id}/deploy")
async def deploy_stream(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Deploy a finalized stream to Vercel."""
    import time
    import subprocess

    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    # Check that stream is finalized
    progress = calculate_progress(stream)
    if not progress.get("finalized"):
        return JSONResponse({
            "status": "error",
            "error": "Stream must be finalized first"
        }, status_code=400)

    finalized_path = Path(progress["finalized_path"])

    # Get Vercel token from environment
    vercel_token = os.environ.get("VERCEL_TOKEN")
    if not vercel_token:
        return JSONResponse({
            "status": "error",
            "error": "VERCEL_TOKEN not configured. Add it to .env file."
        }, status_code=500)

    # Deploy to Vercel using CLI with token
    try:
        cmd = ["vercel", "deploy", "--prod", "--yes", "--token", vercel_token]
        result = subprocess.run(
            cmd,
            cwd=str(finalized_path),
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            return JSONResponse({
                "status": "error",
                "error": f"Vercel deploy failed: {result.stderr}"
            }, status_code=500)

        # Extract URL from output (last line usually contains the URL)
        deploy_url = result.stdout.strip().split('\n')[-1]

        # Save deployment info
        deployment_data = {
            "url": deploy_url,
            "deployed_at": datetime.utcnow().isoformat() + "Z",
            "deployed_by": user.get("display_name") or user.get("username", "Unknown"),
            "platform": "vercel"
        }

        deployment_file = Path(stream["path"]) / "deployment.json"
        with open(deployment_file, "w") as f:
            json.dump(deployment_data, f, indent=2)

        # Register with analytics
        try:
            register_cmd = [
                str(project_root / "infrastructure/analytics/register_stream.sh"),
                stream_id,
                deploy_url
            ]
            subprocess.run(
                register_cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            # Non-critical - don't fail deployment if registration fails
        except Exception as e:
            print(f"Warning: Analytics registration failed: {e}")

        return {"status": "success", "url": deploy_url}

    except subprocess.TimeoutExpired:
        return JSONResponse({
            "status": "error",
            "error": "Deployment timed out after 5 minutes"
        }, status_code=500)
    except FileNotFoundError:
        return JSONResponse({
            "status": "error",
            "error": "Vercel CLI not found. Install with: npm i -g vercel"
        }, status_code=500)
    except Exception as e:
        return JSONResponse({
            "status": "error",
            "error": str(e)
        }, status_code=500)


@app.get("/streams/{stream_id}/progress")
async def get_stream_progress(
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Get current generation progress for a stream."""
    stream = get_stream_data(stream_id)
    if not stream:
        raise HTTPException(status_code=404, detail="Stream not found")

    progress = calculate_progress(stream)
    return {
        "total_segments": progress["total_segments"],
        "keyframes_generated": progress["keyframes_generated"],
        "keyframes_approved": progress["keyframes_approved"],
        "videos_generated": progress["videos_generated"],
        "videos_approved": progress["videos_approved"]
    }


@app.post("/streams/{stream_id}/section-heights")
async def save_section_heights(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Save section scroll heights to production.json."""
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    stream = get_stream_data(stream_id)
    if not stream or not stream["production"]:
        raise HTTPException(status_code=404, detail="Production spec not found")

    stream_path = Path(stream["path"])
    sections_data = data.get("sections", [])

    # Update sections in production.json
    for section_update in sections_data:
        section_id = section_update.get("id")
        for section in stream["production"].get("sections", []):
            if section.get("id") == section_id:
                # Update scroll heights (None means remove/use default)
                if section_update.get("scroll_height") is not None:
                    section["scroll_height"] = section_update["scroll_height"]
                elif "scroll_height" in section:
                    del section["scroll_height"]

                if section_update.get("min_scroll_height") is not None:
                    section["min_scroll_height"] = section_update["min_scroll_height"]
                elif "min_scroll_height" in section:
                    del section["min_scroll_height"]
                break

    # Save production.json
    production_file = stream_path / "production.json"
    with open(production_file, "w") as f:
        json.dump(stream["production"], f, indent=2)

    return {"status": "success"}


@app.post("/streams/{stream_id}/extract-frames")
async def extract_frames_endpoint(
    request: Request,
    stream_id: str,
    user: Dict = Depends(get_current_user)
):
    """Queue frame extraction for specified quality tier(s)."""
    try:
        data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    tier = data.get("tier", "both")
    high_frames = data.get("high_frames", 140)
    perf_frames = data.get("perf_frames", 40)

    import sys
    from pathlib import Path

    # Add pipeline/execution to path
    pipeline_path = Path(__file__).parent.parent.parent / "pipeline" / "execution"
    sys.path.insert(0, str(pipeline_path))

    from extract_frames_dual import extract_dual_tiers, update_production_spec

    def run_extraction():
        tiers = ["high", "performance"] if tier == "both" else [tier]
        frame_targets = {
            "high": high_frames,
            "performance": perf_frames
        }
        results = extract_dual_tiers(stream_id, tiers=tiers, frame_targets=frame_targets)
        update_production_spec(stream_id, results)
        return results

    task_id = tasks.enqueue_task(
        stream_id=stream_id,
        task_type="frame_extraction",
        func=run_extraction,
        segment_id=0,  # Not segment-specific
        user_id=user["id"]
    )

    return {"status": "queued", "task_id": task_id}


# =============================================================================
# CLAUDE-DIRECTOR MESSAGING
# =============================================================================

@app.get("/messages")
async def get_messages(
    stream_id: str = None,
    unread_only: bool = False,
    limit: int = 50,
    user: Dict = Depends(get_current_user)
):
    """Get messages from Claude. Optionally filter by stream or unread status."""
    db = get_db()

    query = "SELECT * FROM messages WHERE 1=1"
    params = []

    if stream_id:
        query += " AND (stream_id = ? OR stream_id IS NULL)"
        params.append(stream_id)

    if unread_only:
        query += " AND read_at IS NULL"

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    messages = db.execute(query, params).fetchall()

    return {
        "messages": [dict(m) for m in messages],
        "unread_count": db.execute(
            "SELECT COUNT(*) as count FROM messages WHERE read_at IS NULL"
        ).fetchone()["count"]
    }


@app.post("/messages")
async def send_message(request: Request):
    """
    Send a message from Claude to the director.
    Used by Claude on Hetzner to communicate suggestions, requests, etc.
    No auth required - Claude calls this from job processing.
    """
    try:
        data = await request.json()
    except:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    content = data.get("content", "").strip()
    if not content:
        return JSONResponse({"error": "Message content required"}, status_code=400)

    db = get_db()
    cursor = db.execute(
        """INSERT INTO messages (stream_id, job_id, sender, message_type, content, options, created_at)
           VALUES (?, ?, 'claude', ?, ?, ?, ?)""",
        (
            data.get("stream_id"),
            data.get("job_id"),
            data.get("message_type", "info"),
            content,
            json.dumps(data.get("options")) if data.get("options") else None,
            datetime.utcnow().isoformat() + "Z"
        )
    )
    db.commit()

    return {"status": "sent", "message_id": cursor.lastrowid}


@app.post("/messages/{message_id}/respond")
async def respond_to_message(
    message_id: int,
    request: Request,
    user: Dict = Depends(get_current_user)
):
    """Director responds to a Claude message (e.g., approval request)."""
    try:
        data = await request.json()
    except:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    response = data.get("response", "").strip()
    if not response:
        return JSONResponse({"error": "Response required"}, status_code=400)

    db = get_db()
    db.execute(
        """UPDATE messages SET response = ?, responded_at = ?, read_at = ?
           WHERE id = ?""",
        (response, datetime.utcnow().isoformat() + "Z", datetime.utcnow().isoformat() + "Z", message_id)
    )
    db.commit()

    return {"status": "responded"}


@app.post("/messages/{message_id}/read")
async def mark_message_read(
    message_id: int,
    user: Dict = Depends(get_current_user)
):
    """Mark a message as read."""
    db = get_db()
    db.execute(
        "UPDATE messages SET read_at = ? WHERE id = ? AND read_at IS NULL",
        (datetime.utcnow().isoformat() + "Z", message_id)
    )
    db.commit()
    return {"status": "marked_read"}


@app.get("/messages/{message_id}/poll")
async def poll_message_response(message_id: int):
    """
    Poll for director's response to a message.
    Used by Claude to wait for approval before proceeding.
    No auth - Claude calls this from job processing.
    """
    db = get_db()
    message = db.execute(
        "SELECT response, responded_at FROM messages WHERE id = ?",
        (message_id,)
    ).fetchone()

    if not message:
        return JSONResponse({"error": "Message not found"}, status_code=404)

    if message["response"]:
        return {"status": "responded", "response": message["response"], "responded_at": message["responded_at"]}
    else:
        return {"status": "pending"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "director"}
