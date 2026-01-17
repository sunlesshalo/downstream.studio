#!/bin/bash
# deploy_stream.sh
# Deploys a generated stream to Vercel as a static site
#
# Usage: ./deploy_stream.sh <stream_id>
#
# Prerequisites:
# - VERCEL_TOKEN environment variable
# - Generated stream in pipeline/streams/<stream_id>/app/

set -e

STREAM_ID=$1
PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
STREAMS_DIR="$PROJECT_DIR/pipeline/streams"
LOG_FILE="$PROJECT_DIR/logs/deployments.log"

if [ -z "$STREAM_ID" ]; then
    echo "Error: Stream ID required"
    echo "Usage: ./deploy_stream.sh <stream_id>"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not set"
    exit 1
fi

STREAM_DIR="$STREAMS_DIR/$STREAM_ID"
APP_DIR="$STREAM_DIR/app"

if [ ! -d "$APP_DIR" ]; then
    echo "Error: Stream app not found at $APP_DIR"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$STREAM_ID] $1" >> "$LOG_FILE"
    echo "$1"
}

log "Starting deployment for stream: $STREAM_ID"

# Navigate to the app directory
cd "$APP_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    log "Installing dependencies..."
    npm install --silent
fi

# Build the app
log "Building..."
npm run build

# Deploy to Vercel
log "Deploying to Vercel..."
DEPLOYMENT_URL=$(npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1 | grep -o 'https://[^ ]*\.vercel\.app')

if [ -z "$DEPLOYMENT_URL" ]; then
    log "Error: Deployment failed - no URL returned"
    exit 1
fi

# Save deployment info
echo "{
  \"stream_id\": \"$STREAM_ID\",
  \"url\": \"$DEPLOYMENT_URL\",
  \"deployed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}" > "$STREAM_DIR/deployment.json"

log "Deployed successfully: $DEPLOYMENT_URL"

# Register with analytics (if API is available)
ANALYTICS_API="${ANALYTICS_API:-http://localhost:8082}"
if curl -s "$ANALYTICS_API/health" >/dev/null 2>&1; then
    # Extract title and customer email from production.json if available
    TITLE=$(cat "$STREAM_DIR/production.json" 2>/dev/null | jq -r '.stream.title // "Untitled"')
    CUSTOMER_EMAIL=$(cat "$STREAM_DIR/order.json" 2>/dev/null | jq -r '.customer_email // ""')
    TOTAL_SECTIONS=$(cat "$STREAM_DIR/production.json" 2>/dev/null | jq -r '.sections | length // 0')

    curl -s -X POST "$ANALYTICS_API/streams/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"id\": \"$STREAM_ID\",
            \"title\": \"$TITLE\",
            \"customer_email\": \"$CUSTOMER_EMAIL\",
            \"deployment_url\": \"$DEPLOYMENT_URL\",
            \"total_sections\": $TOTAL_SECTIONS
        }" >/dev/null 2>&1 && log "Registered with analytics" || log "Analytics registration failed (non-critical)"
else
    log "Analytics API not available (skipping registration)"
fi

# Return the URL
echo "$DEPLOYMENT_URL"
