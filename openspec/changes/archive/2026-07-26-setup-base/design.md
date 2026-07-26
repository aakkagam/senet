# Design: setup-base

## Context

The repo is empty (README only). Two sibling repos define the house pattern: align3 (older; the mandated template per CLAUDE.md) and ostomachion (newer; carries proven upgrades). Senet's rules come from the Oriental Institute set, fixed in CLAUDE.md as the authoritative spec. Product/design intent live in PRODUCT.md and DESIGN.md (seed). Decisions below were settled in an explore session on 2026-07-26.

## Goals / Non-Goals

**Goals:**

- A repo that builds, type-checks, tests, and deploys to `games.aakkagam.com/senet/` from day one.
- A complete, unit-tested, pure rule engine for the OI ruleset — the hard correctness work, done before any UI exists.
- A `GameState` shape that supports full mid-game persistence and drives the future UI without rework.

**Non-Goals:**

- No playable UI: the app shell is a placeholder (mounts, loads styles, renders nothing interactive). Board, tokens, sticks, motion are the next change.
- No landing-page/sitemap updates in the user-site repo (only after the playable game ships).
- No AI opponent, no online play, no sound.

## Decisions

### 1. align3 layout + ostomachion upgrades

Follow align3's structure (`src/lib/game/` pure layer → `src/lib/store.svelte.ts` → `src/lib/components/`, `geometry.ts`, `motion.ts`) as CLAUDE.md mandates, and adopt three things ostomachion proved out:

- `svelte-check` with a `check` script, run in CI before tests.
- `src/styles/tokens.css` + `base.css` instead of a single `app.css`. DESIGN.md's four color voices (Carved Wood, Faience, Ivory, Ebony) land as custom properties in `tokens.css` with placeholder values to be resolved during UI work.
- A `persist.ts` module pattern (serialize/restore, unit-tested).

*Alternative considered*: literal align3 clone — rejected; the upgrades are cheap now and expensive to retrofit, and ostomachion demonstrates they fit the house pattern.

### 2. Randomness stays out of the pure layer

`resolveThrow(faces: [boolean, boolean, boolean, boolean])` is a pure function returning `{ value, throwAgain }` per the OI table (0 light → 5). All rule transitions take the throw value as input. The store layer generates the random faces (`crypto.getRandomValues` or `Math.random`; unspecified, it's UI-side). Every rule test is deterministic.

*Alternative considered*: seeded RNG inside the game layer — rejected; injecting outcomes is simpler and makes test cases readable ("given a throw of 4...").

### 3. `GameState` is plain serializable data

The pure layer exports `GameState` as a plain object type (JSON-safe: no classes, functions, Maps, or Dates). This is forced by the persistence goal and also keeps transitions immutable (`move(state, ...) → GameState | null`, align3 convention). The runes store wraps state; it is not the state.

Suggested shape (final shape may evolve during implementation):

```
GameState {
  squares: (Token | null)[31]        // 1-indexed path; 0 unused
  borneOff: { light: number, dark: number }
  turn: 'light' | 'dark'
  phase: Phase                       // explicit turn state machine
  pendingThrow: number | null
  firstMoveDone: { light: boolean, dark: boolean }
}
```

### 4. The turn state machine is explicit and lives in the pure layer

Senet's turn flow (extra throws, forced backward moves, the house-27 choice, first-move constraints) is a real state machine, not a boolean. `Phase` is a discriminated union (e.g. `awaiting-throw`, `awaiting-move`, `house-27-choice`, `game-over`). Keeping it in `GameState` makes it unit-testable and means persistence captures a turn mid-flight.

### 5. Build/deploy conventions

- Base path passed on the CLI in the workflow (`npm run build -- --base=/senet/`), align3-style, per CLAUDE.md. `vite.config.ts` carries no `base`.
- Workflow = align3's `deploy.yml` with the base path changed and `npm run check` inserted before `npm test`.
- Vitest in `node` environment, `src/**/*.test.ts`; no jsdom, no component tests (rules + persistence are the tested surface).
- Fonts via `@fontsource/*` dependencies like both siblings; actual families chosen during UI work (DESIGN.md: rare serif + humanist sans), not in this change.
- `index.html` follows the siblings: full SEO head (title, canonical, OG/Twitter, `VideoGame` JSON-LD) and crawlable prose below the mount point, written for Senet from the start so the first deploy is already indexable.

## Risks / Trade-offs

- [OI ruleset has under-specified edge cases (see Open Questions)] → Defaults proposed below; each default is encoded as a spec scenario and test so behavior is explicit, documented, and cheap to change if the user overrules.
- [Persisted schema will evolve as the UI change lands] → `persist.ts` writes a schema version; any mismatch discards the save and starts fresh. No migration machinery in this change.
- [Placeholder deploy publishes a non-playable page at the live URL] → Acceptable: page carries "coming soon" prose (README already says this publicly); the URL is not linked from the landing page yet.
- [Suggested `GameState` shape may not survive contact with implementation] → The spec pins behavior, not the shape; tasks treat the shape as internal.

## Open Questions

Edge cases the OI rules don't settle. Proposed defaults (to confirm with the user, ideally before implementing rules; encode as tests either way):

1. **Rebirth target occupied.** A token sent to square 1 (from 15, or returning from 27 to 15) finds the target occupied. Default encoded in the spec: place on the lowest-numbered empty square scanning forward from the target. Deterministic; confirm or overrule.
2. **Special squares on backward moves.** Does a backward move landing on 15 trigger rebirth, or on 26 count as "landed exactly"? Default: yes for 15 (the square acts on landing, direction-agnostic); yes for 26 (a backward landing on 26 satisfies the exact-landing gate).
3. **Swap victim on a special square.** A swapped opponent token lands on the mover's origin square; if that origin is 15, does the victim rebirth? Default: no — house effects trigger only on a player's own move, not on being displaced.
4. **Walls and backward moves.** Default: a 3+ wall blocks passage in both directions.
5. **Backward past 26.** Default: the 26-gate applies only to forward passage; backward moves may cross it.
