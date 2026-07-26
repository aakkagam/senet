# Spec: house-teaching

Teach-through-the-board: special houses explain themselves at the moment they act, with transient notes anchored on the board — no tutorials, no lore panels.

## ADDED Requirements

### Requirement: House landings are explained in the moment
When a token lands on a special house whose effect is not self-evident, a short note anchored at that house SHALL name the house and state what just happened: rebirth on 15 (token returns toward the start), capture by the Waters on 27 (stuck until a 4, or a return to Second Life), and arrival on 28, 29, or 30 (the exact throw needed to leave). Notes SHALL derive from engine transitions, not re-derived rules.

#### Scenario: Rebirth explains itself
- **WHEN** a token lands on square 15 and is reborn
- **THEN** a note anchored at square 15 names the House of Second Life and says the token returns to the start

#### Scenario: The Waters explain themselves
- **WHEN** a token lands on square 27
- **THEN** a note anchored at square 27 names the House of Waters and states the token is stuck until a 4 or a return to Second Life

#### Scenario: The judges explain their exact throws
- **WHEN** a token lands on square 28 or 29
- **THEN** a note anchored at that square states the exact throw (3 or 2) required to bear it off

### Requirement: Gate refusals are explained
When a player's grab or tap of a token is refused and the House of Beauty gate is the reason (the move would pass square 26 without having landed there), a note anchored at square 26 SHALL say the token must land on 26 by exact throw before passing. The refusal reason SHALL come from a read-only rule-engine helper.

#### Scenario: Blocked by the gate
- **WHEN** a player taps a token whose only obstacle is the 26 gate
- **THEN** the token refuses as usual and a note at square 26 explains the exact-landing rule

### Requirement: Notes are transient and non-blocking
At most one note SHALL show at a time (a newer note replaces the current one). Notes SHALL auto-dismiss within a few seconds, SHALL never gate input or delay turn flow, and SHALL be announced to screen readers via a polite live region. Landing notes SHALL fire once per game per house (reset on new game); refusal notes MAY repeat since they respond to a player action. If a note would overlap the active house-27 choice panel, the panel wins and the note is suppressed.

#### Scenario: Note dismisses itself
- **WHEN** a house note appears and the player does nothing
- **THEN** the note disappears on its own and play was never blocked

#### Scenario: Landing notes fire once per game
- **WHEN** a second token lands on square 15 in the same game
- **THEN** no rebirth note is shown, and after starting a new game the note fires again

### Requirement: Notes respect reduced motion
Under `prefers-reduced-motion`, notes SHALL appear and dismiss with instant placement or brief fades — no movement animation.

#### Scenario: Reduced-motion note
- **WHEN** `prefers-reduced-motion: reduce` is set and a house event fires
- **THEN** the note appears without motion and dismisses the same way
