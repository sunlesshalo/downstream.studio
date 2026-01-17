# /log - Log Context Entry

Log a discovery, error, or decision to CONTEXT.md.

## Usage

```
/log [type] [message]
```

Types:
- `discovery` - Something learned about the codebase or system
- `error` - A problem and its solution
- `decision` - Why a choice was made

## Format

Append to `memory/CONTEXT.md`:
```
[YYYY-MM-DD HH:MM] [type] message
```

## Example

```
/log decision Using lazy loading for iframe to improve initial page load
```

Results in:
```
[2026-01-09 10:30] [decision] Using lazy loading for iframe to improve initial page load
```
