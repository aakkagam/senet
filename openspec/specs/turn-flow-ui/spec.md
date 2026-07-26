# Spec: turn-flow-ui

## Purpose

The full turn loop made visible and operable: throwing, results, forced moves, the house-27 choice, winning, and starting over. The UI is a function of the engine's `Phase`.

## Requirements

### Requirement: Whose turn is always visible
The UI SHALL always indicate the current player, by shape + color + label (never color alone), positioned so both hotseat players can read it at a glance.

#### Scenario: Turn indicator follows the game
- **WHEN** a move ends a player's turn
- **THEN** the indicator switches to the other player

### Requirement: Throwing the sticks
During awaiting-throw, a throw control SHALL be available to the current player. The result SHALL always be shown as a large numeral (stick faces may be shown as static glyphs, but the numeral is the fact), and a throw granting another throw SHALL be visibly marked.

#### Scenario: Result shows as a numeral
- **WHEN** the player throws
- **THEN** the resolved value (1–5) renders as a numeral, regardless of any stick-face rendering

#### Scenario: Extra throw is announced
- **WHEN** the throw is a 1, 4, or 5
- **THEN** the UI marks that the player throws again after moving

### Requirement: Forced situations are explained in the moment
When only backward moves are legal, the UI SHALL say so briefly and, if an extra throw was pending, show that it is forfeited. When no move is legal at all, the UI SHALL show a short notice before the turn indicator flips.

#### Scenario: Backward-only turn is labeled
- **WHEN** applyThrow yields a backward-move phase
- **THEN** a brief message states there are no forward moves and highlights run on backward origins

#### Scenario: No legal move notice
- **WHEN** a throw yields no legal move and the turn ends
- **THEN** the player sees a notice that no move was possible before the opponent's turn begins

### Requirement: House of Waters choice
When the phase is house-27-choice, the UI SHALL present exactly two actions anchored to square 27: return the token to the House of Second Life (executes without a throw and ends the turn) or throw for it (a 4 bears it off with an extra turn; any other value leaves it and ends the turn, with the result shown as a numeral).

#### Scenario: Choice blocks other input
- **WHEN** the phase is house-27-choice
- **THEN** no other token can be selected and the throw control is replaced by the two options

#### Scenario: Return executes without throwing
- **WHEN** the player picks the return option
- **THEN** the token moves to square 15 (or its fallback) and the turn passes with no throw

### Requirement: Win and play again
When a player bears off their fifth token, the UI SHALL show a win banner naming the winner and offering a new game. Starting a new game SHALL reset the board to the opening position (dark already advanced 10→11) and clear the saved game.

#### Scenario: Win banner appears
- **WHEN** the game reaches game-over
- **THEN** the banner names the winner, board input is disabled, and "play again" is offered

#### Scenario: Play again starts fresh
- **WHEN** the player chooses play again
- **THEN** a fresh game begins and the previous save is gone after reload

### Requirement: A restored game resumes visibly mid-turn
When a saved game restores on load, the UI SHALL reflect the restored phase exactly: pending throw values, movable-token highlights, the house-27 choice, or the awaiting-throw control — whatever was persisted.

#### Scenario: Mid-move restore shows highlights
- **WHEN** the page reloads with a save in an awaiting-move phase
- **THEN** the same legal origins are highlighted and the pending value is shown without re-throwing
