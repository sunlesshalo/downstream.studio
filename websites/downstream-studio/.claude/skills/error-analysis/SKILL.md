# Error Analysis Skill

Structured failure analysis to prevent repeated mistakes.

## Trigger
Activate when:
- Debugging takes multiple attempts
- Same error appears twice
- User reports recurring issue

## Analysis Framework

When logging an error, capture:

### 1. Trigger
What exact action caused the error?

### 2. Category
- `hallucination` - Assumed something false
- `ignored_instruction` - Missed explicit requirement
- `wrong_approach` - Tried incorrect solution
- `context_loss` - Forgot earlier information
- `environment` - External system issue

### 3. Root Cause
Why did this happen? Focus on input variables:
- Missing information?
- Ambiguous requirement?
- Incomplete context?

### 4. Prevention
What specific change prevents recurrence?
- Add check to process?
- Update CLAUDE.md?
- Create new skill?

## Log Format

```markdown
[YYYY-MM-DD] [error]
Trigger: [what happened]
Category: [category]
Root Cause: [why]
Fix: [solution]
Prevention: [how to avoid]
```

## Example

```markdown
[2026-01-09] [error]
Trigger: npm run build failed with type error
Category: environment
Root Cause: New TypeScript version has stricter checks
Fix: Added explicit type annotation to function
Prevention: Run build before committing changes
```
