# /checkpoint - Session End

Save progress and prepare clean handoff.

## Steps

1. **Verify current work**
   - Run tests if applicable
   - Check for errors in console
   - Ensure code is clean and merge-ready

2. **Update memory files**
   - Update `memory/STATE.json`:
     - Set `current_focus` to next task
     - Update feature statuses (only if verified!)
   - Append to `memory/CONTEXT.md`:
     - What was accomplished
     - Any discoveries or errors
     - What to do next

3. **Git status check**
   ```bash
   git status
   ```

4. **Commit if appropriate**
   - Only commit if user approves
   - Use descriptive commit message

## Rules

- NEVER mark a feature as `passing` without verification
- Code must be merge-ready (no debugging logs, clean formatting)
- Update memory files BEFORE committing

## Output Format

```
Session Summary:
- Completed: [list]
- In Progress: [list]
- Next Focus: [from STATE.json]

[Uncommitted changes: X files]
Ready to commit? (y/n)
```
