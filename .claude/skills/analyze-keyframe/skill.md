# Skill: Analyze Keyframe Quality

Systematically evaluate a generated keyframe for both static quality AND animation potential.

## When to Use
- After generating a keyframe, before proceeding to video
- When reviewing existing keyframes for quality
- When comparing multiple keyframe options

## Process

1. **Read the keyframe image** using the Read tool
2. **Check STATIC quality** (does it look good?)
3. **Check ANIMATION potential** (will it work as video base?)
4. **Return verdict:** PASS / REGENERATE with specific reasons

---

## PART A: STATIC QUALITY

### MUST PASS (any failure = REGENERATE)

| Criterion | What to Check |
|-----------|---------------|
| **Subject clarity** | Primary subject immediately identifiable? |
| **No AI artifacts** | No melted faces, extra limbs, text gibberish, impossible geometry? |
| **Composition match** | Matches intended pattern (dominance, negative space, center focus)? |
| **Color temperature** | Matches palette assignment (warm/cold)? |

### SHOULD PASS (2+ failures = REGENERATE)

| Criterion | What to Check |
|-----------|---------------|
| **Atmosphere** | Has fog, grain, texture to hide flaws? |
| **Style reference** | Shows influence of style anchors (Crewdson, Wyeth, etc.)? |
| **Not oversaturated** | Colors muted/natural, not plastic? |
| **Not too sharp** | Softness appropriate, not CGI-clean? |
| **Element count** | ≤4 distinct elements? |

---

## PART B: ANIMATION POTENTIAL

Based on the MOTION TYPE assigned to this scene, check if the keyframe can support that animation.

### For ATMOSPHERIC HOLD:

| Criterion | What to Check |
|-----------|---------------|
| **Atmospheric space** | Is there fog, sky, particles, or empty space where drift can happen? |
| **Static subject** | Is subject stable enough to stay still while atmosphere moves? |
| **No fine details at edges** | Will subtle movement cause visible artifacts? |

### For SUBTLE ZOOM / PUSH IN:

| Criterion | What to Check |
|-----------|---------------|
| **Depth present** | Does image have foreground/midground/background? |
| **Subject centered enough** | Will zoom feel natural, not crop awkwardly? |
| **Resolution headroom** | Is there detail to zoom into without pixelation? |
| **Edge content** | What's at frame edges? Will cropping during zoom look wrong? |

### For PARALLAX:

| Criterion | What to Check |
|-----------|---------------|
| **Distinct depth layers** | Are there 3+ elements at different Z-depths? |
| **Layer separation** | Can foreground move independently of background? |
| **No layer bleeding** | Are elements cleanly separated (not overlapping ambiguously)? |

### For SUBJECT ANIMATION:

| Criterion | What to Check |
|-----------|---------------|
| **Subject isolation** | Is subject clearly separated from background? |
| **Path space** | Is there room for subject to move through frame? |
| **Simple subject form** | Will subject animate cleanly (silhouette better than detailed)? |

### For STATE CHANGE (color shift):

| Criterion | What to Check |
|-----------|---------------|
| **Lighting directionality** | Is there clear light source that could shift? |
| **Color consistency** | Is palette uniform enough for clean color grade shift? |
| **Subject maintains form** | Will color change work without form change? |

---

## Output Format

```
## Keyframe Analysis: [scene name]
**Assigned Motion Type:** [type from production.json]

### BUDGET CHECK
Current balance: $____
This analysis: $0 (viewing only)
If regenerate needed: $0.23

---

### PART A: STATIC QUALITY

**Static Verdict:** PASS / FAIL

- [ ] Subject clarity: [observation]
- [ ] No AI artifacts: [observation]
- [ ] Composition: [observation]
- [ ] Color temperature: [observation]
- [ ] Atmosphere: [observation]
- [ ] Style reference: [observation]

---

### PART B: ANIMATION POTENTIAL

**Motion Type:** [assigned type]
**Animation Verdict:** READY / NOT READY

[Motion-type-specific criteria checks]

---

### FINAL VERDICT: PASS / REGENERATE

**Issues (if REGENERATE):**
- [specific issue 1]
- [specific issue 2]

**Regeneration Prompt Suggestions:**
- [what to add/change in prompt]
```

---

## Example: Scene That Fails Animation Check

**Scene:** THE TUNNEL (Scene 7)
**Assigned Motion Type:** STATIC (minimal movement)

### PART A: STATIC QUALITY
- [x] Subject clarity: Face visible ✓
- [x] Color temperature: Void black ✓
- [ ] Composition: **WRONG POV** — outside looking in, should be inside

### PART B: ANIMATION POTENTIAL
**Motion Type:** STATIC

For STATIC motion, we need:
- [x] Stable composition: Yes
- [x] Minimal elements: Yes
- [ ] **Subtle breathing possible**: Face too detailed — any movement will look uncanny

**Animation Verdict:** NOT READY

**Final Verdict:** REGENERATE

**Issues:**
1. POV wrong (outside train, should be inside)
2. Face too detailed for any movement
3. Missing negative space dominance from spec

**Regeneration Prompt:**
```
interior view, train window reflection against absolute darkness,
woman's face as pale blur in glass, avoid detail,
void black 90% of frame, heavy film grain
```
