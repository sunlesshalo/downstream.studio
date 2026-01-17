---
name: production-preflight
description: Quick quality gate before starting asset generation. Run after create-production-spec, before generating keyframes/videos.
---

# Production Preflight

## When to Use
- After `production.json` is created
- Before running keyframe or video generation
- Takes 2 minutes, saves hours of regeneration

---

## The Checklist

Open `production.json` and verify:

### 1. Opening Hook (Segment 1)
```
Does segment 1 have at least ONE of:
[ ] Color contrast (subject distinct from background)
[ ] Visible motion planned (camera_instruction is not "static")
[ ] Clear focal point / light source in composition
```
**If none → STOP. Redesign segment 1 before continuing.**

### 2. Camera Instructions
```
[ ] Every segment has camera_instruction field
[ ] No segment has empty/missing camera_instruction
```
Quick check: `grep -c "camera_instruction" production.json` should equal segment count.

### 3. Bookend Resonance
```
[ ] visual_direction.bookend_strategy is set
[ ] visual_direction.bookend_method is set
[ ] Final segment's visual connects to opening (per method)
```

### 4. Motion Specificity
```
Scan motion_prompts for red flags:
[ ] No motion_prompt says only "subtle movement" or "atmospheric"
[ ] Each motion_prompt has: direction, speed, or specific elements
```

---

## Quick Fixes

| Problem | Fix |
|---------|-----|
| Opening is dark-on-dark | Add light source, change subject color, or add bright accent element |
| Missing camera_instruction | Add `"camera_instruction": "slow push in"` as default |
| Vague motion prompt | Specify: "fog drifting left, particles floating upward, slow zoom in" |
| No bookend resonance | Review opening, add color callback or compositional echo to final segment |

---

## Pass/Fail

**PASS:** All checks green → proceed to keyframe generation

**FAIL:** Any check red → fix production.json first, then re-run preflight

Time saved by catching issues now: ~30 min per failed video regeneration
