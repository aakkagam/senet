# Product

## Register

product

## Users

Two friends or family members sharing one device (phone, tablet, or laptop) at home, in a cafe, or while travelling. Casual, spontaneous play; a race game with luck swings, so rounds run longer than align3 (roughly 10–20 minutes) but stay light. No accounts, no network — the device passes between hands or sits between the players. Most players have never seen Senet before, so the rules (casting sticks, houses, exact-throw exits) must be learnable through the UI itself: legal moves highlighted, throws animated and explained, special squares announcing what they do when they matter.

## Product Purpose

Senet is a 2-player local-hotseat implementation of the ancient Egyptian race game: 30 squares in a reverse-S path, five tokens per side, moves decided by four two-sided casting sticks. Rules follow the Oriental Institute's "Make and Play Your Own Senet" set exactly (see CLAUDE.md — that ruleset is the spec). Part of Aakkagam Games; deploys to games.aakkagam.com/senet/. Success looks like: two people who've never heard of Senet finish a game without reading rules text, groan at a swap on square 26, and immediately deal out the tokens again.

## Brand Personality

**Warm, tactile, spirited** — the shared Aakkagam soul, in Senet's own material: a carved wooden game box with ivory and dark tokens. Daylight, domestic, playful — the household artifact Egyptians actually kept and played, not a tomb treasure behind glass. Competitive energy between the two players: the clatter of thrown sticks, the swing of a lucky capture, win moments that land. Voice in UI copy: brief, friendly, a little playful; never corporate, never lore-dumping.

## Anti-references

- **Egyptian kitsch**: no Papyrus or hieroglyph novelty fonts, no gold-on-black pharaoh bling, no Vegas/slot-machine Egypt, no clip-art ankhs and scarabs sprinkled as decoration.
- **Generic SaaS/flat web**: no sterile flat cards, default blues, corporate minimalism, dashboard chrome.
- **Cheap mobile-game clutter**: no coins, popups, neon gradients, fake-3D plastic buttons, reward jingles.

## Design Principles

1. **The board is the app.** One screen carries the whole product; HUD, stick throws, and settings stay quiet and peripheral around the wooden box.
2. **Teach through the board, not text.** Legal moves highlight, illegal drops bounce back, special houses explain themselves the moment they matter. No rules modal required to finish a first game.
3. **Weight you can feel.** Sticks clatter, tokens slide and settle with spring physics; motion is the texture and must respect reduced-motion preferences.
4. **A game box, not a monument.** Senet was a household game played for fun; the design is domestic and handled, wood worn smooth by play — never museum-solemn or pharaonic.
5. **Luck is theatre.** The stick throw is the game's heartbeat — give it a moment (anticipation, reveal, result) without slowing the rhythm of play.

## Accessibility & Inclusion

- WCAG AA contrast for all text and interactive states.
- `prefers-reduced-motion`: replace spring animations and throw theatrics with short fades/instant results.
- Colorblind-safe player identity: tokens differ by **shape + color** (historically spools vs. cones — use it), never color alone.
- Touch targets ≥ 44px; drag interactions also work with a plain tap-tap fallback.
- Stick-throw results always shown as a numeral, never conveyed by stick faces alone.
