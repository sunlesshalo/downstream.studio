# Check API Version

## When to Use
Before integrating or modifying code that uses any external API (Stripe, OpenAI, Replicate, etc.).

## Steps

### 1. Identify the package
Find which npm/pip package wraps the API.

### 2. Check installed version
```bash
grep "package-name" package.json
# or for Python
pip show package-name
```

### 3. Search for latest stable version
Use WebSearch to find:
- `[package-name] latest version npm 2026` (use current year)
- Check the official changelog or releases page

### 4. Compare versions
If installed version is more than 1 major version behind, update.

### 5. Check API version string
Many APIs have version strings (like Stripe's `apiVersion`). Search for:
- `[API name] API version [current year]`
- Check what version string the latest SDK expects

### 6. Update if needed
- Update package.json with new version
- Update any `apiVersion` strings in code
- Run `npm install` or equivalent
- Test build to catch type errors

### 7. Verify types
Run the build. If there are type errors related to the API:
- Check if the types expect a specific version string
- Adjust to match what the SDK types allow

## Common APIs and their version patterns

| API | Package | Version Location |
|-----|---------|------------------|
| Stripe | `stripe` | `apiVersion` in constructor |
| OpenAI | `openai` | No version string needed |
| Replicate | `replicate` | No version string needed |
| Supabase | `@supabase/supabase-js` | No version string needed |

## Anti-pattern
Never copy-paste old API version strings from existing code without checking if they're current.
