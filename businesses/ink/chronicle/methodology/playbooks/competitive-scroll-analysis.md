# Playbook: Competitive Scroll-Driven Media Analysis

**Created:** 2026-01-07
**Used for:** Capsules.thirdroom.studio analysis

## Purpose

Systematically analyze a competitor's scroll-driven storytelling experience to extract:
- Visual techniques
- Animation patterns
- Text-visual relationships
- Color and emotional arcs
- Production implications for our pipeline

## Prerequisites

- Playwright MCP server configured and running
- Permission to take screenshots without prompts
- Target URL of the scroll experience

## Process

### 1. Initial Setup

Navigate to the target URL with full viewport:

```
playwright_navigate(url, width=1920, height=1080)
```

### 2. Systematic Scroll Capture

Take screenshots at regular intervals (300-500px recommended):

```
For scroll_position in range(0, total_height, 400):
    playwright_evaluate("window.scrollBy(0, 400)")
    playwright_screenshot(name=f"capture_{scroll_position}")
    Read the screenshot to analyze
```

### 3. Per-Screenshot Analysis

For each screenshot, document:
- **Scroll position** (px)
- **Scene description** (what's shown)
- **Visual-text relationship** (SYMBOLIC / LITERAL / METAPHORICAL SYNC)
- **Color palette** (warm/cold, specific colors)
- **Animation type observed** (if visible from previous frame comparison)
- **Text visible** (key phrases)

### 4. Scene Boundary Detection

A scene change is identified when:
- Subject matter completely changes
- Color palette shifts dramatically
- Composition resets

Note the scroll position of each transition.

### 5. Pattern Extraction

After full scroll, compile:

**Scene Map Table:**
| Scroll Range | Scene | Visual-Text Type | Palette | Animation Type |

**Animation Techniques:**
- Camera movements observed
- Subject animation types
- Transition techniques between scenes

**Color Arc:**
- Map the emotional journey through color
- Identify warm→cold shifts and their narrative purpose

**Production Implications:**
- What can we replicate?
- What tools/techniques are needed?
- What's the words-per-scene formula?

### 6. Documentation

Save the full analysis to:
- `chronicle/artifacts/analyses/[competitor]-analysis.md`
- Summarize key insights in the relevant skill file
- Update CHRONICLE.md if it represents a significant learning

## Example Output

See: `pipeline/skills/artistic-director/SKILL.md` (Capsules Deep Dive sections)

## Variations

**Quick scan:** 1000px increments, 5-6 screenshots total, for initial assessment
**Deep dive:** 300px increments, full documentation, for production learning
**Comparison:** Run on multiple competitors, create comparison table

## Time Estimate

- Quick scan: 15-20 minutes
- Deep dive (one capsule): 45-60 minutes
- Full analysis (multiple): 2-3 hours
