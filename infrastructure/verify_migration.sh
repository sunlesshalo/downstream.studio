#!/bin/bash
# Verification script for Hetzner migration
# Run this after migrate_to_downstream.sh

echo "============================================"
echo "DownStream Migration Verification"
echo "============================================"
echo ""

PASS=0
FAIL=0

# Check 1: Directory exists
echo "Check 1: Repository directory"
if [ -d "/root/downstream" ]; then
    echo "  ✓ /root/downstream exists"
    ((PASS++))
else
    echo "  ✗ /root/downstream NOT FOUND"
    ((FAIL++))
fi

# Check 2: Virtual environment
echo "Check 2: Python virtual environment"
if [ -f "/root/downstream/venv/bin/activate" ]; then
    echo "  ✓ venv exists"
    ((PASS++))
else
    echo "  ✗ venv NOT FOUND"
    ((FAIL++))
fi

# Check 3: Git status
echo "Check 3: Git repository"
cd /root/downstream 2>/dev/null || true
if git rev-parse --git-dir > /dev/null 2>&1; then
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    echo "  ✓ Git repository OK (commit: $CURRENT_COMMIT)"
    ((PASS++))
else
    echo "  ✗ Git repository ERROR"
    ((FAIL++))
fi

# Check 4: Director service
echo "Check 4: Director service"
if systemctl is-active --quiet director; then
    echo "  ✓ Director service is running"
    ((PASS++))
else
    echo "  ✗ Director service is NOT running"
    ((FAIL++))
fi

# Check 5: Director HTTP response
echo "Check 5: Director HTTP endpoint"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ Director responding (HTTP $HTTP_CODE)"
    ((PASS++))
else
    echo "  ✗ Director not responding (HTTP $HTTP_CODE)"
    ((FAIL++))
fi

# Check 6: Database
echo "Check 6: Director database"
if [ -f "/root/downstream/infrastructure/director/director.db" ]; then
    TABLE_COUNT=$(sqlite3 /root/downstream/infrastructure/director/director.db ".tables" 2>/dev/null | wc -w)
    echo "  ✓ Database exists ($TABLE_COUNT tables)"
    ((PASS++))
else
    echo "  ✗ Database NOT FOUND"
    ((FAIL++))
fi

# Check 7: Crontab
echo "Check 7: Crontab paths"
CRON_REFS=$(crontab -l 2>/dev/null | grep -c "/root/downstream" || echo "0")
OLD_REFS=$(crontab -l 2>/dev/null | grep -c "/root/downstream.ink" || echo "0")
if [ "$CRON_REFS" -gt 0 ] && [ "$OLD_REFS" -eq 0 ]; then
    echo "  ✓ Crontab updated ($CRON_REFS jobs)"
    ((PASS++))
elif [ "$OLD_REFS" -gt 0 ]; then
    echo "  ✗ Crontab still has old paths ($OLD_REFS references)"
    ((FAIL++))
else
    echo "  ⚠ No crontab entries found"
    ((PASS++))
fi

# Check 8: Systemd service file
echo "Check 8: Systemd service paths"
if [ -f "/etc/systemd/system/director.service" ]; then
    if grep -q "/root/downstream" /etc/systemd/system/director.service && ! grep -q "/root/downstream.ink" /etc/systemd/system/director.service; then
        echo "  ✓ Service file updated"
        ((PASS++))
    else
        echo "  ✗ Service file still has old paths"
        ((FAIL++))
    fi
else
    echo "  ⚠ Service file not found"
fi

# Check 9: Factory scripts
echo "Check 9: Factory execution scripts"
if [ -f "/root/downstream/factory/execution/produce_stream.py" ]; then
    DEFAULT_MODEL=$(grep -A 2 "def produce_videos" /root/downstream/factory/execution/produce_stream.py | grep "model: str" | grep -o '"[^"]*"' | head -1)
    if [ "$DEFAULT_MODEL" = '"kling"' ]; then
        echo "  ✓ produce_stream.py exists (default model: kling)"
        ((PASS++))
    else
        echo "  ⚠ produce_stream.py exists (default model: $DEFAULT_MODEL)"
        ((PASS++))
    fi
else
    echo "  ✗ produce_stream.py NOT FOUND"
    ((FAIL++))
fi

# Summary
echo ""
echo "============================================"
echo "Summary: $PASS passed, $FAIL failed"
echo "============================================"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "✓ Migration successful - all checks passed!"
    exit 0
else
    echo "✗ Migration has issues - review failures above"
    exit 1
fi
