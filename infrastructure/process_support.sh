#!/bin/bash
# process_support.sh
# Process incoming support emails
# Called by cron, moves emails from pending to review for Claude to respond

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JOBS_DIR="$SCRIPT_DIR/jobs"
PENDING="$JOBS_DIR/pending"
PROCESSING="$JOBS_DIR/processing"

# Load environment and alerts
cd "$PROJECT_DIR"
source .env 2>/dev/null || true
source "$SCRIPT_DIR/lib/alerts.sh" 2>/dev/null || true

# Ensure directories exist
mkdir -p "$PROCESSING" "$JOBS_DIR/review"

# Pull latest (may have new support jobs from webhook)
safe_git_pull "$PROJECT_DIR" || true

# Find support email jobs
JOBS_PROCESSED=0
for job_file in "$PENDING"/support-*.json; do
    [ -f "$job_file" ] || continue

    JOB_ID=$(basename "$job_file" .json)
    echo "Processing support email: $JOB_ID"

    # Move to processing
    if ! mv "$job_file" "$PROCESSING/"; then
        alert_error "Failed to move job to processing" "Job: $JOB_ID"
        continue
    fi

    # Extract email details
    FROM=$(jq -r '.from' "$PROCESSING/$JOB_ID.json" 2>/dev/null)
    SUBJECT=$(jq -r '.subject' "$PROCESSING/$JOB_ID.json" 2>/dev/null)
    TEXT=$(jq -r '.text' "$PROCESSING/$JOB_ID.json" 2>/dev/null)

    if [ -z "$FROM" ] || [ "$FROM" = "null" ]; then
        alert_error "Invalid job file" "Job $JOB_ID has no 'from' field"
        mv "$PROCESSING/$JOB_ID.json" "$JOBS_DIR/failed/"
        continue
    fi

    echo "From: $FROM"
    echo "Subject: $SUBJECT"
    echo "---"

    # Log to operations
    LOG_FILE="$PROJECT_DIR/chronicle/OPERATIONS.md"
    {
        echo ""
        echo "### $(date '+%Y-%m-%d %H:%M') — webhook:email"
        echo ""
        echo "**From:** $FROM"
        echo "**Subject:** $SUBJECT"
        echo ""
        echo "**Content:**"
        echo '```'
        echo "$TEXT" | head -20
        echo '```'
        echo ""
        echo "**Status:** Pending Claude response"
        echo ""
    } >> "$LOG_FILE"

    # Move to review for Claude to handle
    if ! mv "$PROCESSING/$JOB_ID.json" "$JOBS_DIR/review/"; then
        alert_error "Failed to move job to review" "Job: $JOB_ID"
        continue
    fi

    JOBS_PROCESSED=$((JOBS_PROCESSED + 1))
    echo "Support email logged and queued for review"
done

# Commit any changes
if [ $JOBS_PROCESSED -gt 0 ]; then
    safe_git_push "$PROJECT_DIR" "[cron:support] Processed $JOBS_PROCESSED support emails"
fi

echo "Support processing complete. Jobs processed: $JOBS_PROCESSED"
