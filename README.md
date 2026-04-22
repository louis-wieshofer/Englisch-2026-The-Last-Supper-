# The Last Supper?

A scrollytelling essay on the paradox of global food waste and world hunger. Built as a senior-level portfolio showcase and as an English class project — the same codebase ships to GitHub Pages **and** packages into a Windows `.exe` via Electron.

Live site: https://louis-wieshofer.github.io/Englisch-2026-The-Last-Supper-/

## Stack

- **Vite** + **TypeScript** (strict mode) — zero framework, hand-written modular classes
- **Three.js** for the hero globe, paradox scale, supermarket aisle, interactive fridge, and the grain-assembly loading screen
- **GSAP** + **ScrollTrigger** for reveals, counters, and drawer tweens
- **Lenis** for smooth scrolling (native scroll preserved when `prefers-reduced-motion`)
- **Electron** + **electron-builder** for the portable Windows executable

## Commands

```bash
npm install              # install dependencies
npm run dev              # Vite dev server on http://localhost:5173
npm run typecheck        # strict TypeScript check (no emit)
npm run build            # production build to dist/
npm run preview          # serve the built dist/ locally
npm run electron:dev     # build + launch Electron wrapper (local smoke test)
npm run electron:build   # build portable Windows .exe (use the CI workflow on non-Windows hosts)
```

## Sections

1. **Hero** — globe with hunger-severity heatmap + 500 instanced wheat-grain particles that repel from the cursor via a fragment shader.
2. **Paradox** — two counters (1.3 billion tons wasted / 828 million hungry) flanking a Three.js tipping scale whose tilt is scroll-linked.
3. **Supermarket** — low-poly aisle where items periodically arc from the shelves into a dumpster, plus a HUD counter, pull quote, and word-by-word scroll reveals.
4. **Fridge** — procedural fridge with three clickable drawers. Each drawer opens via raycaster + GSAP tween, revealing labeled food items.
5. **Solutions** — three flip cards with magnetic hover, moss-green back faces, click-to-flip (keyboard-accessible).
6. **Outro** — closing quote with scroll-in word reveal.
7. **Footer** — three-column layout with sources, GitHub link, .exe download link, and a "No cookies. No trackers. No ads." signature.

## Motion & performance

- `prefers-reduced-motion: reduce` disables Lenis, replaces tweens with set-state, and skips cursor-driven particle repulsion.
- Three.js scenes are mounted lazily via an IntersectionObserver (`150%` rootMargin) and paused when off-screen.
- `devicePixelRatio` capped at 2 everywhere.
- JS bundle: ~177 KB gzipped (under the 400 KB target).

## Design tokens

Canonical tokens live in `src/styles/tokens.css`. The Claude Design handoff bundle under `project/` is kept for provenance and is **not** shipped in the Vite build. Edit `src/styles/tokens.css` to change colors, type scales, or motion durations.

## Deployment

### GitHub Pages (automatic)

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes `dist/` to the `github-pages` environment. Enable Pages in repo settings → Pages → Source: GitHub Actions.

### Windows `.exe` (manual)

Trigger `.github/workflows/release-windows.yml` via the Actions tab (workflow_dispatch) or by pushing a tag (`git tag v1.0.0 && git push --tags`). The job runs on `windows-latest`, builds a portable `The Last Supper 1.0.0.exe`, and attaches it to the release / workflow artifacts.

## Credits

- Design tokens, copy, and the Three.js reference scenes under `project/` are from a Claude Design handoff bundle.
- Statistics: FAO, UNEP Food Waste Index Report 2024, World Food Programme.
- Fonts: Fraunces, Inter, JetBrains Mono (all OFL).

## Screenshots

_(Populate `docs/hero.png`, `docs/paradox.png`, etc. once captured.)_
