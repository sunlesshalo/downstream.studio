#!/bin/bash
#
# validate_frames.sh - Validate frame sequences have no gaps
#
# Usage: ./validate_frames.sh <frames_folder>
#
# Checks each segment folder for:
#   - Sequential numbering (no gaps)
#   - Correct naming pattern (frame_0001.webp)
#   - Minimum frame count
#
# Example:
#   ./validate_frames.sh ./stream-client/public/frames
#

set -e

if [ $# -lt 1 ]; then
    echo "Usage: $0 <frames_folder>"
    echo "Example: $0 ./stream-client/public/frames"
    exit 1
fi

FRAMES_FOLDER="$1"
ERRORS=0

if [ ! -d "$FRAMES_FOLDER" ]; then
    echo "Error: Frames folder '$FRAMES_FOLDER' not found"
    exit 1
fi

echo "Validating: $FRAMES_FOLDER"
echo ""

# Find all numbered directories
SEGMENT_DIRS=($(find "$FRAMES_FOLDER" -maxdepth 1 -type d -name "[0-9]*" | sort -V))

if [ ${#SEGMENT_DIRS[@]} -eq 0 ]; then
    echo "Error: No numbered segment folders found"
    exit 1
fi

for DIR in "${SEGMENT_DIRS[@]}"; do
    SEGMENT_ID=$(basename "$DIR")
    FRAME_COUNT=$(find "$DIR" -name "frame_*.webp" 2>/dev/null | wc -l | tr -d ' ')

    echo "Segment $SEGMENT_ID: $FRAME_COUNT frames"

    # Check minimum frame count
    if [ "$FRAME_COUNT" -lt 10 ]; then
        echo "  WARNING: Very few frames (< 10)"
        ((ERRORS++))
    fi

    # Check for gaps in sequence
    if [ "$FRAME_COUNT" -gt 0 ]; then
        EXPECTED=1
        MISSING=()

        while [ $EXPECTED -le $FRAME_COUNT ]; do
            FRAME_FILE=$(printf "frame_%04d.webp" $EXPECTED)
            if [ ! -f "$DIR/$FRAME_FILE" ]; then
                MISSING+=($EXPECTED)
            fi
            ((EXPECTED++))
        done

        # Check if there are frames beyond expected count
        ACTUAL_MAX=$(ls "$DIR"/frame_*.webp 2>/dev/null | sort -V | tail -1 | grep -o '[0-9]\{4\}' | tail -1 | sed 's/^0*//')

        if [ -n "$ACTUAL_MAX" ] && [ "$ACTUAL_MAX" -gt "$FRAME_COUNT" ]; then
            echo "  WARNING: Gap detected - max frame number ($ACTUAL_MAX) > file count ($FRAME_COUNT)"
            ((ERRORS++))
        fi

        if [ ${#MISSING[@]} -gt 0 ]; then
            echo "  ERROR: Missing frames: ${MISSING[*]}"
            ((ERRORS++))
        fi
    fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "Validation passed! All frame sequences are valid."
    exit 0
else
    echo "Validation found $ERRORS issue(s). Please review above."
    exit 1
fi
