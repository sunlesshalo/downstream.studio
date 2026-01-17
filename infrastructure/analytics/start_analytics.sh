#!/bin/bash
# Start the DownStream Analytics API server
#
# Usage:
#   ./start_analytics.sh              # Run in foreground
#   ./start_analytics.sh --daemon     # Run as background daemon

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${PROJECT_DIR:-$(dirname $(dirname $SCRIPT_DIR))}"

# Environment
export DS_ANALYTICS_DB="${DS_ANALYTICS_DB:-/var/lib/downstream/analytics.db}"
export DS_ANALYTICS_ENDPOINT="${DS_ANALYTICS_ENDPOINT:-https://analytics.downstream.ink}"

# Ensure database directory exists
mkdir -p "$(dirname "$DS_ANALYTICS_DB")"

# Initialize database if needed
if [ ! -f "$DS_ANALYTICS_DB" ]; then
    echo "Initializing database at $DS_ANALYTICS_DB"
    sqlite3 "$DS_ANALYTICS_DB" < "$SCRIPT_DIR/schema.sql"
    echo "Database initialized"
fi

# Check for required Python packages
python3 -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "Installing required packages..."
    pip3 install -r "$SCRIPT_DIR/requirements.txt"
}

# Start server
if [ "$1" = "--daemon" ]; then
    echo "Starting analytics API as daemon..."
    nohup python3 "$SCRIPT_DIR/api.py" > "$PROJECT_DIR/logs/analytics.log" 2>&1 &
    echo $! > "$PROJECT_DIR/logs/analytics.pid"
    echo "Analytics API started (PID: $(cat "$PROJECT_DIR/logs/analytics.pid"))"
    echo "Logs: $PROJECT_DIR/logs/analytics.log"
else
    echo "Starting analytics API in foreground..."
    echo "Database: $DS_ANALYTICS_DB"
    echo "Endpoint: $DS_ANALYTICS_ENDPOINT"
    echo ""
    python3 "$SCRIPT_DIR/api.py"
fi
