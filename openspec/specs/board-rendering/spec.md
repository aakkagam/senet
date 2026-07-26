# Spec: board-rendering

## Purpose

The 30-square senet box drawn as a single SVG stage. The engine's linear 1..30 path is mapped to the 3×10 boustrophedon here and nowhere else.

## Requirements

### Requirement: Boustrophedon layout
The board SHALL render 30 squares in a 3×10 grid traversed in a reverse-S: squares 1–10 left-to-right on the top row, 11–20 right-to-left on the middle row, 21–30 left-to-right on the bottom row. The mapping SHALL live in a single geometry function; no other module derives row/column from a square number.

#### Scenario: Path corners are visually continuous
- **WHEN** the board renders
- **THEN** square 11 sits directly below square 10, and square 21 directly below square 20, so the path turns without a gap

#### Scenario: Middle row runs right-to-left
- **WHEN** the positions of squares 11 and 20 are compared
- **THEN** square 11 is at the right end of the middle row and square 20 at the left end

### Requirement: Special house marks
Squares 15, 26, 27, 28, 29, and 30 SHALL carry restrained visual marks distinguishing them from plain squares. Marks SHALL be legible as shape/glyph, not conveyed by color alone.

#### Scenario: Houses are distinguishable
- **WHEN** the board renders in grayscale
- **THEN** the six special houses remain visually distinct from plain squares

### Requirement: The board is the app
The game SHALL render as one SVG stage with the board centered; HUD elements (turn indicator, throw control, messages) stay peripheral to the box, and the board is never nested inside cards or panels. On viewports too narrow for the landscape box, the stage SHALL letterbox (preserving board proportions) rather than reflow, remaining playable at 360px width.

#### Scenario: Narrow viewport stays playable
- **WHEN** the page renders at 360×640
- **THEN** all 30 squares and both players' controls are visible and interactive without horizontal scrolling

### Requirement: Borne-off tokens remain visible
Tokens borne off the board SHALL be shown in a per-player tray beside the box, so both players can read the race state (n of 5 off) at a glance.

#### Scenario: Bear-off moves a token to the tray
- **WHEN** a player bears a token off
- **THEN** that token appears in the player's tray and the board square is empty
