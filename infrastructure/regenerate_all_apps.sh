#!/usr/bin/env bash
# regenerate_all_apps.sh
# Regenerate ALL stream apps with fixed tracker

STREAMS=(
    "az-utols-iro"
    "bolyai"
    "demo-club-promo"
    "demo-restaurant-mediterranean"
    "fotoszintezis-demo"
    "founding-story"
    "nvnyeknek-mondotta-el-rszlet"
)

echo "=== Regenerating ALL Stream Apps with Fixed Tracker ==="
echo "Total streams: ${#STREAMS[@]}"
echo ""

cd /root/downstream

SUCCESS=0
FAILED=0

for stream in "${STREAMS[@]}"; do
    echo "========================================="
    echo "Regenerating: $stream"
    echo "========================================="

    if python3 factory/execution/generate_app.py --stream-id "$stream" --skip-frames 2>&1 | tail -10; then
        ((SUCCESS++))
        echo "✓ $stream regenerated"
    else
        ((FAILED++))
        echo "✗ $stream failed"
    fi
    echo ""
done

echo "========================================="
echo "Regeneration complete:"
echo "  ✓ Success: $SUCCESS"
echo "  ✗ Failed: $FAILED"
echo "========================================="
