#!/bin/bash
# respond_to_emails.sh
# Uses Claude Code to draft and send responses to support emails
# Called by cron after process_support.sh moves jobs to review/

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JOBS_DIR="$SCRIPT_DIR/jobs"
REVIEW="$JOBS_DIR/review"
COMPLETED="$JOBS_DIR/completed"
FAILED="$JOBS_DIR/failed"

# Load environment, alerts, and sanitization
cd "$PROJECT_DIR"
source .env 2>/dev/null || true
source "$SCRIPT_DIR/lib/alerts.sh" 2>/dev/null || true
source "$SCRIPT_DIR/lib/sanitize.sh" 2>/dev/null || true

# Rate limiting: Max 20 email responses per day
RATE_LIMIT_FILE="$JOBS_DIR/.email_rate_limit"
TODAY=$(date '+%Y-%m-%d')

# Initialize or reset rate limit counter
if [ -f "$RATE_LIMIT_FILE" ]; then
    RATE_DATE=$(head -1 "$RATE_LIMIT_FILE" 2>/dev/null)
    if [ "$RATE_DATE" = "$TODAY" ]; then
        EMAILS_TODAY=$(tail -1 "$RATE_LIMIT_FILE" 2>/dev/null || echo "0")
    else
        # New day, reset counter
        EMAILS_TODAY=0
        echo "$TODAY" > "$RATE_LIMIT_FILE"
        echo "0" >> "$RATE_LIMIT_FILE"
    fi
else
    EMAILS_TODAY=0
    echo "$TODAY" > "$RATE_LIMIT_FILE"
    echo "0" >> "$RATE_LIMIT_FILE"
fi

MAX_EMAILS_PER_DAY=20

# Ensure directories exist
mkdir -p "$COMPLETED" "$FAILED"

# Check for required env vars
if [ -z "$RESEND_API_KEY" ]; then
    alert_error "Missing RESEND_API_KEY" "Cannot send email responses without API key"
    exit 1
fi

# Pull latest
safe_git_pull "$PROJECT_DIR" || true

# Process support emails in review
EMAILS_SENT=0
EMAILS_FAILED=0

for job_file in "$REVIEW"/support-*.json; do
    [ -f "$job_file" ] || continue

    JOB_ID=$(basename "$job_file" .json)
    echo "=== Responding to: $JOB_ID ==="

    # Check rate limit
    if [ "$EMAILS_TODAY" -ge "$MAX_EMAILS_PER_DAY" ]; then
        alert_warning "Daily email limit reached" "Skipping $JOB_ID - already sent $EMAILS_TODAY emails today (max $MAX_EMAILS_PER_DAY)"
        # Keep in review for tomorrow
        continue
    fi

    # Extract email details
    FROM=$(jq -r '.from' "$job_file" 2>/dev/null)
    SUBJECT=$(jq -r '.subject' "$job_file" 2>/dev/null)
    TEXT=$(jq -r '.text // .html // "No content"' "$job_file" 2>/dev/null)
    MESSAGE_ID=$(jq -r '.message_id // ""' "$job_file" 2>/dev/null)

    if [ -z "$FROM" ] || [ "$FROM" = "null" ]; then
        alert_error "Invalid job file" "Job $JOB_ID has no sender address"
        mv "$job_file" "$FAILED/"
        continue
    fi

    echo "From: $FROM"
    echo "Subject: $SUBJECT"
    echo "---"

    # Check for spam
    if detect_spam "$TEXT"; then
        alert_warning "Spam detected" "Job $JOB_ID from $FROM appears to be spam - skipping"
        mv "$job_file" "$FAILED/"
        continue
    fi

    # Build safe prompt using sanitization library
    PROMPT=$(build_email_prompt "$FROM" "$SUBJECT" "$TEXT")

    # Call Claude Code to draft response
    echo "Calling Claude to draft response..."
    RESPONSE=$(cd "$PROJECT_DIR" && claude -p "$PROMPT" --print 2>&1)
    CLAUDE_EXIT=$?

    if [ $CLAUDE_EXIT -ne 0 ] || [ -z "$RESPONSE" ]; then
        alert_error "Claude failed to draft response" "Job: $JOB_ID, Exit code: $CLAUDE_EXIT"
        # Don't move to failed yet - maybe retry on next cron
        EMAILS_FAILED=$((EMAILS_FAILED + 1))
        continue
    fi

    # Validate response before sending
    if ! validate_response "$RESPONSE" 2000; then
        alert_error "Response validation failed" "Job: $JOB_ID - response may contain sensitive data or be malformed"
        EMAILS_FAILED=$((EMAILS_FAILED + 1))
        # Keep in review for manual inspection
        continue
    fi

    echo "Draft response:"
    echo "$RESPONSE"
    echo "---"

    # Prepare reply subject
    if [[ "$SUBJECT" == Re:* ]]; then
        REPLY_SUBJECT="$SUBJECT"
    else
        REPLY_SUBJECT="Re: $SUBJECT"
    fi

    # Build headers for threading
    HEADERS=""
    if [ -n "$MESSAGE_ID" ] && [ "$MESSAGE_ID" != "null" ]; then
        HEADERS=",\"headers\": {\"In-Reply-To\": \"$MESSAGE_ID\", \"References\": \"$MESSAGE_ID\"}"
    fi

    # Send via Resend
    echo "Sending response..."
    SEND_RESULT=$(curl -s -X POST 'https://api.resend.com/emails' \
        -H "Authorization: Bearer $RESEND_API_KEY" \
        -H 'Content-Type: application/json' \
        -d "{
            \"from\": \"DownStream <hello@downstream.ink>\",
            \"to\": [\"$FROM\"],
            \"subject\": \"$REPLY_SUBJECT\",
            \"text\": $(echo "$RESPONSE" | jq -Rs .)
            $HEADERS
        }")

    # Check if send succeeded
    if echo "$SEND_RESULT" | jq -e '.id' > /dev/null 2>&1; then
        echo "Email sent successfully!"
        EMAILS_SENT=$((EMAILS_SENT + 1))

        # Update rate limit counter
        EMAILS_TODAY=$((EMAILS_TODAY + 1))
        echo "$TODAY" > "$RATE_LIMIT_FILE"
        echo "$EMAILS_TODAY" >> "$RATE_LIMIT_FILE"

        # Move to completed
        mv "$job_file" "$COMPLETED/"

        # Log to operations
        LOG_FILE="$PROJECT_DIR/chronicle/OPERATIONS.md"
        {
            echo ""
            echo "### $(date '+%Y-%m-%d %H:%M') — auto:email-response"
            echo ""
            echo "**To:** $FROM"
            echo "**Subject:** $REPLY_SUBJECT"
            echo ""
            echo "**Response:**"
            echo '```'
            echo "$RESPONSE"
            echo '```'
            echo ""
        } >> "$LOG_FILE"
    else
        ERROR_MSG=$(echo "$SEND_RESULT" | jq -r '.message // .error // "Unknown error"' 2>/dev/null)
        alert_error "Failed to send email" "Job: $JOB_ID, To: $FROM, Error: $ERROR_MSG"
        EMAILS_FAILED=$((EMAILS_FAILED + 1))
        # Keep in review for retry
    fi

    echo "=== Done: $JOB_ID ==="
    echo ""
done

# Commit any changes
if [ $EMAILS_SENT -gt 0 ]; then
    safe_git_push "$PROJECT_DIR" "[auto:email] Responded to $EMAILS_SENT support emails"
fi

# Summary
if [ $EMAILS_FAILED -gt 0 ]; then
    echo "WARNING: $EMAILS_FAILED emails failed to send"
fi
echo "Email response complete. Sent: $EMAILS_SENT, Failed: $EMAILS_FAILED"
