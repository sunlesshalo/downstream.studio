#!/bin/bash
# setup_hetzner.sh
# One-time setup for Hetzner server

set -e

echo "=== DownStream SaaS Hetzner Setup ==="

# Configuration - UPDATE THESE PATHS
AIRUNBUSINESS_DIR="$HOME/AIrunBusiness"
DOWNSTREAM_DIR="$HOME/downstream"

# Create directory structure
echo "Creating directories..."
mkdir -p "$AIRUNBUSINESS_DIR/infrastructure/jobs"/{pending,processing,review,completed,failed}
mkdir -p "$AIRUNBUSINESS_DIR/infrastructure/triggers"
mkdir -p "$AIRUNBUSINESS_DIR/logs"
mkdir -p "$AIRUNBUSINESS_DIR/memory"/{DAILY,WEEKLY,MONTHLY,QUARTERLY}
mkdir -p "$AIRUNBUSINESS_DIR/proposals"

# Copy memory files (will be synced from local)
echo "Memory files should be synced from local machine"

# Make all scripts executable
chmod +x "$AIRUNBUSINESS_DIR/infrastructure/"*.sh

# Update paths in all scripts
echo "Updating paths in scripts..."
for script in "$AIRUNBUSINESS_DIR/infrastructure/"*.sh; do
    sed -i "s|/path/to/AIrunBusiness|$AIRUNBUSINESS_DIR|g" "$script"
done

# Update paths in crontab
sed -i "s|/path/to/AIrunBusiness|$AIRUNBUSINESS_DIR|g" "$AIRUNBUSINESS_DIR/infrastructure/crontab.txt"

# Install crontab
echo "Installing crontab..."
crontab "$AIRUNBUSINESS_DIR/infrastructure/crontab.txt"

# Verify
echo ""
echo "=== Setup Complete ==="
echo "Crontab installed:"
crontab -l
echo ""
echo "Job directories:"
ls -la "$AIRUNBUSINESS_DIR/infrastructure/jobs/"
echo ""
echo "Next steps:"
echo "1. Ensure Claude Code is installed and authenticated"
echo "2. Ensure downstream project is at $DOWNSTREAM_DIR"
echo "3. Set environment variables (GOOGLE_AI_API_KEY, REPLICATE_API_TOKEN, VERCEL_TOKEN)"
echo "4. Test with: touch $AIRUNBUSINESS_DIR/infrastructure/jobs/pending/test-stream.json"
