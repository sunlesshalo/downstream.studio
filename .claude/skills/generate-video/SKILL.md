---
name: generate-video
description: Generate animated video from keyframe image using Replicate API (Minimax Hailuo). Use after generating keyframes to create motion for stream segments.
---

# Generate Video - Animation from Keyframes

## Goal
Animate keyframe images into video clips using Replicate API, then extract frames for use in StreamEngine.

## When to Use
- After generating keyframes with generate-frames skill
- Creating animation for stream segments
- User requests "animate", "add motion", "create video"

## Prerequisites
- Keyframe image exists (`streams/{id}/keyframes/segment_{n}.jpg`)
- `REPLICATE_API_TOKEN` in `.env` file
- Python with replicate package installed
- ffmpeg installed for frame extraction

---

## QUICK COMMAND

### Generate Video + Extract Frames
```bash
python execution/generate_video.py \
  --image "streams/{id}/keyframes/segment_{n}.jpg" \
  --prompt "your motion prompt here" \
  --output "streams/{id}/videos/segment_{n}.mp4" \
  --model minimax \
  --extract-frames \
  --frames-dir "streams/{id}/public/frames/{n}/"
```

### Video Only (No Extraction)
```bash
python execution/generate_video.py \
  --image "streams/{id}/keyframes/segment_{n}.jpg" \
  --prompt "your motion prompt here" \
  --output "streams/{id}/videos/segment_{n}.mp4"
```

---

## HOW IT WORKS

The script uses **async predictions** to avoid timeouts:

1. Opens keyframe image as file handle
2. Creates prediction via `replicate.predictions.create()`
3. Polls status every 5 seconds until complete
4. Downloads video when succeeded
5. Optionally extracts frames with ffmpeg

Typical generation time: **2-5 minutes per video**

---

## MOTION PROMPTS

### Be Specific and Dynamic
```
BAD:  "subtle movement, atmospheric"

GOOD: "concentric circular layers rotating at different speeds,
       outer ring clockwise slow, inner ring counter-clockwise faster,
       paper debris spiraling inward like whirlpool,
       color shifting from cold blue to warm amber pulsing from center,
       dramatic vortex motion"
```

### Motion Types with Examples

| Type | Description | Prompt Example |
|------|-------------|----------------|
| **rotation-vortex** | Circular layers rotating | "layers rotating at different speeds and directions, debris spiraling inward" |
| **parallax-drift** | Depth layers moving at different speeds | "multiple layer speeds, foreground fast, background slow, atmospheric drift" |
| **zoom-sweep** | Camera zoom with light movement | "dramatic zoom toward center, light beam sweeping across, particles swirling" |
| **swing-pulse** | Pendulum motion with pulsing | "bell swinging dramatically, light pulsing bright then dim, elements vibrating" |
| **zoom-consume** | Pull back while edges close in | "slow zoom out, void edges creeping inward from corners, light alternating warm cold" |

### Always Include
- Multiple moving elements (not just one thing)
- Speed/direction variations ("slow", "fast", "clockwise", "counter-clockwise")
- Color shifts if appropriate ("warm amber to cold blue")
- Intensity level ("dramatic", "gentle", "aggressive")

---

## AVAILABLE MODELS

| Model | ID | Cost | Best For |
|-------|-------|------|----------|
| **Minimax Hailuo** | minimax | $0.02-0.05 | POC, fast iteration |
| **Kling v2.5 Pro** | kling | $0.50-1.00 | Production quality |
| **Kling v2.5 Turbo** | kling-turbo | $0.25-0.50 | Balance of speed/quality |

**Default: minimax** for POC work

---

## BATCH GENERATION

Generate all videos from production.json:

```bash
STREAM_ID="az-ehseg-v2"

for i in 1 2 3 4 5; do
  echo "Generating segment $i..."

  python execution/generate_video.py \
    -i "streams/${STREAM_ID}/keyframes/segment_${i}.jpg" \
    -p "$(jq -r ".segments[$((i-1))].motion_prompt" streams/${STREAM_ID}/production.json)" \
    -o "streams/${STREAM_ID}/videos/segment_${i}.mp4" \
    --model minimax \
    --extract-frames \
    --frames-dir "streams/${STREAM_ID}/public/frames/${i}/"

  echo "Completed segment $i"
done
```

---

## FRAME EXTRACTION

### Automatic (with --extract-frames)
Frames extracted to specified directory:
- Format: `frame_0001.webp`, `frame_0002.webp`, ...
- ~141 frames for 5-second video at 25fps

### Manual (from existing video)
```bash
ffmpeg -i "streams/{id}/videos/segment_{n}.mp4" \
  -y "streams/{id}/public/frames/{n}/frame_%04d.webp"
```

### Verify Frame Count
```bash
ls streams/{id}/public/frames/{n}/ | wc -l
# Expected: ~141 frames (may vary slightly)
```

---

## QUALITY CHECKLIST

After generation:

- [ ] **Motion matches prompt** - Elements move as described
- [ ] **No distortion** - Subject doesn't morph unnaturally
- [ ] **Smooth motion** - No jarring jumps or freezes
- [ ] **Dynamic enough** - Not just subtle/barely visible motion
- [ ] **Correct duration** - ~5 seconds
- [ ] **Frames extracted** - Correct count in frames directory

---

## REGENERATION

If video quality is poor:

1. **Simplify motion prompt** - Focus on 2-3 key movements
2. **Change motion type** - Try different approach
3. **Use higher quality model** - Switch to kling for important segments
4. **Regenerate**:
   ```bash
   python execution/generate_video.py \
     -i "streams/{id}/keyframes/segment_{n}.jpg" \
     -p "simplified motion prompt" \
     -o "streams/{id}/videos/segment_{n}.mp4" \
     --model kling \
     --extract-frames \
     --frames-dir "streams/{id}/public/frames/{n}/"
   ```

---

## COST

| Model | Per Video | 5 Segments | 10 Segments |
|-------|-----------|------------|-------------|
| Minimax | $0.05 | $0.25 | $0.50 |
| Kling | $0.75 | $3.75 | $7.50 |

**Recommendation:** Use Minimax for POC, Kling for final production

---

## TROUBLESHOOTING

### "API token not found"
Check `.env` file has `REPLICATE_API_TOKEN=your_token`

### Timeout waiting for video
Script polls for up to 10 minutes. If still timing out:
- Check Replicate dashboard for prediction status
- Network issues may cause polling to fail
- Try again

### "Billing required" (402 error)
Add payment method at replicate.com/account/billing

### Video distorts subject
Motion prompts too aggressive. Simplify to:
- Camera movements only
- Ambient particle motion
- Subtle lighting changes

### Frame count doesn't match config
Expected ~141 frames for 5-sec video. If different:
- Update `frameCount` in config.tsx to match actual count
- Minor variations (125-145) are normal

### ffmpeg not found
Install with: `brew install ffmpeg`

---

## RELATED SKILLS

- **generate-frames** - Create keyframe images first
- **artistic-director** - Develop visual/motion concepts
- **stream-production** - Full pipeline orchestration
- **finalize-stream** - Create stream app after frame extraction
