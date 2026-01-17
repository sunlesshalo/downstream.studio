#!/bin/bash
# review_streams.sh
# Runs via cron every 15 minutes. Reviews generated streams before delivery.

set -e

PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
JOBS_DIR="$PROJECT_DIR/infrastructure/jobs"
LOG_FILE="$PROJECT_DIR/logs/reviewer.log"

mkdir -p "$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check for streams awaiting review
for job_file in "$JOBS_DIR/review"/*.json; do
    [ -e "$job_file" ] || continue

    stream_id=$(basename "$job_file" .json)
    log "Reviewing stream: $stream_id"

    # Spawn Claude Code to review and decide
    claude --print "
You are reviewing a generated stream before customer delivery.

Stream ID: $stream_id
Job file: $JOBS_DIR/review/$stream_id.json

REVIEW STEPS:
1. Read the job file to get customer info and expectations
2. Look at the generated content in pipeline/streams/$stream_id/
   - Check keyframes: Are they coherent? Match the story tone?
   - Check videos: Do they flow well? Any glitches?
   - Check the production.json: Does the text/visual pairing work?
3. Make a decision:
   - APPROVE: Deploy to Vercel, send customer notification, move to completed/
   - REGENERATE: Note which segments need redo, move back to pending/ with instructions
   - FAIL: If fundamentally broken, refund customer, move to failed/

Log your review notes and decision to memory/ACTION_LOG.md.
Update memory/FINANCES.md if you deploy (delivery = revenue recognized).

Be honest about quality. A bad delivery hurts reputation more than a delay.
" --cwd "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

    exit_code=${PIPESTATUS[0]}
    log "Review complete for $stream_id (exit: $exit_code)"
done

log "Review run complete"
