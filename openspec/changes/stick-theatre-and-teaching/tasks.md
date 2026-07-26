# Tasks: stick-theatre-and-teaching

## 1. Engine and store groundwork

- [x] 1.1 Add read-only `refusalReason(state, from)` to `src/lib/game/rules.ts` (returns why a grab/move is refused, incl. `'beauty-gate'`), unit-tested against gate/wall/protection/own-token/exact-exit cases with no behavior change
- [x] 1.2 Add `revealing` sequencing to the store: set on `throwSticks()`/`waterThrow()`, cleared by animation completion with a fail-safe timeout; never set under `prefers-reduced-motion`; while set, `canGrab` refuses, `movableSquares` is empty, and the no-move/water notice window starts only after clear
- [x] 1.3 Derive house events in `commit()` (landed on 15/27/28/29/30) plus gate-refusal events from `refusalReason`; expose a single `houseNote` state with once-per-game-per-house tracking for landing notes, reset by `newGame()`

## 2. Stick theatre

- [x] 2.1 Add stick rest positions (strip between the trays) to `geometry.ts` and tumble tunings/durations to `motion.ts`
- [x] 2.2 Build `Sticks.svelte`: four stick sprites in the stage, tumble via Web Animations API (rise, staggered flips, settle on true faces from `lastFaces`), settled sticks persist until the turn passes; instant settled state under reduced motion
- [x] 2.3 Wire the HUD: remove static stick glyphs, hide numeral/messages while `revealing`, disable the throw control during the tumble, extra-throw marker at/after reveal; `WaterChoice` throw runs the same theatre
- [x] 2.4 Verify sequencing: numeral only at reveal; mid-tumble taps change nothing; no-move notice follows the reveal; reload mid-tumble restores the committed phase without replaying; fail-safe timeout re-enables input

## 3. House teaching

- [x] 3.1 Build `HouseNote.svelte`: percent-anchored transient note (WaterChoice pattern), one at a time, auto-dismiss ~3 s, `aria-live="polite"`, suppressed while the house-27 panel is up, reduced-motion fades
- [x] 3.2 Write the note copy for 15, 27, 28, 29, 30 landings and the 26-gate refusal (short, names the house, states the rule; no lore dumps)
- [x] 3.3 Wire events → notes: landing notes once per game per house, gate-refusal notes on each refused grab; verify rebirth, waters, judges, and gate scenarios in the browser

## 4. Verification and ship

- [x] 4.1 Full manual pass: several throws (incl. house-27 both outcomes), all five landing notes, gate refusal, reduced-motion mode, 360×640 letterbox with the stick strip
- [x] 4.2 `npm run check && npm test && npm run build` green; deploy via push and spot-check the live URL
