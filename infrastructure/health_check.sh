#!/bin/bash
# health_check.sh
# Self-healing watchdog for DownStream infrastructure
# Runs every 30 min via cron. Only alerts when there's something to report.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JOBS_DIR="$SCRIPT_DIR/jobs"

# Load environment
cd "$PROJECT_DIR"
source .env 2>/dev/null || true

# Track if we found any issues
ISSUES_FOUND=0
ISSUES_FIXED=0
ISSUES_FAILED=0

# ============================================
# HELPER FUNCTIONS
# ============================================

alert_issue_found() {
    local issue="$1"
    local action="$2"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"Issue Detected\",
                    \"description\": \"$issue\",
                    \"color\": 16744256,
                    \"fields\": [{
                        \"name\": \"Action\",
                        \"value\": \"$action\"
                    }],
                    \"footer\": {\"text\": \"Health Check\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null 2>&1
    fi
    echo "[ISSUE] $issue - $action"
}

alert_fixed() {
    local issue="$1"
    ISSUES_FIXED=$((ISSUES_FIXED + 1))

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"Issue Fixed\",
                    \"description\": \"$issue\",
                    \"color\": 5763719,
                    \"footer\": {\"text\": \"Health Check - Auto-healed\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null 2>&1
    fi
    echo "[FIXED] $issue"
}

alert_needs_attention() {
    local issue="$1"
    local details="$2"
    ISSUES_FAILED=$((ISSUES_FAILED + 1))

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -s -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"Needs Human Attention\",
                    \"description\": \"$issue\",
                    \"color\": 15158332,
                    \"fields\": [{
                        \"name\": \"Details\",
                        \"value\": \"$details\"
                    }],
                    \"footer\": {\"text\": \"Health Check - Manual intervention required\"},
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                }]
            }" > /dev/null 2>&1
    fi
    echo "[NEEDS ATTENTION] $issue - $details"
}

# ============================================
# CHECK 1: Git Lock File
# ============================================

check_git_lock() {
    if [ -f "$PROJECT_DIR/.git/index.lock" ]; then
        # Check if lock is old (more than 10 minutes)
        if [ "$(find "$PROJECT_DIR/.git/index.lock" -mmin +10 2>/dev/null)" ]; then
            alert_issue_found "Stale git lock file detected (>10 min old)" "Attempting to remove..."

            rm -f "$PROJECT_DIR/.git/index.lock"

            if [ ! -f "$PROJECT_DIR/.git/index.lock" ]; then
                alert_fixed "Git lock file removed successfully"
            else
                alert_needs_attention "Could not remove git lock file" "Manual intervention required"
            fi
        fi
    fi
}

# ============================================
# CHECK 2: Git Sync Health
# ============================================

check_git_sync() {
    cd "$PROJECT_DIR"

    # Try to fetch (read-only, safe)
    if ! git fetch origin main --quiet 2>/dev/null; then
        alert_issue_found "Git fetch failed" "Checking authentication..."

        # Check if it's an auth issue
        if git remote -v | grep -q "github_pat"; then
            alert_needs_attention "Git fetch failed but PAT is configured" "Token may have expired or been revoked"
        else
            alert_needs_attention "Git fetch failed - no authentication configured" "Need to set up GitHub PAT"
        fi
        return
    fi

    # Check if we're behind
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/main 2>/dev/null)

    if [ "$LOCAL" != "$REMOTE" ]; then
        # Check for uncommitted changes that might block pull
        if [ -n "$(git status --porcelain)" ]; then
            alert_issue_found "Local changes blocking git sync" "Attempting to stash and pull..."

            git stash --quiet 2>/dev/null || true
            if git pull origin main --quiet 2>/dev/null; then
                git stash pop --quiet 2>/dev/null || true
                alert_fixed "Git sync restored (stashed local changes, pulled, restored)"
            else
                alert_needs_attention "Could not sync with GitHub" "May have merge conflicts"
            fi
        fi
    fi
}

# ============================================
# CHECK 3: Stale Pending Jobs
# ============================================

check_stale_jobs() {
    # Find support jobs pending for more than 1 hour
    for job_file in "$JOBS_DIR/pending"/support-*.json; do
        [ -f "$job_file" ] || continue

        if [ "$(find "$job_file" -mmin +60 2>/dev/null)" ]; then
            JOB_ID=$(basename "$job_file" .json)
            SUBJECT=$(jq -r '.subject // "unknown"' "$job_file" 2>/dev/null)

            alert_needs_attention "Support email pending for >1 hour" "Job: $JOB_ID, Subject: $SUBJECT"
        fi
    done

    # Find order jobs pending for more than 2 hours
    for job_file in "$JOBS_DIR/pending"/order-*.json; do
        [ -f "$job_file" ] || continue

        if [ "$(find "$job_file" -mmin +120 2>/dev/null)" ]; then
            JOB_ID=$(basename "$job_file" .json)

            alert_needs_attention "Order pending for >2 hours" "Job: $JOB_ID - Customer may be waiting"
        fi
    done
}

# ============================================
# CHECK 4: Jobs Stuck in Processing
# ============================================

check_stuck_processing() {
    # Jobs in processing/ for more than 30 minutes are likely stuck
    if [ -d "$JOBS_DIR/processing" ]; then
        for job_file in "$JOBS_DIR/processing"/*.json; do
            [ -f "$job_file" ] || continue

            if [ "$(find "$job_file" -mmin +30 2>/dev/null)" ]; then
                JOB_ID=$(basename "$job_file" .json)
                alert_issue_found "Job stuck in processing: $JOB_ID" "Moving back to pending..."

                mv "$job_file" "$JOBS_DIR/pending/"
                alert_fixed "Moved stuck job $JOB_ID back to pending for retry"
            fi
        done
    fi
}

# ============================================
# CHECK 5: Disk Space
# ============================================

check_disk_space() {
    # Check if disk is more than 90% full
    DISK_USAGE=$(df -h "$PROJECT_DIR" | awk 'NR==2 {gsub(/%/,""); print $5}')

    if [ "$DISK_USAGE" -gt 90 ]; then
        alert_needs_attention "Disk space critical: ${DISK_USAGE}% used" "May need to clean up old files"
    elif [ "$DISK_USAGE" -gt 80 ]; then
        alert_issue_found "Disk space warning: ${DISK_USAGE}% used" "Consider cleaning up soon"
    fi
}

# ============================================
# CHECK 6: Recent Activity (no responses in 24h when jobs exist)
# ============================================

check_activity() {
    # Count completed jobs in last 24 hours
    RECENT_COMPLETED=$(find "$JOBS_DIR/completed" -name "*.json" -mmin -1440 2>/dev/null | wc -l)

    # Count jobs that came in during last 24 hours (in any state)
    RECENT_PENDING=$(find "$JOBS_DIR/pending" -name "*.json" -mmin -1440 2>/dev/null | wc -l)
    RECENT_REVIEW=$(find "$JOBS_DIR/review" -name "*.json" -mmin -1440 2>/dev/null | wc -l)

    # If jobs came in but none completed, something might be wrong
    if [ $((RECENT_PENDING + RECENT_REVIEW)) -gt 0 ] && [ "$RECENT_COMPLETED" -eq 0 ]; then
        alert_needs_attention "Jobs received but none completed in 24h" "Processing pipeline may be blocked"
    fi
}

# ============================================
# CHECK 7: Environment Variables
# ============================================

check_env_vars() {
    MISSING_VARS=""

    [ -z "$RESEND_API_KEY" ] && MISSING_VARS="$MISSING_VARS RESEND_API_KEY"
    [ -z "$REPLICATE_API_TOKEN" ] && MISSING_VARS="$MISSING_VARS REPLICATE_API_TOKEN"
    [ -z "$GOOGLE_AI_API_KEY" ] && MISSING_VARS="$MISSING_VARS GOOGLE_AI_API_KEY"
    [ -z "$VERCEL_TOKEN" ] && MISSING_VARS="$MISSING_VARS VERCEL_TOKEN"

    if [ -n "$MISSING_VARS" ]; then
        alert_needs_attention "Missing environment variables" "$MISSING_VARS"
    fi
}

# ============================================
# RUN ALL CHECKS
# ============================================

echo "$(date '+%Y-%m-%d %H:%M:%S') - Running health check..."

check_git_lock
check_git_sync
check_stale_jobs
check_stuck_processing
check_disk_space
check_activity
check_env_vars

# ============================================
# SUMMARY (only logged, not alerted)
# ============================================

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "All systems healthy. No issues detected."
else
    echo "Summary: $ISSUES_FOUND issues found, $ISSUES_FIXED auto-fixed, $ISSUES_FAILED need attention"
fi

# Log to health check history
LOG_FILE="$PROJECT_DIR/logs/health_check.log"
mkdir -p "$(dirname "$LOG_FILE")"
echo "$(date '+%Y-%m-%d %H:%M:%S') | Issues: $ISSUES_FOUND | Fixed: $ISSUES_FIXED | Failed: $ISSUES_FAILED" >> "$LOG_FILE"

# Keep log file manageable (last 1000 entries)
tail -1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"

echo "Health check complete."
