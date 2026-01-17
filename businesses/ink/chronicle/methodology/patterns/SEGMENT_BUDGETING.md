# Pattern: Section Pacing

**Discovered:** 2026-01-07 (The Loop demo review)
**Updated:** 2026-01-07 (simpler solution found)
**Source:** Self-analysis after first demo production

---

## The Problem

When sections flow naturally (height based on content), multiple text blocks appear at once. Opening and closing scenes feel rushed. Animation doesn't have time to establish.

## The Solution (Simple)

**Make each section full-viewport height.**

```css
.ds-section {
  min-height: 100vh;
  justify-content: center;
}
```

This ensures:
- One text block visible at a time
- Full scroll distance for each animation to play
- Text centered vertically (comfortable reading position)

**Status:** Now built into StreamEngine template.

## Alternative: Extra Segments

For more control, budget **20-30% more segments than text blocks**.

```
Segment 1:     INTRO (animation only, no text)
Segments 2-N:  CONTENT (text + animation)
Segment N+1:   OUTRO (animation continues after text ends)
```

Use this when:
- You want a title card before text begins
- Story needs contemplative exit after final text
- Different scenes need different pacing

## Counter-Example

"The Loop" demo (before fix): Sections flowed naturally, multiple visible at once. Scene 1 and 9 felt abrupt because users scrolled past them quickly.

After adding `min-height: 100vh`: Each scene gets full scroll range, animation unfolds completely.

## Application

1. **Default:** Use `min-height: 100vh` on sections (built into engine)
2. **Advanced:** Add intro/outro segments with no text content for premium pacing
