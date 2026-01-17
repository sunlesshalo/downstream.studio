# record-stream

Record a video of a stream scrolling through its content. Use when creating marketing videos, demos, or previews of streams.

## Steps

1. **Ensure the stream is running:**
   - Check if the dev server is running on the expected port (usually 3003)
   - If not, start it: `cd stream-<name> && npm run dev -- --port 3003`

2. **Ask the user for recording options:**

   Use AskUserQuestion to gather:

   **Duration** (header: "Duration")
   - 15 seconds - Quick teaser
   - 30 seconds - Standard preview (Recommended)
   - 45 seconds - Extended preview
   - 60 seconds - Full preview

   **Format** (header: "Format", multiSelect: true)
   - Desktop (1920x1080) - YouTube, Twitter (Recommended)
   - Mobile (390x844) - TikTok, Instagram Reels

   **Sections** (header: "Sections")
   - All sections - Record entire stream (Recommended)
   - Custom range - Specify start and end sections

3. **If custom range selected:**
   - List available sections from the stream config
   - Ask which sections to include (start and end)

4. **Run the capture script:**
   ```bash
   cd recordings
   node capture-frames.js <type> --duration <seconds> [--start <section>] [--end <section>] [--name <custom-name>]
   ```

   Examples:
   - Full stream, desktop: `node capture-frames.js desktop --duration 30`
   - Mobile, sections 0-3: `node capture-frames.js mobile --duration 20 --start 0 --end 3`
   - Both formats: Run twice with different types

5. **Report results:**
   - Show the output file paths
   - Show file sizes
   - Remind user where recordings are saved: `recordings/`

## Script Options

```
node capture-frames.js <type> [options]

Types:
  desktop    1920x1080 horizontal (16:9)
  mobile     390x844 vertical (9:16)

Options:
  --duration <seconds>   Recording duration (default: 30)
  --start <section>      Start from section ID or index
  --end <section>        End at section ID or index
  --name <name>          Custom output filename
  --port <port>          Dev server port (default: 3003)
  --url <url>            Custom URL (overrides port)
```

## Output

Videos are saved to: `recordings/<name>.mp4`

Default names:
- `desktop.mp4` for desktop format
- `mobile.mp4` for mobile format
