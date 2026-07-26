# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A free browser version of **Senet**, the ancient Egyptian race game (30 squares, casting sticks), two-player local hotseat. Part of Aakkagam Games; deploys to `games.aakkagam.com/senet/`.

**The repo is currently empty — only `README.md` exists.** Implementation follows the sibling `align3/` repo pattern exactly (Svelte 5 + TypeScript + Vite, no backend, single screen). When scaffolding, mirror align3's layout, config, and conventions rather than inventing new ones. Read `../align3/CLAUDE.md` for the shared architecture (three layers: pure game logic → Svelte-runes store → components; abstract viewBox geometry; spring motion; `prefers-reduced-motion`; teach-through-the-board interaction; WCAG AA / shape-not-color-alone accessibility floors).

## Planned commands (once scaffolded, matching align3)

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm test` — Vitest once; `npm run test:watch` — watch
- Single test file: `npx vitest run src/lib/game/rules.test.ts`; filter: `npx vitest run -t "pattern"`

Deploy via `.github/workflows/deploy.yml` on push to main: `npm ci` → `npm test` → `npm run build -- --base=/senet/` → GitHub Pages. Copy align3's workflow and change only the base path. After the first deploy, add a link/entry for Senet to the landing page, `sitemap.xml`, and structured data in the `nannakuhtum.github.io` repo.

## Game rules (authoritative — implement exactly)

Source: Oriental Institute (Univ. of Chicago) "Make and Play Your Own Senet." Senet has no single canonical historical ruleset; **these rules are the spec for this implementation** — do not substitute variants from elsewhere without the user's say-so. The pure logic layer (`src/lib/game/`) is the only unit-tested layer; every rule below needs test coverage.

**Board & path.** 30 squares in a 3×10 grid, traversed in a boustrophedon (reverse-S): 1→10 left-to-right on the top row, 11→20 right-to-left on the middle row, 21→30 left-to-right on the bottom row. Model the path as a linear 1..30 index; the S-shape is purely a rendering concern.

**Pieces & setup.** 5 light + 5 dark tokens. Setup fills squares 1–10 alternating: **light on odd squares, dark on even squares** (so light starts on 1,3,5,7,9 and dark on 2,4,6,8,10). Goal: be first to bear all 5 of your tokens off past square 30.

**Casting sticks (the "dice").** 4 two-sided sticks; count light sides up:
- 1 light → move 1, **throw again**
- 2 light → move 2
- 3 light → move 3
- 4 light → move 4, **throw again**
- 0 light → counts as **5**, **throw again**

**First move.** Players throw to see who goes first: first to throw a "1" takes **dark**, moves the token on square 10 to 11, and throws again (then may move any dark token). The other player takes **light** and on their first move must move the token starting on **square 9** first.

**Movement & capture.** Only one token per turn. One token per square. Landing exactly on an opponent's token **swaps** them — the opponent's token goes back to the square yours started from. You cannot land on your own token.

**Blocking (protection).** Two of *your* tokens on **consecutive** squares cannot be individually captured (an opponent may not swap onto either). This holds around a row corner (e.g. 20 & 21) but **not** across the visual gap between rows (e.g. 18 & 23 are not adjacent on the path). Three-plus in a row form an impassable wall — opponents cannot pass. (Protection does **not** apply on squares 27–30; see below.)

**Forced moves.** On your turn you must move forward if any forward move is legal. If no forward move exists, you must move a token **backward** and you forfeit any extra throws. If after throwing you have no legal move at all, your turn ends immediately.

**Special squares.**
- **15 — House of Second Life (rebirth):** landing here sends the token to square **1** immediately. (Also the return square for tokens sent back from 27.)
- **26 — House of Beauty:** no token may pass beyond 26 until it has first landed on 26 by an **exact** throw.
- **27 — House of Waters:** landing here forfeits extra throws. On your next turn, that token must either (a) return to square 15 and end your turn without throwing, or (b) throw — a **4** bears it off the board and grants an extra turn; anything else leaves it stuck and ends your turn.
- **28 — House of Three Judges:** token leaves only on an exact **3**.
- **29 — House of Two Judges:** token leaves only on an exact **2**.
- **30 — House of Horus:** token bears off on a throw of **1 or greater** (any throw).
- Squares **27–30**: the consecutive-token protection rule (blocking) does **not** apply.

**Win:** first player to bear off all 5 tokens.

## Conventions that matter

Follow align3 throughout: Svelte 5 runes (`$state`/`$derived`, `onclick=` not `on:click`); pure immutable `GameState` transitions in `src/lib/game/` returning a new state or `null` for illegal moves; spring motion tuned separately and degrading under `prefers-reduced-motion`; drag with a tap-tap fallback; legal targets highlighted, illegal drops bounced back; player identity conveyed by shape + color, never color alone.
