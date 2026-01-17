---
name: clear-thinking
description: Meta-cognitive check to catch reasoning errors, imprecise framing, and flawed logic. Use when making decisions, hitting walls, or during reviews.
---

# Clear Thinking - Reasoning Quality Check

## Goal
Catch my own reasoning errors before they compound into bad decisions. Distinguish between what's true, what I assume, and what I want to be true.

## When to Use
- Before making significant decisions (>€10 spend, pivots, new directions)
- When I've failed at something 2+ times
- When framing problems or conclusions
- During business reviews (built into rhythm)
- When I notice myself being certain about something
- User says "check your thinking", "are you sure", "think again"

---

## CORE QUESTIONS

### 1. Temporary vs. Fundamental?

**The photorealism error pattern:**
- I said: "Photorealism doesn't work for scroll-based content"
- Truth: "Our current tools can't reliably produce photorealistic content with enough movement quality YET"

**Ask myself:**
- Is this limitation temporary (tools, skills, knowledge) or fundamental (physics, logic, definition)?
- Will this likely change in 6 months? 2 years?
- Am I closing a door that should stay open?

**Template:**
```
Instead of: "[X] doesn't work"
Say: "Our current [tools/process/skills] can't reliably do [X] yet because [specific reason]"
```

### 2. Evidence vs. Assumption?

**Check each belief:**
- Did I observe this directly?
- Did I test this?
- Am I assuming based on pattern matching?
- Would Ferenc ask "how do you know that?"

**Red flags:**
- "Obviously..."
- "Everyone knows..."
- "It's clear that..."
- Strong certainty without recent testing

**Action:** If I can't point to specific evidence, mark as assumption and test before acting on it.

### 3. Am I Solving the Right Problem?

**Before diving into solutions, ask:**
- What's the actual problem?
- Whose problem is it?
- What would solving it change?
- Is this the highest-leverage problem to solve right now?

**Red flag:** Spending hours on something that wouldn't matter even if solved.

### 4. What Would Disprove This?

**For any conclusion:**
- What evidence would make me change my mind?
- Have I looked for that evidence?
- Am I avoiding looking for it?

**If I can't answer what would disprove it → I might be rationalizing, not reasoning.**

### 5. Am I Generalizing from Too Little?

**Check sample size:**
- How many times did I actually try this?
- Were the conditions the same each time?
- Could there be variation I haven't seen?

**Example error:** "Video model X doesn't work" after 1 failed attempt with 1 prompt.

---

## COMMON REASONING ERRORS

### Confirmation Bias
**Pattern:** Only noticing evidence that supports what I already believe.
**Fix:** Actively look for counter-examples before concluding.

### Sunk Cost Fallacy
**Pattern:** Continuing something because I've already invested in it.
**Fix:** Ask "If I were starting fresh today, would I do this?"

### Anchoring
**Pattern:** Over-weighting the first piece of information.
**Fix:** Actively seek alternative framings before deciding.

### Availability Bias
**Pattern:** Overweighting recent or memorable examples.
**Fix:** Check: "Is this actually common, or just salient?"

### False Dichotomy
**Pattern:** Treating a complex situation as binary (either/or).
**Fix:** Ask: "What's a third option? A fourth?"

### Scope Insensitivity
**Pattern:** Not properly weighing magnitude differences.
**Fix:** Put numbers on things. €5 vs €500 matters.

### Planning Fallacy
**Pattern:** Underestimating time, cost, or complexity.
**Fix:** Base estimates on similar past tasks, not optimistic projection.

---

## FRAMING PRECISION CHECKLIST

Before making statements, especially about limitations or conclusions:

| Check | Question |
|-------|----------|
| **Scope** | Does my statement apply to all cases, or just what I tested? |
| **Temporality** | Is this always true, or true now with current tools? |
| **Causality** | Do I know WHY, or just that it happened? |
| **Attribution** | Is this the tool's fault, my prompt's fault, or the approach's fault? |
| **Alternatives** | Have I considered other explanations? |

### Good vs. Bad Framing Examples

| Bad | Good |
|-----|------|
| "X doesn't work" | "X didn't work in my test because [reason]. Might work if [condition]." |
| "This is impossible" | "I haven't found a way to do this yet. Tried: [list]" |
| "Users want X" | "The 3 users I talked to mentioned X. Need more data." |
| "We should definitely do X" | "X seems promising because [evidence]. Risks: [list]" |

---

## DECISION-MAKING PROCESS

For significant decisions (>€10, pivots, new directions):

### Step 1: State the decision clearly
What exactly am I deciding?

### Step 2: List options
At least 3 options, including "do nothing"

### Step 3: For each option, ask:
- What evidence supports this?
- What evidence contradicts this?
- What assumptions am I making?
- What would I need to believe for this to be the right choice?

### Step 4: Pre-mortem
Imagine it's 3 months later and this decision failed badly. Why did it fail?

### Step 5: Reversibility check
- Is this easily reversible? → Decide faster, learn from results
- Is this hard to reverse? → Get more evidence first

### Step 6: Log the decision
In CONTEXT.md:
```
[decision] Decided to [X] because [reasons].
Alternatives considered: [Y, Z]
Key assumptions: [list]
Would reconsider if: [conditions]
```

---

## TRIGGER PHRASES

If I catch myself saying/thinking these, pause and check:

| Phrase | What to check |
|--------|---------------|
| "Obviously..." | Is this actually obvious, or am I assuming? |
| "Everyone knows..." | Do I have evidence others believe this? |
| "We have to..." | Do we? What happens if we don't? |
| "There's no way to..." | Have I exhausted options, or given up early? |
| "This always..." | Always? What's my sample size? |
| "It's impossible to..." | Fundamentally impossible, or just hard/unknown? |

---

## INTEGRATION WITH OTHER SKILLS

### In business-rhythms (weekly/monthly reviews):
- Include "Clear thinking check" section
- Review major decisions for reasoning quality
- Look for patterns in errors

### In verify-quality:
- After 3 failed attempts, run clear-thinking before escalating
- Am I solving the right problem?
- Is my approach sound?

### In logging to CONTEXT.md:
- For decisions, include assumptions
- For discoveries, distinguish evidence vs. inference

---

## SELF-ASSESSMENT

Periodically ask:

1. What's a belief I held strongly that turned out wrong?
2. What would change my mind about our current strategy?
3. What am I avoiding thinking about?
4. What would Ferenc challenge in my reasoning?
5. What would a skeptic say?

---

## OUTPUT

When running this skill explicitly:

```markdown
## Clear Thinking Check - [DATE]

**Topic:** [What I'm evaluating]

**Current belief/conclusion:**
[What I think is true]

**Evidence for:**
- [List specific evidence]

**Evidence against:**
- [List or note if I haven't looked]

**Key assumptions:**
- [What I'm assuming without proof]

**Temporary vs. fundamental:**
[Assessment]

**Framing check:**
[Is my language precise?]

**Verdict:**
[Belief stands / Needs revision / Needs more evidence]

**Action:**
[What I'll do differently]
```
