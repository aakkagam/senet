# Delta: app-scaffold (playable-core)

The placeholder shell gives way to the playable game; the layout requirement stops reserving `geometry.ts`/`motion.ts` for the future.

## REMOVED Requirements

### Requirement: Placeholder app shell
**Reason**: The placeholder ("coming soon") is replaced by the playable game this change delivers.
**Migration**: Superseded by "Playable app shell" below; the SEO head and crawlable prose obligations carry over unchanged.

## ADDED Requirements

### Requirement: Playable app shell
The app SHALL mount the playable game (board, tokens, turn flow) wired to the runes store. `index.html` SHALL keep the full SEO head (title, meta description, canonical, OG/Twitter tags, `VideoGame` JSON-LD referencing `https://games.aakkagam.com/senet/`) and crawlable prose about Senet below the mount point; the prose SHALL drop its "coming soon" wording.

#### Scenario: Game renders
- **WHEN** the built site is served
- **THEN** the board renders and a full game can be played without console errors, and the prose remains present in the static HTML

## MODIFIED Requirements

### Requirement: Three-layer source layout
The source SHALL follow align3's layout: `src/lib/game/` containing only pure framework-free logic, `src/lib/store.svelte.ts` as the runes-based bridge, `src/lib/components/` for Svelte components, with `src/lib/geometry.ts` (abstract viewBox geometry, including the boustrophedon mapping) and `src/lib/motion.ts` (spring tuning and reduced-motion handling) as UI-side modules. `src/lib/game/` SHALL NOT import from Svelte or any framework module.

#### Scenario: Pure layer has no framework imports
- **WHEN** the modules under `src/lib/game/` are inspected
- **THEN** none imports `svelte` or any `*.svelte`/`*.svelte.ts` module

#### Scenario: Boustrophedon lives only in geometry
- **WHEN** the modules under `src/lib/game/` are inspected
- **THEN** none maps square numbers to rows or columns
