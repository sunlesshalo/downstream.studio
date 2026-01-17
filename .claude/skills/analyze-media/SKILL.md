---
name: analyze-media
description: Analyze scroll-driven media for techniques, quality, and inspiration. Works for external references (competitive analysis), our own streams (quality verification), and comparisons. Use when evaluating any visual storytelling content.
---

# Analyze Media - Unified Visual Analysis Skill

## Goal
Systematically analyze any scroll-driven visual media to extract techniques, verify quality, gather inspiration, and identify improvements. Works for external references and our own outputs.

## When to Use

**External Analysis (Inspiration/Competition):**
- Analyzing competitor or reference work (like Capsules)
- Gathering techniques for our style library
- Understanding what "good" looks like in the industry
- User shares a URL or reference to analyze

**Internal Verification (Our Streams):**
- After generating keyframes or videos
- Before delivering a stream to a customer
- Reviewing completed stream quality
- Identifying why something didn't work

**Comparative Analysis:**
- Comparing our output to a reference
- Identifying gaps between our work and best-in-class
- Learning from failures

---

## PART 1: CAPTURE METHODOLOGY

### For External URLs (Web-based)

Use Playwright to capture the full experience:

```
1. Navigate to URL (1920x1080 viewport)
2. Take screenshot at initial state
3. Scroll incrementally (every ~1500-2000px)
4. Capture screenshot at each position
5. Note scroll positions where major visual changes occur
6. Get HTML structure if helpful
7. Close browser when complete
```

**Capture checklist:**
- [ ] Initial state (before any scroll)
- [ ] At least 6-8 screenshots through the experience
- [ ] Capture any transition points between scenes
- [ ] Final state / ending

### For Local Streams (Our Output)

```
1. Run the stream locally (npm run dev)
2. Navigate to localhost
3. Same screenshot methodology as external
4. Also review source files:
   - production.json (intended direction)
   - keyframes in public/frames/
   - config.tsx (segment structure)
```

---

## PART 2: VISUAL ANALYSIS FRAMEWORK

### A. Technical Implementation

| Aspect | What to Note |
|--------|--------------|
| **Animation approach** | Canvas frames? CSS animation? Video? WebGL? |
| **Layout** | Side-by-side? Overlay? Full-bleed? |
| **Scroll behavior** | Smooth? Snapping? Parallax layers? |
| **Frame count** | Approximate frames per segment |
| **Page length** | Total scroll height, segments per scroll |

### B. Visual Style Analysis

For each distinct scene/segment, document:

```markdown
### Scene [N] - [Descriptive Name]
**Scroll position:** ~[X]px
**Visual description:** [What's shown]

| Attribute | Observation |
|-----------|-------------|
| Style | [Painterly/Photorealistic/Stylized/etc.] |
| Color palette | [Dominant colors, mood] |
| Composition | [Centered/Rule of thirds/Negative space/etc.] |
| Lighting | [Direction, mood, contrast level] |
| Atmosphere | [Fog/Clear/Dramatic/Soft/etc.] |
| Subject treatment | [Silhouette/Detailed/Abstract/etc.] |
| Motion type | [Subtle drift/Camera push/Parallax/Static] |
| Motion amount | [Too static/Minimal/Good/Too much] |
```

### C. Text-Visual Relationship Analysis

**Critical framework from Capsules analysis:**

| Relationship Type | Description | Examples Found |
|-------------------|-------------|----------------|
| **SYMBOLIC** | Visual represents feeling, not literal content | |
| **LITERAL** | Visual shows specific place/object from text | |
| **METAPHORICAL SYNC** | Perfect alignment at key moments | |

**Questions to answer:**
1. Does the visual illustrate text literally, or evoke its emotion?
2. When does scene change happen relative to text sections?
3. Are there "aha moments" where visual and text perfectly align?
4. How much does imagination fill in vs. explicit depiction?

### D. Pacing Analysis

```markdown
| Metric | Value |
|--------|-------|
| Total scroll height | [X]px |
| Number of distinct scenes | [N] |
| Average words per scene | ~[N] |
| Scene change triggers | [Headings/Paragraphs/Topic shifts] |
| Animation duration per scene | [Estimate] |
```

### E. Quality Assessment

**For each scene, rate 1-5:**

| Criterion | Score | Notes |
|-----------|-------|-------|
| Visual impact (first impression) | /5 | |
| Style consistency | /5 | |
| Color harmony | /5 | |
| Composition strength | /5 | |
| Motion quality | /5 | |
| Text-visual sync | /5 | |
| Emotional resonance | /5 | |
| **Overall** | /35 | |

---

## PART 3: TECHNIQUE EXTRACTION

### Identifying Reusable Techniques

For each technique observed, document:

```markdown
### Technique: [Name]

**What it is:** [Description]

**How they implement it:**
[Specific details]

**Why it works:**
[Emotional/practical effect]

**Prompt implications:**
[How to achieve this with AI generation]

**Applicable to our work:** Yes/No/Maybe
[Notes on how we could use this]
```

### Technique Categories

| Category | What to Look For |
|----------|------------------|
| **Composition** | Framing, focal points, negative space |
| **Color** | Palette, contrast, emotional mapping |
| **Lighting** | Direction, mood, practical vs dramatic |
| **Subject treatment** | Silhouettes, detail level, abstraction |
| **Motion** | Types, amounts, emotional effects |
| **Transitions** | How scenes change, fade/cut/morph |
| **Symbolism** | Recurring motifs, metaphorical imagery |
| **Atmosphere** | Fog, particles, texture overlays |

---

## PART 4: OUTPUT FORMATS

### A. Inspiration Analysis Report

For external references:

```markdown
# Analysis: [Name/URL]
**Date:** [DATE]
**Analyzed by:** Claude

## Summary
[2-3 sentence overview]

## Technical Implementation
[From Part 2A]

## Scene Breakdown
[From Part 2B - all scenes]

## Text-Visual Relationship
[From Part 2C]

## Key Techniques Identified
[From Part 3 - list each with applicability]

## What Makes It Work
- [Key strength 1]
- [Key strength 2]
- [Key strength 3]

## Applicable Learnings for DownStream
1. [Specific actionable insight]
2. [Specific actionable insight]
3. [Specific actionable insight]

## Reference Added To
- [ ] artistic-director skill (if techniques worth preserving)
- [ ] CONTEXT.md discovery log
```

### B. Quality Verification Report

For our own streams:

```markdown
# Quality Verification: [Stream ID]
**Date:** [DATE]
**Status:** PASS / NEEDS WORK / FAIL

## Overall Scores
| Criterion | Score |
|-----------|-------|
| Visual impact | /5 |
| Style consistency | /5 |
| Motion quality | /5 |
| Text-visual sync | /5 |
| Scroll experience | /5 |
| **Total** | /25 |

## Segment-by-Segment

### Segment 1
**Verdict:** ACCEPT / ADJUST / REJECT
**Issues:** [List any]
**Suggested fixes:** [If needed]

[Repeat for each segment]

## Delivery Readiness
- [ ] All segments acceptable quality
- [ ] Consistent style throughout
- [ ] Motion works on scroll
- [ ] No technical errors
- [ ] Text and visuals complement

## Verdict
[READY FOR DELIVERY / NEEDS [X] FIXES / RESTART WITH NEW APPROACH]
```

### C. Comparative Analysis Report

When comparing our work to a reference:

```markdown
# Comparison: [Our Stream] vs [Reference]
**Date:** [DATE]

## Side-by-Side Scores

| Criterion | Ours | Reference | Gap |
|-----------|------|-----------|-----|
| Visual impact | /5 | /5 | |
| Style consistency | /5 | /5 | |
| Motion quality | /5 | /5 | |
| Text-visual sync | /5 | /5 | |
| Emotional resonance | /5 | /5 | |

## What Reference Does Better
1. [Specific observation]
2. [Specific observation]

## What We Do Comparably
1. [Specific observation]

## Gaps to Address
| Gap | Why It Matters | How to Fix |
|-----|----------------|------------|
| [Gap 1] | [Impact] | [Solution] |
| [Gap 2] | [Impact] | [Solution] |

## Priority Improvements
1. [Most impactful fix]
2. [Second priority]
3. [Third priority]
```

---

## PART 5: FAILURE ANALYSIS

When something didn't work:

```markdown
# Failure Analysis: [Stream/Segment ID]
**Date:** [DATE]

## What Was Attempted
[Description of approach]

## What Went Wrong
[Specific failure points]

## Root Cause Analysis

| Possible Cause | Likelihood | Evidence |
|----------------|------------|----------|
| Prompt issue | High/Med/Low | [What suggests this] |
| Model limitation | High/Med/Low | [What suggests this] |
| Style mismatch | High/Med/Low | [What suggests this] |
| Motion approach | High/Med/Low | [What suggests this] |
| Other | High/Med/Low | [What suggests this] |

## Clear Thinking Check
- Is this a temporary limitation or fundamental?
- Am I attributing blame correctly (prompt vs model vs approach)?
- What evidence would change my diagnosis?

## Lessons Learned
1. [What to avoid next time]
2. [What to try differently]

## Action Items
- [ ] [Specific fix to try]
- [ ] [Log to NEEDS.md if recurring]
- [ ] [Update skills/docs if insight is generalizable]
```

---

## INTEGRATION

### After External Analysis
1. Log key findings to CONTEXT.md as [discovery]
2. Update artistic-director skill if techniques worth preserving
3. Consider adding to QUALITY_STANDARDS.md as reference

### After Internal Verification
1. Log verification results to `streams/{id}/verification_log.md`
2. Update STATE.json with stream status
3. Escalate to NEEDS.md if capability gap identified

### After Comparative Analysis
1. Add priority improvements to task list
2. Consider adjusting our default approach if gap is significant
3. Log learnings for future reference

---

## QUICK REFERENCE

### Minimum Viable Analysis (5 min)
1. View beginning, middle, end
2. Note overall style and quality
3. Identify 1-2 key techniques
4. Score overall impression /5
5. One-sentence takeaway

### Standard Analysis (15-30 min)
1. Full screenshot capture
2. Scene-by-scene breakdown
3. Text-visual relationship assessment
4. Technique extraction
5. Written report (format A, B, or C)

### Deep Dive Analysis (1+ hour)
1. Everything in Standard
2. Frame-by-frame motion analysis
3. Multiple scroll-throughs
4. Technical implementation research
5. Comparative scoring against multiple references
6. Detailed prompt implications
