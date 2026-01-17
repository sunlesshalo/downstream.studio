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
│ STEP 5: WRITE PROMPTS                   │
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

### Segment Count Guidelines

Since we validate input (minimum 800 words), segment counts follow naturally from text density:

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

### Example Segment Plan
```json
{
  "segments": [
    { "id": 1, "title": "THE VOID", "represents": "Opening - cosmic emptiness, the hungry universe", "words_covered": "~180" },
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
    "unifying_elements": "What appears consistently across all segments"
  }
}
```

### Use Artistic Director Knowledge
Reference the artistic-director skill for:
- Style library (atmospheric, fine art, cinematic styles)
- Color palettes (narrative palettes: descent, emergence, liminal, cosmic)
- Composition frameworks (golden spiral, negative space, triptych)
- Lighting approaches

---

## STEP 5: WRITE PROMPTS

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

### Motion Prompt Guidelines

**Be Specific:**
```
BAD:  "subtle movement, atmospheric"

GOOD: "concentric layers rotating at different speeds,
       outer ring clockwise slow, inner counter-clockwise,
       debris spiraling inward, color shifting cold to warm,
       dramatic vortex motion"
```

**Include:**
- Multiple moving elements
- Speed variations (slow, fast)
- Direction (clockwise, inward, upward)
- Color/light changes
- Intensity level

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
  "segments": [ ... ],
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

- [ ] All text from input is accounted for in sections
- [ ] Section text_content matches original exactly (no edits)
- [ ] Every segment has unique visual identity
- [ ] All image prompts include "center-focused composition"
- [ ] Motion prompts are specific (not just "subtle movement")
- [ ] Color palette is consistent with brief
- [ ] Segment count is appropriate for text length
- [ ] Section count is minimal (prefer 3)

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
