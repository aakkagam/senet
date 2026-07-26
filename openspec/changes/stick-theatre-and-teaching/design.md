# Design: stick-theatre-and-teaching

## Context

playable-core shipped the full playable loop: throws resolve instantly to a numeral, houses act silently, and the store commits engine transitions synchronously with localStorage persistence. This change layers presentation on top — the stick tumble DESIGN.md calls "the one permitted moment of drama," and the teach-through-the-board house notes — without touching rule behavior or the save format. The existing store already exposes `lastFaces` (the four stick faces) and sequences turn-ending notices; the stage already anchors overlays by viewBox percentage (WaterChoice).

## Goals / Non-Goals

**Goals:**

- A throw reads as an event: sticks tumble and land showing their real faces, then the numeral resolves.
- Nobody acts on a result before they can read it: input and highlights wait for the reveal.
- Every special-house effect explains itself the moment it fires, anchored at the house, then gets out of the way.
- All of it collapses cleanly under `prefers-reduced-motion` and can never soft-lock the game.

**Non-Goals:**

- No sound, no persistent tutorials or help screens, no rules reference UI.
- No visual-identity work (colors/fonts stay placeholders; that is the next change).
- No changes to rules, persistence format, or the house-27 choice flow itself.

## Decisions

### 1. Commit first, reveal later

`throwSticks()` keeps committing the engine transition and saving immediately; the theatre is purely presentational. The store gains a `revealing` flag set on throw and cleared when the tumble ends. While `revealing`: `canGrab` refuses, `movableSquares` reports empty (no halos), the HUD hides the numeral and messages, and the no-move notice timer starts only after the reveal.

*Alternative*: delay the engine commit until the animation finishes — rejected; a mid-tumble reload would lose the throw or demand new persistence machinery. Committing first means a reload lands in the already-committed phase and simply skips the theatre — exactly what the restore spec already promises.

### 2. Sticks are stage objects landing between the trays

Four stick sprites live in the SVG stage and land in the open strip between the two borne-off trays (stage x ≈ 60–94, y ≈ tray row) — physical objects dropped on the table, not HUD chrome. Geometry gains stick rest positions. The tumble: each stick rises, flips (scale oscillation) with a per-stick stagger (~80 ms), and settles showing its true face from `lastFaces`; total ≈ 900 ms. Driven by the Web Animations API from `Sticks.svelte`, tunings in `motion.ts`.

*Alternative*: animate the HUD glyphs — rejected; DESIGN.md's material fiction wants sticks on the table, and the stage already owns coordinate space. The HUD's static glyphs go away; the stage sticks are the persistent record of the last throw.

### 3. A store timeout is the reveal's fail-safe

The `Sticks` component clears `revealing` on animation finish, but the store also arms a `setTimeout` (tumble duration + margin) that clears it unconditionally. Hidden tabs, dropped animation events, or a crashed component can therefore never gate input forever. Under `prefers-reduced-motion`, `revealing` is never set at all — the numeral is instant, sticks appear already settled.

### 4. House events derive from transitions; gate refusals from a read-only helper

The store detects landing events by comparing pre/post states in `commit()`: mover landed on 15 (rebirth), 27 (waters), 28/29/30 (exact-exit houses). Each fires a `houseNote` — `{house, text}` — anchored at that square. The 26-gate has no transition to observe (it is an absence of legality), so the pure layer gains a read-only `refusalReason(state, from): 'beauty-gate' | ... | null` helper (unit-tested, no behavior change, precedent: `legalTarget`); a refused grab whose reason is the gate fires the note at 26.

*Alternative*: re-derive gate logic in the store — rejected; playable-core's standard is that components and store never re-derive rules the engine owns.

### 5. Notes are one-at-a-time, transient, mostly once

One `HouseNote.svelte` overlay (WaterChoice's percent-anchoring pattern), newest note replaces the current one, auto-dismiss after ~3 s, announced via `aria-live="polite"`, never blocks input. Landing notes fire **once per game per house** (a `seen` set, reset by `newGame()`); refusal notes fire every time — they answer a player's action ("why won't it move?"). The waters landing note is worded to foreshadow the choice ("stuck until a 4 — or a return to Second Life") since the actual choice panel appears on the owner's next turn.

## Risks / Trade-offs

- [Reveal gating collides with the existing notice sequencing (no-move turn pass)] → single ordering rule in the store: reveal completes, then the notice window starts; covered by a scenario and verified manually.
- [Stick strip crowds the 150×68 stage on phones] → sticks are small (~6×2 units); if the strip reads cramped at 360 px, drop stick size before moving them; the board never shrinks.
- [Notes at 27 could overlap the WaterChoice panel] → they occur on different turns (landing vs. owner's next turn) and notes auto-dismiss in ~3 s; if both ever coincide, the panel wins and the note is suppressed.
- [Repeated teaching annoys returning players] → landing notes are once per game; refusal notes only respond to direct action.

## Open Questions

1. Should landing notes be once per *device* (persisted "seen" flag) rather than once per game? Default: once per game — cheap, predictable, no storage change.
