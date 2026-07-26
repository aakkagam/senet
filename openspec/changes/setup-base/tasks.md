# Tasks: setup-base

## 1. Scaffold

- [x] 1.1 Create `package.json` (scripts: dev/build/preview/check/test/test:watch), `vite.config.ts` (no `base`; Vitest node env over `src/**/*.test.ts`), `tsconfig.json`, `svelte.config.js` — mirroring align3, adding `svelte-check`
- [x] 1.2 Create `src/styles/tokens.css` (custom properties for Carved Wood, Faience, Ivory, Ebony, Table; placeholder values, no `#000`/`#fff`) and `src/styles/base.css`
- [x] 1.3 Create `index.html` with full SEO head (title, description, canonical, OG/Twitter, `VideoGame` JSON-LD for `https://games.aakkagam.com/senet/`) and crawlable Senet prose below the mount point
- [x] 1.4 Create `src/main.ts` and placeholder `src/lib/components/App.svelte` (title + "coming soon"; loads styles; no board)
- [x] 1.5 Add `public/icon.svg` and `public/og.png` placeholders; add `.gitignore` (node_modules, dist)
- [x] 1.6 Verify `npm ci && npm run check && npm test && npm run build` all pass on the empty shell

## 2. Rules core: foundations

- [x] 2.1 Define `src/lib/game/types.ts`: `GameState` as plain JSON-safe data (squares 1..30, borne-off counts, turn, `Phase` discriminated union, pending throw, first-move flags)
- [x] 2.2 Implement `sticks.ts`: `resolveThrow(faces)` per OI table (1→1+again, 2→2, 3→3, 4→4+again, 0→5+again) with tests
- [x] 2.3 Implement `board.ts`: linear path helpers, consecutive-pair/wall detection (corner-adjacency 20|21, no protection on 27–30) with tests
- [x] 2.4 Implement initial setup (light odd 1–9, dark even 2–10) with tests

## 3. Rules core: movement

- [x] 3.1 Implement forward movement legality: one token per turn, own-token landing forbidden, wall passage blocked (both directions) with tests
- [x] 3.2 Implement capture-by-swap incl. protected-pair immunity and no house effects for the displaced token, with tests
- [x] 3.3 Implement forced-move logic: forward if any legal, else backward with extra-throw forfeit, else turn ends — with tests
- [x] 3.4 Implement first-move rule: dark's forced 10→11 + extra throw; light's first move restricted to the square-9 token — with tests

## 4. Rules core: special houses and win

- [x] 4.1 Implement house 15 rebirth (target 1; forward-scan fallback when occupied; triggers on backward landing too) with tests
- [x] 4.2 Implement house 26 gate (exact landing required before passing; forward-only; backward crossing allowed) with tests
- [x] 4.3 Implement house 27 (landing forfeits extra throws; next-turn choice: return to 15 without throwing, or throw — 4 bears off + extra turn, else stuck) with tests
- [x] 4.4 Implement exact exits 28 (=3) and 29 (=2) and house 30 (any throw) with tests
- [x] 4.5 Implement bear-off counting, win detection, and terminal state rejecting further actions, with tests
- [x] 4.6 Add immutability and JSON round-trip tests over representative reachable states

## 5. Persistence and store

- [x] 5.1 Implement `src/lib/persist.ts`: versioned serialize/validate/restore, discard-on-mismatch, never throws — pure and unit-tested (storage injected)
- [x] 5.2 Implement minimal `src/lib/store.svelte.ts`: holds `GameState` via runes, generates random stick faces, persists after every transition, restores on startup, clears save on win/new game
- [x] 5.3 Confirm the design.md Open Questions defaults with the user; adjust rules + tests if overruled

## 6. Deploy

- [x] 6.1 Copy align3's `.github/workflows/deploy.yml`; change build to `--base=/senet/` and insert `npm run check` before `npm test`
- [x] 6.2 Verify locally that `npm run build -- --base=/senet/` prefixes asset URLs with `/senet/` in `dist/index.html`
- [ ] 6.3 After first push to `main`: enable GitHub Pages with source "GitHub Actions" and verify the workflow deploys (manual step, note in PR/commit)
