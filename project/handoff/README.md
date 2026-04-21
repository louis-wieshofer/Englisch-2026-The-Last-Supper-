# The Last Supper? — Claude Code Handoff

A scrollytelling one-pager on the global food waste paradox.

**Authors:** Louis Wieshofer & Ferdinand Kraetschmer · 2026

## Build target

- **Stack:** Vite + vanilla JS, no React, no heavy frameworks
- **Runtime deps:** Three.js (r160+), GSAP 3 (w/ ScrollTrigger), Lenis (v1+)
- **Output:** static site, no backend, no auth
- **Browsers:** latest 2 Chrome / Firefox / Safari; degrades on reduced-motion & mobile
- **Dark mode is canonical.** Light mode optional via nav toggle.

## Deliverables in this folder

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens — copy into `src/styles/tokens.css` |
| `specs.md` | Per-section component / motion / breakpoint specs |
| `copy.md` | Final copy, locked. Source-attributed. |
| `assets-checklist.md` | What the dev must source (icons, audio, etc.) |

## Project structure to target

```
src/
  main.js                  — Lenis init, GSAP registration, section orchestrator
  styles/
    tokens.css             — from handoff
    base.css               — reset + type
    sections/*.css         — one per section
  scenes/
    heroGlobe.js           — Three.js globe w/ hunger heatmap
    paradoxScale.js        — Three.js balance
    loader.js              — assembling-grain intro
  sections/
    nav.js, hero.js, paradox.js, supermarket.js, fridge.js, solutions.js, outro.js, footer.js
  ui/
    cursor.js              — custom cursor
    magnetic.js            — magnetic button pull
    splitText.js           — word-by-word reveals
    tweaks.js              — optional on-page tweak panel
index.html
```

## Prototype reference

The HTML prototype at `../The Last Supper.html` is a full working reference — 
all copy, layout, counters, cursor behavior and a real Three.js globe + scale 
are implemented there. Treat it as the design spec in executable form. The 
stylized supermarket / fridge / solution cards in the prototype are 
CSS-driven placeholders; the production Three.js versions are listed in 
`specs.md`.

## Non-negotiables

1. Smooth scroll (Lenis, lerp ≈ 0.08). No jank, no snap.
2. `prefers-reduced-motion` must kill all non-essential motion.
3. All statistics attributed in footer.
4. No emoji. No stock photography. No grinning children with vegetables.
5. Custom cursor hidden on coarse pointers (mobile).
6. All Three.js scenes lazy-loaded + paused out of viewport.

## Success check

- Lighthouse Performance ≥ 85 on throttled mobile.
- All reveals, counters, and scroll-driven tilts land within one section of the fold.
- The globe is the punctuation. Not next to it — *is* it.
