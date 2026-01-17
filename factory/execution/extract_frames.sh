#!/bin/bash
#
# extract_frames.sh - Extract WebP frames from MP4 video
#
# Usage: ./extract_frames.sh <input.mp4> <output_dir> [fps]
#
# Arguments:
#   input.mp4   - Source video file
#   output_dir  - Directory to save frames (will be created)
#   fps         - Frames per second (default: 24)
#
# Output:
#   Creates frame_0001.webp, frame_0002.webp, etc.
#

set -e

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <input.mp4> <output_dir> [fps]"
    echo "Example: $0 video.mp4 ./frames/1 24"
    exit 1
fi

INPUT="$1"
OUTPUT_DIR="$2"
FPS="${3:-24}"

# Check input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Extract frames
echo "Extracting frames from '$INPUT' at ${FPS}fps..."
ffmpeg -i "$INPUT" \
    -vf "fps=$FPS" \
    -c:v libwebp \
    -quality 80 \
    "$OUTPUT_DIR/frame_%04d.webp"

# Count frames
FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/frame_*.webp 2>/dev/null | wc -l | tr -d ' ')

echo "Done! Extracted $FRAME_COUNT frames to '$OUTPUT_DIR'"
echo "Frame pattern: frame_0001.webp to frame_$(printf '%04d' $FRAME_COUNT).webp"
