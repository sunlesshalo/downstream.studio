---
name: generate-frames
description: Generate keyframe images for stream segments using Nano Banana Pro (Google Gemini). Use when creating visuals for a new stream or regenerating specific segments.
---

# Generate Frames - Keyframe Generation

## Goal
Generate high-quality keyframe images for stream segments using Nano Banana Pro (Google's Gemini 3 Pro Image model).

## When to Use
- Creating keyframes for new stream segments
- Regenerating a segment that doesn't match style
- Testing visual concepts before full video generation
- User requests "generate image", "create keyframe", "visualize segment"

## Prerequisites
- `GOOGLE_AI_API_KEY` in `.env` file
- Python with google-genai package installed
- Production spec or prompt ready

---

## QUICK COMMAND

```bash
python execution/generate_frame.py \
  --prompt "Your detailed image prompt here" \
  --negative "things to avoid, CGI, photorealistic" \
  --output "streams/{stream-id}/keyframes/segment_{n}.jpg"
```

---

## PROMPT STRUCTURE

### Base Template
```
[SCENE DESCRIPTION], [STYLE REFERENCES],
[LIGHTING], [COLOR PALETTE],
[COMPOSITION], [ATMOSPHERE],
[TECHNICAL SPECS], center-focused composition,
16:9 cinematic, film grain
```

### Example - Strong Prompt
```
Paper theater diorama of cosmic hunger, layered paper cutout void
with torn edges receding into infinite depth, center focal point
is a massive dark circular maw made of crumpled black paper,
scattered paper debris silhouettes floating inward, faint amber
glow from deep within the void center, cold blue paper layers
framing the edges, Indonesian wayang shadow aesthetic meets
Beksiński organic horror, visible paper grain and cut edges,
16:9 cinematic, center-focused composition, film grain
```

### Negative Prompt
```
stars, space, sci-fi, planets, bright colors, clean, CGI,
photorealistic, lens flare, text, 3D render, watermark
```

---

## COMPOSITION RULES

### Center-Focused (Required for DownStream)
- Desktop crops ~20% from each side
- Mobile shows full width but only 40% height
- **Key elements must be in CENTER 60% of frame**
- Always add "center-focused composition" to prompts

### Safe Zone Visualization
```
┌─────────────────────────────────────┐
│     │                         │     │
│CROP │    SAFE ZONE (60%)      │CROP │
│     │    Key elements here    │     │
│     │                         │     │
└─────────────────────────────────────┘
```

---

## STYLE CONSISTENCY

When generating multiple keyframes for a stream, ensure consistency:

1. **Use same style references in every prompt**
   ```
   "Indonesian wayang shadow aesthetic meets Beksiński organic horror"
   ```

2. **Use same color palette**
   ```
   "warm amber (#d4a056) against cold blue-black void (#0a0a0f)"
   ```

3. **Use same texture description**
   ```
   "visible paper grain, cut paper edges, painterly texture, film grain"
   ```

4. **Use same technical specs**
   ```
   "16:9 cinematic, center-focused composition, film grain"
   ```

---

## BATCH GENERATION

Generate all keyframes from production.json:

```bash
# Using jq to read prompts from production.json
STREAM_ID="az-ehseg-v2"

for i in 1 2 3 4 5; do
  python execution/generate_frame.py \
    -p "$(jq -r ".segments[$((i-1))].image_prompt" streams/${STREAM_ID}/production.json)" \
    -n "$(jq -r ".segments[$((i-1))].negative_prompt" streams/${STREAM_ID}/production.json)" \
    -o "streams/${STREAM_ID}/keyframes/segment_${i}.jpg"

  echo "Generated segment $i"
  sleep 2  # Respect rate limits
done
```

---

## QUALITY CHECKLIST

After generation, verify each keyframe:

- [ ] **Centered subject** - Key elements in middle 60%
- [ ] **Style match** - Consistent with other segments
- [ ] **Color palette** - Matches production spec
- [ ] **No artifacts** - No text, watermarks, extra limbs
- [ ] **Proper aspect ratio** - 16:9
- [ ] **Suitable for animation** - Static elements that can be animated

---

## REGENERATION

If a keyframe doesn't match:

1. **Adjust prompt** - Add more specific style references
2. **Strengthen negative** - Add problematic elements to negative prompt
3. **Regenerate**:
   ```bash
   python execution/generate_frame.py \
     -p "adjusted prompt here" \
     -n "expanded negative prompt" \
     -o "streams/{id}/keyframes/segment_{n}.jpg"
   ```

---

## COST

- ~$0.13-0.24 per image generation
- 5 segments = ~$1.00
- 10 segments = ~$2.00

---

## TROUBLESHOOTING

### "API key not found"
Check `.env` file has `GOOGLE_AI_API_KEY=your_key`

### Image too generic
Add more specific style references:
- Artist names (Beksiński, Shaun Tan, Tarkovsky)
- Specific techniques (paper theater, shadow puppet, chiaroscuro)
- Texture descriptions (paper grain, brushstrokes, film grain)

### Wrong aspect ratio
Always include "16:9 cinematic" in prompt

### Elements at edges
Add "center-focused composition with key subject in middle of frame"

---

## RELATED SKILLS

- **artistic-director** - Develop visual direction and prompts
- **generate-video** - Animate keyframes into videos
- **stream-production** - Full pipeline orchestration
