#!/bin/bash
# process_jobs.sh
# Runs via cron every 5 minutes. Picks up pending jobs and spawns Claude Code to process them.

set -e

PROJECT_DIR="${PROJECT_DIR:-/root/downstream.ink}"
JOBS_DIR="$PROJECT_DIR/infrastructure/jobs"
LOG_FILE="$PROJECT_DIR/logs/processor.log"

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$JOBS_DIR/pending" "$JOBS_DIR/processing" "$JOBS_DIR/review" "$JOBS_DIR/completed" "$JOBS_DIR/failed"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check for pending jobs
for job_file in "$JOBS_DIR/pending"/*.json; do
    [ -e "$job_file" ] || continue

    job_id=$(basename "$job_file" .json)
    job_type=$(jq -r '.type // "unknown"' "$job_file")
    stream_id=$(jq -r '.stream_id // "unknown"' "$job_file")

    log "Found pending job: $job_id (type: $job_type, stream: $stream_id)"

    # Move to processing
    mv "$job_file" "$JOBS_DIR/processing/"
    log "Moved to processing: $job_id"

    # Build prompt based on job type
    case "$job_type" in
        "generate-keyframes")
            PROMPT="You are processing a keyframe generation job for DownStream.

Job file: $JOBS_DIR/processing/$job_id.json
Stream ID: $stream_id

TASK: Generate keyframes for all segments in this stream.
1. Read the job file to get stream_path and mode
2. Read production.json from the stream
3. For each segment, generate a keyframe using the keyframe_prompt
4. Save keyframes to {stream_path}/keyframes/segment_{n}_keyframe.png
5. Move job to completed/ when done

Use the generate_frame.py script or Gemini API directly.
Log progress to chronicle/OPERATIONS.md."
            ;;
        "generate-videos")
            PROMPT="You are processing a video generation job for DownStream.

Job file: $JOBS_DIR/processing/$job_id.json
Stream ID: $stream_id

TASK: Generate videos from keyframes for this stream.
1. Read the job file to get stream_path and mode
2. For each segment with a keyframe, generate a video
3. Save videos to {stream_path}/videos/segment_{n}.mp4
4. Extract frames to {stream_path}/frames/segment_{n}/ as webp files
5. Move job to completed/ when done

Use the generate_video.py script.
Log progress to chronicle/OPERATIONS.md."
            ;;
        "finalize-stream")
            PROMPT="You are processing a stream finalization job for DownStream.

Job file: $JOBS_DIR/processing/$job_id.json
Stream ID: $stream_id

TASK: Build the Next.js app for this stream.
1. Read the job file to get stream_path and output_path
2. Read production.json for stream configuration
3. Generate the Next.js app using the finalize-stream skill
4. The app should be created at {output_path}
5. Move job to completed/ when done

Use the finalize-stream skill from pipeline/skills/.
Log progress to chronicle/OPERATIONS.md."
            ;;
        "production-spec")
            PROMPT="You are processing a production spec job for DownStream.

Job file: $JOBS_DIR/processing/$job_id.json
Stream ID: $stream_id

TASK: Create production.json from input.json.
1. Read the job file to get input_path and output_path
2. Read input.json (story text, title, style preferences)
3. IMPORTANT: If input.json has segment_count, use EXACTLY that many segments
4. Create production.json breaking the story into visual segments
5. Each segment needs: text_content, keyframe_prompt, motion_prompt, duration
6. Move job to completed/ when done

Use the create-production-spec skill from pipeline/skills/.
Log progress to chronicle/OPERATIONS.md."
            ;;
        *)
            PROMPT="You are processing a job for DownStream.

Job file: $JOBS_DIR/processing/$job_id.json
Job type: $job_type
Stream ID: $stream_id

Read the job file and execute the appropriate task.
Move job to completed/ on success, failed/ on error.
Log progress to chronicle/OPERATIONS.md."
            ;;
    esac

    # Write prompt to temp file to avoid shell escaping issues
    PROMPT_FILE="/tmp/claude_prompt_${job_id}.txt"
    echo "$PROMPT" > "$PROMPT_FILE"
    chmod 644 "$PROMPT_FILE"

    # Spawn Claude Code to process this job (run from project dir)
    # Run as 'downstream' user since --dangerously-skip-permissions cannot be used as root
    # Use -p for non-interactive output, --dangerously-skip-permissions to allow file writes
    su - downstream -c "cd '$PROJECT_DIR' && claude -p \"\$(cat $PROMPT_FILE)\" --dangerously-skip-permissions" 2>&1 | tee -a "$LOG_FILE"

    exit_code=${PIPESTATUS[0]}

    # Clean up prompt file
    rm -f "$PROMPT_FILE"

    if [ $exit_code -eq 0 ]; then
        mv "$JOBS_DIR/processing/$job_id.json" "$JOBS_DIR/completed/"
        log "Completed: $job_id"
    else
        mv "$JOBS_DIR/processing/$job_id.json" "$JOBS_DIR/failed/"
        log "Failed: $job_id (exit code: $exit_code)"
    fi
done

log "Job processor run complete"
