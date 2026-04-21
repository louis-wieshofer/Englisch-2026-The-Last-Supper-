# Assets the dev must source or confirm

## Fonts (Google Fonts, already wired)

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..900,0..100;1,9..144,400..900,0..100&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

## Libraries

| Lib | Version | Purpose |
|---|---|---|
| three | ^0.160 | Hero globe, scale, loader |
| gsap | ^3.12 | ScrollTrigger-driven reveals + counter timing |
| @studio-freight/lenis | ^1.1 | Smooth inertia scroll (lerp 0.08) |

No React. No Next. No CSS-in-JS.

## Icons
- Nav audio icon, theme icon, footer handoff/frames icons: inline SVG (already in prototype HTML — lift verbatim).
- No external icon sets.

## Audio (decorative only for this class demo)
- Button exists in nav, wired to no audio source.
- If you ship real audio later: short (≤20s) CC0 wheat-field + kitchen-hum loops, autoplay muted, 44.1kHz mono, loudness ≈ -23 LUFS.

## 3D assets
- None required. Everything is procedural Three.js primitives. Do **not** import GLTFs.

## Images
- None. This is a type-first editorial piece by design.

## Favicon
- 32×32 and 180×180 — a single amber `?` on warm black, Fraunces 900. Export as PNG.
