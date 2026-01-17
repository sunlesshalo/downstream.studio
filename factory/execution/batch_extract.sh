#!/bin/bash
#
# batch_extract.sh - Extract frames from all MP4s in a folder
#
# Usage: ./batch_extract.sh <input_folder> <output_folder> [fps]
#
# Processes all .mp4 files in input_folder, creates numbered segment
# folders (1, 2, 3...) in output_folder based on alphabetical order.
#
# Example:
#   ./batch_extract.sh ./videos ./stream-client/public/frames
#
# Input folder structure:
#   videos/
#     01_intro.mp4
#     02_problem.mp4
#     03_solution.mp4
#
# Output folder structure:
#   frames/
#     1/frame_0001.webp, frame_0002.webp, ...
#     2/frame_0001.webp, frame_0002.webp, ...
#     3/frame_0001.webp, frame_0002.webp, ...
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input_folder> <output_folder> [fps]"
    echo "Example: $0 ./videos ./stream-client/public/frames 24"
    exit 1
fi

INPUT_FOLDER="$1"
OUTPUT_FOLDER="$2"
FPS="${3:-24}"

# Check input folder exists
if [ ! -d "$INPUT_FOLDER" ]; then
    echo "Error: Input folder '$INPUT_FOLDER' not found"
    exit 1
fi

# Find all MP4 files, sorted alphabetically
# Use mapfile to handle filenames with spaces correctly
mapfile -t MP4_FILES < <(find "$INPUT_FOLDER" -maxdepth 1 \( -name "*.mp4" -o -name "*.MP4" \) -type f | sort)

if [ ${#MP4_FILES[@]} -eq 0 ]; then
    echo "Error: No MP4 files found in '$INPUT_FOLDER'"
    exit 1
fi

echo "Found ${#MP4_FILES[@]} video(s) to process"
echo ""

# Create output folder
mkdir -p "$OUTPUT_FOLDER"

# Process each video
SEGMENT_ID=1
for VIDEO in "${MP4_FILES[@]}"; do
    FILENAME=$(basename "$VIDEO")
    OUTPUT_DIR="$OUTPUT_FOLDER/$SEGMENT_ID"

    echo "[$SEGMENT_ID/${#MP4_FILES[@]}] Processing: $FILENAME -> $OUTPUT_DIR"

    # Use the extract_frames.sh script
    "$SCRIPT_DIR/extract_frames.sh" "$VIDEO" "$OUTPUT_DIR" "$FPS"

    ((SEGMENT_ID++))
    echo ""
done

echo "=========================================="
echo "Batch extraction complete!"
echo ""
echo "Run this to see frame counts:"
echo "  ./execution/count_frames.sh $OUTPUT_FOLDER"
echo ""
