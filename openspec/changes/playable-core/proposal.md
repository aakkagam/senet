# Proposal: playable-core

## Why

The rules engine, persistence, and deploy pipeline are done (setup-base), but the live page is a "coming soon" placeholder — nobody can play. This change ships the playable game: board, tokens, throws, and turn flow wired to the existing pure engine, so two people can finish a hotseat game at games.aakkagam.com/senet/.

## What Changes

- Render the 30-square board as the boustrophedon "game box" (abstract viewBox geometry in `src/lib/geometry.ts`; the reverse-S is rendering-only, mapping the engine's linear 1..30 path).
- Draw tokens with player identity by shape + color (spools vs. cones, ivory vs. ebony), with spring motion (`src/lib/motion.ts`) degrading under `prefers-reduced-motion`.
- Token interaction: drag with tap-tap fallback, legal targets highlighted in Faience, illegal drops bounced back, touch targets ≥ 44px.
- Turn flow UI: throw button producing a large numeral result (no stick theatre yet — that is the next change), extra-throw indication, forced-backward indication, the house-27 choice (return to 15 vs. throw for a 4), win banner, and new-game action.
- Mount the existing `store.svelte.ts` in the app shell, replacing the placeholder — resume-from-localStorage becomes live behavior.
- Special houses (15, 26–30) get restrained visual marks so the board reads; full teach-through-the-board moments are deferred to the follow-up change.
- No landing-page updates yet (those come with the visual-identity/launch change).

## Capabilities

### New Capabilities

- `board-rendering`: the 3×10 boustrophedon board drawn from the linear path, special-house marks, board-is-the-app layout, responsive across phone/tablet/laptop.
- `token-interaction`: selecting and moving tokens by drag or tap-tap, legal-target highlighting, illegal-drop rejection, accessibility floors (shape+color identity, target sizes).
- `turn-flow-ui`: throwing, numeral results, extra throws, forced backward moves, the house-27 choice, win and new-game flow — the full turn loop made visible and operable.

### Modified Capabilities

- `app-scaffold`: the "Placeholder app shell" requirement is replaced — the app now mounts the playable game (SEO head and crawlable prose unchanged); `geometry.ts`/`motion.ts` are no longer "reserved for the UI change" but real modules.

## Impact

- New: `src/lib/geometry.ts`, `src/lib/motion.ts`, board/token/HUD components under `src/lib/components/`.
- Modified: `App.svelte` (placeholder → game), `store.svelte.ts` (whatever the UI needs exposed, e.g. legal targets), `tokens.css` (any additional interaction-state variables; the four voices stay placeholders until the identity change).
- Pure layer `src/lib/game/` stays untouched unless the UI needs a read-only helper (e.g. legal targets for a selected token) — no rule behavior changes, existing tests keep passing.
- No new dependencies expected beyond possibly `@fontsource/*` deferral (fonts stay system placeholders until the visual-identity change).
