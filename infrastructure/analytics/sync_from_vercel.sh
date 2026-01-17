#!/usr/bin/env bash
# sync_from_vercel.sh
# Syncs all deployed streams from Vercel to analytics backend
#
# Usage: ./sync_from_vercel.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTER_SCRIPT="$PROJECT_ROOT/infrastructure/analytics/register_stream.sh"
ANALYTICS_API="${ANALYTICS_API:-https://analytics.downstream.ink}"

echo "=== Syncing Deployed Streams from Vercel ==="
echo ""

# Check for VERCEL_TOKEN
if [ -z "$VERCEL_TOKEN" ]; then
    # Try to load from .env
    if [ -f "$PROJECT_ROOT/.env" ]; then
        source "$PROJECT_ROOT/.env"
    fi
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not set"
    echo "Set it in .env or export VERCEL_TOKEN=your_token"
    exit 1
fi

# Make register script executable
chmod +x "$REGISTER_SCRIPT"

# Get all Vercel projects
echo "Fetching projects from Vercel..."
PROJECTS=$(curl -s 'https://api.vercel.com/v9/projects' \
    -H "Authorization: Bearer $VERCEL_TOKEN" | \
    jq -r '.projects[] | select(.name | test("^(stream-|the-|demo-|founding|web|intake)")) | "\(.name)|\(.targets.production.alias[0] // .targets.production.url // "")"')

if [ -z "$PROJECTS" ]; then
    echo "No projects found or API error"
    exit 1
fi

# Count projects
TOTAL=$(echo "$PROJECTS" | wc -l | tr -d ' ')
echo "Found $TOTAL Vercel projects"
echo ""

SUCCESS=0
FAILED=0
SKIPPED=0

# Process each project
while IFS='|' read -r vercel_name url; do
    # Skip if no URL
    if [ -z "$url" ]; then
        ((SKIPPED++))
        continue
    fi

    # Convert Vercel project name to stream ID
    # stream-foo-bar → foo-bar
    # the-loop-demo → the-loop-demo (no change)
    if [[ "$vercel_name" == stream-* ]]; then
        stream_id="${vercel_name#stream-}"
    else
        stream_id="$vercel_name"
    fi

    # Add https:// if not present
    if [[ "$url" != http* ]]; then
        url="https://$url"
    fi

    echo "[$((SUCCESS + FAILED + SKIPPED + 1))/$TOTAL] $stream_id"

    # Try to register with spec-based script first
    if "$REGISTER_SCRIPT" "$stream_id" "$url" 2>/dev/null; then
        ((SUCCESS++))
    else
        # Fallback: register directly via API with basic info
        TITLE=$(echo "$stream_id" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')
        RESPONSE=$(curl -s -X POST "$ANALYTICS_API/streams/register" \
            -H "Content-Type: application/json" \
            -d "{
                \"id\": \"$stream_id\",
                \"title\": \"$TITLE\",
                \"customer_email\": \"\",
                \"deployment_url\": \"$url\",
                \"total_sections\": 0,
                \"total_frames\": 0
            }")

        if echo "$RESPONSE" | grep -q '"status":"ok"'; then
            ((SUCCESS++))
            echo "  ✓ Registered via API"
        else
            ((FAILED++))
            echo "  ✗ Failed"
        fi
    fi
    echo ""
done <<< "$PROJECTS"

echo "========================================"
echo "Sync complete:"
echo "  ✓ Success: $SUCCESS"
echo "  ✗ Failed: $FAILED"
echo "  - Skipped: $SKIPPED (no URL)"
echo "========================================"

exit 0
