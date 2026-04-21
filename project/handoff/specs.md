# Component & motion specs

## Loading screen (≈2.6s)
- 280 wheat-grain meshes distributed on a Fibonacci sphere (target positions).
- Each starts from a random direction at distance 3–6, animates to target via cubic ease-out, per-grain delay ≤ 0.4.
- Bottom: mono caption "FAO · UN · WFP · UNEP FOOD WASTE INDEX 2024" fades in at 0.3s.
- Progress bar (220×1px, gold) above caption, bound to grain-assembly progress.
- On complete: overlay fades out over 1200ms, body reveals hero.

## Nav
- 80px tall at top → 56px after scrollY > 40.
- When scrolled: `background: rgba(10,9,8,0.6); backdrop-filter: blur(20px); border-bottom: 1px solid var(--hairline)`.
- Light mode: `background: rgba(246,239,216,0.7)`.
- Brand dot pulses (2.4s ease-out-expo loop, scale 1 ↔ 1.35).
- Nav links: mono 13px, `.08em` tracking, uppercase, underline grows in on hover.

## Custom cursor
- 8px cream dot (direct, no lerp).
- 40px trailing ring (lerp 0.18).
- On interactive targets (a, button, .flip-card, .fridge .door, .nav-icon-btn, .tweaks *): ring → 80px, border → accent; dot → 4px, accent.
- Hidden entirely on `pointer: coarse` and < 900px.

## Hero
- Title: Fraunces 900, opsz 144, letter-spacing -0.045em, line-height 0.82.
- Layout: `display: flex; flex-wrap: wrap; gap: 0 0.08em`. Words reveal with 80ms stagger, translateY 110% → 0, 800ms ease-out-expo.
- Globe slot: `clamp(80px, 14vw, 220px)` square, placed inline as the `?` punctuation. Vertical align ~+0.02em.
- Globe delay: 400ms after title words.
- Sub: Fraunces italic, opsz 144 wght 500, clamp(18px, 1.5vw, 22px), line-height 1.5.
- Background: 70 particles on a 2D canvas; cursor displaces them within 120px radius.

### Hero Three.js globe
- Sphere r=1, 64×64, near-black roughness 0.85, metalness 0.05, emissive #1a1816 @ 0.4.
- 300 hotspot dots (SphereGeometry r=0.018). Severity-colored:
  - sev > 0.6 → crimson (#BC4749)
  - 0.35–0.6 → amber (#F4A259)
  - else → gold (#E0CA3C)
- Hotspot clusters (lat, lon ranges, count, severity):
  - Sub-Saharan Africa: lat −15..15, lon 0..50, 80 dots, sev 0.7–1.0
  - South Asia: lat 5..30, lon 65..95, 50 dots, sev 0.6–1.0
  - SE Asia: lat −5..15, lon 95..125, 25 dots, sev 0.4–0.8
  - Latin America: lat −20..10, lon −80..−50, 30 dots, sev 0.3–0.7
  - Ambient: 120 dots, sev 0.1–0.3
- Ring: inner 1.08 / outer 1.10, amber @ 0.25, rotated PI/2.2.
- Lights: warm key DirectionalLight amber (1.4), crimson rim (0.7), ambient 0x3a3530 (0.5).
- Animation: y rotation 0.0035/frame, x oscillation sin(t·0.4)·0.05.

## Paradox (100vh)
- Grid `1fr auto 1fr` with center column 280×420 container.
- Counter animation: ease-out-quart (1 - (1-t)^4), 2500ms, triggered on `threshold: 0.25`.
- Counter font: mono 500, `clamp(48px, 8vw, 108px)`, `font-variant-numeric: tabular-nums`.
- Side eyebrows: `.08em` square color-coded (amber/crimson), mono 11px `.3em` uppercase.

### Three.js scale
- Scene: post + base + pivot-group beam + two pans.
- Tilt driven by scroll: `target = -0.1 - scrollProgress * 0.34` (final ≈ -0.44 rad).
- Interpolation: `tilt += (target - tilt) * 0.03` — gentle overshoot.
- Left pan: group of 60 wheat ellipsoids, random scale 0.6–1.4 × 1.6–2.8 × 0.6–1.4, rotated randomly.
- 18 falling fallers: vy = -0.01 to -0.03, reset to top when y < -1.6.
- Right pan: crimson bowl, black interior disk.
- Lights: cream directional (1.0), amber point (1.2, range 8), crimson point (0.8, range 8), ambient 0.3.

## Supermarket (Problem 01)
- Grid `1.25fr 1fr`, gap 96px.
- Scene aspect 4:5, two horizontal shelves at top 12% / 42%, height 28%.
- Items drop every 600–1500ms while the section is in view.
- Counter HUD top-left, glass `rgba(10,9,8,0.6) + blur(8px)`, 1px hairline border.
- Pull quote: Fraunces italic, clamp(32, 3.6vw, 48)px, gold, 2px gold left border, max 22ch.
- Paragraphs: word-reveal 30ms stagger, 800ms ease-out-expo, triggered once per paragraph.

## Fridge (Problem 02)
- Grid `1fr 420px 1fr`.
- Fridge: 3:5 aspect, linear-gradient body, inset warm glow that flickers 6s ease-in-out.
- 4 doors with `transform-origin: left center`, open → `perspective(900px) rotateY(-62deg)`.
- Inside each door: grid of `food` chips (mono), each with CO₂ tag (top right, amber).
- Panels: `rgba(22,21,19,0.5)` bg, 1px hairline, max-width 360px, word reveals on entry.
- Click toggles `.open`. Contents fade in 400ms after `.open` via opacity transition with 400ms delay.

## Solutions (100vh, green-tinted section)
- Section bg: `linear-gradient(180deg, var(--bg-deep) 0%, #0D1410 100%)`.
- 3 flip-cards, aspect 3:4, perspective 1400px.
- Flip on **click only** (brief spec: no hover-flip so mobile works).
- Magnetic hover: card's inner translates up to ±6px towards cursor.
- Flipped inner: `rotateY(180deg)` with combined translate applied in flipped state.
- Back: moss (#588157) bg, dark text, mono 64px number, Fraunces 22px body.

## Outro
- Min-height 120vh so the quote lands centered even during scroll overshoot.
- Quote: Fraunces 900 opsz 144, clamp(48, 9vw, 160)px, line 0.92, letter-spacing -0.045em.
- `<em>` inside quote switches to italic 500 + gold color.
- Word reveals, 60ms stagger, 900ms ease-out-expo.

## Footer
- 3-column grid: authorship / sources / artifacts.
- Source links: mono 13px cream with hairline underline; hover → accent.
- Bottom bar: mono 11px `.2em` muted, "No cookies. No trackers. No ads. Just facts." ↔ "↑ back to top".

## Tweaks panel (optional)
- Fixed bottom-right, 280px.
- Exposes: theme (dark/light), accent (amber/crimson/gold), motion (full/gentle/still).
- Persists via host edit-mode bridge (EDITMODE-BEGIN/END JSON block in main.js).

## Breakpoints

| Breakpoint | Changes |
|---|---|
| ≤ 900px | Paradox + Supermarket + Fridge grids collapse to 1 column; cursor disabled; nav links simplify; tweaks full-width |
| ≤ 600px | Hero sub font drops to 18px; solution cards stack; footer grid → 1 column |

## Motion tokens

```
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)
--dur-fast: 300ms  (gentle: 400, still: 0)
--dur: 600ms       (gentle: 800, still: 0)
--dur-slow: 900ms  (gentle: 1200, still: 0)
```

`prefers-reduced-motion: reduce` forces all durations to 0.
