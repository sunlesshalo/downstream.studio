#!/bin/bash
# Send weekly stats emails to customers
#
# Called by cron every Monday at 9:00 UTC
# Queries analytics API for each stream with a customer email
# and sends formatted stats via the main email system

set -e

PROJECT_DIR="${PROJECT_DIR:-/root/downstream.ink}"
ANALYTICS_API="${ANALYTICS_API:-http://localhost:8082}"
DB_PATH="${DS_ANALYTICS_DB:-/var/lib/downstream/analytics.db}"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting weekly stats email job"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    log "ERROR: Database not found at $DB_PATH"
    exit 1
fi

# Get all streams with customer emails
streams=$(sqlite3 "$DB_PATH" "SELECT id, title, customer_email, deployment_url FROM streams WHERE customer_email IS NOT NULL AND customer_email != ''" 2>/dev/null || echo "")

if [ -z "$streams" ]; then
    log "No streams with customer emails found"
    exit 0
fi

sent_count=0
error_count=0

# Process each stream
echo "$streams" | while IFS='|' read -r stream_id title customer_email deployment_url; do
    if [ -z "$stream_id" ] || [ -z "$customer_email" ]; then
        continue
    fi

    log "Processing: $stream_id -> $customer_email"

    # Get stats from API
    stats=$(curl -s "$ANALYTICS_API/api/email-stats/$stream_id" 2>/dev/null || echo "")

    if [ -z "$stats" ] || echo "$stats" | grep -q '"error"'; then
        log "  WARNING: Failed to get stats for $stream_id"
        ((error_count++)) || true
        continue
    fi

    # Extract key metrics
    views=$(echo "$stats" | jq -r '.headline_stats.views // 0')
    unique=$(echo "$stats" | jq -r '.headline_stats.unique_visitors // 0')
    completion=$(echo "$stats" | jq -r '.headline_stats.completion_rate // "0%"')
    reading_time=$(echo "$stats" | jq -r '.headline_stats.avg_reading_time // "0s"')

    # Skip if no views
    if [ "$views" = "0" ]; then
        log "  Skipping: no views this week"
        continue
    fi

    # Build insights list
    insights=$(echo "$stats" | jq -r '.insights | map(select(. != null)) | join("\n- ")' | sed 's/^/- /')

    # Create email job file for the email system
    job_id="weekly-stats-$(date +%s)-$stream_id"
    job_file="$PROJECT_DIR/infrastructure/jobs/pending/$job_id.json"

    cat > "$job_file" << EOF
{
    "type": "weekly-stats-email",
    "id": "$job_id",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "data": {
        "stream_id": "$stream_id",
        "title": "$title",
        "customer_email": "$customer_email",
        "deployment_url": "$deployment_url",
        "stats": {
            "views": $views,
            "unique_visitors": $unique,
            "completion_rate": "$completion",
            "avg_reading_time": "$reading_time"
        },
        "insights": $(echo "$stats" | jq '.insights')
    }
}
EOF

    log "  Created email job: $job_id (views: $views, completion: $completion)"
    ((sent_count++)) || true

done

log "Weekly stats job complete. Queued: $sent_count, Errors: $error_count"
