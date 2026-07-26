# Proposal: setup-base

## Why

The senet repo holds only a README; nothing builds, tests, or deploys. Every future change needs the project base in place: the align3-pattern scaffold (plus the upgrades ostomachion proved out) and a fully tested pure rules core, so UI work can start on a correct, stable foundation.

## What Changes

- Scaffold the project following align3's layout and conventions (Svelte 5 + TypeScript + Vite, `src/lib/game/` pure layer → `store.svelte.ts` → `components/`), with ostomachion's upgrades: `svelte-check` wired into CI, `src/styles/tokens.css` + `base.css` split, and a `persist.ts` module.
- Implement the complete pure game logic for the Oriental Institute Senet ruleset (the spec in CLAUDE.md): board path, casting sticks, setup, first-move rule, movement/swap/blocking, forced moves, special houses 15/26/27/28/29/30, bear-off, win detection — with unit tests for every rule.
- Stick throws are pure functions of injected stick faces; randomness lives only in the store layer.
- `GameState` is plain serializable data from day one; full mid-game persistence (resume after refresh) via localStorage.
- Add `.github/workflows/deploy.yml` (copy of align3's with `--base=/senet/`, plus `npm run check`) deploying to GitHub Pages.
- UI remains a placeholder shell (app mounts, tokens.css loads, no playable board). The playable game is a follow-up change.

## Capabilities

### New Capabilities

- `app-scaffold`: project structure, build/test/check toolchain, styles foundation, and the GitHub Pages deploy pipeline at base `/senet/`.
- `game-rules`: pure, framework-free Senet rule engine — board path, sticks, setup, movement, capture, blocking, forced moves, special houses, bear-off, win.
- `game-persistence`: serialization and restore of a full in-progress game to localStorage, surviving page refresh.

### Modified Capabilities

None — this is the first change; no existing specs.

## Impact

- New repo content: `package.json`, `vite.config.ts`, `tsconfig.json`, `svelte.config.js`, `index.html`, `.github/workflows/deploy.yml`, `public/`, `src/` (game logic, store stub, placeholder shell, styles).
- No existing code affected (repo is empty). No backend, no external services.
- Deploy pipeline requires GitHub Pages enabled with source "GitHub Actions" after first push (manual, out of band).
- Landing-page updates in the user-site repo happen only after the playable game ships — explicitly out of scope here.
