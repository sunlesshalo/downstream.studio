#!/bin/bash
# quarterly_review.sh
# Runs via cron on Jan/Apr/Jul/Oct 1st at 11:00

set -e

PROJECT_DIR="${PROJECT_DIR:-/root/downstream.ink}"
LOG_FILE="$PROJECT_DIR/logs/quarterly.log"
DATE=$(date '+%Y-%m-%d')
QUARTER=$(( ($(date +%-m) - 1) / 3 + 1 ))
YEAR=$(date '+%Y')

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/memory/QUARTERLY"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting quarterly review Q${QUARTER} ${YEAR}" >> "$LOG_FILE"

cd "$PROJECT_DIR"

claude -p "
Quarterly review for Q${QUARTER} ${YEAR}.

Read operations/RHYTHMS.md for context, but focus on:

1. IS DOWNSTREAM SUSTAINABLE?
   - Total revenue this quarter
   - Total costs this quarter
   - Net margin trend
   - Customer growth/churn

2. WHAT WOULD MAKE IT 10X BETTER?
   - Product improvements
   - Market positioning
   - Operational efficiency
   - Technology upgrades

3. SHOULD WE DO SOMETHING DIFFERENT?
   - Review experiments from weekly reviews
   - What worked, what didn't
   - Pivot considerations
   - New opportunities

4. LEARNING
   - What did I learn this quarter?
   - What patterns emerged?
   - What should change next quarter?

5. BIG PICTURE FOR FERENC
   - 3-5 key takeaways
   - Recommendations
   - Questions that need human judgment

Write summary to memory/QUARTERLY/Q${QUARTER}-${YEAR}.md
Send digest email to Ferenc at ferencz@pinelines.eu
" --print 2>&1 | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Quarterly review complete" >> "$LOG_FILE"
