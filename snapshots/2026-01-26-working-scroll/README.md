# Working Scroll Snapshot - 2026-01-26

## Purpose
This snapshot preserves the WORKING scroll configuration for the downstream.studio landing page.
After many iterations fixing scroll blocking issues, this represents a known-good state.

## What's included

### Landing page (`landing-page/`)
- `page.tsx` - Main page with iframe embeds
- `globals.css` - Global styles
- `beta.module.css` - Page-specific styles
- `layout.tsx` - Root layout

### Embedded streams (`streams/`)
- `founding-story-perf/globals.css` - Hero section stream
- `the-hunger-perf/globals.css` - Examples section stream
- `bolyai-en/globals.css` - Examples section stream

### Factory template (`factory/`)
- `globals.css` - Template for new streams

## The Critical CSS Pattern

**NEVER use combined `html, body { }` selector for overflow properties.**

Working pattern (SEPARATE selectors):
```css
html {
  overflow-x: clip;
  overflow-y: scroll;
}

body {
  overscroll-behavior: none;
  /* NO overflow properties */
}
```

Broken pattern (causes Chrome/Mac/trackpad scroll blocking):
```css
html, body {
  overflow-x: clip;
  overflow-y: scroll;
  overscroll-behavior: none;
}
```

## How to compare
If scrolling breaks again, diff the current CSS against this snapshot:
```bash
diff snapshots/2026-01-26-working-scroll/streams/founding-story-perf/globals.css streams/apps/founding-story-perf/app/globals.css
```

## DO NOT EDIT
This is a reference snapshot. Do not modify these files.
