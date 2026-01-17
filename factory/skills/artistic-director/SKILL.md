---
name: artistic-director
description: Creative direction for stream visuals. Use when planning visual style, developing aesthetic concepts, crafting prompts, or when user wants more creative/sophisticated imagery for a stream.
---

# Artistic Director - Stream Visual Methodology

## MANDATORY: Read Style Guide First

**Before doing ANY creative work, read:**
```
chronicle/methodology/STREAM_STYLE_GUIDE.md
```

This is THE visual style. The style guide is the **source of truth** for:
- What elements exist (camera movements, subjects, atmosphere)
- Multi-layer scene construction (realistic + surreal layers)
- Never-repeat rules
- Motion intensity patterns
- Color rhythm patterns

This skill provides workflow guidance for APPLYING the style guide.

---

## Core Philosophy

**Avoid:** Generic AI aesthetics (oversaturated, plastic, "epic" everything)
**Pursue:** Restraint, intentionality, emotional resonance, visual metaphor

**The fundamental shift:** Don't illustrate the story. *Accompany it emotionally.*

---

# THE DOWNSTREAM METHODOLOGY

A unified approach to scroll-driven visual storytelling, synthesized from analysis of Capsules (thirdroom.studio) and Downstream (ehseg v2).

---

## CUSTOMER STYLE OPTIONS

When clients submit their brief, offer these four visualization styles:

```
                    ILLUSTRATED              ATMOSPHERIC
                    (follows the story)      (captures the mood)

CINEMATIC           "Storybook"              "Art Film"
(more scenes)       Scenes change with       Varied atmospheric moments
                    the narrative            that evoke feeling

IMMERSIVE           "Documentary"            "Dream Sequence"
(fewer scenes)      Direct visuals that      Deep, contemplative imagery
                    dwell on key moments     that immerses in emotion
```

### Style Descriptions (for customer form)

**"How should we visualize your story?"**

| Style | Description | Best For |
|-------|-------------|----------|
| **Storybook** | Visual scenes that follow the narrative, changing frequently as your story progresses | Children's books, clear narratives, action-driven stories |
| **Art Film** | Atmospheric imagery that captures the mood, with varied visual moments *(recommended)* | Literary fiction, journalism, essays |
| **Documentary** | Direct visual accompaniment that dwells meaningfully on key moments | Memoirs, profiles, non-fiction |
| **Dream Sequence** | Evocative, contemplative visuals that immerse the reader in feeling | Poetry, experimental, philosophical |

### Mapping to Production Parameters

| Style | Interpretation | Scene Count | Motion |
|-------|---------------|-------------|--------|
| **Storybook** | 60% symbolic, 40% literal | Words ÷ 200 | Subtle |
| **Art Film** | 70% symbolic, 30% literal | Words ÷ 230 | Subtle-Moderate |
| **Documentary** | 50% symbolic, 50% literal | Words ÷ 280 | Minimal-Subtle |
| **Dream Sequence** | 85% symbolic, 15% literal | Words ÷ 300 | Moderate |

---

## PHASE 1: STORY ANALYSIS

Before any visual work, excavate the narrative.

### 1.1 Identify Emotional Beats

Read the full text and mark:
- **Turning points** — Where does emotion shift?
- **Peaks** — Where is the highest intensity?
- **Valleys** — Where does the story breathe?
- **The question** — What is the story really about?

### 1.2 Map the Arc

```
OPENING → SETUP → COMPLICATION → PEAK → RESOLUTION → CLOSURE
   ↓         ↓          ↓          ↓         ↓           ↓
[mood]   [ground]   [tension]   [climax]  [release]  [echo/contrast]
```

### 1.3 Choose Bookend Strategy

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Echo** | Circular story, theme repeats | Bird → Envelope (both = message) |
| **Contrast** | Transformative story, growth | Youth+tech → Age+wisdom |
| **Evolution** | Same subject, changed state | Closed door → Open door |
| **Echo + Frame** | Complex layering | Cosmic void → Domestic table (hunger in both) |

**Bookend Method (how the callback manifests):**

Bookends should resonate, not repeat literally. Subtle callbacks are more elegant than obvious matching.

| Method | Description |
|--------|-------------|
| `color_callback` | Final scene returns to opening's color temperature |
| `compositional_parallel` | Similar framing/layout, different subject |
| `motion_echo` | Similar camera movement or subject motion |
| `symbolic_rhyme` | Different symbol, same meaning |

**Example:** Opening has raven in flight → Closing doesn't need another raven. Could echo through: flight-like motion, same amber sky color, similar composition with empty space.

### 1.4 Opening Hook

**The first scene determines whether readers continue scrolling.**

Opening scene MUST have at least ONE of:
- **Color contrast** — Subject visually distinct from background (no dark-on-dark)
- **Visible motion** — Movement in first 2 seconds of video
- **Light source** — Focal point drawing the eye

**Avoid:** Dark subjects on dark backgrounds, completely static openings, generic establishing shots.

**Test:** Would this stop someone mid-scroll? If not, rethink.

---

## PHASE 2: VISUAL DIRECTION

### 2.1 Choose ONE Consistent Style

**Critical rule:** Pick a single visual language and maintain it throughout.

Style consistency enables:
- Hard cuts between scenes (simpler production)
- Stronger artistic identity
- Easier AI generation (consistent negative prompts)

**Recommended approaches:**

| Style | Best For | Key Elements |
|-------|----------|--------------|
| **Shadow Puppet Theater** | Literary fiction, myth | Silhouettes, warm/cold contrast, paper textures |
| **Atmospheric Illustration** | Tech stories, journalism | Fog, muted palettes, symbolic objects |
| **Surreal Composite** | Philosophical, abstract | Floating elements, layered realities |
| **Living Photograph** | Intimate human moments | Near-static, breathing motion, sepia tones |

### 2.2 Define the Color World

**Every stream needs a color arc that mirrors the emotional journey.**

#### Temperature as Narrative
- **Cold (teal, grey, blue)** = isolation, technology, danger, vastness
- **Warm (amber, gold, sepia)** = connection, hope, intimacy, safety

#### The Color Arc Template

```
SEGMENT 1: Establish signature color (attention, identity)
    ↓
SEGMENT 2-3: Ground in reality OR build tension (colder)
    ↓
SEGMENT 4-5: Emotional revelation (warmer)
    ↓
SEGMENT 6-7: Stakes/complication (shift - warm→cold OR cold→warm)
    ↓
FINAL: Resolution + bookend (return to signature OR deliberate contrast)
```

#### Within-Scene Color Shifts

**Powerful technique:** Shift color temperature WITHIN a single scene to track emotional micro-arc.

```
Scene starts: Warm amber (hope)
Text darkens: Palette shifts to cold blue (despair)
Same composition, different emotional register.
```

Implementation: Generate two color variants of keyframe, blend or switch mid-scene.

### 2.3 Plan Scene Structure

**Formula:** 1 scene per 200-280 words

| Story Length | Scene Count | Words/Scene |
|--------------|-------------|-------------|
| 1,500 words | 6-7 scenes | ~220 |
| 2,000 words | 8-9 scenes | ~230 |
| 2,500 words | 10-11 scenes | ~240 |
| 3,000 words | 12-14 scenes | ~230 |

**Scene boundaries should align with:**
- Section headings (if present)
- Emotional beat changes
- Topic shifts
- NOT arbitrary word counts

---

## PHASE 3: TEXT-VISUAL RELATIONSHIP

### 3.1 The Three Modes

**SYMBOLIC (default, 70% of scenes)**

Visual represents the *feeling*, not the literal content.

| Text Says | DON'T Show | DO Show |
|-----------|------------|---------|
| "planned to escape" | Two people planning | Bird in flight |
| "journalist in war zone" | Journalist with camera | Fog over ruins |
| "data breach exposed millions" | Computer screens | Shattered glass / scattered papers |
| "felt trapped by circumstances" | Person in cage | Narrow corridor, closing walls |

**Why:** Avoids uncanny valley, more emotionally powerful, easier to produce.

**LITERAL (rare, 15% of scenes)**

Specific place or object from the story, used to ground.

- Story mentions Berlin → Brandenburg Gate appears
- Character's name is "Canary" → Yellow canary appears
- Setting is "a small wooden house" → Show the house

**When:** To anchor abstract in concrete, to establish setting, to pay off a setup.

**METAPHORICAL SYNC (powerful, 15% of scenes)**

Perfect alignment at key moments — the "aha" factor.

- Product named "Canary" → Canary appears exactly when product is introduced
- Story about message delivery → Envelope appears at ending
- Title is "The Hunger" → Void/maw opening, then table with food at end

**When:** Opening, climax, closing. The moments that should land.

### 3.2 Composition Frameworks

| Framework | Emotional Effect | Use When |
|-----------|------------------|----------|
| **Negative Space Dominance** (80/20) | Isolation, insignificance, meditation | Character is small against vast forces |
| **Frame Within Frame** | Voyeurism, trapped, layered reality | Multiple narrative layers, choices |
| **Silhouette Against Light** | Mystery, anonymity, universality | Avoid uncanny valley, make relatable |
| **Center Focus** | Importance, stillness, sacred | Key reveals, quiet moments |
| **Diagonal Tension** | Conflict, energy, disruption | Stakes rising, action beats |

---

## PHASE 4: MOTION DESIGN

**Reference: STREAM_STYLE_GUIDE.md for complete element inventory**

### 4.1 The Motion Spectrum

**Rule: Motion is CONTEMPLATIVE, never dramatic.**

| Intensity | Description | Use For |
|-----------|-------------|---------|
| **Minimal** | Atmospheric only - fog drift, light flicker | Quiet moments, contemplation |
| **Subtle** | Camera does work - slow zoom, gentle drift | Standard scenes, reading flow |
| **Moderate** | Subject moves - sway, rotation, parallax | Emphasis, emotional peaks |
| **NEVER** | Fast action, complex movement | AI cannot handle it well |

### 4.1.1 Camera Instruction (Required)

**Every segment needs explicit camera direction.** Without it, videos become static slideshows.

| Camera Instruction | Effect | Best For |
|--------------------|--------|----------|
| `slow push in` | Gradual zoom toward subject | Building tension, focus |
| `gentle drift left/right` | Lateral camera movement | Exploration, passage of time |
| `slow zoom out` | Reveal wider context | Resolution, opening up |
| `parallax layers` | Foreground/background move at different speeds | Depth, dreamlike |
| `static with subject motion` | Camera still, subject moves | Intimate moments |

**In production.json, each segment MUST include:**
```json
{
  "camera_instruction": "slow push in toward center"
}
```

**If the camera instruction is missing, the video will likely be too static.**

### 4.2 Motion Types by Scene

| Scene Type | Camera | Subject | Atmosphere |
|------------|--------|---------|------------|
| **Atmospheric/symbolic** | Slow push in | Static | Fog/particles drift |
| **Character moment** | Static or gentle drift | Breathing, micro-movement | Light flicker |
| **Surreal/abstract** | Push through layers | Parallax float | Multiple depths |
| **Revelation/peak** | Slow zoom in | Color shift | Intensifying |
| **Quiet/intimate** | Static | Living photograph | Subtle dust motes |

### 4.3 Motion Prompt Templates

```markdown
## Atmospheric Scene
"slow drifting fog, atmospheric haze moving gently,
subtle light variation, very slow camera push in,
cinematic, contemplative, no sudden movements"

## Silhouette Scene
"figures completely still, atmospheric fog drifting behind,
subtle parallax between foreground and background,
wind barely moving elements, dreamlike stillness"

## Surreal Floating Elements
"elements drifting at different speeds based on depth,
closest elements move faster, distant slower,
dreamlike gentle rotation, gravity-defying but slow"

## Living Photograph
"very subtle breathing motion, occasional micro-movement,
nearly still but alive, soft light flickering,
photograph coming to life, intimate stillness"

## Color Shift Scene
"gradual color temperature change from warm to cold,
same composition throughout, lighting shifts,
emotional transition, sunset to twilight feeling"
```

---

## PHASE 5: PRODUCTION SPECIFICATION

### 5.1 The production.json Structure

```json
{
  "stream_id": "story-name",
  "visual_direction": {
    "style": "One consistent style description",
    "references": ["Artist 1", "Film 2", "Movement 3"],
    "color_palette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex"
    },
    "negative_prompts": "What to always avoid",
    "bookend_strategy": "echo|contrast|evolution"
  },
  "segments": [
    {
      "id": 1,
      "name": "SCENE NAME",
      "text_visual_mode": "SYMBOLIC|LITERAL|METAPHORICAL_SYNC",
      "emotional_beat": "What viewer should feel",
      "visual_description": "What appears in frame",
      "color_phase": "warm|cold|transition",
      "motion_type": "atmospheric|zoom|drift|parallax|static",
      "motion_intensity": "minimal|subtle|moderate",
      "composition": "negative_space|frame_within_frame|center|diagonal"
    }
  ]
}
```

### 5.2 Segment Planning Checklist

For each segment, answer:

- [ ] What is the emotional beat?
- [ ] SYMBOLIC, LITERAL, or METAPHORICAL SYNC?
- [ ] What metaphor/symbol represents this feeling?
- [ ] Where in the color arc? (warm/cold/transition)
- [ ] Does color shift WITHIN this segment?
- [ ] What motion type serves this mood?
- [ ] What composition framework?
- [ ] How does this transition to next segment?

### 5.3 Transitions Between Scenes

**With consistent style:** Hard cuts work fine
- Color temperature can bridge (amber element carries through)
- Style consistency creates visual continuity

**If style varies:** Use color bridges
- Scenes share one bridging color
- Don't hard-cut between incompatible palettes

---

## PHASE 6: PROMPT ARCHITECTURE

### 6.1 Prompt Structure

```
[SUBJECT/SCENE], [STYLE REFERENCE],
[LIGHTING], [COLOR PALETTE],
[COMPOSITION], [ATMOSPHERE/MOOD],
[TECHNICAL QUALITIES],
[NEGATIVE: what to avoid]
```

### 6.2 Example - Weak vs Strong

**Weak:**
```
"A person standing in a dark room, cinematic, moody"
```

**Strong:**
```
"Solitary figure silhouetted against rain-streaked window,
Tarkovsky stillness meets shadow puppet theater,
single practical lamp casting amber pool in ocean of cold blue shadow,
negative space dominance with subject in lower third,
paper texture overlay, dust particles in light beam,
film grain, shallow depth of field, muted palette,
avoid: sharp facial details, modern elements, oversaturation, plastic textures"
```

### 6.3 The Negative Prompt Bank

Always include relevant negatives:

```
ALWAYS: "avoid oversaturation, plastic textures, generic AI aesthetic"

FOR STYLIZED: "avoid photorealistic, CGI look, sharp details, clean rendering"

FOR HUMAN FIGURES: "avoid uncanny valley, detailed faces, anatomical errors"

FOR ATMOSPHERE: "avoid harsh lighting, flat composition, bright colors"
```

---

## QUICK REFERENCE

### The 7 Commandments

1. **Symbolic over literal** — Show what it FEELS like, not what happens
2. **One style throughout** — Consistency enables hard cuts and identity
3. **Color arc mirrors emotion** — Plan temperature shifts before generating
4. **Within-scene color shifts** — Powerful for emotional micro-arcs
5. **Motion is contemplative** — Slow, subtle, dreamlike. Never fast.
6. **Bookend with intention** — Echo, contrast, or evolve the opening
7. **Atmosphere hides AI flaws** — Fog, grain, haze are your friends

### Scene Count Formula

```
Words ÷ 230 = Scene count (round to nearest)
```

### Color Temperature Quick Guide

```
COLD → WARM: Story moves toward hope, connection, resolution
WARM → COLD: Story moves toward isolation, danger, loss
OSCILLATING: Complex story with multiple emotional threads
```

### Text-Visual Mode Distribution

```
70% SYMBOLIC (default)
15% LITERAL (grounding)
15% METAPHORICAL SYNC (payoff moments)
```

---

## APPENDIX: REFERENCE ANALYSES

Detailed analyses of reference streams are preserved below for context. The methodology above synthesizes these learnings.

### A.1 Capsules (thirdroom.studio)

**Key learnings incorporated:**
- Symbolic over literal approach
- Color temperature as narrative device
- Three text-visual relationship modes
- Subtle motion, camera does heavy lifting
- Atmospheric effects hide AI flaws
- Bookend strategies (echo, contrast)

**Capsule #1 stats:** ~12,100px scroll, 10 scenes, ~2500 words
**Capsule #2 stats:** ~15,400px scroll, 14 scenes, ~3000 words

### A.2 Downstream Ehseg v2

**Key learnings incorporated:**
- Consistent style enables hard cuts
- Full palette shifts within scenes (not just accent)
- Fewer, longer scenes are valid
- Frame-within-frame composition
- Shadow puppet aesthetic for literary fiction

**Ehseg v2 stats:** ~7,635px scroll, 5 scenes, ~1,450 words

---

## VISUAL STYLE LIBRARY

### Recommended Styles for Streams

| Style | Best For | Key Prompts |
|-------|----------|-------------|
| **Tarkovsky Stillness** | Literary, contemplative | "rain on windows, abandoned rooms, sacred mundane, mirror reflections" |
| **Shadow Puppet Theater** | Myth, folk tales, literary | "silhouettes, paper texture, warm amber vs cold void, Indonesian wayang" |
| **Beksiński Surrealism** | Horror, existential | "bone cathedrals, organic nightmare, decaying grandeur, beautiful grotesque" |
| **Hopper Isolation** | Urban, loneliness | "empty diners, long shadows, solitary figures, american melancholy" |
| **Atmospheric Noir** | Tech, thriller | "fog, neon reflections, venetian blind shadows, rain-soaked streets" |
| **Shaun Tan Handcraft** | Children's lit, wonder | "handcrafted surrealism, impossible creatures, paper collage, gentle strangeness" |

### Color Palettes

```
DESCENT / TRAGEDY
├── Deep navy (#0a1628)
├── Dried blood (#8b0000)
├── Bruise purple (#301934)
└── Bone white (#f5f5dc)

EMERGENCE / HOPE
├── Pre-dawn grey (#2c3e50)
├── Rose gold (#b76e79)
├── Soft amber (#ffbf00)
└── Clear sky (#87ceeb)

VOID / COSMIC
├── Void black (#0d0d0d)
├── Cold blue (#1a2a3a)
├── Nebula magenta (#ff00ff)
└── Star white (#ffffff)

INTIMATE / DOMESTIC
├── Warm amber (#d4a056)
├── Flesh tone (#c9b8a8)
├── Shadow brown (#3d2314)
└── Candle glow (#ffcc66)
```

---

## Memory Integration

- Log [decision] for major style choices
- Log [discovery] for effective prompt patterns
- Save successful prompts as templates in CONTEXT.md
