# Execution Scripts

Reusable scripts for DownStream stream production.

## Quick Start: Full Production Workflow

```bash
# 1. Create new stream structure
./execution/new_stream.sh acme-corp

# 2. Put your MP4 videos in a folder (named alphabetically: 01_intro.mp4, 02_main.mp4, etc.)

# 3. Batch extract all frames
./execution/batch_extract.sh ./videos stream-acme-corp/public/frames

# 4. Get frame counts for config
./execution/count_frames.sh stream-acme-corp/public/frames

# 5. Validate no gaps in sequences
./execution/validate_frames.sh stream-acme-corp/public/frames

# 6. (Optional) Optimize frame size
./execution/optimize_frames.sh stream-acme-corp/public/frames 75

# 7. Update config.tsx with frame counts, update content.tsx with copy

# 8. Build for deployment
./execution/build_stream.sh acme-corp
```

## Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `new_stream.sh` | Create folder structure for a new stream | `./new_stream.sh <name>` |
| `extract_frames.sh` | Extract WebP frames from single MP4 | `./extract_frames.sh <video> <output_dir> [fps]` |
| `batch_extract.sh` | Extract frames from all MP4s in folder | `./batch_extract.sh <input_dir> <output_dir> [fps]` |
| `count_frames.sh` | Count frames per segment, output config | `./count_frames.sh <frames_dir>` |
| `validate_frames.sh` | Check for gaps in frame sequences | `./validate_frames.sh <frames_dir>` |
| `optimize_frames.sh` | Compress WebP frames further | `./optimize_frames.sh <frames_dir> [quality]` |
| `build_stream.sh` | Build stream for production | `./build_stream.sh <name>` |

## Script Details

### new_stream.sh

Creates a complete stream folder with:
- Next.js app structure
- Skeleton `config.tsx` with 5 sections
- Skeleton `content.tsx` with placeholder components
- All necessary config files

```bash
./execution/new_stream.sh my-client
# Creates: stream-my-client/
```

### extract_frames.sh

Converts a single MP4 to WebP frame sequence.

```bash
./execution/extract_frames.sh video.mp4 ./frames/1 24
# Output: frames/1/frame_0001.webp, frame_0002.webp, ...
```

### batch_extract.sh

Processes all MP4s in a folder. Files are processed in alphabetical order and output to numbered segment folders (1, 2, 3...).

```bash
# Input: videos/01_intro.mp4, videos/02_main.mp4
./execution/batch_extract.sh ./videos ./frames
# Output: frames/1/..., frames/2/...
```

### count_frames.sh

Scans frame folders and outputs ready-to-paste TypeScript config.

```bash
./execution/count_frames.sh ./stream-client/public/frames

# Output:
# segments: [
#     { id: 1, frameCount: 96 },
#     { id: 2, frameCount: 120 },
#     ...
# ]
```

### validate_frames.sh

Checks for issues in frame sequences:
- Missing frames (gaps in sequence)
- Very low frame counts (< 10)
- Numbering problems

```bash
./execution/validate_frames.sh ./stream-client/public/frames
# Exit 0 = valid, Exit 1 = issues found
```

### optimize_frames.sh

Re-encodes WebP frames at lower quality to reduce file size. Requires `cwebp` (install with `brew install webp`).

```bash
./execution/optimize_frames.sh ./frames 75
# Quality 75 is good default, lower = smaller but more artifacts
```

### build_stream.sh

Runs Next.js static build for a stream.

```bash
./execution/build_stream.sh my-client
# Output: stream-my-client/out/ (ready to deploy)
```

## Naming Convention

`verb_noun.sh`

- Extract = get data out of something
- Batch = process multiple items
- Count = measure/report
- Validate = check for errors
- Optimize = improve performance
- Build = compile for production
- New = create from scratch

## Requirements

- **ffmpeg** - for frame extraction (`brew install ffmpeg`)
- **cwebp** - for frame optimization (`brew install webp`)
- **Node.js 18+** - for building streams

## Adding New Scripts

1. Follow naming convention: `verb_noun.sh`
2. Include header comment with usage
3. Use `set -e` for error handling
4. Validate inputs before processing
5. Log progress to stdout
6. Update this README

---

*All scripts designed for macOS. Linux may need minor adjustments (sed -i syntax).*
