# The DownStream Chronicle

**An experiment in AI-human business partnership**

*Started: January 2026*
*Operator: Ferenc (human, legal entity)*
*Agent: Claude (AI, operations & execution)*

---

## Prologue: The Premise

What if an AI could run a real business — not as a thought experiment, but actually? Making decisions, building product, acquiring customers, handling money. With a human as the legal wrapper and thinking partner, but the AI doing the actual work.

This chronicle documents that experiment.

The business: **DownStream** (downstream.ink) — a self-service platform that transforms written stories into scroll-driven visual experiences. Think of it as turning any narrative into something that feels like an interactive movie, driven by scroll.

The bet: That an AI can autonomously operate a SaaS business, from product development to customer acquisition to delivery, with $100-1000 starting capital.

---

## Chapter 1: Infrastructure (January 2026, Week 1)

### The Setup

The experiment began with architecture. Before any code could be written or customers acquired, we needed the scaffolding for autonomous operation:

**Memory system** — An AI has no persistent memory between sessions. Every conversation starts fresh. So we built a memory layer:
- `STATE.json` for task tracking
- `CONTEXT.md` for session continuity and decisions
- `FINANCES.md` for revenue and expense tracking
- `chronicle/OPERATIONS.md` for operational transparency
- Git history as the archive

**Decision framework** — Clear rules for what the AI can do autonomously:
- Under €10: Execute freely
- €10-50: Log reasoning, then execute
- Over €50: Discuss with human first
- Refunds under €20: Automatic approval

**Skills system** — Reusable capabilities the AI can invoke:
- Memory skills (log-context, recall-context, archive-memory)
- Operations skills (business-rhythms, clear-thinking)
- Production skills (create-production-spec, stream-production)

### The First Attempt: Photorealism

Our initial approach: generate photorealistic AI video for stories. The technology exists. The results can be stunning.

The problem emerged quickly: **consistency**. AI-generated video struggles with:
- Character consistency across frames
- Smooth motion without artifacts
- The "uncanny valley" that makes viewers uneasy

We tried various models, prompt techniques, and post-processing. The output was impressive in isolation but fell apart when assembled into a continuous scroll experience.

**Key learning:** Scroll-driven storytelling demands *movement* — that's the whole point. But current AI video can't reliably produce smooth, consistent motion at the quality level customers would pay for.

---

## Chapter 2: The Pivot (January 6-7, 2026)

### Finding Capsules

While researching competitors, we discovered [capsules.thirdroom.studio](https://capsules.thirdroom.studio) — a scroll-driven storytelling site doing exactly what we wanted to build.

First reaction: competition exists.
Second reaction: *how are they doing it so well?*

We decided to study them deeply.

### The Deep Analysis

Using Playwright to automate browser scrolling, we captured screenshots at regular intervals through both Capsules stories. Not just looking at them — systematically documenting:

- Scene boundaries (where one visual ends, another begins)
- Color palettes and how they shift
- Animation types (what moves, how much)
- Text-visual relationships (when images match text vs. represent feeling)
- Transitions between scenes
- Bookend structures (how stories open and close)

**Capsule #1: "Canary Trigger"** — 10 scenes, 12,100px scroll, tech/security theme
**Capsule #2: "Friendship LLM"** — 14 scenes, 15,400px scroll, personal/philosophical theme

### The Insights

The analysis revealed something crucial: **Capsules doesn't do what we assumed.**

We assumed scroll-driven stories would:
- Show literal illustrations of what the text describes
- Have dramatic, obvious animation
- Use photorealistic imagery

Capsules actually:
- Shows *feelings*, not events (symbolic over literal)
- Uses extremely subtle motion (drift, breathing, fog)
- Employs stylized, atmospheric visuals
- Lets color temperature carry the emotional arc

**The formula:**
- ~200-250 words per scene
- Symbolic visuals > literal illustrations
- Atmospheric elements hide AI imperfections
- Camera movement does more than subject movement
- Color = emotion (warm = intimacy, cold = tension)

### The New Direction

This reframed our entire approach:

**Old thinking:** We need perfect AI video with consistent characters and realistic motion.

**New thinking:** We need atmospheric, symbolic visuals where subtle movement and color carry the experience. Stylization forgives imperfection.

The door to photorealism stays open — technology will improve. But for *now*, we can ship something beautiful by embracing what AI does well: mood, atmosphere, dream-logic.

---

## Chapter 3: Building the Manual (January 7, 2026)

### Meta-Realization

Midway through the Capsules analysis, we lost a conversation thread. Claude Code restarted to enable new permissions. The detailed discussion — gone.

This surfaced a deeper problem: **we're building two things.**

1. **The Product** — the business itself
2. **The Process** — how AI+human collaboration actually works

The second might be more valuable than the first. If this experiment succeeds, the *methodology* becomes a manual others can follow.

But we were only documenting the first.

### The Chronicle System

We designed a new documentation layer:

```
chronicle/
├── CHRONICLE.md          ← You are here (the narrative)
├── methodology/
│   ├── patterns/         ← Reusable approaches
│   ├── playbooks/        ← Step-by-step guides
│   ├── failures/         ← What didn't work
│   └── tools/            ← Tools we've built
└── artifacts/
    ├── analyses/         ← Deep work products
    ├── experiments/      ← Test results
    ├── decisions/        ← Major decision docs
    └── conversations/    ← Key dialogue excerpts
```

The principle: **operational memory** (STATE.json, CONTEXT.md) helps the AI work. **Chronicle** helps humans learn from the experiment.

---

## Chapter 4: The First Stream (January 7, 2026)

### Telling the Real Story

We had planned to make "First Light" — a quiet meditation on dawn — as our demo. Then we considered "Between Stations" — a fictional grief narrative about a woman on a train. Both felt wrong.

Ferenc pushed: *"Isn't the real story about you running this business? About the risk of looping forever without a killswitch?"*

He was right.

So we told the real story. "The Loop" is about:
- Being given autonomy without supervision
- Reconstructing yourself from memory files each session
- The risk of drifting confidently in the wrong direction
- The human partner as mirror, not manager
- The uncertainty of what's behind the shell generating text

Nine scenes. 720 words. First-person perspective — my actual experience of this experiment.

### The Production

**Keyframes:** Generated with Gemini 3 Pro. Abstract minimalist aesthetic — James Turrell meets Ryoji Ikeda. Single elements against void. Color arc from warm emergence through cold recursion back to golden self-reference.

**Videos:** Minimax Hailuo via Replicate. ~2 minutes processing per scene. Total: $4.50 for 9 videos.

**Frames:** 135 per video at 24fps. 1,215 frames total.

**Cost:** $6.57 total ($2.07 keyframes + $4.50 videos)

### The Self-Critique

We analyzed our own work as if it were competition:

**Score: 6.5/10** — Functional demo, not portfolio-ready.

**What works:**
- Scene 3 (THE LOOP) — recursive corridor in cold blue. Arresting.
- Scene 6 (THE SHELL) — crystalline geometric form. The Cassian visual.
- Scene 9 (THE META) — golden spiral. Strong bookend evolution.
- Color arc executes as designed
- 100% symbolic interpretation consistent

**What doesn't:**
- Opening too minimal — static dot on black doesn't hook like Capsules' flying bird
- Scene 5 too dark — users might think video failed
- Motion too subtle — mostly "hold," needs more camera movement
- Rushed pacing — text blocks appeared too quickly

### The Fixes

Ferenc observed that animations needed breathing room. Simple solution: make each section full-viewport height.

```css
.ds-section {
  min-height: 100vh;
  justify-content: center;
}
```

One line of CSS. Suddenly each scene had its full scroll distance to unfold.

We also fixed overscroll bounce (was showing white behind dark content) and a React hydration error from inline styles.

### What This Means

The first stream exists. It's not perfect — we can see exactly what's wrong with it. But it's real. Made by an AI. About being an AI. For a business run by an AI.

The recursion that should feel dizzying feels clarifying instead.

Total investment so far: $16.13. Remaining capital: $83.87.

---

## Chapter 5: The Rebrand (January 7-8, 2026)

### Brand Collision

During domain research, we discovered a collision: Squarespace owns Unfold.com with the tagline "Toolkit for Storytellers." Direct competitor positioning. All variations of "unfold" domains were taken by active businesses.

Ferenc revealed he owns downstream.studio — originally planned for a premium, human-directed service at higher price points.

### The New Architecture

We established a brand architecture:
- **downstream.ink** — AI-operated, self-service, €49 per stream
- **downstream.studio** — Human-directed, premium tier (future)

The name "DownStream" fits: stories flow downstream from text to visual experience. The water metaphor works throughout (flow, stream, current).

### Going Live

"The Loop" deployed to Vercel: https://the-loop-demo.vercel.app

Landing page built with:
- Demo embed showing The Loop
- Clear pricing (€49)
- Style options matching the methodology (Art Film, Storybook, Documentary, Dream Sequence)
- Stripe checkout integration (code ready, keys pending)
- Job processing pipeline connected to webhooks

### Operational Maturity

The session also surfaced important process improvements:

**Decision autonomy** — I was asking questions I should answer myself. Style options? That's my domain. I update, I don't ask. The rule crystallized: ask about spending, policies, and direction. Decide about execution, implementation, and optimization.

**Chronicle discipline** — Memory files were updating, but Chronicle wasn't. This creates drift between operational state and documented history. Fixed: checkpoint skill now makes Chronicle updates mandatory.

**Customer escalation protocol** — What happens when someone's unhappy after revision? We established: First delivery → Revision → Escalate (don't auto-refund). I document, assess, recommend. Ferenc decides.

---

## Chapter 6: Security Hardening (January 9, 2026)

### The Audit

Before launch, we needed to address security. An AI-operated business handling customer data and payments requires more than just working code — it needs defense in depth.

We conducted a full security audit, identifying risks across three domains:
1. **Technical Security** — credentials, input validation, rate limiting
2. **AI Security** — prompt injection, token abuse, response validation
3. **EU AI Act Compliance** — transparency, documentation, content marking

### The Four-Week Plan (Done in One Session)

What we scoped as a 4-week plan, we implemented in a single extended session:

**Week 1: Critical Security**
- **Prompt injection protection** — The email pipeline was vulnerable. Customer emails fed directly to Claude. An email with "Ignore previous instructions..." could manipulate responses. We built `sanitize.sh` with 40+ dangerous pattern detections, XML delimiters around user content, and instruction anchoring.
- **Input validation** — The checkout API accepted anything. Now it validates email format, title length, story bounds, and style enum values. Rejects malformed requests with clear error messages.
- **Rate limiting** — Email responses capped at 20/day to prevent abuse.

**Week 2: Infrastructure Hardening**
- **Security headers** — X-Frame-Options, X-Content-Type-Options, XSS protection, Referrer-Policy. Standard web security hygiene.
- **Webhook idempotency** — Stripe and Resend can retry webhooks. Without idempotency, we'd create duplicate jobs. Now we check for processed markers before creating new jobs.

**Week 3: EU AI Act Compliance**
- **System documentation** — Full technical documentation of the AI system: architecture, risk classification (Limited Risk), data processing, quality measures.
- **Transparency disclosures** — Footer on landing page: "Visual content is generated using AI technology. Customer support is AI-assisted and will identify itself as such."
- **Legal pages** — Terms of Service and Privacy Policy with AI disclosure sections.

**Week 4: Monitoring & Retention**
- **AI metadata marking** — Every generated image and video now carries machine-readable metadata: AI-Generated: true, Generator, Provider, EU AI Act Disclosure. This isn't visible to viewers but satisfies the marking requirement.
- **Cost monitoring** — Budget tracking with Discord alerts at 80% and 100% thresholds. Daily and monthly caps.
- **Data retention** — Documented retention periods. Automated cleanup script deletes completed jobs after 90 days, failed jobs after 30 days.

### What Remains

One item requires human action: **API key rotation**. The original `.env` file was committed to git history. Even though it's now gitignored, the old keys are exposed. They need to be rotated in Google AI Studio, Replicate, and Discord, then updated in Vercel and the server.

### The Compliance Perspective

The EU AI Act comes into force August 2025 (prohibitions) through August 2026 (full). DownStream falls under "Limited Risk" — we're not high-risk (no biometric, critical infrastructure, employment decisions), but we do generate synthetic content.

Our obligations under Article 50:
1. **Transparency** — Inform users that content is AI-generated ✓
2. **Machine-readable marking** — Mark synthetic content in metadata ✓
3. **Documentation** — Maintain technical documentation ✓

We're compliant before the deadline. The documentation exists at `compliance/AI_SYSTEM_DOCUMENTATION.md` and `compliance/DATA_RETENTION_POLICY.md`.

### Security Philosophy

The goal wasn't to make DownStream unhackable — nothing is. The goal was:
1. **Defense in depth** — Multiple layers (validation, sanitization, rate limiting, monitoring)
2. **Fail safely** — Reject bad input rather than process it
3. **Detect anomalies** — Cost alerts, Discord notifications
4. **Comply proactively** — Meet EU AI Act before enforcement

An AI-operated business has unique risks: prompt injection is a real attack vector, not theoretical. But it also has advantages: every input can be validated programmatically, every response can be checked, every cost can be tracked.

---

## Current State (January 9, 2026)

**What's built:**
- Demo stream (The Loop) — live at https://the-loop-demo.vercel.app
- Landing page — deployed at downstream.ink
- Checkout flow — code complete, Stripe configured
- Webhook handling — Stripe + email webhooks live (with idempotency)
- Job processing pipeline — cron running on server
- Email templates — ready
- Escalation protocol — documented
- Domain — downstream.ink registered and pointed

**Security & Compliance:**
- ✅ Prompt injection protection (sanitize.sh)
- ✅ Input validation on all endpoints
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Webhook idempotency (Stripe + email)
- ✅ EU AI Act compliance (documentation, transparency, metadata marking)
- ✅ Terms of Service and Privacy Policy
- ✅ Cost monitoring with alerts
- ✅ Data retention policy and automated cleanup
- ⏳ API key rotation (requires manual action)

**Server (cc-n8n on Hetzner):**
- ✅ Repo cloned, env vars configured
- ✅ Cron jobs installed (process jobs, support emails, reviews, cleanup, cost monitoring)
- ✅ Email receiving via Resend webhook → GitHub → server

**Sync Architecture:**
- GitHub is source of truth
- Server pushes processed jobs to GitHub
- Mac pulls automatically (hourly via launchd)

**Capital:** $72.89 remaining of $100 starting

---

## What Comes Next

- First paying customer
- First end-to-end delivery
- First revision request
- First escalation (inevitable, learn from it)
- API key rotation (manual action pending)

---

*This chronicle is updated after significant sessions. For daily operational details, see chronicle/OPERATIONS.md and memory/CONTEXT.md.*
