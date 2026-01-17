#!/bin/bash
# Clean up archived assets that have passed their deletion time
# Run via cron every 6 hours

set -e

DOWNSTREAM_DIR="${DOWNSTREAM_DIR:-/root/downstream}"
PENDING_DELETE_DIR="$DOWNSTREAM_DIR/infrastructure/archival/pending_delete"
LOG_DIR="/var/log/downstream"

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date -Iseconds)] $1" | tee -a "$LOG_DIR/cleanup.log"
}

if [ ! -d "$PENDING_DELETE_DIR" ]; then
    log "No pending deletions directory found"
    exit 0
fi

# Get current time as ISO timestamp
NOW=$(date -Iseconds)

log "=== Starting cleanup check ==="

# Process each deletion marker
for MARKER in "$PENDING_DELETE_DIR"/*.delete; do
    [ -f "$MARKER" ] || continue

    STREAM_ID=$(basename "$MARKER" .delete)
    DELETE_AFTER=$(head -1 "$MARKER")

    # Compare timestamps (works on Linux with date -d)
    DELETE_EPOCH=$(date -d "$DELETE_AFTER" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "$DELETE_AFTER" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)

    if [ "$NOW_EPOCH" -ge "$DELETE_EPOCH" ]; then
        log "Deleting assets for: $STREAM_ID (scheduled: $DELETE_AFTER)"

        # Read paths to delete (skip first line which is the timestamp)
        tail -n +3 "$MARKER" | while read -r PATH_TO_DELETE; do
            if [ -d "$PATH_TO_DELETE" ]; then
                SIZE=$(du -sh "$PATH_TO_DELETE" 2>/dev/null | cut -f1 || echo "unknown")
                log "  Removing: $PATH_TO_DELETE ($SIZE)"
                rm -rf "$PATH_TO_DELETE"
            elif [ -f "$PATH_TO_DELETE" ]; then
                log "  Removing file: $PATH_TO_DELETE"
                rm -f "$PATH_TO_DELETE"
            fi
        done

        # Remove the marker
        rm -f "$MARKER"
        log "  Cleanup complete for $STREAM_ID"
    else
        HOURS_LEFT=$(( (DELETE_EPOCH - NOW_EPOCH) / 3600 ))
        log "Skipping $STREAM_ID - ${HOURS_LEFT}h until deletion"
    fi
done

log "=== Cleanup check complete ==="
