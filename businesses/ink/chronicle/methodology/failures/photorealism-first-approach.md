# Failure: Photorealism-First Approach

**Period:** January 2026, Week 1
**Status:** Abandoned (not failed permanently — technology may catch up)

## What We Tried

Generate photorealistic AI video sequences for scroll-driven stories using:
- High-quality image generation (photorealistic prompts)
- Video generation from keyframes
- Character consistency techniques (reference images, detailed descriptions)

## Why It Failed

### 1. Character Consistency Problem
AI image/video models struggle to maintain consistent characters across frames. A character's face, clothing, or proportions shift subtly between generations. In static images, this isn't noticeable. In video/scroll sequences, it's jarring.

### 2. Motion Quality
Current video generation produces motion that's either:
- Too subtle (basically a still image with minor drift)
- Too chaotic (physics-defying movements, morphing)

Neither works for scroll-driven narrative where smooth, intentional motion is key.

### 3. Uncanny Valley
Photorealistic AI imagery triggers stronger "something's wrong" reactions than stylized imagery. Viewers are hyper-tuned to human faces and realistic motion. Stylized/atmospheric work has more forgiveness.

### 4. The Fundamental Mismatch
Scroll-driven storytelling's value proposition IS movement. If we can't do smooth, consistent motion, we're not delivering the core value.

## What We Learned

1. **Play to AI's strengths, not against them**
   - AI excels at: atmosphere, mood, abstract imagery, stylization
   - AI struggles with: consistency, precise motion, photorealistic humans

2. **The competitor insight**
   - Capsules uses stylized, atmospheric visuals
   - Motion is subtle (fog drift, slight zoom, breathing)
   - They're not trying to do what AI can't do

3. **Temporary vs permanent limitation**
   - This is a 2026 limitation, not a fundamental one
   - Video AI is improving rapidly
   - Keep the door open for photorealism later

## The Pivot

Instead of fighting AI's limitations, we embraced a stylized approach:
- Atmospheric, symbolic visuals
- Subtle motion that forgives imperfection
- Color and composition carrying the emotional load
- Fog/particles/haze hiding transitions and artifacts

See: `patterns/symbolic-over-literal.md`

## Resurrection Conditions

Revisit photorealism when:
- Character consistency tools mature (LoRA, consistent character models)
- Video generation quality jumps (watch for new model releases)
- Customer feedback indicates demand for realistic style
- We have budget to experiment (~€50-100 of API costs)

## Cost of Failure

- ~1 week of exploration time
- ~€20-30 in API costs for test generations
- Net positive: We understand the landscape better
