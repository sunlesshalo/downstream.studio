# DownStream Analytics Specification

**Version:** 1.1
**Date:** 2026-01-19 (Updated)
**Status:** Definitive specification for implementation

---

## Executive Summary

DownStream streams are **full websites** with scroll-driven animation. They combine:
- **Landing page capabilities** — buttons, forms, links, CTAs, any interactive element
- **Dual-content medium** — text AND animation consumed through scroll interaction

Our analytics must measure:
1. **Standard conversion metrics** — what every landing page measures (clicks, submissions, CTR)
2. **Stream-specific metrics** — what only we can measure (reading ratio, animation engagement, mode switching)

**Our moat:** We provide landing page conversion metrics PLUS unprecedented content engagement depth. No one else can show both "they clicked the CTA" AND "they read 87% of the text and replayed the demo section twice before clicking."

**Our promise:** "Full landing page analytics plus clinical precision on how they consumed your content — every scroll, every pause, every replay, every click."

**Privacy commitment:** All tracking is behavioral, not personal. No PII, no cross-site tracking, no cookies, GDPR compliant by design.

---

# PART 1: WHAT WE CAN MEASURE

## 1.1 Raw Scroll Data (Foundation)

Everything derives from scroll telemetry. This is the foundation.

| Data Point | How Collected | Granularity |
|------------|---------------|-------------|
| Scroll position | `window.scrollY` | Every 200ms |
| Timestamp | `Date.now()` | Millisecond |
| Document height | `document.documentElement.scrollHeight` | On load, on resize |
| Viewport height | `window.innerHeight` | On load, on resize |
| Scroll direction | Derived from position delta | Per sample |
| Scroll velocity | Derived from position/time | Per sample (px/sec) |

**Storage:** Local array of samples, summarized every 60 seconds, sent to server.

---

## 1.2 Derived Metrics: Text Engagement

### Per-Section Text Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Section Dwell Time** | Time while section is primary viewport occupant | How long they spent on this section |
| **Section Reading Time** | Dwell time while velocity < reading_threshold | How long they were in reading mode |
| **Reading Ratio** | reading_time / expected_reading_time | Did they have time to read? (>0.7 = likely read) |
| **Pause Count** | Number of velocity=0 periods > 2 seconds | How often they stopped to read |
| **Pause Total Duration** | Sum of all pause durations | Total time spent stationary reading |
| **Re-read Count** | Reversals entering this section after leaving | Did they come back to re-read? |

### Aggregate Text Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Total Reading Time** | Sum of all section reading times | How long in reading mode overall |
| **Overall Reading Ratio** | total_reading_time / total_expected_reading_time | Did they read the content? |
| **Reading Coverage** | % of sections with reading_ratio > 0.5 | How much text did they engage with? |
| **Most Read Section** | Section with highest reading_ratio | Which text was most engaging |
| **Least Read Section** | Section with lowest reading_ratio (among visited) | Which text was skipped |
| **Reading Mode %** | reading_time / total_active_time × 100 | What % of time was reading vs watching |

### Text-Specific Insights

| Insight | How Derived | Value |
|---------|-------------|-------|
| "Section 3 was read 2.4x more than average" | Compare section reading_ratio to stream average | Content optimization |
| "47% of readers paused at the climax paragraph" | Pause location analysis | Emotional beat identification |
| "Most common drop-off: after Section 2" | Last section with reading activity | Content problem identification |
| "Re-read rate: 23% returned to Section 1" | Re-read count / total sessions | Hook effectiveness |

---

## 1.3 Derived Metrics: Animation Engagement

### Per-Section Animation Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Section Scroll Distance** | Total px scrolled while in this section | How much they "played" this animation |
| **Section Passes** | scroll_distance / section_height | How many times they "watched" it |
| **Animation Time** | Time at velocity > watching_threshold | Time spent actively watching animation |
| **Replay Count** | Number of reversals within section bounds | Did they replay parts? |
| **Playback Speed** | Average velocity during forward scroll | How fast they watched |
| **Smooth vs Jerky** | Velocity variance analysis | Fluid watching vs stuttered interaction |

### Aggregate Animation Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Total Scroll Distance** | Sum of all scroll movement (absolute) | Total interaction intensity |
| **Scroll Intensity** | total_distance / content_height | How many "passes" (1.0 = single watch) |
| **Replay Rate** | sessions_with_reversals / total_sessions | % who rewatched something |
| **Animation Coverage** | % of sections with passes ≥ 1.0 | Did they see all animations? |
| **Most Watched Section** | Section with highest passes value | Most compelling visual |
| **Watching Mode %** | animation_time / total_active_time × 100 | What % of time was watching vs reading |

### Animation-Specific Insights

| Insight | How Derived | Value |
|---------|-------------|-------|
| "Section 4 animation was replayed by 34% of viewers" | Section replay_count analysis | Visual impact measurement |
| "Average playback speed: 1.2x content length" | Scroll intensity across sessions | Engagement intensity |
| "Most paused frame: Section 2 at 67% depth" | Pause location within sections | Emotional peak identification |
| "Smooth playback: 78% had low velocity variance" | Jerk analysis | Experience quality |

---

## 1.4 Derived Metrics: Combined / Mode Analysis

### Mode Detection

**Reading Mode:** velocity < 30 px/sec OR velocity = 0 for > 2 seconds
**Watching Mode:** velocity > 50 px/sec, continuous movement
**Transitional:** 30-50 px/sec (could be either)

### Combined Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Mode Distribution** | % time in reading vs watching vs transitional | How did they experience it? |
| **Mode Switch Count** | Number of reading↔watching transitions | How often did they change modes? |
| **Mode Switch Rate** | switches / active_time_minutes | Switching frequency |
| **Dominant Mode** | Which mode had > 60% of time | Primary consumption style |
| **Full Experience** | reading_ratio > 0.7 AND scroll_intensity > 0.9 | Did they read AND watch? |

### Combined Insights

| Insight | How Derived | Value |
|---------|-------------|-------|
| "62% achieved full experience (read + watched)" | Full experience calculation | Premium engagement proof |
| "Average viewer switched modes 8 times" | Mode switch count | Engagement depth indicator |
| "Section 3: 70% reading mode, 30% watching" | Per-section mode distribution | Content type alignment |
| "Readers convert to watchers at Section 4" | Mode transition analysis | Narrative turning point |

---

## 1.5 Derived Metrics: Session & Behavior

### Session-Level Metrics

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Session Duration** | last_activity - first_activity | Wall clock time (less meaningful) |
| **Active Time** | Sum of time with scroll activity + reading pauses | Actual engagement time |
| **Idle Time** | session_duration - active_time | Time with tab open but not engaging |
| **Completion** | max_scroll_depth reached | Did they see the end? |
| **Completion Rate** | sessions_reaching_100% / total_sessions | % who finished |
| **Bounce Rate** | sessions_with_depth < 25% / total_sessions | % who left immediately |
| **Engaged View** | depth > 10% AND active_time > 10 seconds | Real view vs accidental |

### Behavioral Patterns

| Pattern | Detection | Meaning |
|---------|-----------|---------|
| **Linear Consumption** | Steady forward progress, minimal reversals | Standard viewing |
| **Explorer** | Multiple reversals, high scroll intensity | Deep engagement |
| **Sampler** | Scattered engagement, incomplete coverage | Testing/browsing |
| **Finisher** | Reached 100%, regardless of mode | Completed experience |
| **Re-visitor** | Same visitor_id, new session | Return engagement |

---

## 1.6 Derived Metrics: Technical / Quality

### Experience Quality

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Tab Visible %** | visible_time / session_time | Was tab in foreground? |
| **Mobile vs Desktop** | device_type classification | Platform distribution |
| **Viewport Utilization** | How much content visible at once | Mobile experience quality |
| **Load to First Scroll** | Time from load to first scroll event | Initial engagement speed |
| **Frame Rate Proxy** | Scroll smoothness analysis | Performance impact |

### Traffic Quality

| Metric | Calculation | What It Tells Us |
|--------|-------------|------------------|
| **Source Engagement** | Average engagement metrics by referrer | Which sources bring quality traffic |
| **UTM Performance** | Metrics by campaign | Campaign effectiveness |
| **Geographic Engagement** | Metrics by country/region | Regional differences |
| **Device Engagement** | Metrics by device type | Platform optimization needs |

---

## 1.7 Conversion Metrics: CTAs, Forms, Links

Streams are full websites. They can have any landing page element. We measure all of them.

### Button / CTA Metrics

Buttons can appear anywhere: in text column, overlay on animation, sticky footer, revealed on scroll.

| Metric | How Measured | What It Tells Us |
|--------|--------------|------------------|
| **CTA Impressions** | IntersectionObserver when button enters viewport | How many saw it? |
| **CTA Visibility Duration** | Time button was in viewport | How long was it visible? |
| **CTA Clicks** | Click event listener | How many clicked? |
| **CTA Click-Through Rate** | clicks / impressions | Conversion efficiency |
| **Time to Click** | click_timestamp - first_visibility_timestamp | How quickly did they decide? |
| **Click Scroll Depth** | scroll_depth at moment of click | Where in journey did they convert? |
| **Click Mode** | reading/watching mode at click time | Were they reading or watching when they clicked? |
| **Pre-Click Behavior** | Scroll pattern before click | Did they read first? Replay? |

### CTA Context Metrics (Unique to Streams)

| Metric | What It Tells Us |
|--------|------------------|
| **Clicks after full read** | % who read most content before clicking |
| **Clicks after animation replay** | % who rewatched before clicking |
| **Clicks at scroll depth X** | Which position converts best |
| **Reading ratio of converters** | Do readers convert better than watchers? |
| **Engagement score of converters** | What engagement level leads to conversion? |

### Form Metrics

Forms can be embedded anywhere in the text column or as overlays.

| Metric | How Measured | What It Tells Us |
|--------|--------------|------------------|
| **Form Impressions** | IntersectionObserver | How many saw the form? |
| **Form Interactions** | First focus event on any field | How many started filling? |
| **Field Completion** | Blur events with value present | Which fields get completed? |
| **Form Abandonment** | Interaction started but no submission | Where do they drop off? |
| **Form Submissions** | Submit event fired | How many completed? |
| **Form Conversion Rate** | submissions / impressions | Overall form performance |
| **Time to Submit** | submit_timestamp - first_interaction | How long to complete? |
| **Submission Scroll Depth** | Where in stream they submitted | Optimal form placement |

### Link Metrics

| Metric | How Measured | What It Tells Us |
|--------|--------------|------------------|
| **Link Clicks** | Click events on anchor elements | Which links get clicked? |
| **Internal vs External** | href analysis | Navigation vs exit |
| **Link Click Depth** | Scroll position at click | Where in journey |
| **Link Context** | In text / in button / standalone | Placement effectiveness |
| **Exit Link Timing** | Time from load to exit click | Engagement before exit |

### Conversion Funnel Metrics

| Funnel Stage | Metric |
|--------------|--------|
| **Landed** | Page view |
| **Engaged** | > 10% scroll AND > 10 sec active |
| **Read** | Reading ratio > 0.5 |
| **Completed** | 100% scroll depth |
| **Converted** | CTA click or form submission |

### Conversion Attribution to Content

**Unique to DownStream:** We can attribute conversions to specific content engagement.

| Attribution | What We Can Say |
|-------------|-----------------|
| **"Converters read 2.1x more than non-converters"** | Reading drives conversion |
| **"Section 3 has highest pre-conversion dwell time"** | Key persuasion content |
| **"78% of converters replayed the demo animation"** | Visual proof matters |
| **"Avg reading ratio of converters: 0.92"** | Full read = higher conversion |

---

## 1.8 Privacy-First Architecture

**Core principle:** We track BEHAVIOR, not IDENTITY. We want to know WHAT users do, not WHO they are.

### What We Collect (Behavioral Only)

| Data | Purpose | PII? |
|------|---------|------|
| Anonymous visitor ID | Session/return visitor tracking | No (random UUID, localStorage) |
| Scroll events | Engagement measurement | No |
| Click events | Conversion tracking | No |
| Form submissions | Conversion tracking | No (content not stored) |
| Device type | Platform analytics | No (general category) |
| Viewport size | Experience optimization | No |
| Country (from Cloudflare) | Geographic distribution | No (country only, not IP) |
| Referrer | Traffic source | No |
| UTM parameters | Campaign tracking | No |
| User agent | Bot filtering, device detection | No (not stored after processing) |

### What We Do NOT Collect

| Data | Why Not |
|------|---------|
| **IP addresses** | PII — we use Cloudflare country header only |
| **Email addresses** | PII — form submissions tracked as events only |
| **Names** | PII |
| **Cookies** | We use localStorage for visitor_id, no tracking cookies |
| **Device fingerprints** | Invasive, not needed |
| **Cross-site tracking** | Not applicable, single-site only |
| **Third-party tracker data** | No third-party scripts |

### GDPR Compliance by Design

| GDPR Requirement | Our Approach |
|------------------|--------------|
| **Lawful basis** | Legitimate interest (service improvement) |
| **Data minimization** | Only behavioral data, aggregated |
| **Purpose limitation** | Analytics only, no advertising |
| **Storage limitation** | Aggregated after 90 days |
| **No consent required?** | Likely yes — no PII, no cookies, no cross-site |

**Note:** We may still show a simple analytics notice for transparency, but consent banner is likely not legally required given our approach.

### Technical Implementation

```javascript
// Visitor ID: localStorage, not cookie
const visitorId = localStorage.getItem('ds_vid') || generateUUID()
localStorage.setItem('ds_vid', visitorId)

// No cookies set
// No third-party scripts loaded
// No external tracking pixels

// Country from Cloudflare header (server-side)
// IP address never stored
// User agent processed for device type, then discarded
```

### Data Retention

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Raw events | 90 days | Then aggregated |
| Aggregated stats | Indefinite | No PII |
| Visitor IDs | Anonymized after 90 days | Cannot link to behavior |

### User Rights (Even Though Not Required)

- **Opt-out:** Can clear localStorage to reset visitor ID
- **No tracking mode:** Respect `Do Not Track` header (optional)
- **Data export:** Not applicable (no personal data stored)
- **Deletion:** Automatic via retention policy

---

# PART 2: METRICS FOR SELLING

## 2.1 Metrics for Authors / Content Creators

**What they want to know:** Did people READ my work?

| Metric | How to Present | Why It Sells |
|--------|----------------|--------------|
| **Reading Completion** | "72% of viewers read your full text" | Proves readership |
| **Per-Section Engagement** | "Section 3 (climax) had highest re-read rate" | Shows what resonated |
| **Reading Time** | "Average reader spent 8.2 minutes reading" | Quantifies attention |
| **Re-read Sections** | "23% returned to re-read the opening" | Proves compelling writing |
| **Drop-off Analysis** | "15% dropped at Section 2 — consider revision" | Actionable feedback |

**Report Format:** Section-by-section breakdown with reading metrics, highlighted peaks and valleys.

---

## 2.2 Metrics for Visual Directors / Production Partners

**What they want to know:** Did the animation land?

| Metric | How to Present | Why It Sells |
|--------|----------------|--------------|
| **Animation Completion** | "89% watched the full animation" | Proves visual engagement |
| **Replay Rate** | "34% replayed at least one section" | Proves compelling visuals |
| **Most Replayed** | "Section 4 animation replayed by 41%" | Identifies visual peaks |
| **Playback Analysis** | "Smooth playback: 82% viewed fluidly" | Quality indicator |
| **Frame Pause Points** | "Most paused at 67% through Section 2" | Emotional beat identification |

**Report Format:** Animation engagement timeline, replay hotspots, playback quality analysis.

---

## 2.3 Metrics for Agencies / Marketing Partners

**What they want to know:** What's the attention quality? How does it compare?

| Metric | How to Present | Why It Sells |
|--------|----------------|--------------|
| **Full Experience Rate** | "62% achieved full experience (read + watched)" | Premium attention proof |
| **Active Engagement Time** | "4.7 minutes average active time" | Vs. 30-second video views |
| **Zero Passive Views** | "100% of views required active scrolling" | Quality guarantee |
| **Completion vs Video** | "68% completion vs. 50% for typical video" | Competitive advantage |
| **Attention per Dollar** | "Cost per engaged minute: €0.08" | ROI comparison |

**Report Format:** Comparison dashboard, benchmark charts, ROI calculator.

---

## 2.4 Metrics for Brands / Sponsors

**What they want to know:** If I sponsor, what do I get?

| Metric | How to Present | Why It Sells |
|--------|----------------|--------------|
| **Section Visibility** | "Sponsored section seen by 94% of viewers" | Impression guarantee |
| **Section Engagement** | "Average 45 seconds on sponsored section" | Attention depth |
| **Brand Recall Proxy** | "78% paused or slowed at brand moment" | Likely noticed |
| **Context Quality** | "Viewers engaged with full story, not just ad" | Brand safety |
| **CTA Visibility** | "CTA button in viewport for avg 12 seconds" | Action opportunity |

**Report Format:** Sponsored section deep-dive, visibility heatmap, engagement context.

---

## 2.5 Metrics for Landing Page / Conversion Focus

**What they want to know:** Does this convert? How does engagement drive conversion?

| Metric | How to Present | Why It Sells |
|--------|----------------|--------------|
| **CTA Click-Through Rate** | "12.4% CTR on primary CTA" | Direct conversion metric |
| **Form Conversion Rate** | "8.2% form submission rate" | Lead generation proof |
| **Engagement-to-Conversion** | "Converters read 2.1x more than non-converters" | Content ROI |
| **Optimal CTA Placement** | "CTAs at 75% depth convert 3x better" | Actionable insight |
| **Pre-Conversion Behavior** | "78% of converters replayed demo section" | What drives conversion |
| **Time to Convert** | "Average 4.2 minutes from land to click" | Engagement depth |

**Unique Value Proposition:**
> "Unlike standard landing pages where you only know IF they converted, we show you WHY. Which content they read, which sections they replayed, what engagement pattern leads to conversion. Optimize based on behavior, not guesswork."

**Report Format:** Conversion funnel, engagement-to-conversion correlation, CTA performance by placement, pre-conversion behavior analysis.

---

## 2.6 Metrics for DownStream Internal

**What we need to know:** How do we improve the product?

| Metric | Use |
|--------|-----|
| **Engagement by Stream Length** | Optimal length discovery |
| **Engagement by Visual Style** | Production quality correlation |
| **Device Performance** | Platform optimization |
| **Traffic Source Quality** | Marketing channel optimization |
| **Conversion Funnel** | Visitor → Engaged → Completed → Return |
| **Cohort Trends** | Are we improving over time? |

---

# PART 3: ENGAGEMENT COHORTS

## 3.1 Cohort Definitions

| Cohort | Criteria | % of Users (estimate) |
|--------|----------|----------------------|
| **Deep Engagers** | full_experience = true AND reversals > 0 | 15-25% |
| **Full Experiencers** | reading_ratio > 0.7 AND scroll_intensity > 0.9 | 20-30% |
| **Readers** | reading_ratio > 0.7 AND scroll_intensity < 0.9 | 10-20% |
| **Watchers** | reading_ratio < 0.3 AND scroll_intensity > 0.9 | 15-25% |
| **Samplers** | 25% < coverage < 75% | 10-15% |
| **Bouncers** | coverage < 25% OR active_time < 10s | 15-25% |

## 3.2 Cohort Value Matrix

| Cohort | Author Value | Visual Value | Brand Value | Conversion Likelihood |
|--------|--------------|--------------|-------------|----------------------|
| Deep Engagers | ★★★★★ | ★★★★★ | ★★★★★ | Highest |
| Full Experiencers | ★★★★★ | ★★★★ | ★★★★ | High |
| Readers | ★★★★★ | ★★ | ★★★ | Medium |
| Watchers | ★★ | ★★★★★ | ★★★ | Medium |
| Samplers | ★★ | ★★ | ★★ | Low |
| Bouncers | ★ | ★ | ★ | Very Low |

## 3.3 Cohort Insights for Sales

| For Authors | "72% of your viewers were Readers or Deep Engagers — your words were consumed" |
| For Visual Directors | "45% were Watchers or Deep Engagers — your animation captivated" |
| For Brands | "62% achieved Full Experience or higher — premium attention" |

---

# PART 4: TECHNICAL IMPLEMENTATION

## 4.1 Tracker Data Collection

### Current (what we have)

```javascript
// Scroll samples: {t: timestamp, y: position, pct: depth}
// Engagement summaries every 60s: reversals, pause_points, scroll_distance, min/max depth
// Section events: enter/exit with timestamps
// Milestones: 25%, 50%, 75%, 100% with time_to_reach
```

### Required Additions

```javascript
// 1. Tab visibility tracking
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    recordEvent('tab_hidden', { timestamp: Date.now() })
    pauseActiveTimer()
  } else {
    recordEvent('tab_visible', { timestamp: Date.now() })
    resumeActiveTimer()
  }
})

// 2. Mode classification in real-time
function classifyMode(velocity) {
  if (velocity < 30) return 'reading'
  if (velocity > 50) return 'watching'
  return 'transitional'
}

// 3. Enhanced engagement summary
{
  period: 0,
  reading_mode_ms: 45000,      // NEW: Time in reading mode
  watching_mode_ms: 12000,     // NEW: Time in watching mode
  transitional_mode_ms: 3000,  // NEW: Time in transitional
  mode_switches: 4,            // NEW: Number of mode changes
  pauses: [                    // ENHANCED: More detail
    { depth_pct: 23, duration_ms: 5400, section_id: 'chapter-1' },
    { depth_pct: 67, duration_ms: 3200, section_id: 'chapter-3' }
  ],
  section_scroll_distances: {  // NEW: Per-section scroll
    'chapter-1': 2400,
    'chapter-2': 1800,
    'chapter-3': 4200
  },
  // ... existing fields
}

// 4. Content metadata injection (at build time)
var DS_STREAM_METADATA = {
  total_words: 2000,
  total_height: 5000,
  sections: [
    { id: 'chapter-1', words: 500, height: 1200, start_pct: 0, end_pct: 24 },
    { id: 'chapter-2', words: 400, height: 1000, start_pct: 24, end_pct: 44 },
    // ...
  ]
}

// 5. CTA/Button tracking
function trackCTA(element, ctaId) {
  // Visibility tracking with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!element._dsFirstVisible) {
          element._dsFirstVisible = Date.now()
          queueEvent('cta_impression', {
            cta_id: ctaId,
            scroll_depth: getCurrentScrollDepth(),
            mode: getCurrentMode()
          })
        }
        element._dsLastVisible = Date.now()
      }
    })
  }, { threshold: 0.5 })
  observer.observe(element)

  // Click tracking
  element.addEventListener('click', () => {
    const visibilityDuration = element._dsLastVisible - element._dsFirstVisible
    queueEvent('cta_click', {
      cta_id: ctaId,
      scroll_depth: getCurrentScrollDepth(),
      mode: getCurrentMode(),
      time_to_click: Date.now() - element._dsFirstVisible,
      visibility_duration_ms: visibilityDuration,
      reading_ratio_at_click: getCurrentReadingRatio(),
      reversals_before_click: getTotalReversals()
    })
  })
}

// 6. Form tracking
function trackForm(formElement, formId) {
  let interactionStarted = null
  let fieldsInteracted = new Set()

  // Visibility tracking (same as CTA)
  observeVisibility(formElement, formId, 'form')

  // Field interaction tracking
  formElement.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('focus', () => {
      if (!interactionStarted) {
        interactionStarted = Date.now()
        queueEvent('form_interaction_start', {
          form_id: formId,
          scroll_depth: getCurrentScrollDepth()
        })
      }
      fieldsInteracted.add(field.name || field.id)
    })
  })

  // Submission tracking
  formElement.addEventListener('submit', (e) => {
    queueEvent('form_submission', {
      form_id: formId,
      scroll_depth: getCurrentScrollDepth(),
      time_to_submit: Date.now() - interactionStarted,
      fields_completed: fieldsInteracted.size,
      reading_ratio_at_submit: getCurrentReadingRatio()
    })
    // Note: form content NOT tracked for privacy
  })
}

// 7. Link tracking
document.addEventListener('click', (e) => {
  const link = e.target.closest('a')
  if (link && link.href) {
    const isExternal = new URL(link.href).host !== window.location.host
    queueEvent('link_click', {
      href: link.href,
      is_external: isExternal,
      scroll_depth: getCurrentScrollDepth(),
      link_text: link.textContent?.slice(0, 50), // Truncated for privacy
      mode: getCurrentMode()
    })
  }
})
```

## 4.2 Server-Side Calculations

### Per-Session Calculations

```python
def calculate_session_metrics(page_view, engagement_summaries, milestones, sections):

    # Basic
    active_time = sum(s.reading_mode_ms + s.watching_mode_ms for s in summaries)
    coverage = max(m.milestone for m in milestones) if milestones else 0

    # Reading metrics
    total_reading_ms = sum(s.reading_mode_ms for s in summaries)
    expected_reading_ms = stream.word_count / 200 * 60 * 1000  # 200 wpm
    reading_ratio = total_reading_ms / expected_reading_ms if expected_reading_ms > 0 else 0

    # Animation metrics
    total_scroll_distance = sum(s.total_scroll_distance for s in summaries)
    scroll_intensity = total_scroll_distance / stream.content_height

    # Mode analysis
    reading_pct = total_reading_ms / active_time * 100 if active_time > 0 else 0
    watching_pct = 100 - reading_pct
    mode_switches = sum(s.mode_switches for s in summaries)

    # Reversals
    total_reversals = sum(s.reversals for s in summaries)
    has_reversals = total_reversals > 0

    # Cohort
    cohort = classify_cohort(reading_ratio, scroll_intensity, coverage, has_reversals, active_time)

    # Full experience
    full_experience = reading_ratio > 0.7 and scroll_intensity > 0.9 and coverage >= 100

    return {
        'active_time_ms': active_time,
        'coverage_pct': coverage,
        'reading_ratio': reading_ratio,
        'scroll_intensity': scroll_intensity,
        'reading_mode_pct': reading_pct,
        'watching_mode_pct': watching_pct,
        'mode_switches': mode_switches,
        'reversals': total_reversals,
        'cohort': cohort,
        'full_experience': full_experience
    }
```

### Per-Section Calculations

```python
def calculate_section_metrics(section_id, summaries, section_metadata):

    section_scroll = sum(s.section_scroll_distances.get(section_id, 0) for s in summaries)
    section_dwell = calculate_section_dwell(section_id, summaries)  # From enter/exit events
    section_pauses = [p for s in summaries for p in s.pauses if p.section_id == section_id]

    expected_reading_ms = section_metadata.words / 200 * 60 * 1000
    section_reading_ratio = sum(p.duration_ms for p in section_pauses) / expected_reading_ms

    section_passes = section_scroll / section_metadata.height
    section_replays = count_section_reversals(section_id, summaries)

    return {
        'section_id': section_id,
        'dwell_time_ms': section_dwell,
        'reading_ratio': section_reading_ratio,
        'scroll_distance': section_scroll,
        'passes': section_passes,
        'replay_count': section_replays,
        'pause_count': len(section_pauses)
    }
```

## 4.3 Database Schema Additions

```sql
-- Add to page_views or create new computed_metrics table
ALTER TABLE page_views ADD COLUMN active_time_ms INTEGER;
ALTER TABLE page_views ADD COLUMN reading_ratio REAL;
ALTER TABLE page_views ADD COLUMN scroll_intensity REAL;
ALTER TABLE page_views ADD COLUMN reading_mode_pct REAL;
ALTER TABLE page_views ADD COLUMN mode_switches INTEGER;
ALTER TABLE page_views ADD COLUMN cohort TEXT;
ALTER TABLE page_views ADD COLUMN full_experience BOOLEAN;

-- Section-level metrics
CREATE TABLE section_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    section_id TEXT NOT NULL,
    dwell_time_ms INTEGER,
    reading_ratio REAL,
    scroll_distance INTEGER,
    passes REAL,
    replay_count INTEGER,
    pause_count INTEGER,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Stream metadata
CREATE TABLE stream_metadata (
    stream_id TEXT PRIMARY KEY,
    total_words INTEGER,
    total_height INTEGER,
    sections_json TEXT  -- JSON array of section metadata
);

-- CTA/Button events
CREATE TABLE cta_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    cta_id TEXT NOT NULL,
    event_type TEXT NOT NULL,  -- 'impression' or 'click'
    timestamp TEXT NOT NULL,
    scroll_depth_pct INTEGER,
    mode TEXT,  -- 'reading', 'watching', 'transitional'
    time_to_click_ms INTEGER,  -- NULL for impressions
    visibility_duration_ms INTEGER,
    reading_ratio_at_event REAL,
    reversals_before_event INTEGER,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Form events
CREATE TABLE form_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    form_id TEXT NOT NULL,
    event_type TEXT NOT NULL,  -- 'impression', 'interaction_start', 'submission', 'abandonment'
    timestamp TEXT NOT NULL,
    scroll_depth_pct INTEGER,
    time_to_event_ms INTEGER,
    fields_completed INTEGER,
    reading_ratio_at_event REAL,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Link clicks
CREATE TABLE link_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_view_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    href TEXT NOT NULL,
    is_external BOOLEAN,
    scroll_depth_pct INTEGER,
    mode TEXT,
    FOREIGN KEY (page_view_id) REFERENCES page_views(id)
);

-- Conversion summary per page view
ALTER TABLE page_views ADD COLUMN cta_clicks INTEGER DEFAULT 0;
ALTER TABLE page_views ADD COLUMN form_submissions INTEGER DEFAULT 0;
ALTER TABLE page_views ADD COLUMN converted BOOLEAN DEFAULT FALSE;

-- Indexes for conversion queries
CREATE INDEX idx_cta_events_page_view ON cta_events(page_view_id);
CREATE INDEX idx_cta_events_cta_id ON cta_events(cta_id);
CREATE INDEX idx_form_events_page_view ON form_events(page_view_id);
CREATE INDEX idx_form_events_form_id ON form_events(form_id);
```

## 4.4 Dashboard Additions

### Stream Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│ STREAM: Bolyai                                    Last 30 days  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OVERVIEW                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   247    │  │   68%    │  │   62%    │  │   4.7m   │       │
│  │  Views   │  │ Complete │  │Full Exp. │  │ Avg Time │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                 │
│  ENGAGEMENT COHORTS                                             │
│  ████████████████████░░░░░ Deep Engagers (23%)                 │
│  ████████████████████████░ Full Experience (28%)               │
│  ██████████░░░░░░░░░░░░░░░ Readers (12%)                       │
│  ████████████████░░░░░░░░░ Watchers (18%)                      │
│  ████░░░░░░░░░░░░░░░░░░░░░ Samplers (8%)                       │
│  ██████░░░░░░░░░░░░░░░░░░░ Bouncers (11%)                      │
│                                                                 │
│  SECTION ENGAGEMENT                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Section      │ Reading │ Watching │ Replays │ Drop-off │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Chapter 1    │  0.92   │   1.2x   │   18%   │   -      │   │
│  │ Chapter 2    │  0.78   │   1.1x   │   12%   │   8%     │   │
│  │ Chapter 3    │  1.14   │   1.8x   │   34%   │   5%     │   │
│  │ Chapter 4    │  0.81   │   1.3x   │   21%   │   7%     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  READING vs WATCHING                                            │
│  Reading Mode: ████████████████████░░░░░░ 58%                  │
│  Watching Mode: ████████████░░░░░░░░░░░░░ 42%                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 5: COMPETITIVE ADVANTAGE

## 5.1 What We Can Say That Others Can't

| Claim | Why Only We Can Make It |
|-------|-------------------------|
| "Zero passive views" | Animation only plays on scroll — can't background play |
| "X% actually read the text" | We measure reading mode, not just time on page |
| "X% replayed sections" | We detect reversals — video platforms can't |
| "Section-by-section engagement" | Granular scroll + section tracking |
| "Both reading AND watching metrics" | Dual-content measurement |
| "Every frame was actively chosen" | Scroll = explicit user action |

## 5.2 Comparison Positioning

| vs. Video | Our Advantage |
|-----------|---------------|
| Background playing | Impossible — requires scroll |
| Can't detect rewatch | We measure every reversal |
| Fixed playback speed | User-controlled pacing |
| Just "watch time" | Reading mode + watching mode |

| vs. Articles | Our Advantage |
|--------------|---------------|
| Time on page is meaningless | Active time with mode classification |
| Can't tell reading vs scrolling | Velocity-based mode detection |
| No visual engagement data | Full animation metrics |
| Static content | Dynamic, engaging medium |

## 5.3 The Sales Pitch Summary

> **For authors:** "We tell you not just if they visited, but if they READ. Section by section. Which paragraphs they paused on. Which they re-read. Your words, measured."
>
> **For visual creators:** "We tell you which animations captivated. Which sections got replayed. Every scroll is a frame advance — we track them all."
>
> **For agencies:** "Zero passive views. Every engagement is active. We measure reading AND watching separately. This is attention quality you can prove."
>
> **For brands:** "Know exactly how your sponsored content performed. Visibility, dwell time, engagement mode, completion. Context that matters."

---

# PART 6: IMPLEMENTATION PRIORITY

## Phase 1: Core Accuracy (Week 1)

1. Add tab visibility tracking to tracker
2. Fix time calculation (active time, not wall time)
3. Add reading/watching mode classification to engagement summaries
4. Update API to calculate reading_ratio and scroll_intensity

## Phase 2: Section Metrics (Week 2)

1. Add per-section scroll distance tracking
2. Calculate section-level reading ratios
3. Identify per-section replay counts
4. Build section engagement table in DB

## Phase 3: Conversion Tracking (Week 3)

1. Add CTA visibility and click tracking
2. Add form interaction and submission tracking
3. Add link click tracking
4. Build conversion tables in DB
5. Calculate conversion-to-engagement correlation

## Phase 4: Cohort System (Week 4)

1. Implement cohort classification algorithm
2. Add cohort distribution to dashboard
3. Create cohort-based filtering

## Phase 5: Dashboard Upgrade (Week 5)

1. Add new metrics to stream detail view
2. Build section-by-section engagement visualization
3. Add mode distribution display
4. Create exportable reports

## Phase 5: Sales-Ready Reports (Week 5+)

1. Author report template
2. Agency report template
3. Brand/sponsor report template
4. Benchmark comparison charts

---

## Appendix: Threshold Values (To Be Calibrated)

| Threshold | Initial Value | Notes |
|-----------|---------------|-------|
| Reading mode velocity | < 30 px/sec | Allows ~200 wpm reading |
| Watching mode velocity | > 50 px/sec | Animation plays smoothly |
| Pause detection | velocity = 0 for > 2 sec | Intentional stop |
| Minimum engaged view | > 10% depth AND > 10 sec active | Real engagement |
| Reading ratio threshold | > 0.7 = "read" | Had time for most words |
| Scroll intensity threshold | > 0.9 = "watched" | Saw most animation |
| Full experience | reading > 0.7 AND intensity > 0.9 | Both |

**These values need calibration with real user data.**

---

## Appendix: Complete Metrics Catalog

### Standard Landing Page Metrics (What Everyone Has)

| Category | Metric |
|----------|--------|
| **Traffic** | Page views, Unique visitors, Sessions |
| **Sources** | Referrer, UTM parameters, Geographic |
| **Device** | Mobile/Desktop/Tablet, Viewport size |
| **Engagement** | Bounce rate, Time on page |
| **Conversion** | CTA clicks, Form submissions, CTR |

### Stream-Specific Metrics (Our Differentiator)

| Category | Metric | Unique Value |
|----------|--------|--------------|
| **Content Coverage** | Scroll depth %, Completion rate | Standard |
| **Active Engagement** | Active scroll time (not wall time) | **Better than "time on page"** |
| **Reading Metrics** | Reading ratio, Section reading time, Pause locations | **Unique to DownStream** |
| **Animation Metrics** | Scroll intensity, Section passes, Playback speed | **Unique to DownStream** |
| **Mode Analysis** | Reading vs watching %, Mode switches | **Unique to DownStream** |
| **Replay Behavior** | Reversals, Section replays, Re-read rate | **Unique to DownStream** |
| **Cohorts** | Deep Engagers, Full Experience, Readers, Watchers | **Unique to DownStream** |
| **Section Analysis** | Per-section reading ratio, Per-section replays | **Unique to DownStream** |

### Conversion Context Metrics (Our Advantage)

| Metric | What It Tells Us | Why It's Unique |
|--------|------------------|-----------------|
| Reading ratio of converters | Do readers convert better? | Links content to conversion |
| Engagement score of converters | What engagement level converts? | Behavioral conversion model |
| Pre-conversion replay behavior | Did they rewatch before clicking? | Intent signal |
| Section dwell before conversion | Which content drives conversion? | Content attribution |
| Mode at conversion | Were they reading or watching when they clicked? | Context understanding |

### Privacy-First Data Model

| What We Track | What We Don't Track |
|---------------|---------------------|
| Anonymous visitor UUID (localStorage) | IP addresses |
| Behavioral events (scrolls, clicks) | Personal information |
| Aggregate statistics | Individual profiles |
| Session patterns | Cross-site behavior |
| Device category | Device fingerprints |
| Country (from Cloudflare) | Precise location |

### Total Metrics Count

| Category | Count |
|----------|-------|
| Standard landing page metrics | ~15 |
| Stream-specific engagement metrics | ~25 |
| Conversion context metrics | ~10 |
| Section-level metrics | ~8 per section |
| **Total unique metrics** | **~60+** |

---

*This document supersedes all previous analytics planning documents.*
*Version 1.1 — January 19, 2026*
