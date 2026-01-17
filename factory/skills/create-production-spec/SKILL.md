---
name: create-production-spec
description: Transform client input into a complete production specification. Use when a new input.json arrives and needs to be processed into production.json for asset generation.
---

# Create Production Spec

## Goal
Read `input.json` and produce a complete `production.json` with all creative decisions, prompts, and text mappings.

## When to Use
- New stream intake arrives
- User says "process input", "create production spec", "start new stream"
- `input.json` exists but `production.json` does not

## Prerequisites
- `streams/{id}/input.json` exists
- Access to artistic-director skill knowledge

## MANDATORY: Read Style Guide First

**Before doing ANY creative work, read:**
```
chronicle/methodology/STREAM_STYLE_GUIDE.md
```

This is THE visual style. All element choices, camera movements, color decisions, and scene construction MUST follow this guide. The style guide contains:
- Element inventory (what camera movements, subjects, atmospheric elements exist)
- Multi-layer scene construction (realistic + surreal layers)
- Never-repeat rules (camera, color)
- Motion intensity patterns
- Color rhythm patterns
- Bookend strategies

**Do not make creative decisions from memory. Reference the style guide.**

---

## WORKFLOW OVERVIEW

```
input.json
    ↓
┌─────────────────────────────────────────┐
│ STEP 1: ANALYZE TEXT                    │
│ • Word count, reading time              │
│ • Identify story structure              │
│ • Find natural breaks                   │
│ • Detect dialogue patterns              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 2: PLAN SEGMENTS                   │
│ • Decide segment count (3-10)           │
│ • Define what each represents           │
│ • Distribute duration/frames            │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 3: PLAN SECTIONS                   │
│ • Map text to sections (fewer = better) │
│ • Assign segments to sections           │
│ • Preserve original text exactly        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 4: DEVELOP VISUAL DIRECTION        │
│ • Interpret brief                       │
│ • Choose aesthetic                      │
│ • Define color palette                  │
│ • Identify unifying elements            │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 5: CONCEPT EXPLORATION             │
│ • Apply visual concept tools            │
│ • Generate alternatives to obvious      │
│ • Choose strongest concept per segment  │
│ • Define layers (realistic + surreal)   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ STEP 6: WRITE PROMPTS                   │
│ • Image prompt per segment              │
│ • Motion prompt per segment             │
│ • Apply composition rules               │
└─────────────────────────────────────────┘
    ↓
production.json
```

---

## STEP 0: VALIDATE INPUT

Before processing, check if the text meets minimum requirements.

### Input Requirements

| Criterion | Requirement | Reason |
|-----------|-------------|--------|
| **Minimum length** | 800 words | Shorter texts can't support enough segments for visual rhythm |
| **Maximum length** | 3500 words | Longer texts should be split into multiple streams |
| **Has structure** | At least 2-3 distinct moments | Needs natural segment boundaries |

### Rejection Criteria

**Reject the input if:**
- Word count < 800: "Text too short for stream format. Minimum 800 words required."
- Word count > 3500: "Text too long. Consider splitting into multiple streams."
- No discernible structure (single continuous paragraph with no breaks)

### Marginal Cases (800-1000 words)

For texts in the 800-1000 word range:
- Verify there are at least 4-5 distinct visual moments
- If the text is dense prose with few natural breaks, it may not work
- Use judgment: quality of moments matters more than word count

---

## STEP 1: ANALYZE TEXT

### Read and Parse
```
1. Read streams/{id}/input.json
2. Extract: text, title, language, brief
3. Calculate: word_count, estimated_reading_time
4. VALIDATE: Check word_count >= 800
```

### Identify Structure
Look for these markers in the text:

| Marker Type | Pattern | Meaning |
|-------------|---------|---------|
| **Chapter/Section headers** | Standalone short lines, often title case | Major story division |
| **Scene breaks** | Extra blank lines, "* * *", "---" | Scene change |
| **Tonal shifts** | Mood change in narrative | Potential segment boundary |
| **Dialogue blocks** | Lines starting with "–", "-", '"' | Character interaction |
| **Climax indicators** | Rising tension, pivotal moment | Key visual segment |

### Example Analysis Output
```json
{
  "word_count": 1450,
  "reading_time_minutes": 6,
  "structure": {
    "has_chapters": true,
    "chapter_count": 2,
    "chapter_titles": ["Az Éhség", "Kis ház sziklával", "Epilógus"],
    "dialogue_heavy": true,
    "dialogue_marker": "– ",
    "estimated_segments": 5,
    "key_moments": [
      "Opening cosmic description",
      "Introduction of house and characters",
      "Dialogue about stories and truth",
      "Discovery of the rescue pod",
      "The impossible choice"
    ]
  }
}
```

---

## STEP 2: PLAN SEGMENTS

### Director-Specified Segment Count (HIGHEST PRIORITY)

**If input.json contains `segment_count`, use that EXACT number.**

```json
{
  "segment_count": 3  // Director wants exactly 3 segments
}
```

When `segment_count` is specified:
- **Use exactly that number of segments** — no more, no less
- Skip the automatic calculation based on word count
- Trust the director's creative decision
- Focus on making those N segments visually distinct and compelling

### Automatic Segment Count (when not specified)

If `segment_count` is NOT in input.json, calculate based on text density:

| Text Length | Recommended Segments | Reasoning |
|-------------|---------------------|-----------|
| 800-1200 words | 5-6 segments | Minimum for good progression |
| 1200-2000 words | 6-8 segments | Rich story arc |
| 2000-3000 words | 8-10 segments | Full visual journey |
| 3000-3500 words | 10-12 segments | Maximum density |

### Segment Duration Balance

**Avoid extremes:**
- Too short (< 200 words of text coverage): Feels rushed, viewer can't absorb
- Too long (> 500 words of text coverage): Loses visual momentum, feels static

**Target:** Each segment should cover roughly 150-350 words of narrative

### Segment Planning Principles

**Reference: STREAM_STYLE_GUIDE.md → SCENE CONSTRUCTION**

Each segment is multi-layered:
```
LAYER 4: Texture/overlay (grain, paper)
LAYER 3: Surreal additions (floating elements, impossible physics)
LAYER 2: Environment (background, atmosphere, particles)
LAYER 1: Subject (primary focus)
LAYER 0: Camera (how we view it all)
```

1. **Each segment = one visual scene/mood**
   - Don't split a single moment across segments
   - Each segment should have clear visual identity
   - **If a scene has multiple distinct visual moments, split it**

2. **Story beats guide segments**
   - Opening/introduction
   - Rising action (may need 2-3 segments)
   - Pivotal moments (1-3 key scenes)
   - Climax (often benefits from 2 segments: tension + release)
   - Resolution/ending

3. **Consider visual variety**
   - Avoid similar segments back-to-back
   - Contrast wide/close, dark/light, still/dynamic
   - **Long dialogue passages need visual breaks** (e.g., cut between speakers, show reactions)

4. **Thematic content can span multiple segments**
   - A long conversation doesn't mean one long segment
   - Find visual sub-moments within continuous text
   - Example: Father-son dialogue → could be 3 segments:
     - Father's face, concerned
     - The pear on the table, symbolic
     - Son looking out window, distracted

### Opening Hook Check (Segment 1)

**Before finalizing segment plan, verify Segment 1 has scroll-stopping power:**

- [ ] Subject has color contrast from background? (not dark-on-dark)
- [ ] Will have visible motion in first 2 seconds?
- [ ] Has clear focal point / light source?

If none checked → redesign Segment 1 concept before continuing.

### Example Segment Plan
```json
{
  "segments": [
    { "id": 1, "title": "THE VOID", "represents": "Opening - cosmic emptiness, the hungry universe", "opening_hook": "bright maw against void = color contrast", "words_covered": "~180" },
    { "id": 2, "title": "THE HOUSE", "represents": "Introduction - house on rock, silhouette at window", "words_covered": "~220" },
    { "id": 3, "title": "THE WATCHERS", "represents": "Father and son at the window, gazing out", "words_covered": "~200" },
    { "id": 4, "title": "THE STORAGE", "represents": "The dwindling supplies, father's worry", "words_covered": "~250" },
    { "id": 5, "title": "THE LAST PEAR", "represents": "The final fruit, weight of scarcity", "words_covered": "~180" },
    { "id": 6, "title": "THE CATCH", "represents": "Discovery - rescue pod caught in net", "words_covered": "~280" },
    { "id": 7, "title": "THE STRANGER", "represents": "Movement in the pod, hope and dread", "words_covered": "~200" },
    { "id": 8, "title": "THE CHOICE", "represents": "Climax - the impossible calculation", "words_covered": "~220" }
  ]
}
```

---

## STEP 3: PLAN SECTIONS

### Section Principles

1. **Fewer sections = better text flow**
   - 3 sections is often ideal
   - Avoid many small sections (causes gaps)

2. **One section can span multiple segments**
   - intro: segment 1
   - main-story: segments 2, 3, 4
   - epilogue: segment 5

3. **Text must be preserved EXACTLY**
   - Copy character-for-character from original
   - Keep all formatting, punctuation, special characters
   - Never "improve" or edit the text

### Section to Segment Mapping
```
SECTIONS (text units)          SEGMENTS (visual units)
┌──────────────────────┐       ┌──────────────────────┐
│ intro                │ ────► │ segment 1            │
├──────────────────────┤       ├──────────────────────┤
│ main-story           │ ────► │ segment 2            │
│                      │       │ segment 3            │
│                      │       │ segment 4            │
├──────────────────────┤       ├──────────────────────┤
│ epilogue             │ ────► │ segment 5            │
└──────────────────────┘       └──────────────────────┘
```

### Detect Text Type
```json
{
  "text_type": "prose_with_dialogue",
  "dialogue_markers": ["– "],
  "heading": "h2"
}
```

---

## STEP 4: DEVELOP VISUAL DIRECTION

### Interpret the Brief

Read `input.brief` and synthesize:

| Brief Field | Influences |
|-------------|------------|
| `tone[]` | Color temperature, lighting, mood |
| `style[]` | Rendering approach, texture, composition |
| `colors` | Color palette hex values |
| `references` | Artist/film styles to emulate |
| `notes` | Special considerations, metaphors |

### Build Visual Direction

```json
{
  "visual_direction": {
    "aesthetic": "Synthesized style description combining references",
    "color_palette": {
      "background": "#0a0a0f",
      "primary": "#d4a056",
      "secondary": "#c9b8a8",
      "accent": "#6b2a2a",
      "cold": "#1a2a3a"
    },
    "texture": "Film grain, painterly, specific material references",
    "references": ["Specific artists/films from brief"],
    "unifying_elements": "What appears consistently across all segments",
    "bookend_strategy": "echo|contrast|evolution",
    "bookend_method": "color_callback|compositional_parallel|motion_echo|symbolic_rhyme",
    "bookend_notes": "How final scene will resonate with opening (subtle, not literal)"
  }
}
```

**Bookend planning is required.** Before writing prompts, decide how opening and closing will connect. Subtle resonance (color, composition, motion) is preferred over literal repetition.

### Use Artistic Director Knowledge
Reference the artistic-director skill for:
- Style library (atmospheric, fine art, cinematic styles)
- Color palettes (narrative palettes: descent, emergence, liminal, cosmic)
- Composition frameworks (golden spiral, negative space, triptych)
- Lighting approaches

---

## STEP 5: CONCEPT EXPLORATION

**This step is MANDATORY.** You cannot write prompts until you have explored concept alternatives for each segment.

The problem: The first idea is usually illustration (showing what the text literally describes). Illustration lacks visual interest and emotional depth. This step forces you to find stronger concepts before committing to prompts.

### Visual Concept Tools

Use these tools to transform obvious ideas into compelling visuals:

#### Top Tier (use at least one per segment)

| Tool | Description | Example |
|------|-------------|---------|
| **Frame as Window** | A moving shape reveals content through its silhouette | Ravens as negative space, city visible THROUGH their shapes as they fly |
| **Layer Inversion** | Flip container/contained, figure/ground, mover/still | Shadow carries the burdens while man walks free; he's frozen while world scrolls past |
| **Motion Transfer** | What should move is still, what should be still moves | Subject frozen, environment moves around them (perfect for scroll-driven format) |
| **Shadow Independence** | Shadow does something different than the object | Shadow shows the truth while body performs the lie |
| **Absence as Presence** | The missing thing is more visible than present things | Raven-shaped holes in the sky; man-shaped emptiness in the crowd |

#### Mid Tier (use when scene fits)

| Tool | Description | Best For |
|------|-------------|----------|
| **Scale Inversion** | Tiny things massive, massive things tiny | Awe moments, power shifts |
| **Reflection Autonomy** | Reflections show different content than reality | When water/mirror present |
| **Dimensional Shift** | 3D becomes 2D (paper theater) or 2D becomes 3D | Theatrical, story-within-story |
| **Multiplication/Echo** | One thing repeated at different scales or states | Journey, time passage |
| **Material Substitution** | Things made of unexpected materials | Metaphorical texture (ravens made of smoke, flood made of pages) |

### Concept Exploration Template

**For EACH segment, complete this table BEFORE writing any prompt:**

```markdown
| Segment | [NUMBER]: [TITLE] |
|---------|-------------------|
| **Emotional beat** | What should the viewer FEEL? |
| **Conventional idea** | The obvious/illustration approach (write it to clear it from your system) |
| **Tool 1: [NAME]** | Apply a top-tier tool, describe result |
| **Tool 2: [NAME]** | Apply a different tool, describe result |
| **Chosen concept** | Which is strongest? Why? (Cannot be conventional unless justified) |
| **Realistic layer** | What grounded/literal element is in this scene? |
| **Surreal layer** | What impossible/symbolic addition? (REQUIRED - cannot be empty or just "particles") |
```

### Example: Segment 1 (Ravens / Apocalypse)

| Field | Content |
|-------|---------|
| **Emotional beat** | Quiet dread, something ending |
| **Conventional idea** | Ravens flying away against grey sky over cityscape |
| **Tool 1: Frame as Window** | Ravens as negative space — city visible THROUGH their silhouettes as they fly, they are holes in reality |
| **Tool 2: Motion Transfer** | Ravens frozen mid-flight, city scrolls/crumbles behind them |
| **Chosen concept** | Tool 1 — strongest inversion, immediate visual "aha", the absence IS the presence |
| **Realistic layer** | Cityscape architecture, medieval rooftops |
| **Surreal layer** | Ravens as portal-holes revealing city, impossible negative space |

### Concept Exploration Rules

1. **You must write the conventional idea first** — this clears the obvious from your system
2. **Apply at least 2 tools per segment** — one must be from top tier
3. **The chosen concept cannot be the conventional idea** — unless you can justify why the obvious approach is genuinely the strongest (rare)
4. **Both layers must be specified** — realistic AND surreal, neither can be empty
5. **"Atmospheric particles" is not a surreal layer** — fog and particles are environment, not surreal. Surreal means impossible, symbolic, or reality-bending.

### Surreal Layer Examples

**Valid surreal layers:**
- Ravens as negative space portals
- Shadow acting independently of figure
- Objects floating with impossible physics
- Multiple time-states visible simultaneously
- Interior of chest contains cosmos
- Scale impossibilities (tiny figure, massive raven)

**NOT surreal (just environment):**
- Fog drifting
- Particles floating
- Rain falling
- Atmospheric haze

---

## STEP 6: WRITE PROMPTS

### Image Prompt Structure
```
[SCENE DESCRIPTION], [STYLE REFERENCES],
[LIGHTING], [COLOR PALETTE],
[COMPOSITION], [ATMOSPHERE],
[TECHNICAL SPECS], center-focused composition,
16:9 cinematic, film grain
```

### CRITICAL: Composition Rules
```
"composition_rules": {
  "safe_zone": "Key visual elements must be in CENTER 60% of frame",
  "reason": "Desktop crops ~20% from each side",
  "prompt_suffix": "center-focused composition with key subject in middle of frame"
}
```

**Always add to every prompt:**
- "center-focused composition"
- "key subject in middle of frame"
- "16:9 cinematic"

### Camera Instruction (Required)

**Reference: STREAM_STYLE_GUIDE.md → CAMERA MOVEMENTS**

**Every segment MUST have a camera_instruction field.** Without explicit camera direction, videos become static.

| Camera Movement | Description | Best For |
|-----------------|-------------|----------|
| **ORBIT** | Camera circles around subject | Opening hooks, closing resolution |
| **PAN L→R / R→L** | Camera slides horizontally | Revealing environments, rest points |
| **PUSH IN** | Camera moves toward subject | Building intensity, intimacy |
| **PULL BACK** | Camera moves away from subject | Revealing scale, showing context |
| **DRIFT** | Floating camera, no fixed direction | Dreamlike sequences, atmospheric holds |
| **STATIC** | No camera movement | When subject/environment motion carries scene |

**NEVER-REPEAT RULE:** Don't use the same camera movement in consecutive segments.

**MOTION BUDGET (from style guide):**
- Opening: Maximum motion (camera + subject + environment can all move)
- Middle scenes: Usually 1-2 elements moving
- Closing: Match opening intensity OR elegant stillness

```json
{
  "id": 1,
  "camera_instruction": "slow push in toward center",
  "motion_prompt": "fog drifting, particles floating..."
}
```

### Motion Prompt Guidelines

**Reference: STREAM_STYLE_GUIDE.md → SUBJECT MOVEMENTS, ENVIRONMENT ELEMENTS**

**Be Specific:**
```
BAD:  "subtle movement, atmospheric"

GOOD: "concentric layers rotating at different speeds,
       outer ring clockwise slow, inner counter-clockwise,
       debris spiraling inward, color shifting cold to warm,
       dramatic vortex motion"
```

**SUBJECT MOVEMENTS (from style guide):**
| Movement | Description |
|----------|-------------|
| Flying/wings beating | Bird in flight |
| Walking into distance | Figures moving away (Z-axis) |
| Head turn | Subject turns head |
| Breathing | Expansion/contraction of body |
| Pose change | Body position changes |
| Arms raised/lowered | Gestural movement |
| Writing/working | Hands at task |
| Pages flipping | Book pages turn |
| Door opening/closing | Interactive with scroll |

**ENVIRONMENT ELEMENTS (from style guide):**
| Element | Motion |
|---------|--------|
| Debris/particles | Blowing L→R or R→L |
| Fog/mist | Drifting |
| Floating screens | Drift in space |
| Floating orbs | Rise upward, drift |
| Floating cards/papers | Flutter |
| Light rays | Animate with scroll |
| Landscape passing | Background moves (train effect) |
| Rising elements | Move upward |

**Include in motion prompt:**
- Camera instruction (from field above)
- Subject movement (from table above)
- Environment movement (from table above)
- Direction (L→R, upward, clockwise)
- Speed (slow, fast)
- Color/light changes if any

**CRITICAL: Direction Rule**
When multiple elements move (ravens, particles, debris, floating objects), ALWAYS specify:
1. **Unified direction** — all elements moving the same way (e.g., "all ravens drifting left to right")
2. **Speed variation by depth** — closer = faster, farther = slower (e.g., "foreground ravens faster, background ravens slower")

Without explicit direction, video generation produces chaotic/random movement.

### Motion Types
| Type | Use For |
|------|---------|
| `rotation-vortex` | Circular, spiraling |
| `parallax-drift` | Depth layers, lateral movement |
| `zoom-sweep` | Camera push/pull with light movement |
| `swing-pulse` | Pendulum, pulsing, rhythmic |
| `zoom-consume` | Pull back while edges close in |
| `static` | Minimal movement, breathing |
| `breathing` | Subtle organic pulsing |

---

## OUTPUT: production.json

Assemble all decisions into `streams/{id}/production.json`:

```json
{
  "stream": {
    "id": "from input.id",
    "title": "from input.title",
    "interpretation_scale": 7,
    "notes": "production notes"
  },

  "input": {
    "language": "from input.language",
    "word_count": "calculated",
    "original_text": "from input.text (preserved exactly)",
    "brief": {
      "tone": "from input.brief, normalized",
      "style_hints": [],
      "references": [],
      "target_audience": "",
      "notes": ""
    }
  },

  "visual_direction": { ... },
  "composition_rules": { ... },

  "segments": [
    {
      "id": 1,
      "title": "SEGMENT TITLE",

      "concept": {
        "conventional_idea": "The obvious approach (documented to show it was considered)",
        "tools_applied": ["Frame as Window", "Layer Inversion"],
        "chosen_concept": "Description of the chosen visual concept",
        "justification": "Why this concept is strongest"
      },

      "layers": {
        "realistic": "What grounded/literal element is in this scene",
        "surreal": "What impossible/symbolic addition (REQUIRED)"
      },

      "camera_instruction": "orbit|pan|push|pull|drift|static",
      "color_state": "colored|grey|cold|warm|shift",

      "image_prompt": "Full prompt built from concept + layers + style",
      "negative_prompt": "What to avoid",
      "motion_prompt": "Camera + subject + environment motion"
    }
  ],

  "sections": [ ... ],

  "output": {
    "frame_format": "webp",
    "dimensions": "1920x1080"
  }
}
```

---

## QUALITY CHECKLIST

Before finalizing production.json, verify:

**Concept Exploration (VERIFY FIRST):**
- [ ] Concept exploration template completed for EVERY segment
- [ ] Conventional idea written for each segment (to clear it from system)
- [ ] At least 2 tools applied per segment (one from top tier)
- [ ] Chosen concept is NOT the conventional idea (unless explicitly justified)
- [ ] Realistic layer specified for each segment
- [ ] Surreal layer specified for each segment (NOT just fog/particles)

**Style Guide Compliance:**
- [ ] Read STREAM_STYLE_GUIDE.md before starting
- [ ] No camera movement repeated in consecutive segments
- [ ] No color state repeated more than 2x consecutively
- [ ] Each scene has at least one motion source (camera OR subject OR environment)
- [ ] Opening scene has maximum motion (hook)
- [ ] Closing scene relates to opening (bookend strategy applied)

**Text & Structure:**
- [ ] All text from input is accounted for in sections
- [ ] Section text_content matches original exactly (no edits)
- [ ] Segment count is appropriate for text length
- [ ] Section count is minimal (prefer 3)

**Visual Direction:**
- [ ] Every segment has unique visual identity
- [ ] All image prompts include "center-focused composition"
- [ ] Color palette is consistent with brief
- [ ] Bookend strategy and method specified

**Motion:**
- [ ] Every segment has camera_instruction field
- [ ] Motion prompts are specific (not just "subtle movement")
- [ ] Opening segment has visible motion or color contrast

**Opening & Closing:**
- [ ] Segment 1 passes opening hook check (contrast/motion/focal point)
- [ ] Final segment resonates with opening (per bookend_method)

---

## EXAMPLE TRANSFORMATION

### Input (abbreviated)
```json
{
  "title": "Az Éhség",
  "language": "hu",
  "text": "Egyre aszó, üres gyomor az űr...",
  "brief": {
    "tone": ["dark", "melancholic"],
    "style": ["cinematic", "painterly"],
    "references": "Tarkovsky, Beksiński"
  }
}
```

### Output (abbreviated)
```json
{
  "stream": { "id": "az-ehseg", "title": "Az Éhség" },
  "visual_direction": {
    "aesthetic": "Paper theater meets Eastern European illustration",
    "color_palette": { "void": "#0a0a0f", "warm": "#d4a056" }
  },
  "segments": [
    {
      "id": 1,
      "title": "THE VOID",
      "image_prompt": "Paper theater diorama of cosmic hunger...",
      "motion_prompt": "concentric layers rotating..."
    }
  ],
  "sections": [
    {
      "id": "intro",
      "segment_ids": [1],
      "text_content": "Egyre aszó, üres gyomor az űr..."
    }
  ]
}
```

---

## RELATED SKILLS

- **artistic-director** - Visual style development, prompt crafting
- **generate-frames** - Execute image generation from prompts
- **generate-video** - Execute video generation from prompts
- **finalize-stream** - Create app from production.json

---

## CRITICAL: JSON Safety

**ALWAYS use Python json module to write production.json:**

```python
import json

production_data = {
    "stream": {...},
    "input": {...},
    "segments": [...]
}

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(production_data, f, indent=2, ensure_ascii=False)
```

**NEVER construct JSON by string concatenation.** The json.dump() function automatically escapes quotes and special characters.

**Common pitfall:** Story text often contains quotation marks. If you build JSON as a string, these break the format. Using json.dump() handles this automatically.
