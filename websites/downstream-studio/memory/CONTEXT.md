# Downstream Landing - Session Context

## Project Overview
Landing page for Downstream Studio - a scroll-driven visual storytelling platform.
Single-page site with hero, demo iframe embed, and booking CTA.

---

## Session Log

### 2026-01-09 - Initial Setup

[discovery] Project structure established with Next.js 15, static export
[discovery] Demo iframe embeds Az Ehseg stream from vercel deployment
[discovery] Agent template implemented for session persistence

### 2026-01-14 - Scroll Behavior & Floating Button

[problem] Iframe scroll trapping - users could not scroll from stream section to rest of landing page
[attempted] Multiple approaches: scroll-snap mandatory, escape zones with wheel handlers, sticky positioning
[solution] CSS scroll-snap-type: y proximity on page + scroll-snap-align: start on stream and transition sections
[limitation] Scroll out only works from "Tell Us Your Story" CTA button area, not from within stream

[feature] Added floating scroll button (bottom-right corner)
- Shows down arrow when in stream section → scrolls to content
- Shows up arrow when below stream → scrolls back to stream top
- Bouncing animation, hover glow effect

[deployed] Changes live at https://downstream.studio

---

## Key URLs
- Demo stream: https://downstream-stream-az-ehseg-v2.vercel.app/
- Booking: https://cal.com/ferencz-csuszner/30min

## Design Constraints
- Dark theme with warm accent (#d4a056)
- Georgia serif font
- Minimal, elegant aesthetic
- DO NOT change visual design without explicit request

---

## Patterns & Solutions

<!-- Add solutions to recurring problems here -->

---

## Decisions

[decision] Using iframe for demo to isolate stream app complexity
[decision] Mobile shows direct link instead of iframe for better UX

---

## Errors & Fixes

[error] CSS class names didn't match JSX component classes
- Old CSS used: .hero-section, .site-header, .cta-button, .scroll-indicator
- JSX uses: .hero, .header, .cta, .scroll-hint
- Fix: Rewrote globals.css to match component structure
- Prevention: Always verify CSS selectors match JSX classNames

## 2026-01-09 - Chrome Iframe Bug

[error] Chrome iframe animation disappearing on scroll between hero/stream sections
- Started after removing snap scrolling
- FAILED CSS fixes: z-index (200/250/300), transform translateZ(0), backface-visibility hidden, isolation isolate, will-change contents, contain layout style, content-visibility visible
- Need JavaScript solution to force iframe repaint during scroll

## 2026-01-09 - Chrome Mobile Canvas Bug SOLVED

[error] Chrome mobile: canvas inside iframe disappears during scroll transitions
- Root cause: Chrome "sleeps" canvas rendering when it thinks nothing is happening
- Scrolling "wakes it up" - animation reappears when user scrolls

[solution] Two-part fix:
1. Mobile iframe is position: fixed (z-index: 1), hero covers it (z-index: 10)
2. Continuous CSS animation on iframe keeps Chrome rendering:
   ```css
   animation: keepCanvasAlive 2s linear infinite;
   @keyframes keepCanvasAlive {
     0%, 100% { transform: translate3d(0, 0, 0); }
     50% { transform: translate3d(0, 0.5px, 0); }
   }
   ```

[discovery] Chrome pauses canvas rendering in iframes to save resources
[discovery] Continuous transform animation prevents Chrome from pausing canvas
