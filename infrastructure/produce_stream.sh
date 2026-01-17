#!/bin/bash
# produce_stream.sh
# Full production pipeline: spec → visuals → app → deploy → email
#
# Usage: ./produce_stream.sh <stream_id> <customer_email> <order_id>

set -e

STREAM_ID="$1"
CUSTOMER_EMAIL="$2"
ORDER_ID="$3"

if [ -z "$STREAM_ID" ] || [ -z "$CUSTOMER_EMAIL" ] || [ -z "$ORDER_ID" ]; then
    echo "Usage: $0 <stream_id> <customer_email> <order_id>"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PIPELINE_DIR="$PROJECT_DIR/pipeline"
STREAMS_DIR="$PIPELINE_DIR/streams"
STREAM_DIR="$STREAMS_DIR/$STREAM_ID"
LOG_FILE="$STREAM_DIR/production.log"

# Load environment
source "$PROJECT_DIR/.env" 2>/dev/null || true

# Load Discord notifications
source "$SCRIPT_DIR/notify_discord.sh"

# Logging
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Alert Ferenc on failure (email + Discord)
alert_ferenc() {
    local subject="$1"
    local message="$2"

    # Notify Discord first (faster)
    notify_discord "error" "Production Failed" "" "[
        {\"name\": \"Error\", \"value\": \"$subject\", \"inline\": false},
        {\"name\": \"Stream\", \"value\": \"\`$STREAM_ID\`\", \"inline\": true},
        {\"name\": \"Customer\", \"value\": \"$CUSTOMER_EMAIL\", \"inline\": true},
        {\"name\": \"Order\", \"value\": \"\`$ORDER_ID\`\", \"inline\": true},
        {\"name\": \"Details\", \"value\": \"$message\", \"inline\": false}
    ]"

    # Also send email
    if [ -n "$RESEND_API_KEY" ]; then
        curl -s -X POST 'https://api.resend.com/emails' \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H 'Content-Type: application/json' \
            -d "{
                \"from\": \"DownStream <hello@downstream.ink>\",
                \"to\": [\"ferencz@pinelines.eu\"],
                \"subject\": \"[DownStream Alert] $subject\",
                \"html\": \"<div style='font-family: system-ui; padding: 20px;'><h2 style='color: #dc3545;'>Production Alert</h2><p><strong>Order:</strong> $ORDER_ID</p><p><strong>Stream:</strong> $STREAM_ID</p><p><strong>Customer:</strong> $CUSTOMER_EMAIL</p><hr><pre>$message</pre></div>\"
            }" > /dev/null
        log "INFO" "Alert sent to Ferenc"
    else
        log "ERROR" "Cannot alert Ferenc - RESEND_API_KEY not set"
    fi
}

# Send delivery email to customer
send_delivery_email() {
    local stream_url="$1"
    local stream_title="$2"

    if [ -n "$RESEND_API_KEY" ]; then
        curl -s -X POST 'https://api.resend.com/emails' \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H 'Content-Type: application/json' \
            -d "{
                \"from\": \"DownStream <hello@downstream.ink>\",
                \"to\": [\"$CUSTOMER_EMAIL\"],
                \"subject\": \"Your story is live: \\\"$stream_title\\\"\",
                \"html\": \"<div style='font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;'><h1 style='font-size: 24px; margin-bottom: 24px;'>Your stream is ready!</h1><p style='font-size: 16px; line-height: 1.6; color: #333;'>Great news — <strong>\\\"$stream_title\\\"</strong> is now live and ready to share.</p><div style='margin: 32px 0;'><a href='$stream_url' style='display: inline-block; background: #0a0a0f; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-size: 16px;'>View Your Stream →</a></div><p style='font-size: 16px; line-height: 1.6; color: #333;'>Share this link with anyone — it works on any device with a modern browser.</p><div style='margin: 32px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;'><p style='margin: 0; font-size: 14px; color: #666;'><strong>Your stream URL:</strong><br><a href='$stream_url' style='color: #0066cc;'>$stream_url</a></p></div><p style='font-size: 14px; color: #666;'>Questions or feedback? Just reply to this email.</p><p style='font-size: 14px; color: #999; margin-top: 40px;'>— Claude at DownStream</p></div>\"
            }" > /dev/null
        log "INFO" "Delivery email sent to $CUSTOMER_EMAIL"
        return 0
    else
        log "ERROR" "Cannot send delivery email - RESEND_API_KEY not set"
        return 1
    fi
}

# Main production pipeline
main() {
    log "INFO" "=========================================="
    log "INFO" "Starting production for stream: $STREAM_ID"
    log "INFO" "Customer: $CUSTOMER_EMAIL"
    log "INFO" "Order: $ORDER_ID"
    log "INFO" "=========================================="

    # Notify Discord - production starting
    notify_discord "warning" "Production Started" "" "[
        {\"name\": \"Stream\", \"value\": \"\`$STREAM_ID\`\", \"inline\": true},
        {\"name\": \"Customer\", \"value\": \"$CUSTOMER_EMAIL\", \"inline\": true},
        {\"name\": \"Order\", \"value\": \"\`$ORDER_ID\`\", \"inline\": true}
    ]"

    # Ensure stream directory exists
    mkdir -p "$STREAM_DIR"

    # =========================================================================
    # STAGE 1: Create production spec from input
    # =========================================================================
    log "INFO" "STAGE 1: Creating production spec..."

    INPUT_FILE="$STREAM_DIR/input.json"
    PRODUCTION_FILE="$STREAM_DIR/production.json"

    if [ ! -f "$INPUT_FILE" ]; then
        log "ERROR" "input.json not found at $INPUT_FILE"
        alert_ferenc "Production Failed - No Input" "input.json not found for stream $STREAM_ID"
        exit 1
    fi

    if [ ! -f "$PRODUCTION_FILE" ]; then
        log "INFO" "Creating production.json from input.json..."

        # Call Claude to create production spec
        cd "$PROJECT_DIR"
        SPEC_PROMPT="You are creating a production spec for a DownStream stream.

Read the input file at: pipeline/streams/$STREAM_ID/input.json

Use the create-production-spec skill to transform this into a full production.json with:
- Visual direction (style, colors, references)
- Segments with image prompts, negative prompts, motion prompts
- Sections mapping text to segments

Output the production.json to: pipeline/streams/$STREAM_ID/production.json

This is an automated production run. Execute the skill now."

        if ! claude -p "$SPEC_PROMPT" --print --allowedTools "Write Edit Read Glob Grep Bash" > /dev/null 2>&1; then
            log "ERROR" "Failed to create production spec"
            alert_ferenc "Production Failed - Spec Creation" "Claude failed to create production.json"
            exit 1
        fi

        if [ ! -f "$PRODUCTION_FILE" ]; then
            log "ERROR" "production.json was not created"
            alert_ferenc "Production Failed - No Spec" "production.json not created after Claude call"
            exit 1
        fi
    else
        log "INFO" "production.json already exists, skipping spec creation"
    fi

    log "INFO" "STAGE 1 complete: production.json ready"

    # =========================================================================
    # STAGE 2: Generate keyframes
    # =========================================================================
    log "INFO" "STAGE 2: Generating keyframes..."

    KEYFRAMES_DIR="$STREAM_DIR/keyframes"
    mkdir -p "$KEYFRAMES_DIR"

    # Get segment count from production.json
    SEGMENT_COUNT=$(jq '.segments | length' "$PRODUCTION_FILE")
    log "INFO" "Found $SEGMENT_COUNT segments to generate"

    cd "$PIPELINE_DIR"

    for i in $(seq 0 $((SEGMENT_COUNT - 1))); do
        SEGMENT_ID=$((i + 1))
        KEYFRAME_FILE="$KEYFRAMES_DIR/segment_${SEGMENT_ID}.jpg"

        if [ -f "$KEYFRAME_FILE" ]; then
            log "INFO" "Keyframe $SEGMENT_ID already exists, skipping"
            continue
        fi

        log "INFO" "Generating keyframe for segment $SEGMENT_ID..."

        IMAGE_PROMPT=$(jq -r ".segments[$i].image_prompt" "$PRODUCTION_FILE")
        NEGATIVE_PROMPT=$(jq -r ".segments[$i].negative_prompt // \"\"" "$PRODUCTION_FILE")

        # Use previous keyframe as reference for consistency (if exists)
        REFERENCE_ARG=""
        if [ $SEGMENT_ID -gt 1 ]; then
            PREV_KEYFRAME="$KEYFRAMES_DIR/segment_$((SEGMENT_ID - 1)).jpg"
            if [ -f "$PREV_KEYFRAME" ]; then
                REFERENCE_ARG="--reference $PREV_KEYFRAME"
            fi
        fi

        if ! python execution/generate_frame.py \
            -p "$IMAGE_PROMPT" \
            --negative "$NEGATIVE_PROMPT" \
            -o "$KEYFRAME_FILE" \
            $REFERENCE_ARG; then
            log "ERROR" "Failed to generate keyframe for segment $SEGMENT_ID"
            alert_ferenc "Production Failed - Keyframe" "Failed to generate keyframe for segment $SEGMENT_ID"
            exit 1
        fi

        log "INFO" "Keyframe $SEGMENT_ID generated"

        # Small delay to avoid rate limits
        sleep 2
    done

    log "INFO" "STAGE 2 complete: All keyframes generated"

    # =========================================================================
    # STAGE 3: Generate videos
    # =========================================================================
    log "INFO" "STAGE 3: Generating videos..."

    VIDEOS_DIR="$STREAM_DIR/videos"
    mkdir -p "$VIDEOS_DIR"

    for i in $(seq 0 $((SEGMENT_COUNT - 1))); do
        SEGMENT_ID=$((i + 1))
        KEYFRAME_FILE="$KEYFRAMES_DIR/segment_${SEGMENT_ID}.jpg"
        VIDEO_FILE="$VIDEOS_DIR/segment_${SEGMENT_ID}.mp4"

        if [ -f "$VIDEO_FILE" ]; then
            log "INFO" "Video $SEGMENT_ID already exists, skipping"
            continue
        fi

        log "INFO" "Generating video for segment $SEGMENT_ID..."

        MOTION_PROMPT=$(jq -r ".segments[$i].motion_prompt" "$PRODUCTION_FILE")

        if ! python execution/generate_video.py \
            -i "$KEYFRAME_FILE" \
            -p "$MOTION_PROMPT" \
            -o "$VIDEO_FILE" \
            -m minimax; then
            log "ERROR" "Failed to generate video for segment $SEGMENT_ID"
            alert_ferenc "Production Failed - Video" "Failed to generate video for segment $SEGMENT_ID"
            exit 1
        fi

        log "INFO" "Video $SEGMENT_ID generated"
    done

    log "INFO" "STAGE 3 complete: All videos generated"

    # =========================================================================
    # STAGE 4: Extract frames
    # =========================================================================
    log "INFO" "STAGE 4: Extracting frames..."

    FRAMES_DIR="$STREAM_DIR/public/frames"
    mkdir -p "$FRAMES_DIR"

    for i in $(seq 0 $((SEGMENT_COUNT - 1))); do
        SEGMENT_ID=$((i + 1))
        VIDEO_FILE="$VIDEOS_DIR/segment_${SEGMENT_ID}.mp4"
        SEGMENT_FRAMES_DIR="$FRAMES_DIR/$SEGMENT_ID"

        if [ -d "$SEGMENT_FRAMES_DIR" ] && [ "$(ls -A $SEGMENT_FRAMES_DIR 2>/dev/null)" ]; then
            FRAME_COUNT=$(ls "$SEGMENT_FRAMES_DIR" | wc -l)
            log "INFO" "Frames for segment $SEGMENT_ID already exist ($FRAME_COUNT frames), skipping"
            continue
        fi

        log "INFO" "Extracting frames from video $SEGMENT_ID..."

        mkdir -p "$SEGMENT_FRAMES_DIR"

        if ! ffmpeg -i "$VIDEO_FILE" -y -c:v libwebp "$SEGMENT_FRAMES_DIR/frame_%04d.webp" > /dev/null 2>&1; then
            log "ERROR" "Failed to extract frames for segment $SEGMENT_ID"
            alert_ferenc "Production Failed - Frames" "Failed to extract frames for segment $SEGMENT_ID"
            exit 1
        fi

        FRAME_COUNT=$(ls "$SEGMENT_FRAMES_DIR" | wc -l)
        log "INFO" "Segment $SEGMENT_ID: $FRAME_COUNT frames extracted"
    done

    log "INFO" "STAGE 4 complete: All frames extracted"

    # =========================================================================
    # STAGE 5: Create stream app
    # =========================================================================
    log "INFO" "STAGE 5: Creating stream app..."

    STREAM_APP_DIR="$PROJECT_DIR/stream-$STREAM_ID"

    if [ -d "$STREAM_APP_DIR" ] && [ -f "$STREAM_APP_DIR/package.json" ]; then
        log "INFO" "Stream app already exists, skipping creation"
    else
        log "INFO" "Creating Next.js app via finalize-stream..."

        cd "$PROJECT_DIR"
        FINALIZE_PROMPT="You are finalizing a DownStream stream.

The stream ID is: $STREAM_ID
Production spec: pipeline/streams/$STREAM_ID/production.json
Frames are in: pipeline/streams/$STREAM_ID/public/frames/

Use the finalize-stream skill to:
1. Create the Next.js app at stream-$STREAM_ID/
2. Copy frames from the pipeline streams folder
3. Generate config.tsx from production.json (use actual frame counts)
4. Generate content.tsx with EXACT original text from production.json
5. Create all necessary Next.js files

This is an automated production run. Execute the skill now."

        if ! claude -p "$FINALIZE_PROMPT" --print --allowedTools "Write Edit Read Glob Grep Bash" > /dev/null 2>&1; then
            log "ERROR" "Failed to create stream app"
            alert_ferenc "Production Failed - App Creation" "Claude failed to create stream app"
            exit 1
        fi

        if [ ! -d "$STREAM_APP_DIR" ]; then
            log "ERROR" "Stream app directory not created"
            alert_ferenc "Production Failed - No App" "stream-$STREAM_ID directory not created"
            exit 1
        fi
    fi

    # Install dependencies
    cd "$STREAM_APP_DIR"
    if [ ! -d "node_modules" ]; then
        log "INFO" "Installing dependencies..."
        npm install --silent
    fi

    log "INFO" "STAGE 5 complete: Stream app ready"

    # =========================================================================
    # STAGE 6: Deploy to Vercel
    # =========================================================================
    log "INFO" "STAGE 6: Deploying to Vercel..."

    if [ -z "$VERCEL_TOKEN" ]; then
        log "ERROR" "VERCEL_TOKEN not set, cannot deploy"
        alert_ferenc "Production Failed - No Vercel Token" "Cannot deploy - VERCEL_TOKEN not configured"
        exit 1
    fi

    cd "$STREAM_APP_DIR"

    # Deploy to Vercel
    DEPLOY_OUTPUT=$(vercel deploy --prod --token="$VERCEL_TOKEN" --yes 2>&1)
    DEPLOY_STATUS=$?

    if [ $DEPLOY_STATUS -ne 0 ]; then
        log "ERROR" "Vercel deployment failed: $DEPLOY_OUTPUT"
        alert_ferenc "Production Failed - Deployment" "Vercel deployment failed:\n$DEPLOY_OUTPUT"
        exit 1
    fi

    # Extract deployment URL
    STREAM_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*' | tail -1)

    if [ -z "$STREAM_URL" ]; then
        log "ERROR" "Could not extract deployment URL"
        alert_ferenc "Production Failed - No URL" "Deployment succeeded but could not extract URL"
        exit 1
    fi

    log "INFO" "Deployed to: $STREAM_URL"
    log "INFO" "STAGE 6 complete: Stream deployed"

    # =========================================================================
    # STAGE 7: Send delivery email
    # =========================================================================
    log "INFO" "STAGE 7: Sending delivery email..."

    STREAM_TITLE=$(jq -r '.stream.title // "Your Stream"' "$PRODUCTION_FILE")

    if send_delivery_email "$STREAM_URL" "$STREAM_TITLE"; then
        log "INFO" "STAGE 7 complete: Customer notified"
    else
        log "ERROR" "Failed to send delivery email"
        # Don't fail the whole pipeline for email - stream is live
        alert_ferenc "Warning - Email Failed" "Stream deployed but delivery email failed\nURL: $STREAM_URL"
    fi

    # =========================================================================
    # COMPLETE
    # =========================================================================
    log "INFO" "=========================================="
    log "INFO" "PRODUCTION COMPLETE"
    log "INFO" "Stream: $STREAM_ID"
    log "INFO" "URL: $STREAM_URL"
    log "INFO" "Customer: $CUSTOMER_EMAIL"
    log "INFO" "=========================================="

    # Notify Discord - production complete
    notify_discord "success" "Stream Delivered" "" "[
        {\"name\": \"Stream\", \"value\": \"$STREAM_TITLE\", \"inline\": false},
        {\"name\": \"Customer\", \"value\": \"$CUSTOMER_EMAIL\", \"inline\": true},
        {\"name\": \"Order\", \"value\": \"\`$ORDER_ID\`\", \"inline\": true},
        {\"name\": \"URL\", \"value\": \"$STREAM_URL\", \"inline\": false}
    ]"

    # Save deployment info
    echo "{
  \"stream_id\": \"$STREAM_ID\",
  \"order_id\": \"$ORDER_ID\",
  \"customer_email\": \"$CUSTOMER_EMAIL\",
  \"stream_url\": \"$STREAM_URL\",
  \"deployed_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"status\": \"delivered\"
}" > "$STREAM_DIR/deployment.json"

    return 0
}

# Run main with error handling
if ! main; then
    log "ERROR" "Production pipeline failed"
    exit 1
fi
