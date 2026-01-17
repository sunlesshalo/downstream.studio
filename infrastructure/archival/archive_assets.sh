#!/bin/bash
# Archive stream assets to Google Drive
# Usage: ./archive_assets.sh <stream-id>

set -e

STREAM_ID="$1"
DOWNSTREAM_DIR="${DOWNSTREAM_DIR:-/root/downstream}"
GDRIVE_REMOTE="gdrive:downstream-assets"
PENDING_DELETE_DIR="$DOWNSTREAM_DIR/infrastructure/archival/pending_delete"
DELETE_AFTER_HOURS=48

if [ -z "$STREAM_ID" ]; then
    echo "Usage: $0 <stream-id>"
    exit 1
fi

SPEC_DIR="$DOWNSTREAM_DIR/streams/specs/$STREAM_ID"

if [ ! -d "$SPEC_DIR" ]; then
    echo "Error: Stream spec directory not found: $SPEC_DIR"
    exit 1
fi

echo "=== Archiving assets for: $STREAM_ID ==="
echo "Timestamp: $(date -Iseconds)"

# Create pending delete directory
mkdir -p "$PENDING_DELETE_DIR"

# Check what exists
VIDEOS_DIR="$SPEC_DIR/videos"
KEYFRAMES_DIR="$SPEC_DIR/keyframes"
FRAMES_DIR="$SPEC_DIR/public/frames"
FRAMES_PERF_DIR="$SPEC_DIR/public/frames-perf"

# Build manifest
MANIFEST=$(mktemp)
ARCHIVED_AT=$(date -Iseconds)
DELETE_AFTER=$(date -d "+${DELETE_AFTER_HOURS} hours" -Iseconds 2>/dev/null || date -v+${DELETE_AFTER_HOURS}H -Iseconds)

cat > "$MANIFEST" << EOF
{
  "stream_id": "$STREAM_ID",
  "archived_at": "$ARCHIVED_AT",
  "delete_after": "$DELETE_AFTER",
  "files": {
EOF

FIRST_SECTION=true

# Upload videos if they exist
if [ -d "$VIDEOS_DIR" ] && [ "$(ls -A "$VIDEOS_DIR" 2>/dev/null)" ]; then
    echo ""
    echo "Uploading videos..."
    rclone copy "$VIDEOS_DIR" "$GDRIVE_REMOTE/$STREAM_ID/videos/" --progress

    VIDEO_FILES=$(ls "$VIDEOS_DIR" | jq -R . | jq -s .)
    VIDEO_SIZE=$(du -sm "$VIDEOS_DIR" | cut -f1)

    if [ "$FIRST_SECTION" = false ]; then echo "," >> "$MANIFEST"; fi
    echo "    \"videos\": $VIDEO_FILES" >> "$MANIFEST"
    FIRST_SECTION=false

    echo "Videos uploaded: $VIDEO_SIZE MB"
fi

# Upload keyframes if they exist
if [ -d "$KEYFRAMES_DIR" ] && [ "$(ls -A "$KEYFRAMES_DIR" 2>/dev/null)" ]; then
    echo ""
    echo "Uploading keyframes..."
    rclone copy "$KEYFRAMES_DIR" "$GDRIVE_REMOTE/$STREAM_ID/keyframes/" --progress

    KEYFRAME_FILES=$(ls "$KEYFRAMES_DIR" | jq -R . | jq -s .)
    KEYFRAME_SIZE=$(du -sm "$KEYFRAMES_DIR" | cut -f1)

    if [ "$FIRST_SECTION" = false ]; then echo "," >> "$MANIFEST"; fi
    echo "    \"keyframes\": $KEYFRAME_FILES" >> "$MANIFEST"
    FIRST_SECTION=false

    echo "Keyframes uploaded: $KEYFRAME_SIZE MB"
fi

# Close manifest
cat >> "$MANIFEST" << EOF

  }
}
EOF

# Upload manifest
echo ""
echo "Uploading manifest..."
rclone copyto "$MANIFEST" "$GDRIVE_REMOTE/$STREAM_ID/manifest.json"
rm "$MANIFEST"

# Schedule deletion - create marker file with deletion timestamp
DELETE_MARKER="$PENDING_DELETE_DIR/${STREAM_ID}.delete"
echo "$DELETE_AFTER" > "$DELETE_MARKER"
echo "Paths to delete:" >> "$DELETE_MARKER"
[ -d "$VIDEOS_DIR" ] && echo "$VIDEOS_DIR" >> "$DELETE_MARKER"
[ -d "$KEYFRAMES_DIR" ] && echo "$KEYFRAMES_DIR" >> "$DELETE_MARKER"

echo ""
echo "=== Archive Complete ==="
echo "Stream: $STREAM_ID"
echo "Remote: $GDRIVE_REMOTE/$STREAM_ID/"
echo "Scheduled for deletion: $DELETE_AFTER"
echo ""
echo "To restore assets later:"
echo "  rclone copy $GDRIVE_REMOTE/$STREAM_ID/videos/ $VIDEOS_DIR/"
echo "  rclone copy $GDRIVE_REMOTE/$STREAM_ID/keyframes/ $KEYFRAMES_DIR/"
