# Stream Production Methodology

Complete system for creating scroll-driven storytelling streams.

Compiled from frame-by-frame analysis of Capsules (thirdroom.studio) and production experiments.

---

## PART 1: SCENE STRUCTURE

### Scene Count & Duration

| Story Length | Scene Count | Avg Duration | Total Scroll |
|--------------|-------------|--------------|--------------|
| Short (~1000 words) | 5-6 scenes | ~1700px | ~10,000px |
| Medium (~2000 words) | 8-10 scenes | ~1700px | ~15,000px |
| Long (~3000 words) | 12-14 scenes | ~1700px | ~22,000px |

**Rule:** ~200-250 words per scene. Scene duration varies by function.

### Scene Duration by Function

| Function | Duration | When Used |
|----------|----------|-----------|
| Hook/Opening | 1500-2000px | Scene 1 |
| Standard | 1500-2000px | Most scenes |
| Rest/Meditation | 2000-2700px | ~35% and ~60% points |
| Resolution/Ending | 2000-2500px | Final scene |

---

## PART 2: MOTION TYPES

### Type 1: SUBJECT ANIMATION
**Definition:** Single subject moves through frame; background static.

| Attribute | Value |
|-----------|-------|
| Subject movement | 100% (scroll-driven path) |
| Background movement | 0% |
| Typical path | Enter frame → traverse → exit frame |
| Duration | 1500-2000px |
| When to use | Opening hook, key dramatic moments |
| Frequency | 1-2 per stream |

**Video prompt pattern:** `[subject] moving [direction] through frame, static background, cinematic`

---

### Type 2: ATMOSPHERIC HOLD
**Definition:** Scene largely static; atmosphere provides subtle life.

| Attribute | Value |
|-----------|-------|
| Subject movement | 0% |
| Background movement | 5-10% (fog, particles, light) |
| Duration | 1000-2500px |
| When to use | Breathing moments, context, most scenes |
| Frequency | 5-7 per stream (majority) |

**Video prompt pattern:** `static composition, subtle fog drift, atmospheric particles, gentle light variation, contemplative`

---

### Type 3: PARALLAX
**Definition:** Multiple elements at different depths move at different rates.

| Attribute | Value |
|-----------|-------|
| Element count | 3+ at different Z-depths |
| Foreground movement | Faster |
| Background movement | Slower or static |
| Duration | 1000-1500px |
| When to use | Complexity moments, visual richness |
| Frequency | 1-2 per stream |

**Video prompt pattern:** `parallax movement, foreground elements drifting faster than background, layered depth, cinematic`

---

### Type 4: STATE CHANGE
**Definition:** Same composition, subject changes state (color, form).

| Attribute | Value |
|-----------|-------|
| Composition | Unchanged |
| Subject | Transforms at scroll trigger |
| Types | Color shift, form change, lighting shift |
| Duration | 1500-2000px (change at midpoint) |
| When to use | Emotional turning points |
| Frequency | 1 per stream |

**Production:** Generate 2 keyframe variants, blend/crossfade in app at trigger point.

---

### Type 5: SUBTLE ZOOM
**Definition:** Very slow camera push-in or pull-out.

| Attribute | Value |
|-----------|-------|
| Scale change | 5-15% over full scene |
| Subject | Static within frame |
| Effect | "Drawing in" feeling |
| Duration | 2000-3000px |
| When to use | Intimacy, emphasis, long holds |
| Frequency | 1-2 per stream |

**Video prompt pattern:** `slow camera push in toward [subject], very gradual zoom, contemplative, cinematic`

---

### Type 6: STATIC
**Definition:** Near-still image with minimal breathing.

| Attribute | Value |
|-----------|-------|
| Movement | <5% (breathing only) |
| Duration | 1500-2500px |
| When to use | Resolution, endings, maximum stillness |
| Frequency | 1 per stream (ending) |

**Video prompt pattern:** `nearly still, minimal movement, subtle breathing, static composition`

---

## PART 3: THE RHYTHM FORMULA

### Motion Intensity Across Story

```
Position:   OPEN    25%     35%     50%     65%     80%     END
Intensity:  HIGH    LOW     MIN     MED     LOW     LOW     MIN
Function:   HOOK   SETTLE   REST   RETURN  COAST   COAST  RESOLVE
```

### The Pattern

1. **Scene 1: HIGH** - Grab attention with movement
2. **Scene 2: LOW** - Let viewer settle, breathe
3. **Scene 3: LOW+** - Similar pace, but with punctuation (state change)
4. **Scene 4: MINIMAL** - Deepest rest (~35% point)
5. **Scene 5: MEDIUM** - Complexity returns (parallax or animation)
6. **Scenes 6-8: LOW** - Coasting toward end
7. **Final Scene: MINIMAL** - Resolution, stillness

### Motion Type Distribution (8-scene stream)

| Motion Type | Count | Percentage |
|-------------|-------|------------|
| ATMOSPHERIC HOLD | 4-5 | 50-60% |
| SUBJECT ANIMATION | 1-2 | 12-25% |
| PARALLAX | 1 | 12% |
| STATE CHANGE | 1 | 12% |
| STATIC | 1 | 12% |

**Key insight:** Most scenes are HOLDS. Motion is the exception, not the rule.

---

## PART 4: SUBJECT & COMPOSITION

### Primary Subject Rules

Every scene has ONE primary subject. Identify it clearly.

| Element Count | When Used | Effect |
|---------------|-----------|--------|
| 1 element | Opening, closing, emphasis | Focus, clarity |
| 2 elements | Relationship, dialogue | Connection, tension |
| 3+ elements | Complexity, depth | Richness (parallax possible) |
| Never >4 | Always | Prevents overwhelm |

### Subject Transformation Within Scene

| Transformation | Example | Placement |
|----------------|---------|-----------|
| POSITION | Subject moves through frame | Opening (Scene 1) |
| STATE (color) | Yellow → Red | Emotional shift (~50%) |
| SCALE | Large → tiny (between scenes) | Perspective shift |
| NONE | Static hold | Most scenes (6 of 9) |

**Ratio:** 1:2 — For every scene with transformation, two scenes hold.

### Composition Patterns

| Pattern | Description | When Used |
|---------|-------------|-----------|
| SUBJECT DOMINANCE | Subject fills 50-70% | Introduction, emphasis |
| NEGATIVE SPACE | Subject <10%, vast empty | Isolation, scale, meditation |
| FRAME WITHIN FRAME | Element contains another | Complexity, voyeurism |
| CENTER FOCUS | Subject perfectly centered | Resolution, importance |

---

## PART 5: COLOR & PALETTE

### Temperature Rhythm

Alternate warm and cold between scenes:

```
WARM → COLD → WARM → COLD → WARM → COLD
```

| Temperature | Colors | Emotional Register |
|-------------|--------|-------------------|
| WARM | Red, amber, sepia, gold, honey | Hope, intimacy, memory, connection |
| COLD | Grey, blue, teal, steel | Isolation, technology, danger, distance |

### Within-Scene Color Shift

For STATE CHANGE scenes, palette shifts within the scene:

- Same composition
- Lighting/color temperature changes
- Marks emotional turning point

**Production:** Generate 2 keyframes (warm variant, cold variant), blend in app.

---

## PART 6: KEYFRAME PRODUCTION

### Prompt Structure

```
[composition] + [subject] + [action/state] + [lighting] + [palette] + [style references] + [texture]
```

**Example:**
```
solitary figure silhouetted against foggy train platform,
standing still waiting,
cold morning light,
steel grey and muted blue palette,
Gregory Crewdson staging, Andrew Wyeth loneliness,
film grain, shallow depth of field
```

### Negative Prompts (Always Include)

```
detailed faces, oversaturation, plastic textures, bright colors,
modern digital look, CGI, sharp edges, text, watermarks, logos
```

### Style Anchors

Use these references consistently:

| Reference | What It Brings |
|-----------|----------------|
| Gregory Crewdson | Staged reality, cinematic lighting |
| Andrew Wyeth | Golden hour, loneliness, texture |
| Terrence Malick | Natural light, atmosphere |
| Film grain | Analog feel, hides AI artifacts |

### What Works for AI Generation

| Works Well | Avoid |
|------------|-------|
| Silhouettes | Detailed faces |
| Fog, mist, atmosphere | Sharp details |
| Negative space | Crowded compositions |
| Texture (wood, fabric, stone) | Smooth surfaces |
| Warm/cold extremes | Neutral mid-tones |
| Single focal point | Multiple competing subjects |

---

## PART 7: VIDEO PRODUCTION

### Cost Reference

| Model | Cost | Duration | Resolution |
|-------|------|----------|------------|
| Minimax Hailuo | $0.50 | ~5.6s | 1312x720 |

**Budget for 8-scene stream:** ~$4.00 (videos only)

### Prompt Rules for Video

**DO:**
- Include camera instruction (push in, drift, static)
- Specify parallax if multiple depth layers
- Use "contemplative," "cinematic," "atmospheric"

**DON'T:**
- Rely on atmospheric particles alone for motion
- Use "nearly still" without camera instruction
- Expect complex subject animation from img2vid

### Motion Prompt Templates

| Motion Type | Prompt Template |
|-------------|-----------------|
| SUBJECT ANIMATION | `[subject] moving [direction] through frame, background static, cinematic` |
| ATMOSPHERIC HOLD | `static composition, subtle atmospheric drift, gentle light variation` |
| PARALLAX | `slow parallax, foreground elements drift [direction], background slower` |
| SUBTLE ZOOM | `very slow camera push in toward [subject], gradual, contemplative` |
| STATIC | `nearly still, minimal breathing movement, static` |

---

## PART 8: SCROLL-TO-FRAME RELATIONSHIP

### Technical Implementation (from downstream engine)

**The system uses extracted frames, not video playback.**

Videos are converted to frame sequences (e.g., 141 frames per ~5s video at 25fps).

**Progress Calculation:**
```
progress = (viewportHeight - sectionRect.top) / (sectionHeight + viewportHeight)
```
- When section top reaches viewport bottom: progress = 0
- When section bottom reaches viewport top: progress = 1

**Frame Mapping:**
```
frameIndex = floor(progress × (totalFrames - 1))
```

### Scene Duration → Frame Progression

| Scene Duration | Frame Count | Feel |
|----------------|-------------|------|
| 1000px scroll | 141 frames | Fast (frames change quickly) |
| 1700px scroll | 141 frames | Standard |
| 2500px scroll | 141 frames | Slow (frames change gradually) |

**Key insight:** Frame count is fixed. Scroll distance controls perceived speed.

---

## PART 8B: LAYOUT & DIMENSIONS

### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────┐
│   ┌──────────────────┬─────────────────┐       │
│   │                  │                 │       │
│   │   ANIMATION      │    TEXT         │       │
│   │   (60%)          │    (40%)        │       │
│   │                  │                 │       │
│   │   sticky         │    scrolls      │       │
│   │   100vh          │                 │       │
│   │                  │                 │       │
│   └──────────────────┴─────────────────┘       │
└─────────────────────────────────────────────────┘
```

- Animation: 60% width, 100vh height, sticky position
- Text: 40% width, scrolls normally
- Text padding: 60px 40px

### Mobile Layout (≤1024px)

```
┌─────────────────────┐
│   ANIMATION         │
│   (100% × 40vh)     │
│   sticky at top     │
├─────────────────────┤
│   TEXT              │
│   (100% width)      │
│   scrolls           │
└─────────────────────┘
```

- Animation: 100% width, 40vh height, sticky at top
- Text: 100% width, below animation
- Text padding: 40px 20px

### Frame/Keyframe Dimensions

| Output | Recommended |
|--------|-------------|
| Keyframe | 1312×720 or 1920×1080 |
| Aspect | 16:9 landscape |
| Format | WebP for frames |

---

## PART 8C: TEXT PLACEMENT & STYLING

### Text Panel Structure (from Capsules)

```
┌─────────────────────────┐
│ LABEL (small)           │  "Stream #1"
│                         │
│ HEADING (large)         │  "Title Here"
│                         │
│ Author: Name            │  Attribution
│                         │
│ Body text flows here    │
│ with normal paragraph   │
│ spacing...              │
└─────────────────────────┘
```

### Typography Hierarchy

| Element | Style |
|---------|-------|
| Label | Small, muted color |
| Heading | Large, high contrast |
| Author | Small, muted |
| Body | Normal size, 1.6-1.8 line-height |
| Dialogue | Italic, left border, indented |

### Color Scheme

| Element | Recommendation |
|---------|----------------|
| Background | Dark (#0a0a0f) |
| Text | Light/warm (#c9b8a8) |
| Accent | Story-appropriate |
| Muted | For secondary text |

---

## PART 8D: SCENE BREAK IDENTIFICATION

### From Story Text to Scenes

**Scene break triggers:**

1. **Setting change** - New location
2. **Time skip** - Hours, days, or implied passage
3. **Emotional shift** - Turning point, revelation
4. **POV change** - Different character perspective
5. **Narrative markers** - "---" or "* * *" in text

**Word count guideline:** ~200-250 words per scene

**Keep together:**
- Dialogue exchanges (don't break mid-conversation)
- Single continuous action
- Closely linked cause-effect moments

### Scene Grouping into Sections

| Section Type | Scenes | Function |
|--------------|--------|----------|
| Intro | 1-2 | Opening, hook |
| Rising | 2-4 | Building tension |
| Climax | 1-2 | Turning point |
| Resolution | 1-2 | Aftermath, ending |

---

## PART 9: DECISION FRAMEWORK

### When to Use Each Motion Type

```
Is this Scene 1 (opening)?
  YES → SUBJECT ANIMATION (high motion hook)
  NO ↓

Is this the final scene?
  YES → STATIC or MINIMAL (resolution)
  NO ↓

Is there an emotional turning point in this scene?
  YES → STATE CHANGE (color/form shift)
  NO ↓

Is this scene at ~35% or ~60% (rest points)?
  YES → ATMOSPHERIC HOLD with long duration (meditation)
  NO ↓

Does this scene have 3+ elements at different depths?
  YES → PARALLAX (layer movement)
  NO ↓

Is this a key dramatic moment?
  YES → SUBTLE ZOOM (draw viewer in)
  NO ↓

Default → ATMOSPHERIC HOLD (standard)
```

### Quick Reference Table

| Scene Position | Recommended Motion | Duration |
|----------------|-------------------|----------|
| Scene 1 | SUBJECT ANIMATION | 1800px |
| Scene 2 | ATMOSPHERIC HOLD | 1800px |
| Scene 3 | HOLD + STATE CHANGE | 1800px |
| Scene ~35% | ATMOSPHERIC HOLD (REST) | 2200px |
| Scene ~50% | PARALLAX or ANIMATION | 1400px |
| Scene ~60% | ATMOSPHERIC HOLD (LONG) | 2500px |
| Scene ~80% | ATMOSPHERIC HOLD | 1500px |
| Final Scene | STATIC | 2000px |

---

## PART 10: PRODUCTION CHECKLIST

### Pre-Production

- [ ] Story text finalized
- [ ] Scene count determined (words ÷ 200-250)
- [ ] Scene breaks identified (emotional beats)
- [ ] Motion type assigned per scene
- [ ] Palette arc defined (warm/cold alternation)
- [ ] Primary subject identified per scene
- [ ] Composition pattern chosen per scene

### Keyframe Generation

- [ ] Prompt written with all elements (composition, subject, light, palette, style)
- [ ] Negative prompts included
- [ ] Generated and reviewed
- [ ] Color temperature matches intended palette
- [ ] Subject clearly identifiable
- [ ] Composition matches chosen pattern

### Video Generation

- [ ] Motion prompt written with camera instruction
- [ ] Motion type matches scene assignment
- [ ] Generated and reviewed
- [ ] Motion feels appropriate (not too much, not too little)
- [ ] Loops properly (if applicable)

### Assembly

- [ ] Videos mapped to scroll positions
- [ ] Scene transitions are hard cuts (no crossfades)
- [ ] STATE CHANGE scenes have crossfade between variants
- [ ] Text scrolls independently of visuals
- [ ] Rhythm feels right (breathe → move → breathe)

---

## PART 11: QUALITY CRITERIA

### Keyframe Quality Checklist

**PASS if:**
- [ ] Primary subject is clearly identifiable
- [ ] Composition matches intended pattern (dominance, negative space, etc.)
- [ ] Color temperature matches palette assignment (warm/cold)
- [ ] No obvious AI artifacts (melted faces, extra limbs, text gibberish)
- [ ] Atmosphere present (fog, grain, texture hides flaws)
- [ ] Style references evident (Crewdson staging, Wyeth light, etc.)

**REGENERATE if:**
- Faces are detailed and uncanny
- Colors are oversaturated or plastic-looking
- Composition is cluttered (>4 distinct elements)
- Subject is unclear or lost in noise
- Modern/digital aesthetic instead of painterly

### Video/Motion Quality Checklist

**PASS if:**
- [ ] Motion type matches assignment (zoom, drift, parallax, static)
- [ ] Camera movement is perceptible but not jarring
- [ ] No morphing artifacts (subject changing shape)
- [ ] Loops seamlessly (for HOLD types)
- [ ] Atmospheric elements move naturally (fog, particles)

**REGENERATE if:**
- Motion is imperceptible (too static for non-STATIC type)
- Motion is too fast or dramatic
- Subject distorts or morphs unnaturally
- Camera jerks or stutters
- Loop has visible jump/seam

### Overall Stream Quality

**Before publishing, verify:**

1. **Rhythm test:** Scroll through entire stream. Does it breathe? (Movement → rest → movement)
2. **Color arc test:** Does palette alternate warm/cold appropriately?
3. **Attention test:** Does opening hook grab attention?
4. **Resolution test:** Does ending feel like resolution (stillness, closure)?
5. **Text sync test:** Do scene breaks align with natural text pauses?
6. **Mobile test:** Does it work on phone (40vh animation, readable text)?

### Quality Bar for Demo

For initial demo streams, aim for:

| Aspect | Minimum | Ideal |
|--------|---------|-------|
| Keyframe quality | 7/10 | 9/10 |
| Motion quality | 6/10 | 8/10 |
| Color consistency | Must pass | Must pass |
| Rhythm | Must feel right | Capsule-level polish |
| Text readability | Must be readable | Comfortable reading |

**Principle:** Better to have fewer scenes at higher quality than more scenes at lower quality.

---

## PART 10: SCROLL SYNCHRONIZATION

### The Problem

Text sections have different word counts, but animations have fixed frame counts. Without synchronization:
- Short text sections → scrolling through empty space
- Long text sections → text feels rushed
- Animation stops while user is still scrolling (worst case)

### The Solution

**Key principle:** Section height determined by word count. Animation adapts.

```
Section height = wordCount × PIXELS_PER_WORD
```

### Parameters (Tuned)

| Parameter | Value | Effect |
|-----------|-------|--------|
| `PIXELS_PER_WORD` | 3 | Lower = tighter gaps |
| First section lead-in | 100px | Small buffer at start |
| Last section tail | 30% viewport | Space to reach final frame |

### Implementation Rules

1. **Add `wordCount` to each section in config**
   ```json
   {
     "id": "opening",
     "segments": [1],
     "wordCount": 213
   }
   ```

2. **Text positioned at top of section** (`justify-content: flex-start`)
   - Read text, then scroll through animation
   - No centering (creates uneven gaps)

3. **Animation tied to global scroll progress**
   - Total frames distributed across total scroll distance
   - Animation NEVER stops while scrolling
   - Longer sections = slower animation (more px per frame)

### Calculating Word Count

Count words in section text (heading + body). For JSX content:
```
// Count: heading words + all paragraph text
"We All Have a Story" (4) + body paragraphs (209) = 213 words
```

### Target Word Count per Section

| Stream Length | Words/Section | Sections |
|---------------|---------------|----------|
| Short (~1000) | 170-210 | 5-6 |
| Medium (~2000) | 200-250 | 8-10 |

**Ideal:** Keep sections within ±20% of each other to maintain consistent rhythm.

---

## APPENDIX: CAPSULE #1 REFERENCE

Full scene map from analysis:

| Scene | Scroll | Duration | Motion | Subject | Palette | Transform |
|-------|--------|----------|--------|---------|---------|-----------|
| 1 | 0-1900 | 1900 | SUBJECT ANIMATION | Bird | Warm red | POSITION |
| 2 | 1900-3800 | 1900 | ATMOSPHERIC HOLD | Cityscape | Cold grey | NONE |
| 3 | 3800-5700 | 1900 | HOLD + STATE | Canary | Warm amber | COLOR |
| 4 | 5700-7900 | 2200 | ATMOSPHERIC HOLD | Tiny figures | Cold grey | NONE |
| 5 | 7900-9300 | 1400 | PARALLAX | Cages | Teal + amber | POSITION |
| 6 | 9300-12000 | 2700 | SUBTLE ZOOM | Workers | Warm sepia | MINIMAL |
| 7 | 12000-13000 | 1000 | ATMOSPHERIC HOLD | Figure | Cold blue | NONE |
| 8 | 13000-14500 | 1500 | ATMOSPHERIC HOLD | Figures | Grey fog | NONE |
| 9 | 14500-end | 2400 | STATIC | Envelope | Grey/BW | NONE |

---

## SPENDING LOG

| Date | Item | Cost |
|------|------|------|
| 2026-01-06 | Keyframes (9× Gemini 3 Pro) | $2.06 |
| 2026-01-06 | Video tests (13× Minimax) | $6.50 |
| 2026-01-07 | Video Scene 1 v1 (test) | $0.50 |
| 2026-01-07 | Video Scene 1 v2 (test) | $0.50 |
| **Total** | | **$9.56** |

**Budget:** $100-1000 starting capital
**Remaining:** ~$90-990
