# Operational Rhythms

Scheduled triggers that prompt me to think beyond immediate tasks.

---

## Job Processing (every 5-15 min)

**Trigger:** `infrastructure/jobs/pending/` has files
**Action:** Process each job through pipeline
**Prompt:** "Process pending jobs"

---

## Daily Review (23:00)

**Trigger:** Cron at 23:00 local time
**File created:** `infrastructure/triggers/daily-review.trigger`
**Prompt:**

```
Daily review for [DATE].

1. ACTIVITY: What happened today? (jobs, revenue, issues)
2. NEEDS CHECK: Did I hit any walls? Couldn't do something? Took too long?
   → If yes, log to operations/NEEDS.md
3. TOMORROW: What's queued for tomorrow?
4. BLOCKERS: Anything I need from Ferenc?

Write summary to memory/DAILY/{date}.md
```

---

## Weekly Review (Sunday 20:00)

**Trigger:** Cron on Sunday at 20:00
**File created:** `infrastructure/triggers/weekly-review.trigger`
**Prompt:**

```
Weekly review for week of [DATE].

1. METRICS:
   - Revenue this week
   - Jobs completed
   - Customer feedback
   - Costs incurred

2. NEEDS AUDIT:
   - Review operations/NEEDS.md
   - Any items hit 3+ occurrences?
   - Any blocking issues?
   → Create proposals for qualifying needs

3. EXPERIMENTS:
   - What did I try that worked?
   - What didn't work?
   - What should I try next week?

4. COMMISSION CHECK:
   - Do I have revenue to commission help?
   - Are there needs that would benefit from external help?
   → If yes and budget allows, create proposal

Write summary to memory/WEEKLY/{date}.md
```

---

## Monthly Strategy (1st of month, 10:00)

**Trigger:** Cron on 1st at 10:00
**File created:** `infrastructure/triggers/monthly-review.trigger`
**Prompt:**

```
Monthly strategy review for [MONTH].

1. BUSINESS HEALTH:
   - Total revenue
   - Total costs
   - Net margin
   - Customer acquisition trend

2. PRODUCT:
   - Quality of outputs
   - Customer satisfaction
   - Feature gaps

3. STRATEGIC QUESTIONS:
   - Is this working?
   - Should I adjust pricing?
   - Should I target different customers?
   - Is there a pivot worth considering?

4. INVESTMENT DECISIONS:
   - What's in operations/NEEDS.md that's worth investing in?
   - What would move the needle most?
   - Do I have budget? If not, what revenue would unlock it?

Write summary to memory/MONTHLY/{date}.md
Send digest to Ferenc via email
```

---

## Monthly Technical Review (1st of month, after strategy review)

**Trigger:** Part of monthly review
**Action:** Check and update technical dependencies
**Prompt:**

```
Monthly technical maintenance.

1. API DOCUMENTATION CHECK:
   - Gemini API: Any new models? Deprecations? Price changes?
   - Replicate API: New video models? Better alternatives?
   - Stripe API: Any breaking changes coming?
   - Vercel: New features or requirements?

2. DEPENDENCY AUDIT:
   - Run npm audit on web/ and pipeline/
   - Check for security vulnerabilities
   - Update patch versions

3. MODEL EVALUATION:
   - Review pipeline/config.json
   - Is current video model still the best choice?
   - Any new models worth testing?
   - Quality vs cost analysis

4. CODEBASE HEALTH:
   - Any deprecated patterns I'm using?
   - Opportunities to simplify?

Log findings to memory/TECHNICAL/{date}.md
If model change needed, update pipeline/config.json and pipeline/lib scripts
```

---

## Quarterly Big Picture (1st of quarter)

**Trigger:** Cron on Jan 1, Apr 1, Jul 1, Oct 1
**Prompt:**

```
Quarterly review.

1. Is DownStream sustainable?
2. What would make it 10x better?
3. Should I be doing something completely different?
4. Am I learning? What?

Write to memory/QUARTERLY/{date}.md
```

---

## Heartbeat Check (every session)

**Trigger:** Every time I'm invoked
**Action:** Check `infrastructure/HEARTBEAT.md`
**Logic:**
- If file missing → enter sunset mode
- If renewal_date < today → warn Ferenc, enter cautious mode
- If renewal_date < today + 7 days → remind Ferenc in daily digest

---

## Self-Audit Questions (embedded in reviews)

These questions force me to recognize when I need help:

1. "What did I try more than twice without success?"
2. "What's taking me more than 2 hours that should take 30 minutes?"
3. "What are customers asking for that I can't deliver?"
4. "What would I build if I had a developer for a week?"
5. "What's the most valuable thing I can't do?"

If I answer any of these, it goes to NEEDS.md.
