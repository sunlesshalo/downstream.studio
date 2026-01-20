# Creative Upgrade Plan

**Inspired by:** Mars Rejects, competitive research (Session 54)
**Goal:** Break out of the 2-column constraint, add dramatic visual storytelling

---

## The Mars Rejects Insight

Their key technique: **a single visual that transforms through scroll** — not animation playback, but *narrative transformation*. The "Welcome to Mars" poster progressively becomes dystopian:
- Starts as glamorous travel ad
- Missing persons poster overlays
- Face becomes masked
- Title morphs "MARS" → "ARMS"
- Handcuffs, propaganda imagery layer in

This is fundamentally different from "animation plays as you scroll." It's **visual decay/evolution as storytelling**.

---

## Quick Wins (This Week)

### 1. Typography System

**Current:** Body text (16-18px), standard headings
**Target:** Display typography that commands the viewport

**Implementation:**
```
fonts/
├── display/           # For section titles, dramatic moments
│   ├── druk-wide      # Bold condensed (like Mars Rejects)
│   ├── obviously      # Wide display
│   └── editorial-new  # Elegant serif
└── reading/           # For body text
    └── source-serif   # Current, keep
```

**Quick action:** Add Google Fonts alternatives:
- `Anton` or `Bebas Neue` (free Druk-ish)
- `Playfair Display` (dramatic serif)
- `Space Grotesk` (tech/modern)

### 2. Color Palette Templates

**Current:** Per-stream custom colors
**Target:** Curated dramatic palettes

| Palette | Background | Accent | Text | Mood |
|---------|------------|--------|------|------|
| **Mars** | #1a1a2e | #e40038 | #faf3e9 | Dystopian, bold |
| **Void** | #000000 | #ffffff | #888888 | Minimal, stark |
| **Ocean** | #0a1628 | #00d4ff | #e0e0e0 | Tech, depth |
| **Earth** | #f5f0e8 | #2d5016 | #1a1a1a | Organic, warm |
| **Fire** | #1a0a0a | #ff6b35 | #fff5f0 | Intense, urgent |

### 3. Full-Width Layout Mode

**Current:** Always 50/50 text-animation split
**Target:** Multiple layout modes per segment

```typescript
type LayoutMode =
  | 'split-left'      // Current: text left, animation right
  | 'split-right'     // Flipped
  | 'full-visual'     // Animation full-width, text overlay
  | 'full-text'       // Text dominates, subtle visual background
  | 'centered'        // Both centered, stacked
  | 'sticky-visual'   // Visual pinned, text scrolls over
```

**Quick action:** Implement `full-visual` and `centered` modes in StreamEngine.

---

## Medium Effort (Next 2 Weeks)

### 4. Sticky-Transform Effect

**The Mars Rejects signature move.**

**How it works:**
1. Visual container has `position: sticky`
2. As user scrolls, overlay elements fade in/out
3. The base visual can also transform (filters, masks, layers)

**Implementation approach:**
```typescript
interface StickyTransformSegment {
  baseVisual: string;           // The main image/video
  transforms: TransformStep[];  // What happens at each scroll point
}

interface TransformStep {
  scrollProgress: number;       // 0-1, when this activates
  overlays?: OverlayElement[];  // Things to add
  filters?: string;             // CSS filters to apply
  textContent?: string;         // Text that appears
}
```

**This requires:** New segment type in StreamEngine, scroll-progress tracking per segment.

### 5. Structural Templates

Pre-designed story structures:

| Template | Segments | Layout Flow | Best For |
|----------|----------|-------------|----------|
| **Origin Story** | 5 | hero → split → full → split → CTA | Founder stories |
| **Journey** | 7 | intro → 3x alternating → climax → resolution → CTA | Book excerpts |
| **Reveal** | 3 | mystery → buildup → reveal | Product launches |
| **Decay** | 5 | pristine → 3x degradation → aftermath | Dystopian, dramatic |
| **Transformation** | 5 | before → catalyst → struggle → breakthrough → after | Personal growth |

### 6. Animated Infographics

**Options:**
- **Flourish embeds** — They have an API, we could integrate
- **Chart.js + scroll triggers** — Custom but more work
- **Lottie animations** — Pre-built, customizable
- **CSS-only** — For simple number counters, progress bars

**Quick win:** Lottie integration for common infographic patterns.

---

## Deeper Work (Month+)

### 7. Soundscapes

**Options evaluated:**

| Option | Cost | Quality | Customization |
|--------|------|---------|---------------|
| **Suno API** | ~$0.10/song | High | Full custom per stream |
| **Epidemic Sound** | $15/mo | Very high | Library, not custom |
| **Artlist** | $200/yr | Very high | Library, not custom |
| **Custom sound design** | Time | Variable | Full control |
| **Freesound.org + mixing** | Free | Variable | Requires curation |

**Recommendation:** Start with curated ambient loops (buy 20-30 tracks from Artlist/Epidemic), then explore Suno for custom.

**Implementation:**
```typescript
interface SoundscapeConfig {
  ambient?: string;           // Background loop
  transitions?: string[];     // Sounds for section changes
  volume: number;             // 0-1, user-controllable
  fadeIn: number;             // ms
}
```

### 8. Real Art + AI Art Hybrid

**The insight:** AI for motion/animation, human art for key moments.

**Workflow:**
1. Commission 1-3 hero illustrations from human artist
2. Use AI to create variants, transitions, ambient frames
3. Human art anchors the experience, AI fills the gaps

**Cost model:**
- Human illustration: $100-500 per piece
- AI variants: $0.50-2.00 per batch
- Total uplift: $200-600 per stream
- Price increase: +$300-500 to customer

### 9. CRM/Automation Integration

**Quick version:** Zapier webhooks on lead capture
**Full version:** Supabase + n8n automation flows

Already partially built (stream_leads table). Need:
- Webhook on new lead → notification/CRM
- Follow-up email sequences
- Lead scoring based on engagement data

---

## Mars Rejects-Inspired Demo

**Concept:** Create a "Proof of Concept" stream using Mars Rejects techniques.

**Story idea:** "The Algorithm" — A story about AI from the AI's perspective
- **Visual:** Single evolving image of a digital face/entity
- **Transformation:** Clean/hopeful → overwhelmed → corrupted → transcendent
- **Palette:** Void (black/white) with accent color appearing as story progresses
- **Typography:** Massive display text, centered
- **Layout:** 100% sticky-transform, no 2-column

**Why this:**
1. It's thematically relevant to what we do
2. It showcases the new capabilities
3. It's weird enough to be memorable
4. The story writes itself (we live it)

---

## Priority Sequence

### Week 1: Typography + Palettes + Full-Width Mode
- [ ] Add display font options to StreamEngine
- [ ] Create 5 curated color palettes
- [ ] Implement `full-visual` layout mode
- [ ] Test on one existing stream

### Week 2: Sticky-Transform Prototype
- [ ] Build scroll-progress tracking per segment
- [ ] Implement overlay system
- [ ] Create "The Algorithm" demo

### Week 3: Templates + Sound
- [ ] Define 5 structural templates
- [ ] Source 20 ambient tracks
- [ ] Implement audio player component

### Week 4: Polish + Documentation
- [ ] Document new capabilities
- [ ] Update production workflow
- [ ] Price adjustment if needed

---

## Technical Notes

### StreamEngine Changes Needed

Current architecture:
```
StreamEngine
├── Section (per segment)
│   ├── TextContent (left)
│   └── AnimationContainer (right)
```

New architecture:
```
StreamEngine
├── Section (per segment)
│   ├── layoutMode: LayoutMode
│   ├── BaseLayer (visual)
│   ├── OverlayLayer (transforms, text)
│   └── AudioLayer (soundscape)
```

### New Props for Segment Config

```typescript
interface SegmentConfig {
  // Existing
  title: string;
  body: string;
  frames: string[];

  // New
  layout: LayoutMode;
  palette?: PaletteKey;
  typography?: {
    titleFont: FontKey;
    titleSize: 'normal' | 'large' | 'massive';
  };
  transforms?: TransformStep[];
  audio?: SoundscapeConfig;
}
```

---

## Open Questions

1. **Backwards compatibility** — Do we update all existing streams or grandfather them?
2. **Pricing** — Does dramatic upgrade justify price increase?
3. **Production time** — These features add complexity. Can we still deliver fast?
4. **Customer choice** — Do customers pick templates, or do we decide based on content?

---

*Created: 2026-01-19 (Session 54)*
*Inspired by: Mars Rejects, competitive research*
