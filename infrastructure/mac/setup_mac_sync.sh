#!/bin/bash
# setup_mac_sync.sh
# Sets up automatic git sync on Mac (pulls from GitHub every hour)

SCRIPT_DIR="$(dirname "$0")"
PLIST_NAME="com.downstream.sync.plist"
PLIST_SOURCE="$SCRIPT_DIR/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "Setting up DownStream auto-sync..."

# Create LaunchAgents directory if needed
mkdir -p "$HOME/Library/LaunchAgents"

# Copy plist
cp "$PLIST_SOURCE" "$PLIST_DEST"

# Unload if already loaded
launchctl unload "$PLIST_DEST" 2>/dev/null

# Load the new plist
launchctl load "$PLIST_DEST"

echo "Auto-sync installed!"
echo "- Syncs every hour"
echo "- Also syncs at login"
echo "- Logs to /tmp/downstream-sync.log"
echo ""
echo "To check status: launchctl list | grep downstream"
echo "To uninstall: launchctl unload $PLIST_DEST && rm $PLIST_DEST"
