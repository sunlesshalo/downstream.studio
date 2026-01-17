# Session Protocol Skill

Manages session lifecycle for consistent context preservation.

## Trigger
Active throughout all sessions.

## Feature Lifecycle

```
failing → in_progress → (verify) → passing
```

### Rules
1. All new features start as `failing`
2. Set to `in_progress` when you begin work
3. **Verify** the feature works (tests, manual check, browser)
4. Set to `passing` ONLY if verification succeeds
5. Never delete feature descriptions - only modify status
6. Never mark `passing` without explicit verification

## Memory Management

### STATE.json
- Source of truth for what to work on
- Update `current_focus` when switching tasks
- Update feature `status` and `verified` fields

### CONTEXT.md
- Append-only log of session activities
- Use tags: `[error]`, `[discovery]`, `[decision]`
- Keep lean - archive when > 300 lines

## Clean Handoff Requirements

Before ending session:
1. Code must be merge-ready (no debug logs)
2. Tests should pass
3. Memory files must be updated
4. Git status should be clean or changes staged

## Anti-Circle Rule

Before debugging:
```bash
grep -i "keyword" memory/CONTEXT.md
```

If found → use existing solution
If new → solve and log it
