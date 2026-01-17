# Generate Video Skill

Generate video clips from keyframes with DYNAMIC, RICH motion.

## CRITICAL: Motion is NOT just camera movement

A motion prompt must include MULTIPLE elements:

1. **Camera movement** — push, pull, drift, pan, static
2. **Subject animation** — pulsing, rotating, growing, dripping, breathing
3. **Atmospheric elements** — particles floating, light shifting, fog drifting
4. **Environmental effects** — lens dirt, scratches, organic residue on glass
5. **Secondary motion** — background elements, depth layers

**BAD (lazy, single element):**
```
slow camera push in toward center
```

**GOOD (rich, multi-layered):**
```
slow camera push in toward the central seed,
the seed pulses rhythmically like a heartbeat,
organic tendrils drip and sway slowly,
light shifts through translucent membrane,
particles float in amber haze,
a root creeps across the corner like growth on a dirty lens
```

## Motion Element Inventory

### Camera Movement
- `slow camera push in` / `pull out`
- `camera drift left/right/up/down`
- `slow pan [direction]`
- `static camera` (when subject moves instead)

### Subject Animation
- `pulses rhythmically` / `pulses like a heartbeat`
- `slowly rotates`
- `breathes` / `expands and contracts`
- `grows` / `extends` / `reaches`
- `drips` / `oozes` / `secretes`
- `splits open` / `unfolds`
- `twitches` / `trembles`

### Organic/Environmental
- `stomata opening and closing`
- `tendrils swaying`
- `roots creeping`
- `membrane undulating`
- `veins pulsing`
- `goo dripping`

### Atmospheric
- `particles floating`
- `light shifting` / `light flickering`
- `fog drifting [direction]`
- `dust motes swirling`
- `amber haze`

### Lens/Frame Effects
- `dirt on lens`
- `organic residue creeping across frame`
- `scratches on glass`
- `grime at edges`
- `condensation forming`
- `root tendril crossing corner of frame`

## Prompt Structure

```
[camera] + [subject animation] + [secondary motion] + [atmosphere] + [lens effect] + [mood]
```

**Minimum 4 elements per prompt. No exceptions.**

## Pre-Generation Checklist

Before running generate_video.py, the prompt MUST have:

- [ ] Camera instruction with direction and speed
- [ ] Subject doing something (not static)
- [ ] At least one atmospheric element
- [ ] Lens/environmental effect if designed
- [ ] Mood descriptor

**If any checkbox is empty, DO NOT GENERATE. Rewrite the prompt first.**

## Example Prompts by Scene Type

### Opening/Hook (high energy)
```
camera drifts slowly inward,
organic mass at center splits open revealing amber light within,
wet tendrils emerge and reach outward,
particles burst from the breach,
grime visible at edges of frame like a contaminated lens,
visceral, dreamlike
```

### Invasion/Growth (violent, dynamic)
```
slow camera push through dense root network toward bright gap,
foreground tendrils sway and drip organic matter,
roots pulse with flowing liquid,
particles caught in the tangle,
organic residue accumulates on lens as we move deeper,
relentless, beautiful horror
```

### Resolution/Breathe (calm but alive)
```
very slow camera push toward central seed,
the seed pulses slowly like a sleeping heartbeat,
canopy above breathes with stomata opening and closing,
light shifts gently through membrane,
a single root tendril creeps across corner of frame,
transcendent, peaceful, eternal
```

## Quality Validation

After generation, check:

- [ ] Camera movement is perceptible
- [ ] Subject is DOING something (not frozen)
- [ ] Atmospheric elements are visible
- [ ] Lens effects present if specified
- [ ] Overall feels dynamic, not static

**If the video looks like a still image with slight zoom: FAILED. Do not use.**

## Cost Reference

| Model | 5s Cost |
|-------|---------|
| kling-v2.1 | ~$0.25 |

**Every failed generation is wasted money. Get the prompt right FIRST.**

## The Golden Rule

**Ask yourself: "If I showed this to someone, would they say 'that's just a zoom' or would they say 'holy shit that's alive'?"**

If the answer is the first one, your prompt sucks. Rewrite it.
