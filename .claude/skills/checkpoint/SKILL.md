---
name: checkpoint
description: Save current progress and prepare for session end.
---

# Checkpoint

## Goal
Save all session progress before ending. Ensure nothing is lost.

## When to Use
- Before ending a session
- After completing significant work
- When uncertain if session will continue
- Periodically during long sessions (every 30-60 min)

## Steps

### 1. Update Operational Memory

**memory/STATE.json** - Update task statuses:
- Mark completed tasks
- Update in-progress items
- Add new tasks discovered
- Update metrics if changed (revenue, customers, capital)

**memory/CONTEXT.md** - Add session summary:
```markdown
## YYYY-MM-DD (Session N)
**[Brief title]**

- Key work completed
- Decisions made
- Discoveries/learnings
- What's next
```

**memory/FINANCES.md** - If any money was spent or earned:
- Add row to Capital Account table
- Update Summary section totals
- Update monthly summary if significant

### 2. Update Chronicle (MANDATORY for every session)

**chronicle/OPERATIONS.md** - ALWAYS log what happened:
```markdown
### YYYY-MM-DD HH:MM — [Trigger Type]

**Trigger:** human | cron:X | webhook:X
**Duration:** X minutes

### What Happened
- [Operations performed]

### Outcomes
- [Results]

### Flags
- [ ] Follow-ups needed
```

**chronicle/CHRONICLE.md** - Update if any of these occurred:
- New capability added
- Major decision made
- Significant milestone reached
- Process/methodology change
- Important learning captured

**memory/DIALOGUE.md** - If philosophical threads emerged:
- Distill key insights
- Preserve meaningful exchanges

**IMPORTANT:** Chronicle updates are NOT optional. Every session must leave a trace in OPERATIONS.md at minimum.

### 3. Capture Conversation Moments (if any)

Ask yourself: "If this conversation disappeared now, what would be lost?"

If something would be lost, save excerpt to:
`chronicle/artifacts/conversations/YYYY-MM-DD-brief-topic.md`

### 4. Git Commit

If there are uncommitted changes worth preserving:
```bash
git add -A
git commit -m "Session checkpoint: [brief description]"
```

### 5. Confirm Checkpoint Complete

Report back:
- What was saved to CONTEXT.md
- What was logged to OPERATIONS.md
- Whether CHRONICLE.md or DIALOGUE.md were updated
- Git commit status

## Quick Checkpoint (Mid-Session)

For routine checkpoints mid-session:
1. Update STATE.json task statuses
2. One-line addition to CONTEXT.md if needed
3. One-line addition to chronicle/OPERATIONS.md (don't skip!)

## Full Checkpoint (End of Session)

For end-of-session:
1. Full CONTEXT.md summary
2. OPERATIONS.md entry
3. Consider CHRONICLE.md / DIALOGUE.md
4. Consider conversation excerpts
5. Git commit

## Automated Session Checkpoint

For cron/webhook-triggered sessions:

1. **Complete OPERATIONS.md entry** (mandatory)
   - Ensure Actions Taken section is complete
   - Add Outcomes section
   - Add any Flags for human review

2. **Update STATE.json**
   - Mark completed tasks
   - Update job statuses
   - Update metrics if applicable

3. **Update FINANCES.md** (if money was spent)
   - Add expense to Capital Account
   - Update Summary totals

4. **Log errors to CONTEXT.md** (if any)
   ```markdown
   - [error] [Trigger Type] failed: description → what was attempted
   ```

5. **Git commit** (if changes were made)
   ```bash
   git add -A
   git commit -m "[cron:job-name] Processed X jobs, Y outcomes"
   ```

6. **No briefing output** — end silently

### Automated Checkpoint Template

```markdown
### Outcomes
- [Job results]
- [Metrics changes]
- [Errors encountered]

### Flags
- [ ] Needs human review: [reason]
- [x] Completed successfully
```
