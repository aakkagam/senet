<!-- Colors and their contrast rules are resolved against the shipped code
     (src/styles/tokens.css). Typography and components are still seed text:
     re-run /impeccable document to capture those from the source. -->
---
name: senet
description: Ancient Egyptian race game as a warm wood-and-ivory game box, spring-driven and playful
---

# Design System: Senet

## 1. Overview

**Creative North Star: "The Game Box on the Table"**

A carved wooden senet box sitting between two people in daylight: a household object worn smooth by hands, not a treasure behind museum glass. The board is not a widget on a page; the box IS the page. Thirty squares inlaid into warm timber, ivory and dark tokens with real weight, four casting sticks that clatter and land. Everything around the box (turn indicator, throw result, settings) stays peripheral and quiet.

The feel is warm, tactile, spirited: piece personality and handmade warmth from Threes and Assemble with Care, with a measure of Monument Valley's serene, reverent geometry in how the board itself is drawn. Materiality comes from palette, line quality, and spring-weighted motion, never from photo-real texture collages. This system explicitly rejects Egyptian kitsch (Papyrus/hieroglyph novelty fonts, gold-on-black pharaoh bling, Vegas Egypt, clip-art ankhs), generic SaaS/flat web sterility, and cheap mobile-game clutter.

Motion energy is **responsive**: every interaction gives spring-weighted feedback (tokens lag, glide, settle; sticks tumble and land; illegal drops bounce back), but there is no scroll choreography or orchestrated entrance theatre. The stick throw is the one permitted moment of drama: anticipation, reveal, result. All of it degrades to fades/instant placement under `prefers-reduced-motion`.

**Key Characteristics:**
- The wooden box is the page; chrome stays peripheral and whisper-quiet
- Full palette, each role deliberate: wood surface, ivory, dark ebony, one Egyptian accent
- Slightly irregular, carved/inlaid line quality on the 30-square grid
- Spring-weighted motion as the primary texture; the stick throw as its heartbeat
- Special houses (15, 26–30) marked with restraint, explained by the board when they matter

## 2. Colors

Four named roles, each used deliberately; warmth throughout, no pure black or white anywhere.

### Primary
- **Carved Wood** `oklch(0.62 0.07 65)`: the board box surface; the grid reads as inlaid or carved into it.

### Secondary
- **Faience** (Egyptian blue-green accent) `oklch(0.68 0.11 195)`: the single accent. Legal-move highlights, the active special house, the throw-result moment. Rare enough to feel like glaze. Ships as three steps, chosen by the ground it sits on (see The Two Grounds Rule):
  - `--faience` `oklch(0.68 0.11 195)` — fills that carry ebony text (6.0:1); never a text or line color itself.
  - `--faience-glaze` `oklch(0.94 0.085 195)` — anything drawn **on the wood**: destination cells, move ghosts, grabbable halos, board focus rings. 3.2:1 on timber; it is the lightest teal the sRGB gamut holds before the chroma clips, so treat 3.2 as the ceiling and never darken the wood past L 0.62 without re-checking.
  - `--faience-deep` `oklch(0.48 0.08 195)` — anything drawn **on the table or ivory**: the "extra throw" label, focus rings, bear-off destinations. 4.7:1 on table, 5.3:1 on ivory.

### Tertiary
- **Ivory** (warm bone-white, never #fff) `oklch(0.94 0.02 90)`: light player tokens, inlaid grid lines, light text on wood.
- **Ebony** (warm near-black, never #000) `oklch(0.24 0.02 55)`: dark player tokens, text, carved-line shadows.

### Neutral
- **Table** (quiet warm neutral around the box) `oklch(0.9 0.02 80)`: whatever surface the box sits on; must recede completely.

### Named Rules
**The Four Voices Rule.** Wood, Faience, Ivory, Ebony: every element on screen maps to one of the four roles. A fifth color needs a reason strong enough to write down here.
**The Glaze Rule.** Faience is the only saturated voice and it only speaks when the game does: legal moves, live special houses, the throw. Decoration never gets it.
**The Both-Floors Contrast Rule.** Both token colors must hold WCAG AA contrast against Carved Wood, and against each other where they meet in a swap.
**The Two Grounds Rule.** This screen has two backgrounds a long way apart in lightness — the timber at L 0.62 and the table at L 0.90 — and one accent value cannot clear its contrast floor on both. Mid faience scores 1.35:1 on wood and 2.03:1 on the table: hue with nothing behind it. So the accent picks its step from what it is drawn *on*, not from what it means. Anything on wood takes the glaze step; anything on table or ivory takes the deep step. A live state is never the base faience.
**The Greyscale Rule.** Every state the player has to read — which pieces can move, where the throw sends them — must survive `grayscale(1)`. Color may reinforce it; color may not be the only thing carrying it. The move destination says it twice: a glazed cell and a ghost of the mover's own silhouette.

## 3. Typography

**Display Font:** `'Marcellus', 'Iowan Old Style', 'Palatino Linotype', serif` — an inscriptional serif, ancient without costume. Shared verbatim with align3 and Ostomachion: one display face across Aakkagam Games, so the three wordmarks read as one family.
**Body Font:** `'Alegreya Sans', 'Gill Sans', 'Segoe UI', sans-serif` — humanist, quiet, warm. Also shared across all three games.

Both load via `@fontsource` in `main.ts` (Marcellus 400; Alegreya Sans 400/700). The system faces behind them carry first paint.

**Character:** Ancient without costume. The serif appears rarely (title, win moment) so it lands with ceremony; the sans does the quiet everyday work of the HUD and throw results. No hieroglyph or papyrus-style novelty faces, ever.

### Hierarchy
- **Display** (serif): game title, win banner only.
- **Body / Label** (sans): turn indicator, throw result numeral, house explanations, settings. Weight contrast ≥ 1.25 scale steps; body ≤ 75ch.

### Named Rules
**The Rare Serif Rule.** The serif is ceremonial. If it appears more than twice on one screen, it has lost its weight.
**The Numeral Rule.** A stick throw always resolves to a large, unambiguous numeral; the stick faces are theatre, the numeral is the fact.

## 4. Elevation

Flat by default. Depth comes from the material fiction, not shadow stacks: the grid reads as inlaid into the wood, tokens sit in shallow depressions. A token gets a single soft contact shadow only while lifted mid-drag, vanishing on settle; the thrown sticks may cast one while airborne. No card shadows, no layered panels.

### Named Rules
**The Lift-Only Rule.** The only shadows in the app belong to a piece in the player's grip and sticks in the air.

## 6. Do's and Don'ts

### Do:
- **Do** make the wooden box the page; HUD and settings stay peripheral and quiet.
- **Do** give every interaction spring weight: tokens lag and settle, sticks tumble, illegal drops bounce back.
- **Do** keep player tokens distinct by shape + color (spools vs. cones), AA-contrasted against the wood.
- **Do** let Faience mark only what's live: legal targets, the active house, the throw result.
- **Do** honor `prefers-reduced-motion` with fades/instant placement and a non-animated throw result.
- **Do** draw grid lines with slight carved/inlaid irregularity; crafted imperfection over vector sterility.

### Don't:
- **Don't** produce "Egyptian kitsch": no Papyrus or hieroglyph novelty fonts, no gold-on-black pharaoh bling, no Vegas/slot-machine Egypt, no clip-art ankhs and scarabs as decoration.
- **Don't** produce "generic SaaS/flat web": no sterile flat cards, default blues, corporate minimalism, dashboard chrome.
- **Don't** produce "cheap mobile-game clutter": no coins, popups, neon gradients, fake-3D plastic buttons, reward jingles.
- **Don't** use pure #000 or #fff, side-stripe borders, gradient text, or glassmorphism.
- **Don't** put the board inside a card or container; no nested chrome around the play surface.
- **Don't** convey a throw result by stick faces or color alone; the numeral is always present.
