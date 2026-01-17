# Transpose Stream Skill

Translate an existing stream to a different language while preserving structure, styling, and animations.

## CRITICAL RULE

**The ONLY change should be the text/language. Everything else must be IDENTICAL to the source stream.**

If the source stream works, the transposed stream will work - as long as you copy everything exactly.

## When to Use

- Client wants their stream in multiple languages
- Translating a demo stream for international audiences
- Creating localized versions of existing content

## Required Inputs

1. **Source stream path**: The EXACT location of the working source stream
2. **Target language**: Language code and name (e.g., `en`, English)
3. **Translated text**: The full translated content
4. **New stream ID**: Slug for the new stream (e.g., `flight-of-ravens`)
5. **Metadata**: Title, description, author credits, publication source

## Workflow

### Step 1: Locate the Source Stream

**IMPORTANT**: The source stream may NOT be in the downstream repo. Common locations:
- `/Users/ferenczcsuszner/Coding/experiments/AIrunBusiness/stream-*`
- `/Users/ferenczcsuszner/Coding/2026/downstream/stream-*`

Find the exact source:
```bash
# Search for the stream by name
find /Users/ferenczcsuszner/Coding -name "stream-*" -type d 2>/dev/null | grep -i "{stream-name}"
```

### Step 2: Study the Source Structure

Before copying, READ the source files to understand:
- `config.tsx`: Segment-to-section mappings (DO NOT CHANGE THESE)
- `content.tsx`: Text structure (continuous paragraphs vs separate `<p>` tags)
- Engine location: Is it `./engine/` or `./packages/engine/`?

```bash
cat {source-path}/config.tsx
cat {source-path}/content.tsx
ls {source-path}/
```

### Step 3: Copy the Entire Source Stream

```bash
cp -r {source-stream-path} stream-{target-id}
```

Remove build artifacts:
```bash
rm -rf stream-{target-id}/.next stream-{target-id}/.vercel stream-{target-id}/node_modules
```

### Step 4: Update ONLY What Needs Changing

#### config.tsx - Minimal changes:
```typescript
export const streamConfig: StreamConfig = {
  id: '{new-id}',           // Change this
  title: '{Translated Title}', // Change this
  // KEEP EVERYTHING ELSE IDENTICAL:
  // - segments array: UNCHANGED
  // - sections array: UNCHANGED (same segment mappings!)
  // - theme: UNCHANGED
}
```

#### content.tsx - Text only:
- Replace all text with translations
- **PRESERVE EXACT STRUCTURE**:
  - If source has one long `<p>` tag, keep one long `<p>` tag
  - If source has multiple `<p>` tags, keep multiple
  - Keep same component names
  - Keep Dialogue components exactly as used
  - Keep inline styles

#### app/layout.tsx:
- Update `title` and `description`
- Change `lang` attribute

#### package.json:
- Change `name`
- Change port number

### Step 5: Test with Debug Mode

```bash
cd stream-{target-id}
npm install
npm run dev
```

Open in browser with debug mode: `http://localhost:{port}/?debug=true`

The debug overlay shows:
- Current segment and frame
- Global frame number
- Pixels per frame
- Section positions

Verify:
- [ ] All frames load (check "Frame X/Y" in debug)
- [ ] Animations sync with scrolling
- [ ] All text displays correctly
- [ ] Segment transitions work smoothly

### Step 6: Deploy

```bash
cd stream-{target-id}
vercel --prod
```

## Common Mistakes to AVOID

### 1. Inventing segment mappings
**WRONG**: Looking at the source and deciding "3 segments per section seems right"
**RIGHT**: Copy the exact `sections.segments` arrays from source

### 2. Changing content structure
**WRONG**: Breaking a continuous paragraph into multiple `<p>` tags for "readability"
**RIGHT**: Match the source structure exactly, then optionally adjust AFTER verifying it works

### 3. Using wrong engine
**WRONG**: Copying packages/engine from downstream
**RIGHT**: Keep the engine that came with the source stream

### 4. Adding minHeight or other properties
**WRONG**: Adding `minHeight` to sections because "it might help"
**RIGHT**: Only add what the source has

## Debugging

If animation doesn't work correctly:
1. Open with `?debug=true`
2. Compare debug info with source stream
3. Check: Are all frames loading? (Frame X/1410 should reach 1410)
4. Check: Is segment changing as you scroll?

If frames aren't loading:
1. Check `/public/frames/` directory exists with all segment folders
2. Verify frame file naming matches source (e.g., `frame_0001.webp`)

## Example: Hollókröpte → Flight of Ravens

Source: `/Users/ferenczcsuszner/Coding/experiments/AIrunBusiness/stream-stream-1767890796051-fhmnte/`
Target: `stream-flight-of-ravens`

Key learnings:
- Source had engine in `./engine/` not `./packages/engine/src`
- Source had segments: [1,2,3], [4,5,6,7], [8,9,10] - not [1,2,3], [4,5,6], [7,8,9,10]
- Source used continuous `<p>` tags - later broke into paragraphs for readability
- Had to copy founding-story engine which had the working scroll sync

Changes made:
- `id`: `stream-1767890796051-fhmnte` → `flight-of-ravens`
- `title`: `Hollók röpte` → `Flight of Ravens`
- `lang`: `hu` → `en`
- All Hungarian text → English translation
- Added credits section

## Checklist

- [ ] Found exact source stream location
- [ ] Read source config.tsx to understand segment mappings
- [ ] Copied entire source stream (not a different stream)
- [ ] Removed build artifacts
- [ ] Updated ONLY: id, title, text content, lang, package name/port
- [ ] Kept IDENTICAL: segments, section.segments mappings, theme, engine
- [ ] Tested with `?debug=true`
- [ ] All frames load correctly
- [ ] Deployed to Vercel
