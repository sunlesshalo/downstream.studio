---
name: stream-production
description: Complete visual production pipeline for streams. Orchestrates the full workflow from production spec to finished stream app. Use when creating a new stream or regenerating visuals.
---

# Stream Production - Complete Visual Pipeline

## Goal
Take client input and generate a complete runnable stream app with all visual assets.

## When to Use
- New stream intake arrives (input.json exists)
- Creating a new stream from scratch
- Regenerating visuals for an existing stream
- User says "produce stream", "create stream", "generate visuals"

---

## MANDATORY: Style Guide Reference

**Before starting production, read:**
```
chronicle/methodology/STREAM_STYLE_GUIDE.md
```

This is THE visual style. All production decisions MUST align with this guide:
- Multi-layer scene construction (realistic + surreal layers)
- Element inventory (camera movements, subjects, atmosphere)
- Never-repeat rules (camera, color)
- Motion intensity patterns
- Bookend strategies

**During production, verify each segment against the style guide.**

---

## COMPLETE WORKFLOW OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│  0. CLIENT INPUT             streams/{id}/input.json                │
│     └─ Text, brief, metadata (from intake form)                    │
│     └─ Use create-production-spec skill to process                 │
├─────────────────────────────────────────────────────────────────────┤
│  1. PRODUCTION SPEC          streams/{id}/production.json          │
│     └─ Visual direction, prompts, segments, sections, motion       │
├─────────────────────────────────────────────────────────────────────┤
│  2. KEYFRAME GENERATION      execution/generate_frame.py           │
│     └─ Creates: streams/{id}/keyframes/segment_{n}.jpg             │
├─────────────────────────────────────────────────────────────────────┤
│  3. VIDEO GENERATION         execution/generate_video.py           │
│     └─ Creates: streams/{id}/videos/segment_{n}.mp4                │
├─────────────────────────────────────────────────────────────────────┤
│  4. FRAME EXTRACTION         ffmpeg via generate_video.py          │
│     └─ Creates: streams/{id}/public/frames/{n}/frame_*.webp        │
├─────────────────────────────────────────────────────────────────────┤
│  5. STREAM APP CREATION      Use finalize-stream skill             │
│     └─ Creates: stream-{id}/ with Next.js app                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## STAGE 0: PROCESS CLIENT INPUT

If starting from `input.json`, use the **create-production-spec** skill first.

### Prerequisites
- `streams/{id}/input.json` exists with:
  - `text`: The full story/content (800-3500 words)
  - `title`, `language`, `id`
  - `brief`: tone, style, colors, references, notes

### Process
Run the create-production-spec skill which:
1. Validates text length (800-3500 words)
2. Analyzes text structure (chapters, dialogue, scene breaks)
3. Plans segments (5-12 based on text length)
4. Maps sections to segment groups
5. Develops visual direction from brief
6. Writes image and motion prompts

### Output
- `streams/{id}/production.json` with:
  - `input.original_text` preserved exactly
  - `sections[]` with text_content and segment_ids
  - `segments[]` with prompts ready for generation

If production.json already exists, skip to Stage 1.

---

## STAGE 1: REVIEW PRODUCTION SPEC

Review `streams/{stream-id}/production.json`:

```json
{
  "stream": {
    "id": "stream-id",
    "title": "Stream Title",
    "interpretation_scale": 7,
    "notes": "Production notes"
  },

  "visual_direction": {
    "aesthetic": "Style description combining references",
    "color_palette": {
      "background": "#0a0a0f",
      "primary": "#d4a056",
      "secondary": "#c9b8a8",
      "accent": "#6b2a2a"
    },
    "texture": "Texture and grain description",
    "references": ["Artist 1", "Film Reference", "Style Reference"],
    "unifying_elements": "What ties all segments together visually"
  },

  "composition_rules": {
    "safe_zone": "Key visual elements must be in CENTER 60% of frame horizontally",
    "reason": "Desktop crops ~20% from each side (60% width x 100vh container)",
    "prompt_suffix": "center-focused composition with key subject in middle of frame"
  },

  "segments": [
    {
      "id": 1,
      "title": "SEGMENT TITLE",
      "frame_count": 141,

      "narrative": "What this segment represents in the story",

      "image_prompt": "Full detailed prompt for keyframe generation..., 16:9 cinematic, center-focused composition, film grain",

      "negative_prompt": "things to avoid, CGI, photorealistic, text",

      "motion_prompt": "detailed description of motion for video generation, specific movements, color shifts, layer behavior",

      "motion_type": "rotation-vortex|parallax-drift|zoom-sweep|swing-pulse",
      "motion_intensity": "low|medium|high"
    }
  ],

  "output": {
    "frame_format": "webp",
    "dimensions": "1920x1080"
  }
}
```

### Key Production Spec Principles

**Composition Safe Zone:**
- Desktop shows animation at 60% width × 100vh (roughly 1:1 square)
- Mobile shows animation at 100% width × 40vh (roughly 3:1 wide)
- Keep key elements in CENTER 60% of frame horizontally
- Add "center-focused composition" to all prompts

**Motion Prompts - Be Specific:**
```
BAD:  "subtle movement, atmospheric"
GOOD: "concentric circular layers rotating at different speeds, outer ring clockwise slow, inner ring counter-clockwise faster, debris spiraling inward like whirlpool, color shifting from cold blue to warm amber"
```

---

## STAGE 2: KEYFRAME GENERATION

Generate one keyframe image per segment using Nano Banana Pro (Google Gemini).

### Command
```bash
python execution/generate_frame.py \
  --prompt "[IMAGE_PROMPT from production.json]" \
  --negative "[NEGATIVE_PROMPT from production.json]" \
  --output "streams/{stream-id}/keyframes/segment_{n}.jpg"
```

### Batch Generation (all segments)
```bash
# Read production.json and generate all keyframes
for each segment in production.json:
    python execution/generate_frame.py \
      -p "{segment.image_prompt}" \
      -n "{segment.negative_prompt}" \
      -o "streams/{id}/keyframes/segment_{segment.id}.jpg"
```

### Cost
- ~$0.13-0.24 per image generation

### Quality Check
- [ ] Key subject centered in frame
- [ ] Colors match palette
- [ ] Style consistent across segments
- [ ] No text/watermarks/artifacts

---

## STAGE 3: VIDEO GENERATION

Animate each keyframe using Replicate API (Minimax Hailuo).

### Command
```bash
python execution/generate_video.py \
  --image "streams/{id}/keyframes/segment_{n}.jpg" \
  --prompt "[MOTION_PROMPT from production.json]" \
  --output "streams/{id}/videos/segment_{n}.mp4" \
  --model minimax
```

### How It Works
The script uses **async predictions** to avoid timeouts:
1. Creates prediction with `replicate.predictions.create()`
2. Polls for completion every 5 seconds
3. Downloads video when succeeded
4. Typical generation time: 2-5 minutes per video

### Cost
- Minimax Hailuo: ~$0.02-0.05 per 5-second video
- Kling v2.5: ~$0.50-1.00 per video (higher quality)

### Quality Check
- [ ] Motion matches prompt description
- [ ] No distortion or morphing artifacts
- [ ] Smooth start and end
- [ ] Dynamic enough (avoid subtle-only motion)

---

## STAGE 4: FRAME EXTRACTION

Extract frames from videos using ffmpeg.

### Command
```bash
python execution/generate_video.py \
  --image "streams/{id}/keyframes/segment_{n}.jpg" \
  --prompt "[motion prompt]" \
  --output "streams/{id}/videos/segment_{n}.mp4" \
  --extract-frames \
  --frames-dir "streams/{id}/public/frames/{n}/"
```

### Or Extract from Existing Video
```bash
ffmpeg -i "streams/{id}/videos/segment_{n}.mp4" \
  -y "streams/{id}/public/frames/{n}/frame_%04d.webp"
```

### Expected Output
- 5-second video at 25fps = 141 frames (with start/end frames)
- Files: `frame_0001.webp` through `frame_0141.webp`

### Quality Check
- [ ] Frame count matches segment config
- [ ] Naming convention: `frame_XXXX.webp` (4 digits, padded)
- [ ] All files valid WebP images

---

## STAGE 5: STREAM APP CREATION

Use the **finalize-stream** skill to create the Next.js app.

This stage:
1. Creates `stream-{id}/` directory structure
2. Copies frames from `streams/{id}/public/frames/` to `stream-{id}/public/frames/`
3. Creates `config.tsx` with segment definitions
4. Creates `content.tsx` with EXACT original text (no modifications)
5. Creates Next.js app files (page.tsx, layout.tsx, globals.css, package.json)
6. Runs `npm install`

See: `/finalize-stream` skill for detailed steps.

---

## FULL PIPELINE EXECUTION

### Manual Execution (Recommended for POC)

```bash
# 1. Create production.json manually with artistic direction

# 2. Generate all keyframes
for i in 1 2 3 4 5; do
  python execution/generate_frame.py \
    -p "$(jq -r ".segments[$((i-1))].image_prompt" streams/{id}/production.json)" \
    -n "$(jq -r ".segments[$((i-1))].negative_prompt" streams/{id}/production.json)" \
    -o "streams/{id}/keyframes/segment_${i}.jpg"
done

# 3. Generate all videos (one at a time due to API limits)
for i in 1 2 3 4 5; do
  python execution/generate_video.py \
    -i "streams/{id}/keyframes/segment_${i}.jpg" \
    -p "$(jq -r ".segments[$((i-1))].motion_prompt" streams/{id}/production.json)" \
    -o "streams/{id}/videos/segment_${i}.mp4" \
    --extract-frames \
    --frames-dir "streams/{id}/public/frames/${i}/"
done

# 4. Create stream app (use finalize-stream skill)
```

### Review Points
After each stage, review outputs before proceeding:
- **After keyframes:** Review all images, regenerate any that don't match style
- **After videos:** Review motion quality, regenerate if distorted
- **After extraction:** Verify frame counts match config
- **After app creation:** Test stream in browser

### Style Guide Verification (per segment)
Before finalizing, verify against STREAM_STYLE_GUIDE.md:
- [ ] No consecutive camera movements are the same
- [ ] No color state repeated more than 2x consecutively
- [ ] Each scene has at least one motion source
- [ ] Multi-layer construction applied (realistic + surreal where appropriate)
- [ ] Opening has maximum motion (hook)
- [ ] Closing relates to opening (bookend)

---

## COST ESTIMATION (Updated 2026-01-10)

### Video Model Options

| Model | Resolution | 5s Cost | Quality | Recommended |
|-------|------------|---------|---------|-------------|
| **Kling v2.1 Standard** | 720p | $0.25 | Good | ✓ Default |
| Kling v2.1 Pro | 1080p | $0.45 | Better | Premium option |
| Minimax Video-01 | 720p | $0.50 | Good | Legacy |

### Per-Stream Costs (9 segments)

| Model | Keyframes | Videos | Total | Margin (€49) |
|-------|-----------|--------|-------|--------------|
| **Kling v2.1 Standard** | $1.08 | $2.25 | **$3.33** | ~€46 |
| Kling v2.1 Pro | $1.08 | $4.05 | $5.13 | ~€44 |
| Minimax (legacy) | $1.08 | $4.50 | $5.58 | ~€43 |

**Recommendation:** Use `--model kling-v2.1` for 50% video cost savings.

---

## TROUBLESHOOTING

### Video Generation Timeout
The script uses async predictions with polling. If it still times out:
- Check Replicate dashboard for prediction status
- Can manually download video URL from prediction

### Frame Count Mismatch
If extracted frames don't match config:
- 5-sec video at 25fps = ~125-141 frames (varies slightly)
- Update `frameCount` in config.tsx to match actual count
- Or regenerate video with different duration

### Style Inconsistency
If segments look different:
- Ensure all prompts include the same style references
- Add `unifying_elements` to each prompt
- Regenerate inconsistent segments

### API Rate Limits
- Nano Banana: ~10 requests/minute
- Replicate: ~5 concurrent predictions
- Add delays between generations if hitting limits

---

## OUTPUT STRUCTURE

```
streams/{stream-id}/
├── production.json          # Production spec (input)
├── keyframes/
│   ├── segment_1.jpg
│   ├── segment_2.jpg
│   └── ...
├── videos/
│   ├── segment_1.mp4
│   ├── segment_2.mp4
│   └── ...
└── public/
    └── frames/
        ├── 1/
        │   ├── frame_0001.webp
        │   ├── frame_0002.webp
        │   └── ... (141 frames)
        ├── 2/
        └── ...

stream-{stream-id}/          # Final app (created by finalize-stream)
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── public/
│   └── frames/              # Copied from streams/{id}/public/frames/
├── config.tsx
├── content.tsx              # EXACT original text, never modified
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## RELATED SKILLS

- **artistic-director** - Creative vision and prompt development
- **generate-frames** - Single image generation details
- **generate-video** - Single video generation details
- **finalize-stream** - Create the final Next.js app
