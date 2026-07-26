# Spec: stick-theatre

The animated casting-stick throw: anticipation, tumble, reveal. The sticks are theatre; the numeral remains the fact.

## ADDED Requirements

### Requirement: The throw animates as a tumble and reveal
Throwing SHALL animate four stick sprites on the stage — rising, flipping, and settling — with each stick landing showing the actual face from the resolved throw. The numeral SHALL resolve at the end of the tumble, and the settled sticks SHALL remain visible as the record of the last throw until the turn passes.

#### Scenario: Sticks land on their true faces
- **WHEN** a throw resolves with a given set of faces
- **THEN** after the tumble, the four stick sprites show exactly those faces and the numeral matches the resolved value

#### Scenario: Numeral resolves at the reveal
- **WHEN** the tumble is running
- **THEN** the numeral is not yet shown, and it appears when the sticks settle

### Requirement: Input waits for the reveal
While the tumble runs, the UI SHALL accept no game input: the throw control is disabled, no movable-token highlights show, and taps or drags on tokens change nothing. Turn-ending notices (no legal move, failed water throw) SHALL begin only after the reveal completes.

#### Scenario: Mid-tumble tap changes nothing
- **WHEN** a player taps a token before the sticks have settled
- **THEN** the game state is unchanged and no move commits

#### Scenario: Notice follows the reveal
- **WHEN** a throw yields no legal move
- **THEN** the sticks settle and the numeral appears before the no-move notice and turn handover are shown

### Requirement: The house-27 throw uses the same theatre
Throwing for a token stuck on the House of Waters SHALL run the same tumble and reveal before the outcome (bear-off on a 4, or the stays-stuck notice) is shown.

#### Scenario: Water throw tumbles first
- **WHEN** the player chooses to throw for the stuck token
- **THEN** the sticks tumble and reveal the value before the outcome is applied visually

### Requirement: The theatre can never block the game
The reveal SHALL complete within a bounded time even if animation completion events are lost (a fail-safe timer clears the gating state). A reload during the tumble SHALL restore the already-committed phase directly, without replaying the animation.

#### Scenario: Lost animation event
- **WHEN** the tumble's completion callback never fires
- **THEN** input is re-enabled after the fail-safe timeout and the numeral is shown

#### Scenario: Reload mid-tumble
- **WHEN** the page reloads while sticks are tumbling
- **THEN** the restored UI shows the committed phase (pending value, highlights) with no tumble

### Requirement: Reduced motion collapses the theatre
Under `prefers-reduced-motion`, the tumble SHALL NOT run: the numeral appears instantly, the sticks appear already settled on their faces, and no input gating delay is introduced.

#### Scenario: Instant result under reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set and the player throws
- **THEN** the numeral and settled stick faces appear immediately and legal moves are highlighted without delay
