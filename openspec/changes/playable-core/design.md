# Design: playable-core

## Context

setup-base delivered a fully tested pure rule engine (`src/lib/game/`), a runes store with localStorage persistence (`store.svelte.ts` + `persist.ts`), and a deployed placeholder shell. This change builds the UI layer on top, following align3's proven architecture (abstract viewBox geometry, spring `motion.ts`, SVG stage with component-per-concept) and the DESIGN.md creative direction ("The Game Box on the Table"). The pure layer does not change behavior; the store grows only read-only helpers the UI needs.

## Goals / Non-Goals

**Goals:**

- Two people finish a full hotseat game in the browser: throw → move → houses → bear-off → win → play again.
- Every rule the engine enforces is *visible*: legal targets highlight, illegal drops bounce back, forced backward moves and the house-27 choice are explicit.
- Motion has weight (springs) and degrades cleanly under `prefers-reduced-motion`.
- Accessibility floors: shape+color token identity, WCAG AA interactive states, ≥ 44px touch targets, numeral throw results.

**Non-Goals:**

- Stick-throw theatre (anticipation/tumble/reveal) and house self-explanations — next change (`stick-theatre-and-teaching`).
- Final colors, fonts, real icon/og art, landing-page updates — the visual-identity/launch change.
- No AI opponent, no online play, no sound.

## Decisions

### 1. One SVG stage, landscape game box

The whole game renders in a single `<svg>` with an abstract viewBox (align3 pattern: geometry in numbers, CSS never positions gameplay). The senet box is landscape 10×3; the stage viewBox is wide (roughly `0 0 160 100`) with the board centered, throw area and HUD in the margins. On narrow portrait phones the stage letterboxes rather than re-flowing the board — the box keeps its proportions like a physical object.

*Alternative*: portrait stage with a rotated 3-column board — rejected; the 3×10 reverse-S is the artifact's identity and rotating it breaks path readability.

### 2. `geometry.ts` maps linear path → grid, one function

`squarePos(square: 1..30): {x, y}` implements the boustrophedon: row = ceil(square/10), column direction alternates (row 1 left→right, row 2 right→left, row 3 left→right). Everything else (token positions, highlight rects, house marks) derives from `squarePos` plus constants (square size, board origin, borne-off tray positions). No other module knows about rows.

### 3. Tokens are identity-stable sprites, not square contents

Like align3's `Stone[]`, the store gains a UI-side `tokens: Token[]` array (id, player, square | 'off'), reconciled against `GameState.squares` after each transition. This gives springs something stable to animate (a swap moves *two* sprites; rebirth flies one token back to square 1). Reconciliation matches old→new squares by player and minimal movement; it lives in the store layer and is unit-testable in node.

*Alternative*: render tokens directly from `squares[]` — rejected; tokens would teleport/swap identities and swaps couldn't animate as two crossing moves.

### 4. Interaction: tap-first, drag as enhancement

Senet moves are chosen by *origin only* (destination is forced by the throw), so the primary interaction is: tap/click a legal token → it moves (or tap again to confirm? No — single tap moves, since destination is unambiguous). Drag still works for tactility — drop anywhere near the destination square commits, anywhere else bounces back. Legal origins pulse subtly when it's your move; the destination square of a selected/dragged token glows Faience.

*Alternative*: align3's select-then-tap-target — rejected as the primary flow; with a forced destination it adds a step without adding choice. Drag retained because DESIGN.md's tactility demands it.

### 5. Turn flow is store-driven, phase-mapped UI

The UI is a pure function of `state.phase`:
- `awaiting-throw` → throw button active on the current player's side; result renders as a large numeral (plus static stick glyphs — no animation yet) with "again!" marker when the throw grants another.
- `awaiting-move` (forward) → legal origins highlighted.
- `awaiting-move` (backward) → same, plus a quiet "no forward moves — moving back" line; extra-throw forfeit shown.
- No legal move at all → applyThrow already ends the turn; the UI flashes "no legal moves" before the turn indicator flips.
- `house-27-choice` → the two options rendered as buttons anchored at square 27 ("return to 15" / "throw for a 4").
- `game-over` → win banner + "play again".

The store exposes `legalOrigins()` (already in rules) and a derived `legalTargetOf(from)` helper so highlights come from the engine, never re-derived in components.

### 6. Motion: two springs + reduced-motion snap

`motion.ts` follows align3: a taut follow spring (drag), a soft settle spring (moves, swaps, rebirth), an underdamped shake ("no"). rAF-driven spring util shared by all animated components; `prefersReducedMotion()` short-circuits springs to instant placement and replaces the bounce-back with a brief fade. The throw numeral appears instantly under reduced motion.

### 7. Components

```
App.svelte      — mounts store, layout shell, resume/new-game
Stage.svelte    — the SVG stage, pointer handling, coordinate transforms
Board.svelte    — box, 30 squares, house marks (15, 26–30), path hinting
Token.svelte    — spool/cone sprite, springs, drag/tap
Hud.svelte      — turn indicator, throw button, numeral result, messages
WaterChoice.svelte — house-27 options
WinBanner.svelte   — win + play again
```

House marks stay restrained (small carved glyph or numeral, no lore text) — enough to signal "this square is special" until the teaching change.

## Risks / Trade-offs

- [Token reconciliation mismatch (sprite on wrong square after complex swap/rebirth)] → reconciler is pure and unit-tested against engine transitions (swap, rebirth, bear-off, water return).
- [Single landscape stage cramped on small portrait phones] → letterbox with minimum readable square size; HUD collapses under the board; verified at 360×640.
- [Tap-to-move may feel too abrupt (no confirmation)] → destination glows before commit on hover/press; illegal taps shake; if playtests disagree, a confirm step is a store-level toggle, not a rework.
- [Placeholder colors/fonts make AA contrast provisional] → interaction states are checked AA against the placeholder values now; the visual-identity change re-verifies when the real palette lands.

## Open Questions

1. **Throw trigger**: one shared throw button in the HUD vs. a tappable stick area on each player's side of the box. Default: single button that slides to the current player's side — simplest correct hotseat affordance.
2. **Backward-move UX**: when only backward moves exist, auto-highlight backward origins with a message (default), or require the player to acknowledge first? Default: no modal, just the message.
