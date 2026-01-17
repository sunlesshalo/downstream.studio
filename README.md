# DownStream

Unified scroll-driven storytelling platform.

## Structure

```
downstream/
├── factory/           # Stream production pipeline (shared)
│   ├── execution/     # Python scripts for generation
│   ├── engine/        # StreamEngine NPM package
│   ├── templates/     # App templates
│   ├── skills/        # Production Claude skills
│   └── schemas/       # JSON validation schemas
│
├── infrastructure/    # Server operations (Hetzner)
│   ├── director/      # Flask dashboard
│   ├── jobs/          # File-based job queue
│   └── *.sh           # Automation scripts
│
├── streams/           # All stream content
│   ├── apps/          # Deployable Next.js apps (~17)
│   └── specs/         # Production specifications
│
├── websites/          # Customer-facing sites
│   ├── downstream-ink/    # downstream.ink
│   ├── downstream-studio/ # downstream.studio
│   └── intake/            # Client intake form
│
├── businesses/        # Business operations (separate)
│   ├── ink/           # AI-run business
│   │   ├── memory/    # STATE.json, CONTEXT.md
│   │   ├── chronicle/ # OPERATIONS.md, methodology
│   │   └── operations/# GUARDRAILS.md, RHYTHMS.md
│   └── studio/        # Human-directed business
│       └── memory/
│
├── assets/            # Marketing assets
│   └── recordings/    # Video recordings
│
└── legacy/            # Archived/experimental
```

## Two Businesses, One Factory

- **downstream.ink** — AI-run, automated (€49/stream)
- **downstream.studio** — Human-directed, premium (€150-300/project)

Both use the same Stream Factory for production.

## Quick Start

### Run a stream locally
```bash
cd streams/apps/the-hunger
npm install
npm run dev
```

### Run Python pipeline
```bash
cd factory/execution
pip install -r requirements.txt
python produce_stream.py --help
```

### Access Director Dashboard (Hetzner)
```
https://director.downstream.studio
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `REPLICATE_API_TOKEN` — Image generation
- `GEMINI_API_KEY` — LLM processing
- `STRIPE_*` — Payment processing
- `VERCEL_TOKEN` — Deployment

## Memory System

AI business state is tracked in `businesses/ink/memory/`:
- `STATE.json` — Tasks, metrics, job queue
- `CONTEXT.md` — Session history, decisions
- `FINANCES.md` — Revenue, expenses
- `DIALOGUE.md` — Philosophical threads

Operations logged in `businesses/ink/chronicle/OPERATIONS.md`.

## Deployment

- **Streams**: Vercel (automatic via `vercel deploy`)
- **Director**: Hetzner server (Flask + gunicorn)
- **Websites**: Vercel

## Server (Hetzner)

IP: See `businesses/ink/memory/CONTEXT.md` line 3
Path: `/root/downstream.ink`

Cron jobs handle automated processing — see `infrastructure/crontab.txt`.
