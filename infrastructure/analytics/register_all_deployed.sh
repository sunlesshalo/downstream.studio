#!/usr/bin/env bash
# register_all_deployed.sh
# Registers all deployed streams with the analytics backend
#
# Usage: ./register_all_deployed.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTER_SCRIPT="$PROJECT_ROOT/infrastructure/analytics/register_stream.sh"

echo "=== Registering All Deployed Streams with Analytics ==="
echo ""

# Make register script executable
chmod +x "$REGISTER_SCRIPT"

# Known deployed streams (stream_id|url pairs)
KNOWN_STREAMS=(
    "az-utols-iro|https://stream-az-utols-9u7mdyg5j-ferenczs-projects-a1c1d3b4.vercel.app"
    "nvnyeknek-mondotta-el-rszlet|https://stream-nvnyeknek-mondotta-el-rszlet-r97b2zj19.vercel.app"
    "fotoszintezis-demo|https://stream-fotoszintezis-demo-h0u5vkdao-ferenczs-projects-a1c1d3b4.vercel.app"
    "bolyai|https://stream-bolyai-cxg6p54xu-ferenczs-projects-a1c1d3b4.vercel.app"
)

# Collect all stream|url pairs
ALL_STREAMS=("${KNOWN_STREAMS[@]}")

# Scan for deployment.json files
echo "Scanning for deployment.json files..."
if [ -d "$PROJECT_ROOT/streams/specs" ]; then
    while IFS= read -r deployment_file; do
        stream_dir=$(dirname "$deployment_file")
        stream_id=$(basename "$stream_dir")
        url=$(jq -r '.url // empty' "$deployment_file")
        if [ -n "$url" ]; then
            # Add to array if not already present
            already_added=false
            for entry in "${ALL_STREAMS[@]}"; do
                if [[ "$entry" == "$stream_id|"* ]]; then
                    already_added=true
                    break
                fi
            done
            if [ "$already_added" = false ]; then
                ALL_STREAMS+=("$stream_id|$url")
            fi
        fi
    done < <(find "$PROJECT_ROOT/streams/specs" -name "deployment.json" 2>/dev/null)
fi

if [ ${#ALL_STREAMS[@]} -eq 0 ]; then
    echo "No deployed streams found."
    exit 0
fi

echo "Found ${#ALL_STREAMS[@]} deployed stream(s)"
echo ""

# Register each stream
SUCCESS=0
FAILED=0

for entry in "${ALL_STREAMS[@]}"; do
    stream_id="${entry%%|*}"
    url="${entry#*|}"
    echo "----------------------------------------"

    if "$REGISTER_SCRIPT" "$stream_id" "$url"; then
        ((SUCCESS++))
    else
        ((FAILED++))
        echo "  ⚠️  Failed to register $stream_id"
    fi
    echo ""
done

echo "========================================"
echo "Registration complete:"
echo "  ✓ Success: $SUCCESS"
echo "  ✗ Failed: $FAILED"
echo "========================================"

exit 0
