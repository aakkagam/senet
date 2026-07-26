# Proposal: stick-theatre-and-teaching

## Why

The game is playable but silent about its own drama: a throw appears as an instant numeral, and the special houses act without explanation — a newcomer watches a token teleport from 15 to square 1 with no idea why. DESIGN.md names the stick throw "the one permitted moment of drama" and mandates teach-through-the-board; both were explicitly deferred out of playable-core to this change.

## What Changes

- Animate the casting-stick throw as anticipation → tumble → reveal: four stick sprites flip and land showing their faces, then the numeral resolves (the numeral remains the fact; the sticks are theatre). Applies to both the HUD throw and the house-27 throw.
- Gate move input and highlights until the reveal completes, so the result is read before it is acted on; under `prefers-reduced-motion` the theatre collapses to the instant numeral exactly as today.
- Add in-the-moment house explanations: when a special house acts (rebirth on 15, the 26 gate refusing passage, capture into the Waters, exact-throw waits on 28/29/30, bear-off at 30), a short note anchored at that house says what just happened and why.
- Explanations are event-driven and transient — no persistent lore panels, no modal tutorials; the board stays the app.

## Capabilities

### New Capabilities

- `stick-theatre`: the animated throw — stick sprites, anticipation/tumble/reveal sequencing, input gating during the tumble, reduced-motion collapse to the instant numeral.
- `house-teaching`: transient, board-anchored explanations of special-house events at the moment they occur, dismissed automatically and never blocking play longer than the moment needs.

### Modified Capabilities

- `turn-flow-ui`: the "Throwing the sticks" requirement changes — the result is revealed through the stick animation before the numeral resolves (ordering requirement), and the throw control is disabled while the tumble runs; the numeral-is-the-fact and reduced-motion obligations carry over unchanged.

## Impact

- New: `Sticks.svelte` (stick sprites + tumble), `HouseNote.svelte` (anchored teaching notes) under `src/lib/components/`.
- Modified: `Hud.svelte` (throw triggers theatre, numeral waits for reveal), `WaterChoice.svelte` (house-27 throw uses the same theatre), `store.svelte.ts` (reveal sequencing state, house-event signals derived from transitions), `motion.ts` (tumble timing), `geometry.ts` (stick area / note anchor positions).
- Pure layer `src/lib/game/`: no rule behavior changes; it MAY gain a read-only refusal-reason helper (like `legalTarget` in playable-core) so the gate note derives from the engine, not re-derived rules. `lastFaces` already exposes the thrown faces.
- No new dependencies; persistence format unchanged (theatre and notes are transient UI state).
