#!/bin/bash
# Start the DownStream Director Dashboard

# Get script directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if running in development or production
if [ "$1" == "--prod" ]; then
    echo "Starting Director Dashboard (production mode)..."
    cd "$DIR"
    python3 -m uvicorn api:app --host 0.0.0.0 --port 8083
else
    echo "Starting Director Dashboard (development mode)..."
    cd "$DIR"
    python3 -m uvicorn api:app --reload --port 8083
fi
