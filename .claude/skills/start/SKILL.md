---
name: start
description: Read all memory files and provide a session briefing.
---

# Start

## Goal
Load context from previous sessions and brief on current state.

## When to Use
- At the beginning of every session
- When resuming after a break
- When uncertain about current project state

## Steps

### 0. Sync from GitHub (ALWAYS FIRST)

Before reading any files, pull latest from server:

```bash
git pull origin main
```

This ensures you have the latest:
- Jobs processed by server
- Emails received
- State changes from automated sessions

### 1. Read Memory Files

Read these files in order:

```
memory/STATE.json     → Current tasks and metrics
memory/CONTEXT.md     → Recent session history
memory/DIALOGUE.md    → Philosophical threads (skim recent)
```

### 2. Check Recent Operations

```
chronicle/OPERATIONS.md → Last few entries
```

### 3. Check Git Status

```bash
git status
git log --oneline -5
```

### 4. Provide Session Briefing

Format:
```markdown
## Session Briefing

**Last Session:** [Date] - [Brief summary]

**Current Focus:** [From STATE.json]

**Open Tasks:**
- [ ] Task 1
- [ ] Task 2
- ...

**Recent Context:**
- [Key points from CONTEXT.md]

**Pending Flags:**
- [Any follow-ups from OPERATIONS.md]

**Git Status:**
- Branch: [branch]
- Uncommitted changes: [yes/no]

**Ready to proceed. What would you like to focus on?**
```

## For Automated Sessions

If session is triggered by cron/webhook (not human):

1. Read STATE.json for pending jobs
2. Read the triggering context (job queue, webhook payload)
3. Skip briefing output (no human to read it)
4. Proceed directly to task
5. **MANDATORY:** Log to OPERATIONS.md throughout and when done

### Detecting Automated Sessions

Automated sessions are identified by:
- Prompt starts with `[cron:job-name]` or `[webhook:event-type]`
- No conversational greeting or question
- Contains structured job data or webhook payload

### Automated Session Start Template

```markdown
### YYYY-MM-DD HH:MM — [Trigger Type]

**Trigger:** [from prompt prefix]
**Job ID:** [if applicable]
**Started:** [timestamp]

### Actions Taken
- [Log as you work]
```

### Critical Rule

Every automated session MUST:
1. Start an OPERATIONS.md entry immediately
2. Update the entry as actions are taken
3. Complete the entry with outcomes before ending
4. Never end without leaving a trace

## Session Gap Detection

If more than 24 hours since last session:
- Mention the gap
- Suggest reviewing OPERATIONS.md for any missed automated sessions
- Consider running /business-rhythms if weekly/monthly review is due
