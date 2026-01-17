#!/bin/bash
# Migration script: /root/downstream.ink → /root/downstream
# Run this on Hetzner server as root

set -e  # Exit on error

echo "============================================"
echo "DownStream Repository Migration"
echo "============================================"
echo ""

# Safety check
if [ ! -d "/root/downstream.ink" ]; then
    echo "Error: /root/downstream.ink not found"
    exit 1
fi

if [ -d "/root/downstream" ]; then
    echo "Error: /root/downstream already exists"
    echo "Please remove or rename it first"
    exit 1
fi

echo "Step 1: Stopping services..."
systemctl stop director 2>/dev/null || echo "  Director service not running"
# Kill any running Claude Code processes
pkill -f "claude.*downstream" || true
echo "  ✓ Services stopped"
echo ""

echo "Step 2: Renaming directory..."
cd /root
mv downstream.ink downstream
echo "  ✓ Renamed /root/downstream.ink → /root/downstream"
echo ""

echo "Step 3: Pulling latest changes from GitHub..."
cd downstream
git pull origin main
echo "  ✓ Latest code pulled (includes commit 4b61a36)"
echo ""

echo "Step 4: Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "  ✓ Virtual environment created"
else
    echo "  ✓ Virtual environment already exists"
fi

source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
echo "  Installing dependencies..."
pip install -r infrastructure/director/requirements.txt > /dev/null 2>&1
echo "  ✓ Director dependencies installed"
echo ""

echo "Step 5: Checking files that need path updates..."
echo "  Files with /root/downstream.ink references:"
grep -r "/root/downstream.ink" . \
    --include="*.sh" \
    --include="*.service" \
    --include="*.conf" \
    --exclude-dir=venv \
    --exclude-dir=.git \
    --exclude-dir=node_modules 2>/dev/null | cut -d: -f1 | sort -u || echo "  None found in common config files"
echo ""

echo "Step 6: Updating systemd service..."
SERVICE_FILE="/etc/systemd/system/director.service"
if [ -f "$SERVICE_FILE" ]; then
    sed -i 's|/root/downstream.ink|/root/downstream|g' "$SERVICE_FILE"
    echo "  ✓ Updated $SERVICE_FILE"
else
    echo "  ⚠ Service file not found at $SERVICE_FILE"
fi
echo ""

echo "Step 7: Updating crontab..."
crontab -l > /tmp/crontab.backup 2>/dev/null || true
if [ -f /tmp/crontab.backup ]; then
    sed 's|/root/downstream.ink|/root/downstream|g' /tmp/crontab.backup | crontab -
    echo "  ✓ Updated crontab (backup at /tmp/crontab.backup)"
else
    echo "  ⚠ No crontab found"
fi
echo ""

echo "Step 8: Reloading systemd..."
systemctl daemon-reload
echo "  ✓ Systemd daemon reloaded"
echo ""

echo "Step 9: Starting Director Dashboard..."
systemctl start director
sleep 2
systemctl status director --no-pager
echo ""

echo "============================================"
echo "Migration Complete!"
echo "============================================"
echo ""
echo "Directory: /root/downstream"
echo "Venv: /root/downstream/venv"
echo "Director: systemctl status director"
echo ""
echo "Next steps:"
echo "1. Test Director: curl http://localhost:8083/"
echo "2. Check logs: journalctl -u director -f"
echo "3. Test job processing"
echo ""
echo "Rollback if needed:"
echo "  systemctl stop director"
echo "  cd /root"
echo "  mv downstream downstream.ink"
echo "  systemctl start director"
