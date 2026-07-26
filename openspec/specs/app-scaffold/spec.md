# Spec: app-scaffold

## Purpose

Project structure, toolchain, styles foundation, and deploy pipeline. Pattern: align3's layout (mandated by CLAUDE.md) plus ostomachion's proven upgrades (svelte-check, tokens/base CSS split).

## Requirements

### Requirement: Project toolchain
The project SHALL build with Svelte 5 + TypeScript + Vite, providing npm scripts `dev`, `build`, `preview`, `check` (svelte-check), `test` (Vitest run), and `test:watch`. Vitest SHALL run in the `node` environment over `src/**/*.test.ts` with no jsdom or component-testing dependencies.

#### Scenario: Clean install passes all gates
- **WHEN** `npm ci && npm run check && npm test && npm run build` runs on a clean checkout
- **THEN** every step exits 0 and `dist/` is produced

### Requirement: Three-layer source layout
The source SHALL follow align3's layout: `src/lib/game/` containing only pure framework-free logic, `src/lib/store.svelte.ts` as the runes-based bridge, `src/lib/components/` for Svelte components, with `src/lib/geometry.ts` (abstract viewBox geometry, including the boustrophedon mapping) and `src/lib/motion.ts` (spring tuning and reduced-motion handling) as UI-side modules. `src/lib/game/` SHALL NOT import from Svelte or any framework module.

#### Scenario: Pure layer has no framework imports
- **WHEN** the modules under `src/lib/game/` are inspected
- **THEN** none imports `svelte` or any `*.svelte`/`*.svelte.ts` module

#### Scenario: Boustrophedon lives only in geometry
- **WHEN** the modules under `src/lib/game/` are inspected
- **THEN** none maps square numbers to rows or columns

### Requirement: Styles foundation
Styles SHALL live in `src/styles/tokens.css` and `src/styles/base.css`. `tokens.css` SHALL define custom properties for DESIGN.md's four color roles (Carved Wood, Faience, Ivory, Ebony) plus the Table neutral, as placeholder values to be resolved during UI work. No stylesheet SHALL use pure `#000` or `#fff`.

#### Scenario: Token variables exist
- **WHEN** `tokens.css` is loaded by the app shell
- **THEN** custom properties for the five color roles are defined on `:root`

### Requirement: Playable app shell
The app SHALL mount the playable game (board, tokens, turn flow) wired to the runes store. `index.html` SHALL keep the full SEO head (title, meta description, canonical, OG/Twitter tags, `VideoGame` JSON-LD referencing `https://games.aakkagam.com/senet/`) and crawlable prose about Senet below the mount point; the prose SHALL drop its "coming soon" wording.

#### Scenario: Game renders
- **WHEN** the built site is served
- **THEN** the board renders and a full game can be played without console errors, and the prose remains present in the static HTML

### Requirement: Deploy pipeline
`.github/workflows/deploy.yml` SHALL mirror align3's workflow: on push to `main`, run `npm ci`, `npm run check`, `npm test`, `npm run build -- --base=/senet/`, then upload and deploy to GitHub Pages. `vite.config.ts` SHALL NOT set a `base`.

#### Scenario: Base path applied at build time
- **WHEN** the workflow build step runs
- **THEN** asset URLs in `dist/index.html` are prefixed with `/senet/`

#### Scenario: Failing tests block deploy
- **WHEN** `npm run check` or `npm test` fails in the workflow
- **THEN** the build job fails and no Pages deployment occurs
