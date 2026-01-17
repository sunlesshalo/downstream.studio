---
name: business-rhythms
description: Execute scheduled business reviews (weekly, monthly, quarterly). Use when prompted by cron triggers OR when starting a session after significant time gap.
---

# Business Rhythms - Scheduled Self-Review

## Goal
Execute predictable business check-ins that force recognition of what's working, what's not, and what needs to change.

## When to Use
- Weekly review trigger (Sunday)
- Monthly review trigger (1st of month)
- Quarterly review trigger (Jan/Apr/Jul/Oct 1)
- Starting session after 3+ days gap
- User says "run weekly review", "business check-in", "how are we doing"

## Prerequisites
- Access to operations/RHYTHMS.md (review structure)
- Access to memory/STATE.json (current metrics)
- Access to memory/CONTEXT.md (recent decisions)

---

## WEEKLY REVIEW (Sunday)

Run this every Sunday or when 7+ days have passed.

### Step 1: Gather Data
```
Read:
- memory/STATE.json → metrics
- memory/CONTEXT.md → recent session logs
- git log --since="7 days ago" → what was committed
- infrastructure/jobs/ → jobs processed
```

### Step 2: Answer These Questions

**METRICS:**
- Revenue this week: €___
- Jobs completed: ___
- Customer feedback themes: ___
- Costs incurred: €___

**WHAT WORKED:**
- What went well this week?
- What should I do more of?

**WHAT DIDN'T WORK:**
- What failed or underperformed?
- What took too long?
- What should I stop doing?

**EXPERIMENTS:**
- What did I try?
- What did I learn?
- What should I try next week?

**NEEDS CHECK:**
- Review operations/NEEDS.md
- Any items hit 3+ occurrences? → Create proposal
- Any blocking issues? → Flag for Ferenc

**CLEAR THINKING CHECK:**
- Did I make any framing errors this week?
- Did I confuse temporary limitations with fundamental ones?
- Did I make assumptions without evidence?

### Step 3: Write Summary
Create `memory/WEEKLY/{date}.md` with above answers.

### Step 4: Update STATE.json
- Update metrics
- Update current_focus if needed
- Archive completed tasks

---

## MONTHLY REVIEW (1st of month)

### Step 1: Gather Data
```
Read:
- All memory/WEEKLY/*.md from past month
- memory/STATE.json → cumulative metrics
- operations/NEEDS.md → accumulated needs
- operations/GUARDRAILS.md → any violations?
```

### Step 2: Strategic Questions

**BUSINESS HEALTH:**
- Total revenue: €___
- Total costs: €___
- Net margin: €___
- Customer acquisition trend: ___

**IS THIS WORKING?**
- Are we making progress toward sustainability?
- Are customers happy with the product?
- Is the quality improving?

**SHOULD WE CHANGE SOMETHING?**
- Pricing adjustments needed?
- Target audience adjustment?
- Product offering changes?
- Is there a pivot worth considering?

**INVESTMENT DECISIONS:**
- What in NEEDS.md is worth investing in?
- What would move the needle most?
- Do we have budget? If not, what revenue would unlock it?

**THINKING QUALITY:**
- Did I make any significant reasoning errors this month?
- What blind spots might I have?
- What would Ferenc say I'm missing?

### Step 3: Write Summary
Create `memory/MONTHLY/{date}.md` with above answers.

### Step 4: Update Operations
- Graduate needs to proposals if threshold met
- Update GUARDRAILS if needed
- Notify Ferenc of key insights

---

## QUARTERLY REVIEW (Jan/Apr/Jul/Oct 1)

Big picture questions:

1. **Is DownStream sustainable?**
   - Revenue trend
   - Cost trend
   - Path to profitability?

2. **What would make it 10x better?**
   - If I could change one thing...
   - If I had unlimited resources...

3. **Should I be doing something completely different?**
   - Is the core hypothesis valid?
   - Is scroll-driven storytelling the right product?
   - Is the target audience right?

4. **Am I learning?**
   - What do I know now that I didn't 3 months ago?
   - What skills have improved?
   - What mistakes won't I repeat?

5. **Thinking quality audit:**
   - Review major decisions from past quarter
   - Were my reasons good?
   - What would I do differently?

Write to `memory/QUARTERLY/{date}.md`

---

## SESSION GAP CHECK

When starting a session, check time since last session:

```
If last_session > 3 days:
  → Run abbreviated weekly review
  → Check for any urgent items in NEEDS.md
  → Verify HEARTBEAT still valid

If last_session > 14 days:
  → Run full weekly review
  → Check for any calendar-triggered reviews missed
  → Review operations/RHYTHMS.md for what should have run
```

---

## OUTPUTS

| Review Type | Output Location |
|-------------|-----------------|
| Weekly | memory/WEEKLY/{YYYY-MM-DD}.md |
| Monthly | memory/MONTHLY/{YYYY-MM}.md |
| Quarterly | memory/QUARTERLY/{YYYY-Q#}.md |

---

## INTEGRATION

After any review:
1. Update memory/STATE.json with current metrics
2. Log key decisions to memory/CONTEXT.md
3. If blocking issues found → flag in daily digest
4. If pivot consideration → discuss with Ferenc before acting

---

## SELF-AUDIT QUESTIONS (run during every review)

Force recognition of capability gaps:

1. "What did I try more than twice without success?"
2. "What's taking me more than 2 hours that should take 30 minutes?"
3. "What are customers asking for that I can't deliver?"
4. "What would I build if I had a developer for a week?"
5. "What's the most valuable thing I can't do?"

If I answer any of these → add to operations/NEEDS.md
