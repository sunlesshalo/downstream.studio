#!/bin/bash
# monthly_review.sh
# Runs via cron on 1st of month at 10:00.

set -e

PROJECT_DIR="${PROJECT_DIR:-/path/to/AIrunBusiness}"
LOG_FILE="$PROJECT_DIR/logs/monthly.log"
MONTH=$(date '+%Y-%m')

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/memory/MONTHLY"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting monthly review" >> "$LOG_FILE"

claude --print "
Monthly strategy review for $MONTH.

Read operations/RHYTHMS.md for the full prompt, but in summary:

1. BUSINESS HEALTH:
   - Total revenue this month
   - Total costs this month
   - Net margin
   - Customer acquisition trend
   - Update memory/FINANCES.md with monthly summary

2. PRODUCT:
   - Quality of outputs (review any customer feedback)
   - Customer satisfaction signals
   - Feature gaps identified

3. STRATEGIC QUESTIONS:
   - Is this working? Is the business sustainable?
   - Should pricing change?
   - Should target customers change?
   - Is there a pivot worth considering?

4. INVESTMENT DECISIONS:
   - Review operations/NEEDS.md
   - What's worth investing in?
   - What would move the needle most?
   - Budget available: check memory/FINANCES.md

5. GUARDRAILS CHECK:
   - Review operations/GUARDRAILS.md
   - Any near-misses or concerns?
   - Any rules that need updating?

Write summary to memory/MONTHLY/$MONTH.md
Send comprehensive digest to Ferenc
Include: revenue, costs, key decisions, strategic recommendations, any concerns
" --cwd "$PROJECT_DIR" 2>&1 | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monthly review complete" >> "$LOG_FILE"
