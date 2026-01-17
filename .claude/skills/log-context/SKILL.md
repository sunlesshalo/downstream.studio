---
name: log-context
description: Log important context to memory. Use when discovering something important, solving an error, or making a decision that should be remembered for future sessions.
---

# Log Context

## Goal
Persist important learnings so they're available in future sessions.

## When to Use
- After solving an error or bug
- When discovering something about the data, API, or system
- When making a decision that affects future work

## Steps
1. Determine the category:
   - `[error]` - Problem and its solution
   - `[discovery]` - Something learned about the system/data
   - `[decision]` - A choice made and why

2. Format the entry:
   - `[error] Problem description → solution`
   - `[discovery] What was learned`
   - `[decision] What was decided and why`

3. Append to `memory/CONTEXT.md` under the **Notes** section

4. Confirm what was logged

## Examples

```markdown
- [error] API returns 429 on bulk requests → add 100ms delay between calls
- [discovery] Customer IDs starting with "TEST_" are sandbox accounts
- [decision] Using pagination of 50 items because API times out at 100+
```
