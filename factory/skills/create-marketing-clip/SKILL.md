---
name: create-marketing-clip
description: Plan and generate shareable marketing clips from completed streams. Use after stream is deployed to create social media content.
---

# Create Marketing Clip

## Goal
Generate shareable video clips with programmatic soundscapes optimized for social platforms.

## When to Use
- Stream is deployed and ready for marketing
- User requests "create clip", "marketing video", "social content"
- After successful stream delivery to create promotional material

## Prerequisites
- Stream must exist with production.json
- Stream must be deployed OR have local app available
- ffmpeg installed
- Node.js with Playwright installed

---

## PLATFORM FORMATS

| Format | Aspect | Resolution | Max Duration | Best For |
|--------|--------|------------|--------------|----------|
| **reels** | 9:16 | 1080x1920 | 90s | Instagram Reels, TikTok |
| **shorts** | 9:16 | 1080x1920 | 60s | YouTube Shorts |
| **square** | 1:1 | 1080x1080 | 60s | Instagram Feed, Facebook |
| **youtube** | 16:9 | 1920x1080 | 180s | YouTube, Website embeds |

---

## CLIP TYPES

### 1. Scroll Experience (Default)
Full UX with text and animation scrolling. Shows the complete reading experience.
- Best for: Demonstrating the product, "watch me read this"
- Duration: 30-60s typical

### 2. Highlight Reel
Fast cuts between best visual moments, minimal text visible.
- Best for: Attention-grabbing, artistic showcase
- Duration: 15-30s typical
- Implementation: Use --start and --end to capture specific sections

### 3. Single Scene Loop
One compelling scene looping.
- Best for: Background content, ambient posts
- Duration: 5-15s typical
- Implementation: Capture short duration of single section

---

## SHAREWORTHINESS FRAMEWORK

Score each criterion 1-10. **Total 40+ = Ready to share.**

### 1. Hook (First 2 Seconds)
**Question:** Would someone stop scrolling for this?

| Score | Description |
|-------|-------------|
| 1-3 | Slow fade-in, dark/muddy, nothing happening |
| 4-6 | Something visible but not compelling |
| 7-8 | Clear visual interest, movement or color |
| 9-10 | Immediate "what is this?" reaction |

**Checklist:**
- [ ] Visible movement in first 2 seconds
- [ ] Color contrast (not dark-on-dark)
- [ ] Clear focal point

### 2. Emotional Punch
**Question:** Does this evoke a feeling?

| Score | Description |
|-------|-------------|
| 1-3 | Generic, bland, could be anything |
| 4-6 | Pleasant but forgettable |
| 7-8 | Evokes mood (awe, curiosity, melancholy) |
| 9-10 | Genuinely moving, memorable |

**Checklist:**
- [ ] Viewer would feel something
- [ ] Not just "pretty" - has emotional weight
- [ ] Matches story's tone

### 3. Production Quality
**Question:** Does this look professional?

| Score | Description |
|-------|-------------|
| 1-3 | Jarring cuts, audio issues, technical problems |
| 4-6 | Acceptable but rough edges |
| 7-8 | Clean, polished, professional |
| 9-10 | Exceptional quality, cinematic |

**Checklist:**
- [ ] Audio syncs with visuals
- [ ] No jarring transitions
- [ ] Consistent style throughout
- [ ] Proper resolution for platform

### 4. Platform Fit
**Question:** Is this optimized for the target platform?

| Score | Description |
|-------|-------------|
| 1-3 | Wrong aspect ratio, too long/short |
| 4-6 | Technically correct but not optimized |
| 7-8 | Well-suited to platform conventions |
| 9-10 | Leverages platform strengths perfectly |

**Checklist:**
- [ ] Correct aspect ratio
- [ ] Duration within platform limits
- [ ] Pacing matches platform (faster for TikTok, slower for YouTube)

### 5. Shareability
**Question:** Would someone share this with others?

| Score | Description |
|-------|-------------|
| 1-3 | No reason to share |
| 4-6 | Might share if directly relevant |
| 7-8 | Would tag a friend, save for later |
| 9-10 | "You HAVE to see this" |

**Checklist:**
- [ ] Has a "moment" worth sharing
- [ ] Viewer would tag someone
- [ ] Promises value (beauty, emotion, curiosity)

### Score Interpretation

| Total Score | Verdict | Action |
|-------------|---------|--------|
| 40-50 | Excellent | Share immediately |
| 30-39 | Good | Share with minor tweaks |
| 20-29 | Needs Work | Identify weak areas, regenerate |
| <20 | Rework | Start over with different approach |

---

## WORKFLOW

### Step 1: Analyze Stream
```bash
# Check stream exists and has production.json
ls pipeline/streams/{stream-id}/

# Review production.json for visual highlights
# Identify: mood, color palette, strongest segments
```

### Step 2: Plan Clip
Decide:
- **Target platform(s):** reels, shorts, square, youtube
- **Clip type:** scroll-experience, highlight-reel, single-scene
- **Duration:** Based on platform and content
- **Section range:** Full stream or specific sections (--start, --end)

### Step 3: Generate Clip
```bash
# Full stream scroll (30s reels)
python pipeline/execution/generate_clip.py \
  --stream {stream-id} \
  --format reels \
  --duration 30 \
  --output pipeline/streams/{stream-id}

# Specific sections (15s highlight)
python pipeline/execution/generate_clip.py \
  --stream {stream-id} \
  --format reels \
  --duration 15 \
  --start 2 --end 4 \
  --output pipeline/streams/{stream-id}

# YouTube format (60s)
python pipeline/execution/generate_clip.py \
  --stream {stream-id} \
  --format youtube \
  --duration 60 \
  --output pipeline/streams/{stream-id}
```

### Step 4: Review & Score
1. Watch the generated clip
2. Score against shareworthiness criteria
3. If score < 40, identify weak areas:
   - **Weak hook:** Try different start section, ensure motion
   - **Low emotion:** Choose more visually striking segments
   - **Quality issues:** Check source stream, regenerate
   - **Platform mismatch:** Adjust duration, pacing
   - **Not shareable:** Find the "moment" - what makes this special?

### Step 5: Iterate or Ship
- Score 40+: Move to distribution
- Score 30-39: Make specific improvements
- Score <30: Fundamental rethink needed

---

## SOUNDSCAPE GENERATION

Soundscapes are automatically generated based on production.json mood.

### Mood Detection
From production.json `brief.tone` and `visual_direction`:
- **dark, melancholic** → Minor intervals, slow, deep bass
- **hopeful, emergence** → Major intervals, rising pitch
- **tension** → Dissonant, building intensity
- **intimate** → Soft, warm, close
- **cosmic** → Wide, reverberant, ethereal

### Color Influence
From `visual_direction.color_palette`:
- Dark colors → Lower frequencies
- Warm colors → Major intervals
- Cold colors → Minor intervals

### Duration Matching
Soundscape automatically matches clip duration.

---

## OUTPUT STRUCTURE

```
pipeline/streams/{stream-id}/clips/
├── {stream-id}-reels-{timestamp}.mp4      # Final clip
├── {stream-id}-reels-{timestamp}-metadata.json  # Clip info
├── {stream-id}-youtube-{timestamp}.mp4
└── {stream-id}-youtube-{timestamp}-metadata.json
```

### Metadata Contents
```json
{
  "stream_id": "stream-xxx",
  "format": "reels",
  "duration": 30,
  "aspect_ratio": "9:16",
  "resolution": "1080x1920",
  "created": "20260109-123456",
  "start_section": null,
  "end_section": null,
  "source_url": "https://stream-xxx.vercel.app",
  "file": "stream-xxx-reels-20260109-123456.mp4"
}
```

---

## TIPS FOR BETTER CLIPS

### Opening Strength
- Start at a visually striking section (not necessarily the beginning)
- Ensure first frame has color contrast
- Motion should be visible immediately

### Pacing
- **Reels/TikTok:** Faster scroll, more visual variety
- **YouTube:** Slower, more contemplative
- **Square:** Medium pace, focus on composition

### Audio-Visual Sync
- Soundscape mood should match visual mood
- Consider starting mid-soundscape for immediate atmosphere

### Duration Guidelines
| Platform | Sweet Spot | Maximum |
|----------|------------|---------|
| TikTok | 15-30s | 60s |
| Reels | 15-30s | 90s |
| Shorts | 15-30s | 60s |
| YouTube | 60-120s | 180s |

---

## RELATED SKILLS

- **artistic-director** - Visual style guidance for selecting segments
- **stream-production** - Ensure source stream has strong visuals
- **generate-frames** - If regenerating specific frames needed
