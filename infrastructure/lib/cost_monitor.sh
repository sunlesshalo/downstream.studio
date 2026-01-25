#!/bin/bash
# cost_monitor.sh
# Track and alert on API costs for DownStream operations
# Helps prevent runaway spending and enables cost visibility

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
COST_LOG="$PROJECT_DIR/logs/costs.json"
DAILY_BUDGET=20  # USD - alert threshold

# Ensure logs directory exists
mkdir -p "$(dirname "$COST_LOG")"

# ============================================
# COST TRACKING FUNCTIONS
# ============================================

# Initialize or load cost tracking
init_cost_tracking() {
    if [ ! -f "$COST_LOG" ]; then
        echo '{
  "daily_limit": 20,
  "monthly_limit": 300,
  "current_day": "'$(date '+%Y-%m-%d')'",
  "current_month": "'$(date '+%Y-%m')'",
  "daily_total": 0,
  "monthly_total": 0,
  "services": {
    "replicate": { "daily": 0, "monthly": 0 },
    "google_ai": { "daily": 0, "monthly": 0 },
    "anthropic": { "daily": 0, "monthly": 0 },
    "resend": { "daily": 0, "monthly": 0 }
  },
  "history": []
}' > "$COST_LOG"
    fi

    # Reset daily counters if new day
    local today=$(date '+%Y-%m-%d')
    local logged_day=$(jq -r '.current_day' "$COST_LOG")
    if [ "$today" != "$logged_day" ]; then
        # Archive yesterday and reset daily counters
        jq --arg today "$today" '
          .history += [{
            "date": .current_day,
            "total": .daily_total,
            "services": (.services | to_entries | map({(.key): .value.daily}) | add)
          }] |
          .current_day = $today |
          .daily_total = 0 |
          .services |= with_entries(.value.daily = 0)
        ' "$COST_LOG" > "$COST_LOG.tmp" && mv "$COST_LOG.tmp" "$COST_LOG"
    fi

    # Reset monthly counters if new month
    local this_month=$(date '+%Y-%m')
    local logged_month=$(jq -r '.current_month' "$COST_LOG")
    if [ "$this_month" != "$logged_month" ]; then
        jq --arg month "$this_month" '
          .current_month = $month |
          .monthly_total = 0 |
          .services |= with_entries(.value.monthly = 0)
        ' "$COST_LOG" > "$COST_LOG.tmp" && mv "$COST_LOG.tmp" "$COST_LOG"
    fi
}

# Log a cost event
# Usage: log_cost "replicate" 0.05 "video generation for order-123"
log_cost() {
    local service="$1"
    local amount="$2"
    local description="${3:-}"

    init_cost_tracking

    jq --arg svc "$service" --argjson amt "$amount" --arg desc "$description" '
      .daily_total += $amt |
      .monthly_total += $amt |
      .services[$svc].daily += $amt |
      .services[$svc].monthly += $amt
    ' "$COST_LOG" > "$COST_LOG.tmp" && mv "$COST_LOG.tmp" "$COST_LOG"

    echo "[COST] $service: \$$amount - $description"
}

# Get current daily total
get_daily_total() {
    init_cost_tracking
    jq -r '.daily_total' "$COST_LOG"
}

# Get current monthly total
get_monthly_total() {
    init_cost_tracking
    jq -r '.monthly_total' "$COST_LOG"
}

# Check if over budget and alert
check_budget() {
    init_cost_tracking

    local daily=$(jq -r '.daily_total' "$COST_LOG")
    local monthly=$(jq -r '.monthly_total' "$COST_LOG")
    local daily_limit=$(jq -r '.daily_limit' "$COST_LOG")
    local monthly_limit=$(jq -r '.monthly_limit' "$COST_LOG")

    local alert_needed=false
    local alert_message=""

    # Check daily limit
    if (( $(echo "$daily >= $daily_limit" | bc -l) )); then
        alert_needed=true
        alert_message="Daily cost limit reached: \$$daily / \$$daily_limit"
    elif (( $(echo "$daily >= ($daily_limit * 0.8)" | bc -l) )); then
        alert_needed=true
        alert_message="Daily cost warning (80%): \$$daily / \$$daily_limit"
    fi

    # Check monthly limit
    if (( $(echo "$monthly >= $monthly_limit" | bc -l) )); then
        alert_needed=true
        alert_message="Monthly cost limit reached: \$$monthly / \$$monthly_limit"
    elif (( $(echo "$monthly >= ($monthly_limit * 0.8)" | bc -l) )); then
        alert_needed=true
        alert_message="${alert_message:+$alert_message | }Monthly cost warning (80%): \$$monthly / \$$monthly_limit"
    fi

    if [ "$alert_needed" = true ]; then
        echo "[COST ALERT] $alert_message"

        # Send Discord alert if configured
        if [ -n "$DISCORD_WEBHOOK_URL" ]; then
            curl -s -X POST "$DISCORD_WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{
                    \"embeds\": [{
                        \"title\": \"Cost Alert\",
                        \"description\": \"$alert_message\",
                        \"color\": 15158332,
                        \"fields\": [
                            {\"name\": \"Daily\", \"value\": \"\$$daily / \$$daily_limit\", \"inline\": true},
                            {\"name\": \"Monthly\", \"value\": \"\$$monthly / \$$monthly_limit\", \"inline\": true}
                        ],
                        \"footer\": {\"text\": \"DownStream Cost Monitor\"},
                        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
                    }]
                }" > /dev/null 2>&1
        fi

        return 1  # Over budget
    fi

    return 0  # Under budget
}

# Get cost summary
get_cost_summary() {
    init_cost_tracking

    echo "=== Cost Summary ==="
    echo "Date: $(date '+%Y-%m-%d %H:%M')"
    echo ""
    echo "Daily Total: \$$(jq -r '.daily_total' "$COST_LOG") / \$$(jq -r '.daily_limit' "$COST_LOG")"
    echo "Monthly Total: \$$(jq -r '.monthly_total' "$COST_LOG") / \$$(jq -r '.monthly_limit' "$COST_LOG")"
    echo ""
    echo "By Service (Today):"
    jq -r '.services | to_entries[] | "  \(.key): $\(.value.daily)"' "$COST_LOG"
    echo ""
    echo "By Service (Month):"
    jq -r '.services | to_entries[] | "  \(.key): $\(.value.monthly)"' "$COST_LOG"
}

# ============================================
# ESTIMATED COSTS PER OPERATION
# ============================================
# These are estimates - actual costs may vary

# Replicate video generation (Kling)
# - Kling v2.1 Standard: ~$0.25 per 5s video (default)
# - Kling v2.1 Pro: ~$0.45 per 5s video (1080p)
# - Kling v2.5 Pro: ~$0.50-1.00 per video
# - Kling Turbo: ~$0.25-0.50 per video

# Google AI (Gemini)
# - Image generation: ~$0.01-0.02 per image
# - Text (Claude Code uses Anthropic, not Google for text)

# Anthropic (Claude)
# - Input: $3/million tokens
# - Output: $15/million tokens
# - Typical email: ~$0.001-0.005

# Resend
# - 3,000 free emails/month
# - Then $0.001 per email

# ============================================
# CLI INTERFACE
# ============================================

if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    case "${1:-}" in
        log)
            log_cost "$2" "$3" "$4"
            ;;
        check)
            check_budget
            ;;
        summary)
            get_cost_summary
            ;;
        daily)
            echo "$(get_daily_total)"
            ;;
        monthly)
            echo "$(get_monthly_total)"
            ;;
        *)
            echo "Usage: $0 {log|check|summary|daily|monthly}"
            echo ""
            echo "Commands:"
            echo "  log <service> <amount> [description]  - Log a cost event"
            echo "  check                                  - Check if over budget (alerts if so)"
            echo "  summary                               - Show cost summary"
            echo "  daily                                 - Get daily total"
            echo "  monthly                               - Get monthly total"
            echo ""
            echo "Example: $0 log replicate 0.05 'video for order-123'"
            ;;
    esac
fi
