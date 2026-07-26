# Spec: app-scaffold

Project structure, toolchain, styles foundation, and deploy pipeline. Pattern: align3's layout (mandated by CLAUDE.md) plus ostomachion's proven upgrades (svelte-check, tokens/base CSS split).

## ADDED Requirements

### Requirement: Project toolchain
The project SHALL build with Svelte 5 + TypeScript + Vite, providing npm scripts `dev`, `build`, `preview`, `check` (svelte-check), `test` (Vitest run), and `test:watch`. Vitest SHALL run in the `node` environment over `src/**/*.test.ts` with no jsdom or component-testing dependencies.

#### Scenario: Clean install passes all gates
- **WHEN** `npm ci && npm run check && npm test && npm run build` runs on a clean checkout
- **THEN** every step exits 0 and `dist/` is produced

### Requirement: Three-layer source layout
The source SHALL follow align3's layout: `src/lib/game/` containing only pure framework-free logic, `src/lib/store.svelte.ts` as the runes-based bridge, `src/lib/components/` for Svelte components, with `src/lib/geometry.ts` and `src/lib/motion.ts` reserved for the UI change. `src/lib/game/` SHALL NOT import from Svelte or any framework module.

#### Scenario: Pure layer has no framework imports
- **WHEN** the modules under `src/lib/game/` are inspected
- **THEN** none imports `svelte` or any `*.svelte`/`*.svelte.ts` module

### Requirement: Styles foundation
Styles SHALL live in `src/styles/tokens.css` and `src/styles/base.css`. `tokens.css` SHALL define custom properties for DESIGN.md's four color roles (Carved Wood, Faience, Ivory, Ebony) plus the Table neutral, as placeholder values to be resolved during UI work. No stylesheet SHALL use pure `#000` or `#fff`.

#### Scenario: Token variables exist
- **WHEN** `tokens.css` is loaded by the app shell
- **THEN** custom properties for the five color roles are defined on `:root`

### Requirement: Placeholder app shell
The app SHALL mount a minimal placeholder (project title and a "coming soon" line) with no interactive board. `index.html` SHALL carry the full SEO head (title, meta description, canonical, OG/Twitter tags, `VideoGame` JSON-LD referencing `https://games.aakkagam.com/senet/`) and crawlable prose about Senet below the mount point, following the sibling repos.

#### Scenario: Shell renders
- **WHEN** the built site is served
- **THEN** the page renders the placeholder without console errors and the prose is present in the static HTML

### Requirement: Deploy pipeline
`.github/workflows/deploy.yml` SHALL mirror align3's workflow: on push to `main`, run `npm ci`, `npm run check`, `npm test`, `npm run build -- --base=/senet/`, then upload and deploy to GitHub Pages. `vite.config.ts` SHALL NOT set a `base`.

#### Scenario: Base path applied at build time
- **WHEN** the workflow build step runs
- **THEN** asset URLs in `dist/index.html` are prefixed with `/senet/`

#### Scenario: Failing tests block deploy
- **WHEN** `npm run check` or `npm test` fails in the workflow
- **THEN** the build job fails and no Pages deployment occurs
