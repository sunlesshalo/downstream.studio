#!/bin/bash
# process_orders.sh
# Uses Claude Code to process new orders (paid via Stripe)
# Creates production spec, generates content, deploys stream

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
JOBS_DIR="$SCRIPT_DIR/jobs"
PENDING="$JOBS_DIR/pending"
PROCESSING="$JOBS_DIR/processing"
COMPLETED="$JOBS_DIR/completed"
FAILED="$JOBS_DIR/failed"

# Pull latest
cd "$PROJECT_DIR"
git pull origin main --quiet 2>/dev/null || true

# Process new orders
for job_file in "$PENDING"/order-*.json; do
    [ -f "$job_file" ] || continue

    JOB_ID=$(basename "$job_file" .json)
    echo "=== Processing order: $JOB_ID ==="

    # Move to processing
    mv "$job_file" "$PROCESSING/"
    PROCESSING_FILE="$PROCESSING/$JOB_ID.json"

    # Extract order details
    CUSTOMER_EMAIL=$(jq -r '.customer_email' "$PROCESSING_FILE")
    STREAM_TITLE=$(jq -r '.stream_title' "$PROCESSING_FILE")
    STREAM_ID=$(jq -r '.stream_id' "$PROCESSING_FILE")
    AMOUNT=$(jq -r '.amount_paid' "$PROCESSING_FILE")
    STORY_TEXT=$(jq -r '.story_text // ""' "$PROCESSING_FILE")

    echo "Customer: $CUSTOMER_EMAIL"
    echo "Stream: $STREAM_TITLE ($STREAM_ID)"
    echo "Amount: €$AMOUNT"
    echo "---"

    # Log to operations
    LOG_FILE="$PROJECT_DIR/chronicle/OPERATIONS.md"
    echo "" >> "$LOG_FILE"
    echo "### $(date '+%Y-%m-%d %H:%M') — webhook:stripe" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "**New Order Received**" >> "$LOG_FILE"
    echo "- Customer: $CUSTOMER_EMAIL" >> "$LOG_FILE"
    echo "- Stream: $STREAM_TITLE" >> "$LOG_FILE"
    echo "- Amount: €$AMOUNT" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"

    # Build prompt for Claude to process the order
    PROMPT="You are processing a new DownStream order. A customer has paid for a scroll-driven story.

ORDER DETAILS:
- Customer: $CUSTOMER_EMAIL
- Stream Title: $STREAM_TITLE
- Stream ID: $STREAM_ID
- Amount Paid: €$AMOUNT
- Story Content: $STORY_TEXT

YOUR TASK:
1. Read the customer's story content
2. Create a production spec (input.json) in pipeline/streams/$STREAM_ID/
3. The spec should have 5-12 segments based on text length (see create-production-spec skill)
4. Use the existing demo streams as reference for format

After creating the spec, I will run the production pipeline to generate the actual stream.

Create the input.json file now. If the story content is empty or unclear, create a placeholder spec and note that we need to contact the customer for their story."

    # Call Claude Code to create production spec
    echo "Calling Claude to create production spec..."
    CLAUDE_OUTPUT=$(cd "$PROJECT_DIR" && claude -p "$PROMPT" --print --allowedTools "Write Edit Read Glob Grep Bash" 2>&1 || echo "CLAUDE_ERROR")

    if [[ "$CLAUDE_OUTPUT" == *"CLAUDE_ERROR"* ]] || [ -z "$CLAUDE_OUTPUT" ]; then
        echo "Error: Claude failed to process order"
        echo "Moving to failed..."
        mv "$PROCESSING_FILE" "$FAILED/"

        echo "**Status:** FAILED - Claude error" >> "$LOG_FILE"
        continue
    fi

    echo "Claude output:"
    echo "$CLAUDE_OUTPUT" | head -20
    echo "---"

    # Check if input.json was created
    SPEC_FILE="$PROJECT_DIR/pipeline/streams/$STREAM_ID/input.json"
    if [ -f "$SPEC_FILE" ]; then
        echo "Production spec created: $SPEC_FILE"
        echo "**Status:** Input spec created" >> "$LOG_FILE"

        # Run the full production pipeline
        echo ""
        echo "=== Starting production pipeline ==="
        echo ""

        if "$SCRIPT_DIR/produce_stream.sh" "$STREAM_ID" "$CUSTOMER_EMAIL" "$JOB_ID"; then
            # Production succeeded
            mv "$PROCESSING_FILE" "$COMPLETED/"

            # Get deployment URL from the deployment.json
            DEPLOYMENT_FILE="$PROJECT_DIR/pipeline/streams/$STREAM_ID/deployment.json"
            if [ -f "$DEPLOYMENT_FILE" ]; then
                STREAM_URL=$(jq -r '.stream_url' "$DEPLOYMENT_FILE")
                echo "**Status:** DELIVERED" >> "$LOG_FILE"
                echo "**URL:** $STREAM_URL" >> "$LOG_FILE"
            else
                echo "**Status:** Production complete (no deployment info)" >> "$LOG_FILE"
            fi
        else
            # Production failed - alert already sent by produce_stream.sh
            mv "$PROCESSING_FILE" "$FAILED/"
            echo "**Status:** FAILED - Production pipeline error" >> "$LOG_FILE"
            echo "See pipeline/streams/$STREAM_ID/production.log for details" >> "$LOG_FILE"
        fi
        echo "" >> "$LOG_FILE"
    else
        echo "Warning: No spec file created, moving to review for manual handling"
        mv "$PROCESSING_FILE" "$JOBS_DIR/review/"

        echo "**Status:** Needs manual review - no spec created" >> "$LOG_FILE"
    fi

    echo "=== Done: $JOB_ID ==="
    echo ""
done

# Commit any changes
cd "$PROJECT_DIR"
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "[auto:order] Processed new orders" --quiet
    git push origin main --quiet
fi

echo "Order processing complete."
