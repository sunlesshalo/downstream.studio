# Skill: verify-conventions

**Use BEFORE modifying any file in:**
- `infrastructure/director/api.py`
- `pipeline/execution/`
- `infrastructure/process_jobs.sh`
- Any file that handles keyframes, videos, or frames

## Canonical File Patterns

### Keyframes
- **Pattern:** `segment_{N}_keyframe.png`
- **Location:** `{stream}/keyframes/`
- **N is 1-indexed, no zero-padding**

### Videos
- **Pattern:** `segment_{N}.mp4`
- **Location:** `{stream}/videos/`
- **N is 1-indexed, no zero-padding**

### Extracted Frames
- **Pattern:** `frame_{NNNN}.webp`
- **Location:** `{stream}/frames/segment_{N}/`
- **Frame numbers are 4-digit zero-padded**

## Before Making Changes

1. **Read the existing code** that handles the file type you're touching
2. **Grep for the pattern** to see how it's currently used:
   ```bash
   grep -r "segment_.*keyframe" infrastructure/director/api.py
   grep -r "segment_.*\.mp4" infrastructure/director/api.py
   ```
3. **Match the existing pattern exactly** - don't introduce variations
4. **If patterns conflict**, fix the source (generator script), not the consumer

## Detection Functions in api.py

- `find_keyframe_file(keyframes_dir, segment_id)` - returns Path or None
- `find_video_file(videos_dir, segment_id)` - returns Path or None

These check multiple patterns for backward compatibility. **New code should use the canonical patterns above.**

## Common Mistakes to Avoid

- Using `segment_1.png` when it should be `segment_1_keyframe.png`
- Using `segment_01` (zero-padded) when it should be `segment_1`
- Using `image_prompt` when production.json has `keyframe_prompt`
- Assuming a filename without checking the actual generator script output
