# Tasks: playable-core

## 1. Geometry and motion foundations

- [x] 1.1 Implement `src/lib/geometry.ts`: stage viewBox constants, `squarePos(1..30)` boustrophedon mapping, tray positions, capture-zone helper — with node unit tests (corners 10|11 and 20|21 adjacent, middle row reversed)
- [x] 1.2 Implement `src/lib/motion.ts`: rAF spring util, FOLLOW/SETTLE/SHAKE tunings, `prefersReducedMotion()` (align3 pattern)

## 2. Store extensions

- [x] 2.1 Add identity-stable `tokens: Token[]` to the store with a pure reconciler (old squares → new squares by player and minimal movement), unit-tested against move/swap/rebirth/bear-off/water-return transitions
- [x] 2.2 Expose UI selectors: current legal origins, `legalTargetOf(from)` (destination or 'off'), phase-derived flags (backward turn, extra throw pending, last-throw info); shake/denied signal for illegal grabs

## 3. Board and tokens

- [x] 3.1 Build `Stage.svelte` (single SVG, pointer→viewBox transform, letterbox layout playable at 360×640) and `Board.svelte` (box, 30 squares, restrained house marks for 15/26–30 readable in grayscale)
- [x] 3.2 Build `Token.svelte`: spool vs. cone silhouettes (grayscale-distinguishable), spring-driven position, lift shadow while dragged, ≥44px effective touch targets
- [x] 3.3 Render borne-off trays per player showing off-board tokens
- [x] 3.4 Wire highlights: movable-token indication from engine legality, Faience destination glow on press/drag

## 4. Interaction

- [x] 4.1 Tap/click a legal token commits its forced move; illegal taps shake and change nothing
- [x] 4.2 Drag: follow spring, drop in destination capture zone commits, stray drop springs back; tap remains fully sufficient
- [x] 4.3 Reduced motion: instant placement/fades for all of the above (springs, shake, bounce-back)

## 5. Turn flow HUD

- [x] 5.1 Build `Hud.svelte`: turn indicator (shape+color+label), throw control for the current player, large numeral result with static stick glyphs and "throw again" marker
- [x] 5.2 Backward-only and no-legal-move messaging (incl. extra-throw forfeit note), sequenced before the turn flips
- [x] 5.3 Build `WaterChoice.svelte`: house-27 options anchored at square 27 (return without throwing / throw for a 4), replacing the throw control while active
- [x] 5.4 Build `WinBanner.svelte`: winner announcement, input disabled, play-again wired to `store.newGame()`

## 6. Shell and integration

- [x] 6.1 Replace the placeholder `App.svelte` with the game (store mounted, resume-from-save live); verify a restored awaiting-move phase shows its highlights and pending value without re-throwing
- [x] 6.2 Update `index.html` prose: drop "coming soon", describe playing now (SEO head unchanged)
- [x] 6.3 Verify full loop manually: two hotseat games end to end — swaps, rebirth, 26 gate, house-27 both options, exact exits, win, play again; check 360×640 and desktop; check grayscale distinguishability and reduced-motion mode
- [ ] 6.4 `npm run check && npm test && npm run build` green; deploy via push and spot-check the live URL
