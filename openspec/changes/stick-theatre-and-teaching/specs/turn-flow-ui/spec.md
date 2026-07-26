# Delta: turn-flow-ui (stick-theatre-and-teaching)

The throw result is now revealed through the stick animation; the numeral-is-the-fact and reduced-motion obligations carry over unchanged.

## MODIFIED Requirements

### Requirement: Throwing the sticks
During awaiting-throw, a throw control SHALL be available to the current player and SHALL be disabled while a tumble is running. The result SHALL be revealed through the animated stick tumble (under `prefers-reduced-motion`, instantly), and SHALL always be shown as a large numeral once revealed — the stick faces are theatre, the numeral is the fact. A throw granting another throw SHALL be visibly marked at or after the reveal.

#### Scenario: Result shows as a numeral
- **WHEN** the player throws and the tumble completes
- **THEN** the resolved value (1–5) renders as a numeral, regardless of any stick-face rendering

#### Scenario: Extra throw is announced
- **WHEN** the throw is a 1, 4, or 5
- **THEN** the UI marks that the player throws again after moving, at or after the reveal

#### Scenario: Throw control locked during the tumble
- **WHEN** the sticks are tumbling
- **THEN** the throw control is disabled and cannot start another throw
