#!/bin/bash
# weekly_review.sh
# Runs via cron on Sunday at 20:00.

set -e

PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
LOG_FILE="$PROJECT_DIR/logs/weekly.log"
DATE=$(date '+%Y-%m-%d')

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/memory/WEEKLY"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting weekly review" >> "$LOG_FILE"

claude --print "
Weekly review for week ending $DATE.

Read operations/RHYTHMS.md for the full prompt, but in summary:

1. METRICS:
   - Revenue this week
   - Jobs completed
   - Customer feedback (any emails?)
   - Costs incurred

2. NEEDS AUDIT:
   - Review operations/NEEDS.md
   - Any items logged 3+ times?
   - Any blocking issues?
   - Create proposals for qualifying needs

3. EXPERIMENTS:
   - What did you try that worked?
   - What didn't work?
   - What should you try next week?

4. COMMISSION CHECK:
   - Do you have revenue to commission help?
   - Are there needs that would benefit from external help?
   - If yes and budget allows, create proposal in proposals/

5. SELF-AUDIT QUESTIONS:
   - What did you try more than twice without success?
   - What's taking too long?
   - What's the most valuable thing you can't do?

Write summary to memory/WEEKLY/$DATE.md
Send digest to Ferenc (note key decisions, revenue, any concerns)
" --cwd "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Weekly review complete" >> "$LOG_FILE"
