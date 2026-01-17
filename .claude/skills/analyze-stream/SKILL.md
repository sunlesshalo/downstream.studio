---
name: analyze-stream
description: Analyze scroll-driven visual content (streams, capsules, competitor work). Uses deterministic capture + structured analysis. For quality review, competitive analysis, and methodology development.
---

# Analyze Stream - Visual Content Analysis

## Goal
Produce detailed analysis of scroll-driven visual content at the same rigor level as our Capsule #1 reference analysis. Works for our own streams (quality review), competitor content (competitive analysis), and inspiration sources.

## When to Use
- Reviewing a stream before delivery to client
- Analyzing competitor or inspiration content
- Building/refining production methodology
- Quality verification after pipeline run

---

## PHASE 1: DETERMINISTIC CAPTURE

**The script controls capture. Not me.**

### Run the capture script:
```bash
python pipeline/execution/capture_scroll_frames.py "<url>" "<output_dir>" --interval 100
```

### What the script produces:
- Screenshots at exact 100px intervals
- `capture_metadata.json` with:
  - Total scroll height
  - Number of screenshots
  - List of all captured frames

### Before proceeding, verify:
- [ ] Capture completed without errors
- [ ] `capture_metadata.json` exists
- [ ] Screenshot count matches expected (total_height / 100)

---

## PHASE 2: SCENE BOUNDARY IDENTIFICATION

**Analyze ALL screenshots to identify scene transitions.**

### Process:
1. Load screenshots in sequence: 00000.png, 00100.png, 00200.png...
2. Compare consecutive frames
3. Mark scene boundaries where visual content changes completely
4. Record scroll position of each transition

### Output format:
```markdown
## Scene Boundaries

| Scene | Start (px) | End (px) | Duration |
|-------|------------|----------|----------|
| 1     | 0          | 900      | 900px    |
| 2     | 900        | 2100     | 1200px   |
...
```

### Verification:
- [ ] Every screenshot has been viewed
- [ ] All scene boundaries identified
- [ ] Start of scene N = End of scene N-1

---

## PHASE 3: DETAILED SCENE ANALYSIS

**For EACH scene, analyze using this exact template.**

**CRITICAL:** Be specific about what is moving vs static. Do not use vague terms like "subtle" or "minimal." Name the exact element and its exact behavior.

### Per-Scene Template:

```markdown
### What I Observe in Scene [N]: [DESCRIPTIVE NAME]

**Frames examined:** [list frame numbers, e.g., 03600, 03900, 04200, 04500, 04800]
**Scroll range:** [start]-[end]px
**Duration:** [X]px

---

**Visual Content (what is in this scene):**
- Primary subject: [e.g., "Open book in foreground"]
- Secondary elements: [e.g., "Mountains in background, stormy sky"]
- Tertiary elements: [e.g., "Water/lake below mountains"]
- Color state: [COLORED / B&W / MUTED / SEPIA / WARM / COLD]
- Composition: [e.g., "Book fills lower 40% of frame, landscape behind"]

---

**Static Elements (confirmed same across all frames):**
- Camera position/framing: [STATIC or describe movement]
- [Element 1]: [e.g., "Book position in frame — static"]
- [Element 2]: [e.g., "Mountain silhouette — static"]
- [Element 3]: [e.g., "Water — static"]

---

**Dynamic Elements (confirmed movement across frames):**
- [Element]: [Specific movement, e.g., "Pages — flipping/turning"]
- [Element]: [Specific movement, e.g., "Clouds — drifting L→R"]
- [Element]: [Specific movement, e.g., "Subject — head turns from profile to front"]
(If no dynamic elements detected, write "None detected")

---

**What I Cannot Reliably Detect From These Frames:**
- [Element]: [Why uncertain, e.g., "Subtle breathing — resolution too low to confirm"]
- [Element]: [Why uncertain, e.g., "Cloud drift — frames too far apart to detect"]
(Be honest about limitations. Do not guess.)

---

**Special/Surreal Elements:**
- Impossible elements: [e.g., "Bird standing ON cage, not inside"]
- State changes: [e.g., "Hearts appear on silhouettes mid-scene"]
- Color shifts: [e.g., "Yellow → amber → red transformation"]
- Interactive: [e.g., "Door opens/closes with scroll direction"]
(If none, write "None")

---

**Summary:**
- Camera: [STATIC / ORBIT / PAN / PUSH / PULL / DRIFT]
- Subject: [STATIC / specific movement]
- Environment: [STATIC / specific movement]
- Motion type: [Camera+Subject / Camera only / Subject only / Environment only / State change / Interactive / Static]

**What makes this scene work:**
[1-2 sentences]
```

### Verification per scene:
- [ ] Listed ALL frame numbers examined
- [ ] Compared consecutive frames to detect motion
- [ ] Explicitly listed static elements (not assumed)
- [ ] Explicitly listed dynamic elements with specific descriptions (not assumed)
- [ ] Explicitly stated camera movement (write "STATIC" if no movement — do not leave ambiguous)
- [ ] Listed elements I cannot reliably detect (honest about uncertainty)
- [ ] Did NOT use vague terms ("subtle", "minimal", "slight") without specifics

---

## PHASE 4: PATTERN ANALYSIS

After all scenes analyzed, identify patterns:

### Color/Intensity Pattern:
| Scene | Color State | Intensity |
|-------|-------------|-----------|
| 1     | ?           | ?         |
...

### Motion Strategy Pattern:
| Scene | Camera | Subject | Environment | Type |
|-------|--------|---------|-------------|------|
| 1     | ?      | ?       | ?           | ?    |
...

### Questions to answer:
- Is there a color rhythm? (alternating warm/cold, colored/B&W)
- Where is effort concentrated? (front-loaded? distributed?)
- What motion types are used? Do they repeat consecutively?
- Is there a bookend pattern? (opening vs closing)

---

## PHASE 5: ELEMENT INVENTORY

Extract reusable elements:

### Subjects used:
| Element | Scene(s) | Notes |
|---------|----------|-------|

### Environmental elements:
| Element | Scene(s) | Notes |
|---------|----------|-------|

### Surreal additions:
| Element | Scene(s) | Notes |
|---------|----------|-------|

### Motion techniques:
| Technique | Scene(s) | Notes |
|-----------|----------|-------|

---

## PHASE 6: PRODUCTION INSIGHTS

What can we learn for our own production?

### Key techniques to adopt:
- [List techniques that worked well]

### Patterns to follow:
- [Color rhythm, effort distribution, etc.]

### Things to avoid:
- [What didn't work or felt weak]

---

## OUTPUT VERIFICATION CHECKLIST

Before marking analysis complete:

- [ ] Capture script ran successfully (Phase 1)
- [ ] All screenshots viewed and scene boundaries identified (Phase 2)
- [ ] Every scene has complete template filled (Phase 3)
- [ ] Pattern analysis complete (Phase 4)
- [ ] Element inventory extracted (Phase 5)
- [ ] Production insights documented (Phase 6)
- [ ] Analysis saved to `chronicle/artifacts/analyses/[name]-detailed-analysis.md`

**If any checkbox is unchecked, the analysis is INCOMPLETE. Do not proceed.**

---

## REFERENCE

The reference standard is: `chronicle/artifacts/analyses/capsule-1-detailed-analysis.md`

Before finalizing, compare:
- Does my analysis have the same sections?
- Does each scene have the same depth of detail?
- Did I identify motion, color, elements, and patterns at the same level?

If the answer is "no" to any → go back and complete.

---

## CLEAR THINKING CHECK

Before concluding, ask:
- Did I actually analyze every screenshot, or did I skip some?
- Did I substitute an easier goal for the actual goal?
- Am I claiming completion because I want to be done, or because the work is done?
- Would this analysis be useful for production methodology?

---

## ANTI-DRIFT RULES

1. **Do not speed up intervals.** The script captured at 100px. Analyze at 100px.
2. **Do not skip scenes.** Every scene gets the full template.
3. **Do not leave fields empty.** If unclear, investigate more frames.
4. **Do not claim tool limitations.** Compare consecutive frames to detect motion.
5. **Do not substitute goals.** The goal is reference-quality analysis, not "mapping scenes."
6. **Do not use vague terms.** Never say "subtle", "minimal", "slight" without specifying WHAT is subtle. Name the element and describe its specific movement.
7. **Do not confuse text panel scrolling with visual movement.** The text on the right side scrolls — that is NOT camera or scene movement. Only analyze the visual content panel.
8. **Do not guess.** If you cannot reliably detect movement, say so explicitly in "What I Cannot Reliably Detect" section. Do not claim movement you haven't verified.
9. **Do not trust previous analysis.** If re-analyzing, verify every claim against actual frames. Previous analysis may be wrong.
10. **Be specific about WHAT moves.** "Pages flipping" is correct. "Book moving" is wrong if only the pages move. "Subject breathing" is correct. "Subject moving" is vague.

If you notice yourself wanting to shortcut → STOP and use `/clear-thinking`.
