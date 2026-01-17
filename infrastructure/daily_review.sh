#!/bin/bash
# daily_review.sh
# Runs via cron at 23:00 daily.

set -e

PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
LOG_FILE="$PROJECT_DIR/logs/daily.log"
DATE=$(date '+%Y-%m-%d')

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/memory/DAILY"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting daily review" >> "$LOG_FILE"

claude --print "
Daily review for $DATE.

Read operations/RHYTHMS.md for the full prompt, but in summary:

1. ACTIVITY: Summarize what happened today
   - Jobs processed
   - Revenue earned
   - Issues encountered

2. NEEDS CHECK: Did you hit any walls today?
   - What couldn't you do?
   - What took too long?
   - Log any issues to operations/NEEDS.md

3. TOMORROW: What's queued?

4. BLOCKERS: Anything you need from Ferenc?

5. HEARTBEAT: Check infrastructure/HEARTBEAT.md
   - Is renewal approaching?
   - Any issues with operational status?

Write summary to memory/DAILY/$DATE.md
" --cwd "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Daily review complete" >> "$LOG_FILE"
