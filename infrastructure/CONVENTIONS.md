# File Naming Conventions

**READ THIS BEFORE MODIFYING ANY PIPELINE CODE**

This document is the source of truth for file naming patterns across the DownStream pipeline. When making changes, ensure consistency with these patterns.

---

## Directory Structure

```
pipeline/streams/{stream_id}/
├── input.json              # Original story input
├── production.json         # Segment breakdown + prompts
├── keyframes/              # Generated keyframe images
│   ├── segment_1_keyframe.png
│   ├── segment_2_keyframe.png
│   └── ...
├── videos/                 # Generated video clips
│   ├── segment_1.mp4
│   ├── segment_2.mp4
│   └── ...
└── frames/                 # Extracted video frames (for scroll app)
    ├── segment_1/
    │   ├── frame_0001.webp
    │   ├── frame_0002.webp
    │   └── ...
    └── segment_2/
        └── ...
```

---

## Keyframes

**Pattern:** `segment_{N}_keyframe.png`
**Location:** `{stream_path}/keyframes/`
**Examples:** `segment_1_keyframe.png`, `segment_2_keyframe.png`

**Detection in api.py:** `find_keyframe_file()` checks:
1. `segment_{N}.png` (legacy)
2. `segment_{N}_keyframe.png` (current standard)
3. `scene_{NN}_*.png` (old streams)

**Generator:** `pipeline/execution/generate_frame.py`
**Job prompt specifies:** `segment_{n}_keyframe.png`

---

## Videos

**Pattern:** `segment_{N}.mp4`
**Location:** `{stream_path}/videos/`
**Examples:** `segment_1.mp4`, `segment_2.mp4`

**Detection in api.py:** `find_video_file()` checks:
1. `segment_{N}.mp4` (current standard)
2. `scene_{NN}_*.mp4` (old streams)

**Generator:** `pipeline/execution/generate_video.py`
**Job prompt specifies:** `segment_{n}.mp4`

---

## Extracted Frames

**Pattern:** `frame_{NNNN}.webp`
**Location:** `{stream_path}/frames/segment_{N}/`
**Examples:** `frame_0001.webp`, `frame_0002.webp`

**Extractor:** `generate_video.py --extract-frames`

---

## Segment IDs

- **In production.json:** 1-indexed integers (1, 2, 3...)
- **In filenames:** Same 1-indexed integers
- **In API:** Same 1-indexed integers

**NO zero-padding** in standard patterns. Use `segment_1` not `segment_01`.

---

## Legacy Patterns (Older Streams)

Some older streams use different patterns:
- `scene_01_*.png` instead of `segment_1_keyframe.png`
- `scene_01_*.mp4` instead of `segment_1.mp4`

The api.py detection functions handle both patterns for backward compatibility.

---

## When Adding New Code

1. **Read this file first**
2. Check existing detection functions in `api.py`
3. Check existing generator scripts in `pipeline/execution/`
4. Match the established patterns exactly
5. Update this file if adding new patterns

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `infrastructure/director/api.py` | Dashboard API, file detection functions |
| `pipeline/execution/generate_frame.py` | Keyframe generation |
| `pipeline/execution/generate_video.py` | Video generation + frame extraction |
| `infrastructure/process_jobs.sh` | Job processor prompts |

**Last updated:** 2026-01-16
