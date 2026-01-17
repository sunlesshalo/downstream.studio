# /start - Session Startup

Begin each session with this ritual to restore context.

## Steps

1. **Confirm environment**
   ```bash
   pwd && ls -la
   ```

2. **Check git status**
   ```bash
   git status
   ```

3. **Read current state**
   - Read `memory/STATE.json` for current focus and feature status
   - Read last 30 lines of `memory/CONTEXT.md` for recent discoveries/errors

4. **Check recent commits**
   ```bash
   git log --oneline -5
   ```

5. **Run init script if exists**
   ```bash
   [ -f init.sh ] && bash init.sh
   ```

## Output Format

Present a summary:
```
Environment: [confirmed/issue]
Current Focus: [from STATE.json]
Active Features: [list failing/in_progress features]
Recent Context: [key points from CONTEXT.md]

Ready to continue with [next feature]?
```
