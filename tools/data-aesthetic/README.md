# Data Aesthetic Tool

Transform organic motion (jellyfish, smoke, fluids) into abstract data visualization aesthetics — particles, numbers, lines, glow.

## Features

- **Motion Extraction**: Simplified optical flow from video frames
- **Particle System**: GPU-accelerated particles that follow flow fields
- **Line Traces**: Vector field visualization with fading trails
- **Number Overlays**: Floating numeric data that spawns in high-motion areas
- **Post-Processing**: Bloom/glow effects for sci-fi aesthetic
- **Real-time Controls**: Live parameter tweaking via Leva

## Quick Start

```bash
cd tools/data-aesthetic
npm install
npm run dev
```

Open http://localhost:3000

## Usage

1. **Drop a video file** onto the canvas (or click "Load Sample Video")
2. **Press Play** to start motion extraction
3. **Tweak parameters** in the control panel (top-right)
4. **Export frames** (coming soon) for use in DownStream

## Architecture

```
src/
├── core/
│   ├── FlowField.ts      # Optical flow computation
│   ├── ParticleSystem.ts # GPU particle advection
│   ├── LineTracer.ts     # Vector field lines
│   └── NumberField.ts    # Numeric overlay system
├── components/
│   └── DataAestheticApp.tsx  # Main React component
├── hooks/
│   └── useVideoSource.ts # Video loading/playback
├── presets/
│   ├── default.json      # Balanced preset
│   ├── tech-minimal.json # Sparse, blue/cyan
│   └── organic-dense.json # Warm, high density
└── shaders/              # (future: custom GLSL)
```

## Presets

| Preset | Style | Use For |
|--------|-------|---------|
| Default | Balanced cyan/green | General use |
| Tech Minimal | Sparse blue | Clean, futuristic |
| Organic Dense | Warm orange | Nature, life forms |

## Integration with DownStream

This tool can be integrated as a new renderer style for streams:

1. Export as `DataAestheticRenderer.tsx`
2. Add to `factory/templates/stream-app/engine/components/`
3. Configure per-segment renderer in production.json

See CLAUDE.md architecture docs for integration details.

## Dependencies

- Three.js + React Three Fiber
- @react-three/postprocessing (bloom effects)
- Leva (parameter controls)
- CCapture.js (frame export - planned)

## Roadmap

- [ ] Frame sequence export
- [ ] Audio reactivity
- [ ] Custom shader editor
- [ ] Integration as DownStream renderer
- [ ] More presets
