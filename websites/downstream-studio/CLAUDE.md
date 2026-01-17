# Downstream Landing - Project Instructions

## Project Context

**Project:** Downstream Landing Page
**Stack:** Next.js 15, React 18, TypeScript, CSS (no Tailwind)
**Purpose:** Marketing landing page for Downstream Studio

## Architecture

```
/downstream-landing/
  /app/                 <- Next.js app directory
    page.tsx           <- Main landing page
    layout.tsx         <- Root layout with metadata
    globals.css        <- All styles
  /public/             <- Static assets
  /memory/             <- Session persistence
    STATE.json         <- Feature tracker
    CONTEXT.md         <- Session log
  /.claude/            <- Agent configuration
    /commands/         <- Slash commands
    /skills/           <- Auto-discovered procedures
```

## Key URLs

- **Demo Stream:** https://downstream-stream-az-ehseg-v2.vercel.app/
- **Booking:** https://cal.com/ferencz-csuszner/30min
- **Live Site:** https://www.downstream.studio

## Mandatory Protocol

### Session Start
Run `/start` or manually read `memory/STATE.json` and `memory/CONTEXT.md`

### During Session
Update memory files when you:
- Discover something new
- Solve an error
- Complete a task
- Get blocked

### Session End
Run `/checkpoint` to save progress and commit changes

## Key Rules

1. **DO NOT CHANGE DESIGN** - Only fix functionality, keep visuals identical
2. **Mobile-first** - Test at 375px width
3. **No Tailwind** - Using vanilla CSS with CSS variables
4. **Static export** - Site is statically exported, no SSR features
5. **Iframe isolation** - Demo runs in iframe to isolate complexity

## CSS Variables (Theme)

```css
--ds-color-background: #0a0a0f;
--ds-color-text: #c9b8a8;
--ds-color-accent: #d4a056;
--ds-color-muted: #6b2a2a;
```

## Testing Commands

```bash
# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npx serve out
```

## Memory Files

| File | Purpose |
|------|---------|
| `memory/STATE.json` | Current focus + feature status |
| `memory/CONTEXT.md` | Session log, errors, discoveries |

## Anti-Circle Rule

Before solving any problem:
```bash
grep -i "keyword" memory/CONTEXT.md
```
If found → use existing solution
If new → solve and log it
