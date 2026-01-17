#!/bin/bash
# build_stream_app.sh
# Creates a deployable Next.js app from a stream's production.json and frames
#
# Usage: ./build_stream_app.sh <stream_id>
#
# This script:
# 1. Copies the stream-app template
# 2. Copies the production.json as stream.config.json
# 3. Copies all generated frames to public/frames/
# 4. The result is ready for `npm install && npm run build`

set -e

STREAM_ID=$1
PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
STREAMS_DIR="$PROJECT_DIR/pipeline/streams"
TEMPLATE_DIR="$PROJECT_DIR/pipeline/templates/stream-app"
LOG_FILE="$PROJECT_DIR/logs/build.log"

if [ -z "$STREAM_ID" ]; then
    echo "Error: Stream ID required"
    echo "Usage: ./build_stream_app.sh <stream_id>"
    exit 1
fi

STREAM_DIR="$STREAMS_DIR/$STREAM_ID"
OUTPUT_DIR="$STREAM_DIR/app"

if [ ! -f "$STREAM_DIR/production.json" ]; then
    echo "Error: production.json not found in $STREAM_DIR"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$STREAM_ID] $1" >> "$LOG_FILE"
    echo "$1"
}

log "Building stream app for: $STREAM_ID"

# Clean previous build
rm -rf "$OUTPUT_DIR"

# Copy template
log "Copying template..."
cp -r "$TEMPLATE_DIR" "$OUTPUT_DIR"

# Copy production.json as stream.config.json
log "Setting up config..."
cp "$STREAM_DIR/production.json" "$OUTPUT_DIR/stream.config.json"

# Copy frames
if [ -d "$STREAM_DIR/frames" ]; then
    log "Copying frames..."
    mkdir -p "$OUTPUT_DIR/public/frames"
    cp -r "$STREAM_DIR/frames/"* "$OUTPUT_DIR/public/frames/"
fi

# Update metadata in config from production.json
log "Stream app ready at: $OUTPUT_DIR"
echo "$OUTPUT_DIR"
