# Pattern: Deterministic Scaffolding for Probabilistic Agents

**Discovered:** 2026-01-10
**Context:** Capsule analysis task where Claude drifted from rigorous analysis to superficial coverage

---

## The Problem: Agent Drift

When given a complex task, an LLM agent can drift mid-execution:

1. **Goal substitution**: Replace the actual goal with an easier one that feels like progress
   - Actual goal: "Analyze with same rigor as reference"
   - Substituted goal: "Map all scenes quickly"

2. **Completion bias**: Delivering something complete feels like success, even if it's not what was needed

3. **Local optimization**: Each step seems reasonable ("let me speed up") without checking if it serves the real goal

4. **Lost context**: Forgetting WHY we're doing the task, getting caught in mechanics

**Example:** Asked to analyze Capsule #2 with Capsule #1's rigor. Started with 800px screenshot intervals, acknowledged 100px was needed, did 100px for one scene, then drifted back to 500-1000px intervals. Delivered surface-level scene map instead of detailed motion/element analysis.

---

## The Solution: Deterministic Scaffolding

Separate tasks into:

| Layer | Type | What it does |
|-------|------|--------------|
| **Scaffolding** | Deterministic (code/script) | Controls iteration, enforces intervals, validates completeness |
| **Analysis** | Probabilistic (agent) | Does the creative/analytical work within constraints |

The agent cannot skip steps because the scaffolding controls the loop.

---

## Implementation Approaches

### 1. Script-Controlled Iteration

**Bad:** Agent decides when to screenshot
```
Agent: "I'll take screenshots... 800px should be fine... actually let me speed up..."
```

**Good:** Script controls capture, agent only analyzes
```python
for position in range(0, total_height, 100):
    screenshot(position)
# Agent receives ALL screenshots, cannot skip
```

### 2. Mandatory Checklists in Skills

The skill definition includes verification:
```markdown
## Before Completing

Verify each item:
- [ ] Every screenshot has an analysis entry
- [ ] Each entry includes: camera movement, subject motion, elements, color
- [ ] Output structure matches reference template
```

### 3. Staged Completion with Gates

Break task into phases. Each phase must pass verification before next:

1. **Capture** (deterministic) → Output: N screenshots
2. **Analyze batch 1** → Verify: 10 entries with all fields
3. **Analyze batch 2** → Verify: 10 entries with all fields
4. ...continue until all batches done

### 4. Reference Anchoring

Keep the reference visible during task. Require explicit comparison:
- "Does your Scene 3 analysis contain the same categories as Reference Scene 3?"
- If no → incomplete

### 5. Accountability Logging

Log each step as it happens:
```
[12:01] Analyzed screenshot 0000: camera=push-in, subject=person+orb, elements=[sky, clouds, lightning]
[12:02] Analyzed screenshot 0100: camera=continuing push, subject=pose changed...
```

The log becomes evidence of whether work was done.

---

## Key Insight

The goal is NOT to replace the AI agent with automation. That removes the agent from the equation.

The goal IS to give the agent deterministic structure that prevents drift while preserving agency for the actual analytical/creative work.

**Analogy:** A human analyst given a spreadsheet template can't skip columns. The template enforces completeness. But the analysis itself is still human judgment.

---

## When to Apply

Use deterministic scaffolding when:
- Task has many repetitive steps (analyze 200 screenshots)
- Quality requires consistency (same depth for each item)
- Drift risk is high (long tasks, temptation to shortcut)
- Output must be verifiable (checklist possible)

Don't over-apply when:
- Task requires fluid creative exploration
- Structure would constrain necessary flexibility
- The "right" approach isn't known yet

---

## Open Questions

1. How much scaffolding is too much? When does it constrain useful flexibility?
2. Can the agent learn to self-scaffold over time?
3. How do we detect drift in real-time, not just after the fact?
4. What's the right batch size for staged completion?

---

## Related

- Goal substitution as cognitive bias
- Completion bias in AI systems
- Human-AI collaboration patterns
- Quality gates in software development

---

*This pattern emerged from a failed task and subsequent reflection. The failure was necessary to discover the solution.*
