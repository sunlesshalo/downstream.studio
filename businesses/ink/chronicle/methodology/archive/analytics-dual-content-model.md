# Analytics for Dual-Content Medium: Reading + Animation

**Date:** 2026-01-19
**Context:** Rethinking analytics after recognizing DownStream is neither article nor video, but both simultaneously.

---

## 1. What DownStream Actually Is

DownStream presents **two content types simultaneously**:
- **Text**: Full literary content (stories, essays, marketing copy) — requires reading
- **Animation**: AI-generated video frames — controlled by scroll position

The user experiences BOTH at once, but they consume them differently:

| Content Type | How Consumed | Scroll Behavior |
|--------------|--------------|-----------------|
| Text | Reading (sequential, requires time) | Slow or stopped |
| Animation | Watching (visual, flows with scroll) | Continuous movement |

**The fundamental tension:** You cannot optimize for both simultaneously.
- Reading requires stopping/slowing → animation freezes
- Watching animation requires scrolling → text flies by

---

## 2. How Users Actually Behave

### The Reading-Watching Cycle

A typical engaged user cycles between modes:

```
1. Start scrolling → animation begins playing
2. See interesting text → slow down to read
3. Finish reading paragraph → scroll to see what animation played
4. Continue reading → slow down again
5. Reach dramatic moment → scroll back to rewatch animation
6. Continue forward → keep reading...
```

This creates a distinctive scroll pattern: **slow-fast-slow-fast** with **reversals**.

### User Engagement Modes

| Mode | Scroll Pattern | What They're Doing | Engagement Type |
|------|----------------|-------------------|-----------------|
| **Reader** | Mostly slow, pauses | Reading text, animation is backdrop | Text-primary |
| **Watcher** | Mostly fast, fluid | Watching animation, text ignored | Visual-primary |
| **Reader-Watcher** | Alternating slow/fast | Both reading AND watching | Full experience |
| **Explorer** | Multiple passes, reversals | Deep dive, re-reading and rewatching | Highest engagement |
| **Bouncer** | Minimal | Neither reading nor watching | No engagement |

### The "Complete Experience"

The ideal user experiences BOTH content types:
- Spent enough time to read the text
- Also had scroll activity indicating animation viewing
- Possibly went back to sections (re-read or rewatch)

**Key insight:** Someone who only reads (very slow, no animation viewing) is engaged but missing half the experience. Someone who only watches (fast scroll, no reading) is also engaged but differently.

---

## 3. The Critical Metric: Reading Time

### Why Reading Time Matters

For a stream with 2000 words of text:
- Average reading speed: 200-250 words/minute
- Minimum reading time: **8-10 minutes**

If someone "viewed" a 2000-word stream for 30 seconds:
- They scrolled through
- They did NOT read the content
- They may have watched the animation (still valuable)
- But they didn't experience the text

### Calculating Expected Reading Time

```
expected_reading_time = word_count / reading_speed
where reading_speed ≈ 200-250 wpm

For Bolyai (~2000 words): ~8-10 minutes minimum to read
For a 500-word promo: ~2-3 minutes minimum to read
```

### Reading Time vs. Actual Time

| Ratio: actual_time / expected_reading_time | Interpretation |
|--------------------------------------------|----------------|
| < 0.3 | Watched animation only, didn't read |
| 0.3 - 0.7 | Skimmed text, watched animation |
| 0.7 - 1.2 | Read most/all text, some animation |
| 1.2 - 2.0 | Read carefully + watched animation |
| > 2.0 | Multiple passes, deep exploration |

---

## 4. Detecting Modes from Scroll Data

### Mode Indicators

**Reading indicators:**
- Scroll velocity < threshold for extended periods
- Frequent pauses (velocity = 0 for > 2 seconds)
- Time spent per section > expected reading time for that section

**Watching indicators:**
- Continuous scroll at moderate-to-high velocity
- Minimal pauses
- Time per section < expected reading time

**Mixed/Explorer indicators:**
- Velocity variation (alternating slow and fast)
- Reversals (going back to previous content)
- Total time > expected reading time
- Multiple engagement patterns

### Scroll Velocity Threshold

What scroll speed allows reading?

**Calculation approach:**
```
If section has 200 words and is 800px tall:
- Reading at 200 wpm = 1 minute to read
- Scroll distance = 800px in 60 seconds
- Reading scroll velocity = ~13 px/second

If scrolling at 100 px/second:
- Section passes in 8 seconds
- 200 words in 8 seconds = 1500 wpm = impossible to read
- This is "watching" velocity
```

**Rough thresholds (need calibration):**
- < 20 px/sec: Reading mode (can read while scrolling)
- 20-50 px/sec: Skimming (catching keywords, watching animation)
- > 50 px/sec: Watching mode (animation playing, text flying by)
- 0 px/sec for > 2 sec: Stopped to read

### Per-Section Analysis

For each section, we can calculate:
```
section_reading_ratio = time_in_section / expected_reading_time_for_section

If section has 300 words:
- Expected reading time: ~90 seconds
- Actual time in section: 120 seconds
- Reading ratio: 1.33 → likely read the content

If actual time was 10 seconds:
- Reading ratio: 0.11 → definitely didn't read, just watched/scrolled through
```

---

## 5. The New Metric Framework

### Primary Metrics

| Metric | Definition | What It Tells Us |
|--------|------------|------------------|
| **Scroll Coverage** | max_scroll_depth% | Did they see all content? |
| **Reading Ratio** | actual_active_time / expected_reading_time | Did they have time to read? |
| **Animation Engagement** | scroll_distance / content_height | Did they interact with the animation? |
| **Replay Rate** | sessions_with_reversals / total_sessions | Did they go back to re-experience? |

### Secondary Metrics

| Metric | Definition | What It Tells Us |
|--------|------------|------------------|
| **Mode Distribution** | % time in reading vs watching mode | How did they experience it? |
| **Section Engagement Profile** | per-section reading ratios | Which sections got read vs. watched? |
| **Exploration Depth** | scroll_distance / content_height | How many "passes" did they make? |

### Derived Insights

| Insight | How to Calculate |
|---------|------------------|
| "87% watched the full animation" | scroll_coverage = 100% |
| "62% read most of the text" | reading_ratio > 0.7 |
| "43% experienced both fully" | coverage = 100% AND reading_ratio > 0.7 |
| "Section 3 most re-read" | highest reversal density at section 3 |
| "Avg 1.4 passes through content" | avg(scroll_distance / content_height) |

---

## 6. Engagement Cohorts (Revised)

### Cohort Definitions

| Cohort | Criteria | Interpretation |
|--------|----------|----------------|
| **Deep Readers** | reading_ratio > 1.0, reversals > 0, coverage = 100% | Read everything, rewatched/re-read sections |
| **Full Experience** | reading_ratio 0.7-1.0, coverage = 100% | Read most, watched animation, complete coverage |
| **Readers** | reading_ratio > 0.7, coverage ≥ 75% | Primarily reading experience |
| **Watchers** | reading_ratio < 0.3, coverage ≥ 75%, scroll_distance > content_height | Primarily animation experience |
| **Samplers** | 25% < coverage < 75% | Partial engagement with either mode |
| **Bouncers** | coverage < 25% | Minimal engagement |

### Cohort Value

| Cohort | Value for Authors | Value for Visual Directors | Value for Brands |
|--------|-------------------|---------------------------|------------------|
| Deep Readers | ★★★★★ | ★★★★★ | ★★★★★ |
| Full Experience | ★★★★★ | ★★★★ | ★★★★ |
| Readers | ★★★★★ | ★★ | ★★★ |
| Watchers | ★★ | ★★★★★ | ★★★ |
| Samplers | ★★ | ★★ | ★★ |
| Bouncers | ★ | ★ | ★ |

---

## 7. What We Can Tell Different Stakeholders

### For Authors
- "72% of viewers spent enough time to read your full text"
- "Section 3 (the climax) had the highest re-read rate"
- "Average reading ratio of 1.1 = readers engaged deeply with your words"
- "Viewers paused most frequently at [dialogue/emotional beats]"

### For Visual Directors / Agencies
- "89% watched the complete animation"
- "Average viewer scrolled 1.6x the content length (many replayed sections)"
- "Section 2 animation had 3x more replay activity than others"
- "Zero passive views — every frame shown was actively scrolled to"

### For Brands / Sponsors
- "67% achieved Full Experience (read + watched)"
- "Average engagement duration: 4.2 minutes (vs. 0:30 for typical video ad)"
- "Section with CTA had 94% visibility and 2.1 reading ratio"
- "No background plays — every view is active attention"

---

## 8. Technical Requirements

### What We Need to Track

**Already have:**
- ✅ Scroll samples with timestamps (can derive velocity)
- ✅ Total scroll distance (can calculate animation engagement)
- ✅ Reversals count (can calculate replay rate)
- ✅ Scroll milestones (can calculate coverage)
- ✅ Section enter/exit times (can calculate per-section metrics)

**Need to add:**
- ❌ Word count per stream (to calculate expected reading time)
- ❌ Word count per section (for section-level reading analysis)
- ❌ Reading mode detection (velocity threshold classification)
- ❌ Tab visibility (to distinguish active time from idle time)

**Need to calculate:**
- ❌ Reading ratio (actual_time / expected_reading_time)
- ❌ Mode distribution (% time in reading vs watching)
- ❌ Animation engagement (scroll_distance / content_height)
- ❌ Cohort classification

### Tracker Changes

1. **Add content metadata to streams:**
   ```javascript
   DS_STREAM_WORD_COUNT = 2000  // Total words
   DS_STREAM_HEIGHT = 5000     // Total content height in px
   DS_SECTIONS = [
     { id: 'chapter-1', words: 500, height: 1200 },
     { id: 'chapter-2', words: 300, height: 900 },
     // ...
   ]
   ```

2. **Track scroll velocity samples:**
   - Already tracking scroll samples with timestamps
   - Can calculate velocity from position deltas

3. **Add mode classification in engagement summary:**
   ```javascript
   {
     period: 0,
     reading_mode_seconds: 45,   // Time at low velocity or stopped
     watching_mode_seconds: 15,  // Time at high velocity
     // ... existing fields
   }
   ```

4. **Add tab visibility tracking:**
   ```javascript
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) pauseTimer()
     else resumeTimer()
   })
   ```

### Server-Side Calculations

For each page view, calculate:
```python
# Expected reading time (assuming 200 wpm)
expected_time = stream_word_count / 200 * 60  # seconds

# Actual active time (from engagement summaries or scroll activity)
active_time = sum(summary.reading_mode_seconds + summary.watching_mode_seconds)

# Reading ratio
reading_ratio = active_time / expected_time

# Animation engagement (how many "passes")
animation_engagement = total_scroll_distance / content_height

# Cohort assignment based on thresholds
```

---

## 9. Key Questions to Answer

### For Content Optimization
1. Which sections have low reading ratios? (Too long? Boring?)
2. Which sections have high replay rates? (Compelling? Confusing?)
3. Where do bouncers drop off? (Opening not hooking?)
4. Do readers become watchers at certain points? (Visual section?)

### For Partnership Conversations
1. What % achieve "Full Experience"? (Read + watched)
2. How does engagement compare to passive video?
3. Can we prove attention quality? (Active scrolling, not background)
4. What's the cost per engaged minute vs. other formats?

### For Product Development
1. Is there an optimal word count per stream?
2. Do certain visual styles increase reading time?
3. Do section lengths affect reading completion?
4. Should we show reading time estimate? ("8 min read")

---

## 10. Summary: The Dual-Content Advantage

DownStream is unique because it's **both a reading experience AND a viewing experience**. This dual nature means:

**Challenge:** Metrics from article platforms or video platforms don't apply directly.

**Opportunity:** We can measure engagement with BOTH content types separately, giving richer insights than either format alone.

**The key metrics:**
1. **Reading Ratio** — Did they spend enough time to read?
2. **Animation Engagement** — Did they interact with the visuals?
3. **Coverage** — Did they see everything?
4. **Replay Rate** — Did they re-experience sections?

**The cohorts:**
- Deep Readers (read + rewatched)
- Full Experience (read + watched)
- Readers (text-primary)
- Watchers (visual-primary)
- Samplers (partial)
- Bouncers (none)

**The pitch:**
> "DownStream gives you engagement data that video can't: did they actually read? Which sections? Did they also watch the animation? Did they go back to re-experience moments? Every scroll is an active choice — we show you exactly how your audience consumed both the words and the visuals."

---

## Next Steps

1. Add word_count metadata to streams (production.json → generated app)
2. Update tracker with velocity-based mode detection
3. Add tab visibility tracking for accurate active time
4. Implement reading_ratio calculation server-side
5. Build cohort classification logic
6. Update dashboard with new metrics
7. Create stakeholder-specific report views
