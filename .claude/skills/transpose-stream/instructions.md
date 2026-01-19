# Transpose Stream (Language Translation)

## When to Use
When creating a translated version of an existing stream in a new language. This skill covers copying a stream app and translating all text content while preserving visual assets.

## Critical Rule
**NEVER regenerate visual assets (keyframes, videos).** Only translate text. Copy the existing app and modify text content only.

## Steps

### 1. Create the new stream directory
```bash
cp -r streams/apps/[original-stream] streams/apps/[stream-id]-[lang]
```

Example: `cp -r streams/apps/bolyai streams/apps/bolyai-en`

### 2. Remove build artifacts
```bash
rm -rf streams/apps/[stream-id]-[lang]/.next
rm -rf streams/apps/[stream-id]-[lang]/node_modules
rm -rf streams/apps/[stream-id]-[lang]/.vercel  # Will be recreated on deploy
```

### 3. Update all files requiring translation

#### content.tsx
- Translate ALL text content in chapter/section components
- Keep proper nouns in original form (names, places) unless there's a well-known English equivalent
- Preserve component structure and styling

#### config.tsx
Update:
- `id` - Add language suffix (e.g., `'bolyai-en'`)
- `title` - Translate to target language

#### app/layout.tsx
Update ALL of the following:
- `DS_STREAM_ID` constant - Must match the new stream id
- `metadata.title` - Translated
- `metadata.description` - Translated
- `metadata.keywords` - Translated/relevant for target language
- `metadata.openGraph.title` - Translated
- `metadata.openGraph.description` - Translated
- `metadata.openGraph.images[].alt` - Translated
- `metadata.twitter.title` - Translated
- `metadata.twitter.description` - Translated

#### package.json
- Update `"name"` field to include language suffix

### 4. Create production spec (optional)
```bash
mkdir -p streams/specs/[stream-id]-[lang]
cp streams/specs/[original-stream]/production.json streams/specs/[stream-id]-[lang]/
```

Update in production.json:
- `stream_id`
- All `text_content` fields in sections
- `title`

### 5. Build and test locally
```bash
cd streams/apps/[stream-id]-[lang]
npm install
npm run build
npm run dev
```

### 6. Deploy to Vercel
```bash
cd streams/apps/[stream-id]-[lang]
vercel --prod
```

## Verification Checklist

After completing translation, verify NO source language text remains in:

- [ ] `content.tsx` - All visible text
- [ ] `config.tsx` - Stream id and title
- [ ] `app/layout.tsx` - DS_STREAM_ID matches new stream id
- [ ] `app/layout.tsx` - metadata.title
- [ ] `app/layout.tsx` - metadata.description
- [ ] `app/layout.tsx` - metadata.keywords array
- [ ] `app/layout.tsx` - openGraph.title
- [ ] `app/layout.tsx` - openGraph.description
- [ ] `app/layout.tsx` - openGraph.images[].alt
- [ ] `app/layout.tsx` - twitter.title
- [ ] `app/layout.tsx` - twitter.description
- [ ] `package.json` - name field updated

## Common Mistakes to Avoid

1. **Forgetting DS_STREAM_ID** - Analytics will track under wrong stream
2. **Leaving metadata in source language** - SEO and social sharing will show wrong language
3. **Translating proper nouns unnecessarily** - Keep "János Bolyai" not "John Bolyai"
4. **Regenerating assets** - This wastes time and money, visual assets are language-agnostic

## Language Suffix Convention

| Language | Suffix |
|----------|--------|
| English | `-en` |
| German | `-de` |
| French | `-fr` |
| Spanish | `-es` |
| Hungarian | (original, no suffix) |
