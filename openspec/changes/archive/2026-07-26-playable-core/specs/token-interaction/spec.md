# Spec: token-interaction

Selecting and moving tokens. Senet's destination is forced by the throw, so interaction is origin-only: tap a legal token to move it, or drag it for tactility.

## ADDED Requirements

### Requirement: Token identity by shape and color
Light and dark tokens SHALL differ by shape (spools vs. cones) as well as color (Ivory vs. Ebony), and both SHALL hold WCAG AA contrast against the board surface and against each other. Player identity SHALL never be conveyed by color alone.

#### Scenario: Tokens distinguishable in grayscale
- **WHEN** the board is viewed in grayscale
- **THEN** light and dark tokens remain distinguishable by silhouette

### Requirement: Legal moves are visible before they are made
When the current player must move, their tokens with a legal move SHALL be visibly indicated, and selecting (press/hover/drag) one of them SHALL highlight its forced destination square in the Faience accent. Highlights SHALL derive from the rule engine's legality functions, never re-derived in components.

#### Scenario: Legal origins indicated
- **WHEN** the phase is awaiting-move
- **THEN** exactly the tokens returned as legal origins by the engine are indicated as movable

#### Scenario: Destination glows on selection
- **WHEN** the player presses or drags a legal token
- **THEN** the square it would land on (or its tray, for a bear-off) is highlighted

### Requirement: Tap to move
Tapping or clicking a token with a legal move SHALL commit that move. Tapping a token with no legal move (or out of turn) SHALL refuse with brief motion feedback (a shake) and leave the state unchanged.

#### Scenario: Tap commits the forced destination
- **WHEN** the player taps a legal token
- **THEN** the token moves by the pending throw value and the turn advances per the rules

#### Scenario: Illegal tap refuses without state change
- **WHEN** the player taps an opponent token or a token with no legal move
- **THEN** the token shakes and the game state is unchanged

### Requirement: Drag with tap fallback
Tokens SHALL also be draggable: releasing on or near the forced destination commits the move; releasing anywhere else springs the token back to its square without a state change. Effective touch targets SHALL be at least 44px at typical viewport sizes, and every drag interaction SHALL remain achievable by tap alone.

#### Scenario: Drop near destination commits
- **WHEN** a dragged legal token is released within the destination square's capture zone
- **THEN** the move commits exactly as a tap would

#### Scenario: Stray drop bounces back
- **WHEN** a dragged token is released away from its destination
- **THEN** it returns to its origin square and the state is unchanged

### Requirement: Board changes animate with weight
Moves, swaps, rebirths, and bear-offs SHALL animate with spring motion on identity-stable token sprites: a swap shows both tokens crossing, a rebirth flies the token back to its landing square near the start. Under `prefers-reduced-motion` all of these SHALL resolve as instant placement or brief fades.

#### Scenario: Swap animates both tokens
- **WHEN** a capture-by-swap commits
- **THEN** the mover and the displaced token each animate to their new squares

#### Scenario: Reduced motion places instantly
- **WHEN** `prefers-reduced-motion: reduce` is set and a move commits
- **THEN** tokens appear at their new positions without spring animation
