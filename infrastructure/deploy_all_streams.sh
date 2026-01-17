#!/usr/bin/env bash
# deploy_all_streams.sh
# Deploy ALL streams to Vercel with analytics tracker

set -e

STREAMS_DIR="/root/downstream/streams/apps"
ENV_FILE="/root/downstream/.env"

# Stream directories to deploy
STREAMS=(
    "az-ehseg-v2"
    "az-utols-iro"
    "bolyai"
    "demo-club-promo"
    "demo-restaurant-mediterranean"
    "fotoszintezis-demo"
    "founding-story"
    "nvnyeknek-mondotta-el-rszlet"
    "the-hunger-perf"
    "the-loop-demo"
)

echo "=== Deploying ALL Streams to Vercel ==="
echo "Total streams: ${#STREAMS[@]}"
echo ""

source "$ENV_FILE"

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not found"
    exit 1
fi

SUCCESS=0
FAILED=0

for stream in "${STREAMS[@]}"; do
    echo "========================================"
    echo "Deploying: $stream"
    echo "========================================"

    cd "$STREAMS_DIR/$stream"

    if npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" 2>&1 | tee "/tmp/deploy-$stream.log"; then
        ((SUCCESS++))
        echo "✓ $stream deployed successfully"
    else
        ((FAILED++))
        echo "✗ $stream deployment failed"
    fi

    echo ""
done

echo "========================================"
echo "Deployment complete:"
echo "  ✓ Success: $SUCCESS"
echo "  ✗ Failed: $FAILED"
echo "========================================"
