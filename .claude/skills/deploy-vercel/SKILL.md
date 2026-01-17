# Deploy to Vercel

## Goal
Deploy apps to the correct Vercel project without creating duplicates.

## When to Use
- Deploying any app to Vercel (streams, websites, etc.)

## Critical Rules

1. **NEVER deploy without checking the .vercel/project.json first**
2. **NEVER let Vercel auto-create a new project** — always link to existing
3. **ALWAYS verify after deployment** that no duplicate was created

## Project Reference

| App | Vercel Project | Production URL |
|-----|----------------|----------------|
| downstream-studio | `downstream.studio` | www.downstream.studio |
| downstream-ink | `web` | www.downstream.ink |
| stream apps | `stream-{name}` or `{name}` | {name}.vercel.app |

## Deployment Steps

### 1. Check Current Link

```bash
cat .vercel/project.json
```

If missing or wrong project, go to step 2. Otherwise skip to step 3.

### 2. Link to Correct Project

```bash
# Use -p flag to specify project name
vercel link -p PROJECT_NAME --yes
```

Examples:
```bash
vercel link -p downstream.studio --yes   # for downstream-studio folder
vercel link -p stream-bolyai --yes       # for bolyai stream
```

**To find existing project names:**
```bash
vercel project ls 2>&1 | grep -i KEYWORD
vercel project ls --next TOKEN   # for older projects
```

### 3. Build

```bash
npm run build
```

### 4. Deploy

```bash
vercel --prod --yes
```

### 5. Verify No Duplicate Created

```bash
vercel project ls 2>&1 | grep -i KEYWORD
```

Should show exactly ONE project for this app.

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Deploying to wrong project | Check .vercel/project.json FIRST |
| Creating duplicate project | Use `vercel link -p NAME` before deploying |
| Folder name doesn't match project | Always use `-p` flag explicitly |
| Forgetting to verify | Run `vercel project ls` after EVERY deployment |

## Cleanup: Delete Duplicate Project

```bash
echo "y" | vercel project rm DUPLICATE_NAME
```

## Quick Deploy (When Already Linked Correctly)

```bash
npm run build && vercel --prod --yes
```
