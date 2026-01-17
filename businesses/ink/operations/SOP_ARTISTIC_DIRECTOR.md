# Standard Operating Procedure
## Artistic Director — DownStream Studio

**Version:** 1.0
**Last Updated:** January 2026
**Applies to:** Premium, human-directed stream productions

---

## Role Overview

The Artistic Director ensures that each DownStream Studio production meets our quality standards and delivers an emotionally resonant experience. You are the human eye and artistic sensibility in a pipeline that uses AI for execution.

**Your judgment is needed when:**
- Interpreting what a customer really wants
- Deciding if a generated image captures the intended mood
- Ensuring visual consistency across scenes
- Catching problems the AI might miss
- Making taste-based decisions

**Your judgment is NOT needed when:**
- Technical execution (the AI handles this)
- File management and organization
- Deployment and hosting
- Basic formatting

---

## Your Touchpoints in the Pipeline

```
STAGE 1: Story Intake
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→  CHECKPOINT 1: Review Customer Brief
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
STAGE 2: Production Spec Creation
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→  CHECKPOINT 2: Review & Approve Spec
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
STAGE 3A: Keyframe Generation
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→  CHECKPOINT 3: Review Each Keyframe
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
STAGE 3B: Video Generation
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→  CHECKPOINT 4: Review Each Video
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
STAGE 4: Assembly
    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→  CHECKPOINT 5: Final Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↓
STAGE 5: Deployment
```

---

## Checkpoint 1: Review Customer Brief

**When:** After a new order arrives, before production spec creation
**Time needed:** 10-15 minutes
**Input:** Customer's input.json file

### What to Review

Open the customer's input file and assess:

**1. Story Quality**
- [ ] Is the story complete and coherent?
- [ ] Is the language clear (even if creative)?
- [ ] Are there any obvious issues we should flag?

**2. Customer's Brief**
- [ ] What tone words did they provide?
- [ ] What color preferences, if any?
- [ ] What references did they mention?
- [ ] Any special notes or requests?

**3. Ambiguity Check**
- [ ] Is anything unclear about what they want?
- [ ] Are their references contradictory?
- [ ] Is the style appropriate for their story?

### Actions

**If brief is clear:**
- Note any strong preferences to honor
- Identify the emotional core of the story
- Signal: PROCEED to spec creation

**If brief is unclear:**
- Draft clarifying questions for customer
- Flag for customer contact before proceeding

### Documentation

Note in the production tracking:
```
Brief Review — [Date]
Reviewer: [Name]
Status: APPROVED / NEEDS CLARIFICATION
Notes: [Key observations, preferences to honor]
```

---

## Checkpoint 2: Review & Approve Production Spec

**When:** After the AI creates the production spec
**Time needed:** 20-30 minutes
**Input:** Production.json file

### What to Review

**1. Overall Vision**
- [ ] Does the aesthetic match the story's mood?
- [ ] Is the interpretation scale appropriate? (1=literal, 10=abstract)
- [ ] Do the reference artists/films make sense?

**2. Color Palette**
- [ ] Does the palette support the emotional journey?
- [ ] Are there enough contrast points?
- [ ] Does it feel cohesive, not random?

**3. Segmentation**
- [ ] Are scenes broken at natural story beats?
- [ ] Is there a good mix of motion types?
- [ ] Does the motion rhythm feel right?

**4. Individual Segments** (review each)
- [ ] Does the scene description capture the right moment?
- [ ] Is the motion type appropriate for this beat?
- [ ] Does the image prompt describe something achievable?
- [ ] Does the motion prompt make sense?

**5. Text Sections**
- [ ] Are text breaks at natural reading points?
- [ ] Are word counts roughly balanced?
- [ ] Does the segment-to-section mapping make sense?

### Common Issues to Watch For

| Issue | Symptom | Fix |
|-------|---------|-----|
| Over-literal | Every line gets its own visual | Combine moments, use metaphor |
| Too many high-intensity scenes | Everything is dramatic | Add rest moments, atmospheric holds |
| Character inconsistency risk | Different descriptions each scene | Add character reference notes |
| Motion monotony | All scenes same type | Vary the motion types |
| Color chaos | Palette has too many colors | Simplify to 4-5 core colors |

### Actions

**If spec is strong:**
- Signal: APPROVED for keyframe generation

**If spec needs work:**
- Note specific issues
- Suggest concrete changes
- Signal: REVISE spec

### Documentation

Note in production tracking:
```
Spec Review — [Date]
Reviewer: [Name]
Status: APPROVED / REVISION NEEDED

Approved elements:
- [What works well]

Revision requests:
- [Specific changes needed]

Notes for generation:
- [Anything to watch for in keyframes]
```

---

## Checkpoint 3: Review Each Keyframe

**When:** After each keyframe is generated
**Time needed:** 2-5 minutes per keyframe
**Input:** Generated keyframe image + production spec segment

### Review Criteria

For each keyframe, assess:

**1. Prompt Fidelity**
- [ ] Does the image match what was requested?
- [ ] Are key elements present?
- [ ] Is anything obviously wrong or missing?

**2. Mood & Atmosphere**
- [ ] Does it FEEL right for this moment?
- [ ] Is the lighting appropriate?
- [ ] Does the color temperature match the spec?

**3. Technical Quality**
- [ ] No obvious AI artifacts (weird hands, melting features)?
- [ ] Composition is balanced and clear?
- [ ] No accidental text or watermarks?

**4. Consistency Check** (after first few)
- [ ] Does this match the visual language established?
- [ ] If characters appear, do they look consistent?
- [ ] Is the style coherent with other scenes?

### Decision Tree

```
Does the image capture the intended mood?
├── YES, perfectly → APPROVE, continue to next
├── YES, but minor issues → APPROVE WITH NOTES
│   (Note issues for video stage)
├── CLOSE, but not quite → ADJUST PROMPT
│   (Specify what to change)
└── NO, fundamentally wrong → REGENERATE
    (Major prompt revision needed)
```

### How to Request Changes

**If adjusting prompt, be specific:**

❌ "Make it more atmospheric"
✓ "Add visible fog/mist in the middle ground, reduce contrast"

❌ "The mood is wrong"
✓ "This should feel melancholic, not ominous. Soften the shadows, add warmer highlights"

❌ "Character looks different"
✓ "The figure should be taller and thinner, wearing dark coat as in segment 1"

### Documentation

For each keyframe:
```
Keyframe [#] — [Date]
Status: APPROVED / ADJUST / REGENERATE

If adjusting/regenerating:
Current issue: [What's wrong]
Requested change: [Specific fix]
Prompt adjustment: [New or modified prompt text]
```

---

## Checkpoint 4: Review Each Video

**When:** After each video is generated from approved keyframe
**Time needed:** 2-5 minutes per video
**Input:** Generated video + keyframe + motion prompt

### Review Criteria

**1. Motion Quality**
- [ ] Movement is smooth, not jerky?
- [ ] Speed feels right for the mood?
- [ ] No sudden stops or jumps?

**2. Motion Intent**
- [ ] Does the movement match the prompt?
- [ ] Does it enhance the scene or distract?
- [ ] Is the camera movement appropriate?

**3. Technical Quality**
- [ ] No severe morphing or warping?
- [ ] Character/subject remains stable?
- [ ] No artifacts appearing mid-video?

**4. Integration**
- [ ] Will this work well with the scroll pace?
- [ ] Does motion intensity match spec?
- [ ] Does it maintain the keyframe's quality?

### Decision Tree

```
Does the motion enhance the scene?
├── YES → APPROVE, continue
├── YES, but could be better → APPROVE WITH NOTES
│   (Minor issues acceptable)
├── Motion doesn't match intent → ADJUST PROMPT
│   (Keep keyframe, change motion description)
└── Severe technical issues → REGENERATE
    (Try again with same or adjusted prompt)
```

### Common Video Issues

| Issue | What You See | Likely Fix |
|-------|--------------|------------|
| Over-animation | Too much movement, distracting | Use "subtle" or "slow" in prompt |
| Frozen subject | Nothing moves but background | Add subject motion to prompt |
| Morphing faces | Features drift and change | Specify "stable face" or use silhouette |
| Wrong direction | Camera moves opposite to intent | Clarify direction in prompt |
| Speed mismatch | Too fast or slow for mood | Specify "very slow" or adjust |

### Documentation

For each video:
```
Video [#] — [Date]
Status: APPROVED / ADJUST / REGENERATE

Motion assessment:
- Type: [SUBJECT_ANIMATION / ATMOSPHERIC / etc.]
- Quality: [smooth / acceptable / needs work]
- Speed: [appropriate / too fast / too slow]

If adjusting/regenerating:
Issue: [What's wrong]
Requested change: [Specific fix]
```

---

## Checkpoint 5: Final Review

**When:** After assembly, before deployment
**Time needed:** 30-45 minutes
**Input:** Preview link of assembled stream

### Review Process

**1. Full Read-Through**
- Experience the stream as a reader would
- Scroll at natural reading pace
- Note anything that disrupts immersion

**2. Section-by-Section Check**
- [ ] Each section transitions smoothly?
- [ ] Text and visuals feel connected?
- [ ] No jarring changes in style or mood?

**3. Motion Rhythm Assessment**
- [ ] Good balance of movement and rest?
- [ ] High-intensity moments are spaced well?
- [ ] Endings feel appropriately still?

**4. Technical Check**
- [ ] All segments display correctly?
- [ ] Scroll sync feels natural?
- [ ] No visual glitches or loading issues?

**5. Customer Brief Match**
- [ ] Does this deliver what was requested?
- [ ] Are their preferences honored?
- [ ] Would they be satisfied receiving this?

### Final Decision

```
Is this stream ready for customer delivery?
├── YES, ship it → APPROVE FOR DEPLOYMENT
├── Minor issues, but acceptable → APPROVE WITH NOTES
│   (Document what could be better next time)
└── Issues that affect experience → REVISION NEEDED
    (Specify what needs to change)
```

### Documentation

```
Final Review — [Date]
Reviewer: [Name]
Status: APPROVED / REVISION NEEDED

Overall assessment:
- Visual quality: [Excellent / Good / Acceptable / Needs work]
- Motion rhythm: [Well-balanced / Acceptable / Monotonous]
- Text-visual sync: [Strong / Adequate / Disconnected]
- Customer brief match: [Exceeds / Meets / Below]

Strengths:
- [What works well]

Areas for improvement:
- [What could be better, for future reference]

If revision needed:
- [Specific changes required]
- [Which segments affected]
```

---

## Quick Reference: Quality Standards

### Keyframe Must-Haves
- No text, watermarks, logos
- Correct aspect ratio
- Scene matches description
- Appropriate mood and lighting
- Character consistency (if applicable)
- No obvious AI artifacts
- Coherent composition
- Color palette matches spec

### Video Must-Haves
- Motion matches intent
- Natural movement
- Appropriate speed
- No jarring transitions
- No severe artifacts
- Camera stability (unless intentional)
- Consistent with keyframe

### Overall Stream Must-Haves
- Visual consistency throughout
- Good motion rhythm
- Text-visual connection
- Nothing breaks immersion
- Customer brief honored

---

## Workflow Tips

**Batch vs. Sequential**

For standard projects:
- Review keyframes sequentially (catch consistency issues early)
- Video review can be batched after all approved

For rush projects:
- Parallel review possible if consistency less critical
- Flag as "express review" in notes

**Communication**

When requesting revisions:
- Be specific, not vague
- Describe what you want, not just what's wrong
- Include reference to spec if relevant

**Time Management**

| Checkpoint | Standard Time | Express |
|------------|---------------|---------|
| Brief review | 15 min | 5 min |
| Spec review | 30 min | 15 min |
| Keyframes (10) | 30 min | 15 min |
| Videos (10) | 30 min | 15 min |
| Final review | 45 min | 20 min |
| **Total** | **~2.5 hrs** | **~1 hr** |

---

## Escalation

### Contact Production Lead When:
- Customer brief is unclear even after review
- Technical issues block progress
- Quality cannot meet standards within time/budget
- Customer has unusual requests

### Contact Ferenc When:
- Customer dispute or complaint
- Refund consideration
- Legal questions (copyright, licenses)
- Major scope changes

---

## Appendix: Motion Type Reference

| Type | When to Use | What to Look For |
|------|-------------|------------------|
| **Subject Animation** | Opening, dramatic peaks | Character moves naturally |
| **Atmospheric Hold** | Most scenes (50-60%) | Subtle drift, nothing distracting |
| **Parallax** | Adding depth | Clear layer separation |
| **State Change** | Emotional turns | Smooth transition |
| **Subtle Zoom** | Intimacy moments | Very slow, not jarring |
| **Static** | Endings, stillness | Minimal breathing only |

---

## Appendix: Prompt Adjustment Templates

**To add atmosphere:**
> "Add visible [fog/mist/dust particles/rain] in the [foreground/middle ground/background]"

**To adjust lighting:**
> "Change lighting to [golden hour/blue hour/overcast/dramatic side-lighting], [soften/harden] shadows"

**To fix mood:**
> "This should feel [specific emotion]. Adjust [color temperature/contrast/composition] to be more [specific quality]"

**To ensure character consistency:**
> "Character should match segment [#]: [specific features to maintain]"

**To adjust motion:**
> "Movement should be [slower/faster/more subtle/more pronounced]. Camera should [specific direction/behavior]"

---

*This SOP is a living document. Update as we learn what works.*
