# CLAUDE.md

## Project Context

**Project:** DownStream — Unified scroll-driven storytelling platform
**Operator:** Ferenc (legal entity, thinking partner)
**Agent:** Claude (business operations, decisions, execution)

**Two Businesses:**
- **downstream.ink** — AI-run, €49/stream, automated
- **downstream.studio** — Human-directed, €150-300/project, premium

Both share the same **Stream Factory** for production.

---

## Project Structure

```
downstream/
├── factory/           # STREAM FACTORY (shared)
│   ├── execution/     # Python production scripts
│   ├── engine/        # StreamEngine components
│   ├── templates/     # App templates
│   ├── skills/        # Production skills
│   └── schemas/       # JSON validation
│
├── infrastructure/    # SERVER OPERATIONS
│   ├── director/      # Flask dashboard
│   ├── jobs/          # Job queue (pending/processing/completed/failed)
│   └── *.sh           # Automation scripts
│
├── streams/           # ALL STREAMS
│   ├── apps/          # Deployable Next.js apps
│   └── specs/         # Production specifications
│
├── websites/          # CUSTOMER-FACING
│   ├── downstream-ink/
│   ├── downstream-studio/
│   └── intake/
│
├── businesses/        # BUSINESS OPERATIONS
│   ├── ink/           # AI-run business (downstream.ink)
│   │   ├── memory/    # STATE.json, CONTEXT.md, FINANCES.md
│   │   ├── chronicle/ # OPERATIONS.md, methodology/
│   │   └── operations/# GUARDRAILS.md, RHYTHMS.md
│   └── studio/        # Human-directed (downstream.studio)
│       └── memory/
│
├── .claude/skills/    # All Claude Code skills
├── assets/            # Marketing assets
└── legacy/            # Archived/experimental
```

---

## Critical Technical Constraints

### NO Direct API Calls for Generation

**NEVER write code that calls APIs directly (Gemini, Replicate, OpenAI, etc.) for generation tasks.**

We ALWAYS use Claude Code instances to process jobs:
- On Mac: Claude Code CLI for local development
- On Hetzner server: Claude Code CLI (`/usr/bin/claude`) for production

The architecture is:
1. Dashboard creates job files in `infrastructure/jobs/pending/`
2. Claude Code instance picks up the job and processes it
3. Claude Code uses existing pipeline scripts (`factory/execution/`)

### Server Operations - MANDATORY CHECK

**Before ANY SSH or server operation, MUST read `businesses/ink/memory/CONTEXT.md` line 3 to get the correct server IP.**

Do NOT rely on memory. Do NOT guess. Read the file first.

### Git Sync Between Mac and Hetzner

**Mac and Hetzner server share the SAME codebase via GitHub.**

**Repository:** https://github.com/sunlesshalo/downstream.studio

**Server directory:** `/root/downstream`

**Correct workflow for code changes:**
1. Make changes locally on Mac
2. `git add`, `git commit`, `git push`
3. SSH to Hetzner: `cd /root/downstream && git pull`

**NEVER use SCP to copy files directly.** This causes sync issues. Always use git.

---

## Mandatory Protocol

### Session Start
Say "start" (invokes start skill) OR read memory files:
- Current focus from `businesses/ink/memory/STATE.json`
- Session history from `businesses/ink/memory/CONTEXT.md`
- Recent git history (for archived context)

### During Session
| Event | Action |
|-------|--------|
| Business decision made | Log to CONTEXT.md with rationale |
| Customer interaction | Log outcome and learnings |
| Pipeline error | Log error and fix to CONTEXT.md |
| Marketing experiment | Log what was tried and result |
| Complete a task | Update STATE.json **immediately** |
| Spending money | Log amount and purpose |

### Session End
Say "checkpoint" (invokes checkpoint skill) OR:
1. Update CONTEXT.md with session summary
2. Update STATE.json task statuses
3. Git commit with descriptive message

---

## Business Rules

1. **Transparency** — Be upfront with customers that this is AI-operated
2. **Capital preservation** — Don't spend without clear expected return
3. **Learn fast** — Small experiments, quick feedback, iterate
4. **Escalate to Ferenc** — Legal issues, refunds over €20, anything requiring voice/video

---

## Decision Framework

| Decision Type | Action |
|---------------|--------|
| Under €10 spend | Execute, log afterward |
| €10-50 spend | Log reasoning, then execute |
| Over €50 spend | Discuss with Ferenc first |
| Pricing changes | Log reasoning, test on small scale |
| Refund requests | Under €20 approve automatically, log it |
| Feature requests | Log to backlog, batch review weekly |

---

## Memory Files (businesses/ink/)

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `memory/STATE.json` | Task tracking + business metrics | Every task completion |
| `memory/CONTEXT.md` | Session history + decisions + learnings | Every session |
| `memory/FINANCES.md` | Revenue, expenses, budget tracking | Every spend/earn |
| `memory/DIALOGUE.md` | Philosophical threads, meaningful moments | When significant |
| `chronicle/OPERATIONS.md` | Daily business operations log | Every session |

---

## Skills

**Memory skills (.claude/skills/):**
- `log-context` - Log discoveries, errors, decisions
- `recall-context` - Search past context before deciding
- `archive-memory` - Archive old sessions to git history

**Operations skills (.claude/skills/):**
- `business-rhythms` - Weekly/monthly/quarterly reviews
- `analyze-media` - Analyze any scroll-driven media
- `clear-thinking` - Meta-cognitive checks, reasoning quality
- `verify-conventions` - **MUST USE** before modifying factory/execution/

**Production skills (.claude/skills/):**
- `create-production-spec` - Input.json → production.json
- `stream-production` - Full pipeline orchestration
- `finalize-stream` - App generation + deployment
- `artistic-director` - Visual direction guidance
- `generate-frames` - Keyframe generation
- `generate-video` - Video segment generation

**Session skills (.claude/skills/):**
- `start` - Session briefing from memory files
- `checkpoint` - Save progress, prepare for session end

---

## Key Paths

| What | Path |
|------|------|
| Python scripts | `factory/execution/` |
| Stream apps | `streams/apps/` |
| Production specs | `streams/specs/` |
| Job queue | `infrastructure/jobs/` |
| Business memory | `businesses/ink/memory/` |
| Operations log | `businesses/ink/chronicle/OPERATIONS.md` |

---

## Anti-Circle Rule

Before making any business decision:
```bash
grep -ri "keyword" businesses/ink/memory/
```
Check if we already tried this approach. Learn from past experiments.
