#!/bin/bash
#
# count_frames.sh - Count frames per segment and output config snippet
#
# Usage: ./count_frames.sh <frames_folder>
#
# Scans numbered subfolders (1, 2, 3...) and counts WebP frames in each.
# Outputs ready-to-paste TypeScript config for segments array.
#
# Example:
#   ./count_frames.sh ./stream-client/public/frames
#

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <frames_folder>"
    echo "Example: $0 ./stream-client/public/frames"
    exit 1
fi

FRAMES_FOLDER="$1"

if [ ! -d "$FRAMES_FOLDER" ]; then
    echo "Error: Frames folder '$FRAMES_FOLDER' not found"
    exit 1
fi

echo "Scanning: $FRAMES_FOLDER"
echo ""

# Find all numbered directories, sorted numerically
SEGMENT_DIRS=($(find "$FRAMES_FOLDER" -maxdepth 1 -type d -name "[0-9]*" | sort -t/ -k$(echo "$FRAMES_FOLDER" | tr -cd '/' | wc -c | tr -d ' ')n -k1n))

if [ ${#SEGMENT_DIRS[@]} -eq 0 ]; then
    echo "Error: No numbered segment folders found"
    exit 1
fi

TOTAL_FRAMES=0

echo "Frame counts per segment:"
echo "-------------------------"

# Build segments array
SEGMENTS_CONFIG="segments: ["

for DIR in "${SEGMENT_DIRS[@]}"; do
    SEGMENT_ID=$(basename "$DIR")
    FRAME_COUNT=$(find "$DIR" -name "frame_*.webp" 2>/dev/null | wc -l | tr -d ' ')

    printf "  Segment %s: %d frames\n" "$SEGMENT_ID" "$FRAME_COUNT"

    TOTAL_FRAMES=$((TOTAL_FRAMES + FRAME_COUNT))
    SEGMENTS_CONFIG="$SEGMENTS_CONFIG
    { id: $SEGMENT_ID, frameCount: $FRAME_COUNT },"
done

SEGMENTS_CONFIG="$SEGMENTS_CONFIG
  ]"

echo "-------------------------"
echo "Total: $TOTAL_FRAMES frames"
echo ""
echo "Copy this to your config.tsx:"
echo ""
echo "$SEGMENTS_CONFIG"
echo ""
