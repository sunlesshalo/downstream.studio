# DownStream Production Pipeline
## A Non-Technical Overview for Artistic Directors

---

## The Big Picture

Think of the DownStream production pipeline like making a short film. You start with a story, then create a vision for how it should look and feel, then create the visuals scene by scene, then assemble everything into a final experience.

The key difference: our "film" is **scroll-driven**. As the reader scrolls through the text, the visuals come alive — not as a video that plays on its own, but as frames that respond to how fast or slow someone reads.

---

## The Five Stages

### Stage 1: The Story Arrives

**What happens:** A customer submits their story through our website, along with some artistic direction notes — things like mood preferences, color ideas, visual references.

**The input file** contains:
- The full story text
- Language (Hungarian, English, etc.)
- Style preference (art-film, documentary, poetic, etc.)
- A brief with: tone words, color ideas, artistic references, special notes

**Think of it as:** The script arriving on a director's desk, with the producer's notes attached.

---

### Stage 2: The Production Spec (The Master Blueprint)

**What happens:** This is where all artistic decisions get made. The AI (or an artistic director) reads the story and creates a detailed blueprint that answers:

- How should we break this story into visual scenes (we call them "segments")?
- What should each scene look like?
- What colors should dominate?
- What kind of motion works for each moment?
- How literal or symbolic should the visuals be?
- What references and style guides should we follow?

**The production spec** becomes the source of truth for everything that follows. It's like a very detailed shot list combined with a mood board.

**Key decisions made here:**
- **Segmentation** — Where to cut the story into visual moments
- **Visual direction** — The overall aesthetic, color palette, texture
- **Motion planning** — What kind of animation each scene needs
- **Prompts** — The exact descriptions used to generate each image and video

**Think of it as:** A detailed storyboard with director's notes for every scene.

---

### Stage 3: Asset Generation (Creating the Visuals)

This stage has three sub-steps:

#### 3A: Keyframes (The Still Images)

**What happens:** For each segment, we generate a single "keyframe" — a still image that represents that scene.

**The prompt** describes exactly what should be in the image: the composition, the mood, the colors, what to include, what to avoid.

**Think of it as:** Getting back production stills or concept art for each scene.

#### 3B: Videos (Bringing Scenes to Life)

**What happens:** Each keyframe gets animated into a short video clip (~6 seconds). This isn't full animation — it's subtle motion: atmospheric drift, gentle zooms, light movement.

**The motion prompt** describes how the scene should move: "slow camera drift through fog" or "subject walks slowly into distance."

**Think of it as:** Turning the production stills into short film clips.

#### 3C: Frame Extraction (Preparing for Scroll)

**What happens:** Each video gets broken into ~140 individual frames. These frames are what the reader will see as they scroll — the scroll position determines which frame appears.

**Think of it as:** Cutting film strips into individual frames that can be shown one at a time.

---

### Stage 4: Assembly (Building the Experience)

**What happens:** All the pieces come together into a working website:
- The text gets formatted into readable sections
- Each section gets linked to its visual segments
- The scroll-sync system connects reading position to frame display
- Everything gets packaged as a deployable website

**Key technical magic:** When someone scrolls through a text section, the system calculates: "They're 37% through this section, so I'll show frame 52 of 141."

**Think of it as:** The editing room — cutting together all the shots, syncing them with the script.

---

### Stage 5: Deployment (Going Live)

**What happens:** The assembled website gets published to the internet, typically at a subdomain like `story-name.downstream.ink`.

**Think of it as:** The premiere — the film is now showing.

---

## Understanding Motion Types

Not every scene should move the same way. We use six types of motion, each serving a different purpose:

| Motion Type | What It Looks Like | When to Use It |
|-------------|-------------------|----------------|
| **Subject Animation** | Character walks, bird flies, hand writes | Opening hooks, dramatic moments |
| **Atmospheric Hold** | Scene mostly still, only atmosphere drifts | Most scenes (50-60% of story) |
| **Parallax** | Multiple layers moving at different speeds | Adding depth and richness |
| **State Change** | Same view, but colors or light shifts | Emotional turning points |
| **Subtle Zoom** | Slow camera push toward subject | Creating intimacy |
| **Static** | Nearly still, just breathing | Endings, maximum stillness |

**The rhythm matters:** A story should alternate between movement and rest, like music alternates between melody and silence.

---

## Understanding Visual-Text Relationship

How literally should the visuals match the words? We think about this on a spectrum:

**LITERAL** — The text says "red apple," you see a red apple.
**METAPHORICAL** — The text talks about temptation, you see a red glow in darkness.
**ABSTRACT** — The text explores loss, you see colors draining from a scene.

Most DownStream projects work best in the **metaphorical** range — the visuals show what the text *feels* like, not what it literally describes.

---

## What Makes a Good DownStream Visual?

**Works Well:**
- Silhouettes and shapes (hints at rather than shows)
- Fog, mist, atmosphere (adds mystery and motion)
- Negative space (room for the eye to rest)
- Strong textures (wood, fabric, stone, grain)
- Single focal point (clarity of attention)
- Extreme warm or cold color temperatures

**Doesn't Work:**
- Detailed faces (AI struggles with these)
- Crowded compositions (too much competing for attention)
- Sharp, clean digital surfaces (feels generic)
- Multiple subjects with equal weight (confusing)
- Mid-tone neutrals (flat, uninteresting)

---

## The Production Spec in Detail

The production spec file (production.json) contains everything needed to build a stream:

### Stream Info
- Title, ID, language
- Interpretation scale (1-10): how much artistic freedom to take

### Visual Direction
- Overall aesthetic description
- Color palette with specific hex codes
- Texture and grain preferences
- Reference artists and films
- Unifying visual elements (motifs that repeat)
- What to avoid (negative prompts)

### Segments (The Visual Scenes)
For each segment:
- What it represents in the story
- Emotional beat (what the reader should feel)
- Color phase (warm/cold/neutral)
- Motion type and intensity
- The image generation prompt
- The motion generation prompt

### Sections (The Text Chunks)
For each section:
- Which segments to show
- The actual text content
- Word count (for scroll timing)

---

## Quality Standards

Before any visual is approved, it should meet these criteria:

**For Keyframes:**
- No text, watermarks, or logos in the image
- Correct mood and lighting for the scene
- Composition makes sense
- Color palette matches the spec
- No obvious AI artifacts (weird hands, melting faces)
- Character looks consistent across scenes

**For Videos:**
- Motion feels natural, not jerky
- Speed is appropriate for the mood
- No jarring jumps or glitches
- Consistent with the keyframe it came from

**For the Overall Stream:**
- Visual consistency from beginning to end
- Good rhythm of motion and rest
- Text and visuals feel connected
- Nothing breaks the immersion

---

## Typical Timeline

| Stage | Duration |
|-------|----------|
| Story arrives | — |
| Production spec creation | 30-60 minutes |
| Keyframe generation | 2-3 minutes per scene |
| Keyframe review & revision | Variable |
| Video generation | 3-5 minutes per scene |
| Video review & revision | Variable |
| Assembly | 10-15 minutes |
| Final review | 15-30 minutes |
| Deployment | 5 minutes |

**A typical 10-scene stream** takes about **2-4 hours** of actual production time, though this can stretch with revisions.

---

## Costs

| Component | Cost |
|-----------|------|
| Keyframe generation | ~Free |
| Video generation | ~€0.50 per scene |
| Deployment | ~Free |
| **Total for 10-scene stream** | **~€5** |

At €49 price point, this leaves ~€40 margin for labor and overhead.

---

## Where Artistic Direction Matters Most

1. **The Production Spec** — All major artistic decisions happen here
2. **Keyframe Review** — Does the image capture the intended mood?
3. **Motion Review** — Does the movement enhance or distract?
4. **Final Review** — Does everything flow together?

The AI can handle execution, but human judgment is crucial for:
- Interpreting ambiguous customer briefs
- Catching subtle quality issues
- Ensuring emotional authenticity
- Making taste-based decisions

---

## Glossary

**Stream** — The final scroll-driven storytelling experience
**Segment** — One visual scene (one keyframe that becomes one video)
**Section** — One chunk of text (may use one or more segments)
**Keyframe** — The still image that defines a scene
**Motion prompt** — Description of how a scene should move
**Frame** — One still from the video, shown during scrolling
**Production spec** — The master blueprint for a stream
**Scroll-sync** — The system that connects reading position to visuals
