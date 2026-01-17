# /recall - Search Past Context

Search memory for past solutions before debugging.

## Usage

```
/recall [keyword]
```

## Steps

1. Search CONTEXT.md for keyword:
   ```bash
   grep -i "keyword" memory/CONTEXT.md
   ```

2. If found:
   - Present the relevant entry
   - Apply existing solution

3. If not found:
   - Proceed with debugging
   - Log solution when found using `/log error`

## Anti-Circle Rule

Before solving ANY recurring problem:
1. Run `/recall` with relevant keyword
2. Check if solution already exists
3. Only proceed with new debugging if no match

This prevents wasting time re-solving known problems.
