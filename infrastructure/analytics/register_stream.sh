#!/usr/bin/env bash
# register_stream.sh
# Registers a stream with the analytics backend
#
# Usage: ./register_stream.sh <stream_id> [deployment_url]
#
# If deployment_url is not provided, will look for deployment.json

set -e

STREAM_ID="$1"
DEPLOYMENT_URL="$2"
ANALYTICS_API="${ANALYTICS_API:-https://analytics.downstream.ink}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [ -z "$STREAM_ID" ]; then
    echo "Error: Stream ID required"
    echo "Usage: ./register_stream.sh <stream_id> [deployment_url]"
    exit 1
fi

# Find stream spec directory (check both locations)
SPEC_DIR=""
if [ -d "$PROJECT_ROOT/streams/specs/$STREAM_ID" ]; then
    SPEC_DIR="$PROJECT_ROOT/streams/specs/$STREAM_ID"
elif [ -d "$PROJECT_ROOT/pipeline/streams/$STREAM_ID" ]; then
    SPEC_DIR="$PROJECT_ROOT/pipeline/streams/$STREAM_ID"
else
    echo "Error: Stream spec not found for $STREAM_ID"
    exit 1
fi

# Get deployment URL from deployment.json if not provided
if [ -z "$DEPLOYMENT_URL" ] && [ -f "$SPEC_DIR/deployment.json" ]; then
    DEPLOYMENT_URL=$(jq -r '.url // empty' "$SPEC_DIR/deployment.json")
fi

if [ -z "$DEPLOYMENT_URL" ]; then
    echo "Error: Deployment URL not found"
    echo "Provide as argument or create deployment.json"
    exit 1
fi

# Extract metadata from production.json and input.json
PRODUCTION_JSON="$SPEC_DIR/production.json"
INPUT_JSON="$SPEC_DIR/input.json"

if [ ! -f "$PRODUCTION_JSON" ]; then
    echo "Error: production.json not found at $PRODUCTION_JSON"
    exit 1
fi

# Get title (try input.json first, then production.json)
TITLE=""
if [ -f "$INPUT_JSON" ]; then
    TITLE=$(jq -r '.title // empty' "$INPUT_JSON")
fi
if [ -z "$TITLE" ]; then
    TITLE=$(jq -r '.input.title // .stream.title // empty' "$PRODUCTION_JSON")
fi
if [ -z "$TITLE" ]; then
    TITLE="Untitled Stream"
fi

# Get customer email (from order.json if exists)
CUSTOMER_EMAIL=""
if [ -f "$SPEC_DIR/order.json" ]; then
    CUSTOMER_EMAIL=$(jq -r '.customer_email // empty' "$SPEC_DIR/order.json")
fi

# Count sections and frames
TOTAL_SECTIONS=$(jq -r '.sections | length // 0' "$PRODUCTION_JSON")
TOTAL_FRAMES=0

# Try to count frames from the stream app
APP_DIR="$PROJECT_ROOT/streams/apps/$STREAM_ID"
if [ -d "$APP_DIR/public/frames" ]; then
    TOTAL_FRAMES=$(find "$APP_DIR/public/frames" -name "*.webp" -o -name "*.png" -o -name "*.jpg" | wc -l | tr -d ' ')
fi

echo "Registering stream with analytics..."
echo "  Stream ID: $STREAM_ID"
echo "  Title: $TITLE"
echo "  URL: $DEPLOYMENT_URL"
echo "  Sections: $TOTAL_SECTIONS"
echo "  Frames: $TOTAL_FRAMES"

# Register with analytics API
RESPONSE=$(curl -s -X POST "$ANALYTICS_API/streams/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"id\": \"$STREAM_ID\",
        \"title\": \"$TITLE\",
        \"customer_email\": \"$CUSTOMER_EMAIL\",
        \"deployment_url\": \"$DEPLOYMENT_URL\",
        \"total_sections\": $TOTAL_SECTIONS,
        \"total_frames\": $TOTAL_FRAMES
    }" 2>&1)

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo "✓ Successfully registered with analytics"
    exit 0
else
    echo "✗ Registration failed:"
    echo "$RESPONSE"
    exit 1
fi
