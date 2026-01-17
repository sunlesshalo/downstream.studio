#!/bin/bash
# purge_old_data.sh
# Implements data retention policy for DownStream
# Run daily via cron to maintain compliance with retention periods

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
JOBS_DIR="$(dirname "$SCRIPT_DIR")/jobs"
LOGS_DIR="$PROJECT_DIR/logs"

# Retention periods (in days)
COMPLETED_JOBS_RETENTION=90
FAILED_JOBS_RETENTION=30
PROCESSED_MARKERS_RETENTION=90
LOGS_RETENTION=90

# Load alerts if available
source "$(dirname "$SCRIPT_DIR")/lib/alerts.sh" 2>/dev/null || true

echo "=== Data Retention Cleanup ==="
echo "Date: $(date '+%Y-%m-%d %H:%M')"
echo ""

# Track cleanup stats
DELETED_COUNT=0
ERRORS=0

# ============================================
# CLEANUP COMPLETED JOBS (90 days)
# ============================================

echo "Cleaning completed jobs older than $COMPLETED_JOBS_RETENTION days..."

if [ -d "$JOBS_DIR/completed" ]; then
    count=0
    while IFS= read -r -d '' file; do
        rm -f "$file" && count=$((count + 1))
    done < <(find "$JOBS_DIR/completed" -name "*.json" -mtime +$COMPLETED_JOBS_RETENTION -print0 2>/dev/null)

    if [ $count -gt 0 ]; then
        echo "  Deleted $count completed job files"
        DELETED_COUNT=$((DELETED_COUNT + count))
    else
        echo "  No old completed jobs to delete"
    fi
fi

# ============================================
# CLEANUP FAILED JOBS (30 days)
# ============================================

echo "Cleaning failed jobs older than $FAILED_JOBS_RETENTION days..."

if [ -d "$JOBS_DIR/failed" ]; then
    count=0
    while IFS= read -r -d '' file; do
        rm -f "$file" && count=$((count + 1))
    done < <(find "$JOBS_DIR/failed" -name "*.json" -mtime +$FAILED_JOBS_RETENTION -print0 2>/dev/null)

    if [ $count -gt 0 ]; then
        echo "  Deleted $count failed job files"
        DELETED_COUNT=$((DELETED_COUNT + count))
    else
        echo "  No old failed jobs to delete"
    fi
fi

# ============================================
# CLEANUP IDEMPOTENCY MARKERS (90 days)
# ============================================

echo "Cleaning idempotency markers older than $PROCESSED_MARKERS_RETENTION days..."

if [ -d "$JOBS_DIR/.processed" ]; then
    count=0
    while IFS= read -r -d '' file; do
        rm -f "$file" && count=$((count + 1))
    done < <(find "$JOBS_DIR/.processed" -type f -mtime +$PROCESSED_MARKERS_RETENTION -print0 2>/dev/null)

    if [ $count -gt 0 ]; then
        echo "  Deleted $count idempotency markers"
        DELETED_COUNT=$((DELETED_COUNT + count))
    else
        echo "  No old markers to delete"
    fi
fi

# ============================================
# ROTATE LOGS (90 days)
# ============================================

echo "Rotating logs older than $LOGS_RETENTION days..."

if [ -d "$LOGS_DIR" ]; then
    count=0
    while IFS= read -r -d '' file; do
        rm -f "$file" && count=$((count + 1))
    done < <(find "$LOGS_DIR" -name "*.log" -mtime +$LOGS_RETENTION -print0 2>/dev/null)

    if [ $count -gt 0 ]; then
        echo "  Deleted $count old log files"
        DELETED_COUNT=$((DELETED_COUNT + count))
    else
        echo "  No old logs to delete"
    fi

    # Trim large log files (keep last 10000 lines)
    for log_file in "$LOGS_DIR"/*.log; do
        [ -f "$log_file" ] || continue
        lines=$(wc -l < "$log_file")
        if [ "$lines" -gt 10000 ]; then
            tail -10000 "$log_file" > "$log_file.tmp" && mv "$log_file.tmp" "$log_file"
            echo "  Trimmed $log_file from $lines to 10000 lines"
        fi
    done
fi

# ============================================
# CLEANUP AWAITING-PAYMENT (abandoned checkouts, 7 days)
# ============================================

echo "Cleaning abandoned checkouts older than 7 days..."

if [ -d "$JOBS_DIR/awaiting-payment" ]; then
    count=0
    while IFS= read -r -d '' file; do
        rm -f "$file" && count=$((count + 1))
    done < <(find "$JOBS_DIR/awaiting-payment" -name "*.json" -mtime +7 -print0 2>/dev/null)

    if [ $count -gt 0 ]; then
        echo "  Deleted $count abandoned checkout files"
        DELETED_COUNT=$((DELETED_COUNT + count))
    else
        echo "  No abandoned checkouts to delete"
    fi
fi

# ============================================
# SUMMARY
# ============================================

echo ""
echo "=== Cleanup Complete ==="
echo "Total files deleted: $DELETED_COUNT"
echo "Errors: $ERRORS"

# Log cleanup to operations if significant
if [ $DELETED_COUNT -gt 0 ]; then
    LOG_FILE="$PROJECT_DIR/chronicle/OPERATIONS.md"
    if [ -f "$LOG_FILE" ]; then
        {
            echo ""
            echo "### $(date '+%Y-%m-%d %H:%M') — auto:data-retention"
            echo ""
            echo "**Automated cleanup per data retention policy**"
            echo "- Files deleted: $DELETED_COUNT"
            echo ""
        } >> "$LOG_FILE"
    fi
fi

# Alert if there were errors
if [ $ERRORS -gt 0 ]; then
    if type alert_error &>/dev/null; then
        alert_error "Data retention cleanup had errors" "$ERRORS files could not be deleted"
    fi
    exit 1
fi

exit 0
