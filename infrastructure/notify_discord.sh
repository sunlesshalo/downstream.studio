#!/bin/bash
# notify_discord.sh
# Sends formatted messages to Discord webhook
#
# Usage:
#   source notify_discord.sh
#   notify_discord "success" "Title" "Description" '[{"name":"Field","value":"Value"}]'
#
# Or directly:
#   ./notify_discord.sh <type> <title> <description> <fields_json>
#
# Types: success, error, warning, info, order

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment
source "$PROJECT_DIR/.env" 2>/dev/null || true

# Color codes (decimal)
COLOR_SUCCESS=3066993   # Green
COLOR_ERROR=15158332    # Red
COLOR_WARNING=15844367  # Yellow/Orange
COLOR_INFO=3447003      # Blue
COLOR_ORDER=3066993     # Green (for orders)

notify_discord() {
    local type="$1"
    local title="$2"
    local description="$3"
    local fields="${4:-[]}"

    if [ -z "$DISCORD_WEBHOOK_URL" ]; then
        echo "[notify_discord] DISCORD_WEBHOOK_URL not set, skipping"
        return 0
    fi

    # Select color based on type
    local color
    case "$type" in
        success)  color=$COLOR_SUCCESS ;;
        error)    color=$COLOR_ERROR ;;
        warning)  color=$COLOR_WARNING ;;
        info)     color=$COLOR_INFO ;;
        order)    color=$COLOR_ORDER ;;
        *)        color=$COLOR_INFO ;;
    esac

    # Build JSON payload
    local payload
    payload=$(cat <<EOF
{
    "embeds": [{
        "title": "$title",
        "description": "$description",
        "color": $color,
        "fields": $fields,
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }]
}
EOF
)

    # Send to Discord
    curl -s -H "Content-Type: application/json" \
        -d "$payload" \
        "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1

    echo "[notify_discord] Sent: $title"
}

# Convenience functions for common notifications
notify_order() {
    local customer="$1"
    local amount="$2"
    local stream_title="$3"
    local order_id="$4"

    notify_discord "order" "New Order" "" "[
        {\"name\": \"Customer\", \"value\": \"$customer\", \"inline\": true},
        {\"name\": \"Amount\", \"value\": \"$amount\", \"inline\": true},
        {\"name\": \"Stream\", \"value\": \"$stream_title\", \"inline\": false},
        {\"name\": \"Order ID\", \"value\": \"\`$order_id\`\", \"inline\": false}
    ]"
}

notify_production_start() {
    local stream_id="$1"
    local customer="$2"
    local segment_count="$3"

    notify_discord "warning" "Production Started" "" "[
        {\"name\": \"Stream\", \"value\": \"\`$stream_id\`\", \"inline\": true},
        {\"name\": \"Customer\", \"value\": \"$customer\", \"inline\": true},
        {\"name\": \"Segments\", \"value\": \"$segment_count\", \"inline\": true}
    ]"
}

notify_production_complete() {
    local stream_id="$1"
    local customer="$2"
    local stream_url="$3"
    local stream_title="$4"

    notify_discord "success" "Stream Delivered" "" "[
        {\"name\": \"Stream\", \"value\": \"$stream_title\", \"inline\": false},
        {\"name\": \"Customer\", \"value\": \"$customer\", \"inline\": true},
        {\"name\": \"URL\", \"value\": \"$stream_url\", \"inline\": false}
    ]"
}

notify_production_failed() {
    local stream_id="$1"
    local customer="$2"
    local stage="$3"
    local error="$4"

    notify_discord "error" "Production Failed" "" "[
        {\"name\": \"Stream\", \"value\": \"\`$stream_id\`\", \"inline\": true},
        {\"name\": \"Customer\", \"value\": \"$customer\", \"inline\": true},
        {\"name\": \"Stage\", \"value\": \"$stage\", \"inline\": false},
        {\"name\": \"Error\", \"value\": \"$error\", \"inline\": false}
    ]"
}

notify_support_email() {
    local from="$1"
    local subject="$2"
    local preview="$3"

    notify_discord "warning" "Support Email" "" "[
        {\"name\": \"From\", \"value\": \"$from\", \"inline\": true},
        {\"name\": \"Subject\", \"value\": \"$subject\", \"inline\": false},
        {\"name\": \"Preview\", \"value\": \"$preview\", \"inline\": false}
    ]"
}

# If called directly (not sourced), run with arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [ $# -lt 2 ]; then
        echo "Usage: $0 <type> <title> [description] [fields_json]"
        echo "Types: success, error, warning, info, order"
        exit 1
    fi
    notify_discord "$1" "$2" "${3:-}" "${4:-[]}"
fi
