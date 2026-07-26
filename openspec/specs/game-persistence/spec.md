# Spec: game-persistence

## Purpose

Full mid-game persistence to localStorage so a page refresh never loses a 10–20 minute hotseat game. Implemented as a pure, unit-tested `persist.ts` module (ostomachion pattern); the store layer wires it to actual localStorage.

## Requirements

### Requirement: Save on every state change
The app SHALL persist the complete `GameState` (including turn phase, pending throw, and first-move flags) to localStorage after every state transition, under a single namespaced key that includes a schema version.

#### Scenario: Mid-turn state is captured
- **WHEN** a player has thrown but not yet moved and the state is persisted
- **THEN** the saved payload contains the pending throw value and the awaiting-move phase

### Requirement: Restore on load
On startup, the app SHALL restore a saved game whose schema version matches, resuming exactly where play stopped. A missing save SHALL start a fresh game.

#### Scenario: Refresh resumes the game
- **WHEN** the page reloads with a valid save present
- **THEN** the restored state is deeply equal to the last persisted state

#### Scenario: No save starts fresh
- **WHEN** the page loads with no save present
- **THEN** a new game begins at initial setup

### Requirement: Invalid saves are discarded
A save that fails to parse, fails structural validation, or carries a mismatched schema version SHALL be discarded and replaced by a fresh game. Restore SHALL never throw.

#### Scenario: Corrupt payload
- **WHEN** the stored value is not valid JSON or fails validation
- **THEN** the save is cleared and a fresh game starts without an exception

#### Scenario: Version mismatch
- **WHEN** the stored schema version differs from the app's current version
- **THEN** the save is discarded and a fresh game starts

### Requirement: Completed games are not resumed
When a game reaches its terminal (won) state, the app SHALL clear the save so the next load starts a fresh game. Starting a new game SHALL overwrite any existing save.

#### Scenario: Win clears the save
- **WHEN** a player wins and the page later reloads
- **THEN** a fresh game begins
