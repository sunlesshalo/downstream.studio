#!/bin/bash
#
# optimize_frames.sh - Further compress WebP frames to reduce size
#
# Usage: ./optimize_frames.sh <frames_folder> [quality]
#
# Re-encodes all WebP frames at specified quality level.
# Default quality: 75 (good balance of size/quality)
# Lower = smaller files, more compression artifacts
#
# Example:
#   ./optimize_frames.sh ./stream-client/public/frames 70
#

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <frames_folder> [quality]"
    echo "Example: $0 ./stream-client/public/frames 75"
    exit 1
fi

FRAMES_FOLDER="$1"
QUALITY="${2:-75}"

if [ ! -d "$FRAMES_FOLDER" ]; then
    echo "Error: Frames folder '$FRAMES_FOLDER' not found"
    exit 1
fi

# Check for cwebp
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp not found. Install with: brew install webp"
    exit 1
fi

echo "Optimizing frames at quality $QUALITY"
echo ""

# Calculate initial size
INITIAL_SIZE=$(du -sh "$FRAMES_FOLDER" | cut -f1)
echo "Initial size: $INITIAL_SIZE"
echo ""

# Find all WebP files
WEBP_FILES=$(find "$FRAMES_FOLDER" -name "*.webp" | wc -l | tr -d ' ')
echo "Processing $WEBP_FILES files..."

PROCESSED=0
for FILE in $(find "$FRAMES_FOLDER" -name "*.webp"); do
    # Create temp file
    TEMP_FILE="${FILE}.tmp"

    # Re-encode at target quality
    cwebp -q "$QUALITY" "$FILE" -o "$TEMP_FILE" -quiet

    # Replace original
    mv "$TEMP_FILE" "$FILE"

    ((PROCESSED++))

    # Progress indicator every 100 files
    if [ $((PROCESSED % 100)) -eq 0 ]; then
        echo "  Processed $PROCESSED / $WEBP_FILES"
    fi
done

# Calculate final size
FINAL_SIZE=$(du -sh "$FRAMES_FOLDER" | cut -f1)

echo ""
echo "Optimization complete!"
echo "  Before: $INITIAL_SIZE"
echo "  After:  $FINAL_SIZE"
echo ""
