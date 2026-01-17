# Pattern: Opening Hook

**Discovered:** 2026-01-07 (The Loop demo review)
**Source:** Comparison to Capsules competitive analysis

---

## The Problem

Minimal/abstract openings don't hook viewers. Users may:
- Think the video didn't load
- Bounce before discovering the experience
- Miss that scrolling triggers animation

## The Rule

**First frame must have EITHER:**
1. **Colorful + animated primary subject** (bird flying, figure moving)
2. **Static subject + dynamic surroundings** (silhouette + moving clouds/particles)

Never: static subject + static surroundings (e.g., dot on black void)

## Evidence

| Stream | Opening | Result |
|--------|---------|--------|
| Capsules #1 | Red bird flying through grey clouds | Instant engagement |
| Capsules #2 | Youth with glowing tech orb | Clear focal point |
| The Loop | Warm dot on black void | Too minimal, risks bounce |

## Counter-Example

Scene 1 of "The Loop": single amber light point on near-black background. No movement visible at first glance. Users might think it's broken.

## How to Apply

When writing keyframe prompts for Scene 1:

**Don't:**
```
single point of warm light in infinite void
```

**Do:**
```
single point of warm light in infinite void,
surrounded by slowly drifting particles of golden dust,
subtle atmospheric haze catching light
```

Or:
```
warm glowing orb pulsing gently,
radiating soft amber light rays,
surrounded by swirling motes of light
```

## Motion Prompt for Opening

Always include camera movement in opening video prompt:
- "slow zoom in"
- "gentle camera push"
- "subtle parallax drift"

Never rely only on subject motion for openings.
