# Spec: game-rules

Pure, framework-free Senet rule engine in `src/lib/game/`, implementing the Oriental Institute ruleset (authoritative per CLAUDE.md). All transitions are immutable: they return a new `GameState` or `null` for illegal actions. Every requirement below is unit-tested.

## ADDED Requirements

### Requirement: Linear board path
The engine SHALL model the board as a linear path of squares 1..30. The 3×10 boustrophedon layout SHALL be a rendering concern only and SHALL NOT appear in the game logic.

#### Scenario: Path adjacency across a row corner
- **WHEN** path adjacency of squares 20 and 21 is evaluated
- **THEN** they are consecutive, exactly like 10 and 11

#### Scenario: Visual column neighbors are not adjacent
- **WHEN** path adjacency of squares 18 and 23 is evaluated (visually stacked in the grid)
- **THEN** they are not consecutive on the path

### Requirement: Initial setup
A new game SHALL place 5 light tokens on odd squares 1, 3, 5, 7, 9 and 5 dark tokens on even squares 2, 4, 6, 8, 10, with squares 11–30 empty and zero tokens borne off.

#### Scenario: Fresh game state
- **WHEN** a new game is created
- **THEN** light occupies 1, 3, 5, 7, 9; dark occupies 2, 4, 6, 8, 10; all other squares are empty; borne-off counts are 0/0

### Requirement: Stick throw resolution
The engine SHALL resolve a throw as a pure function of four two-sided stick faces, counting light sides up: 1 light → value 1 with extra throw; 2 light → value 2; 3 light → value 3; 4 light → value 4 with extra throw; 0 light → value 5 with extra throw.

#### Scenario: Zero light faces counts as five
- **WHEN** a throw of 0 light faces is resolved
- **THEN** the result is value 5 with an extra throw granted

#### Scenario: Two light faces
- **WHEN** a throw of 2 light faces is resolved
- **THEN** the result is value 2 with no extra throw

### Requirement: First-move rule
The player who first throws a 1 SHALL take dark, SHALL move the token on square 10 to square 11, and SHALL throw again (then moving any dark token). The opposing player SHALL take light and on light's first move MUST move the token starting on square 9 before any other light token.

#### Scenario: Dark's opening move is forced
- **WHEN** the game starts after first-throw determination
- **THEN** dark's token on square 10 is on square 11 and dark has an extra throw

#### Scenario: Light's first move restricted to square 9
- **WHEN** light attempts a first move with any token other than the one on square 9
- **THEN** the move is rejected as illegal

### Requirement: Basic movement
On a turn a player SHALL move exactly one token forward by exactly the throw value. A token SHALL NOT land on a square occupied by a token of the same player. Only one token may occupy a square.

#### Scenario: Forward move by throw value
- **WHEN** a player with a throw of 3 moves a token from square 12
- **THEN** the token lands on square 15's path position (square 15) if that landing is legal

#### Scenario: Landing on own token is illegal
- **WHEN** a move would land on a square occupied by the mover's own token
- **THEN** the move is rejected as illegal

### Requirement: Capture by swap
Landing exactly on an opponent's unprotected token SHALL swap the two tokens: the opponent's token moves to the square the moving token started from.

#### Scenario: Swap exchanges squares
- **WHEN** light moves from square 12 to square 14 where an unprotected dark token sits
- **THEN** light occupies 14 and the dark token occupies 12

#### Scenario: Displaced token does not trigger house effects
- **WHEN** a swap sends the opponent's token to the mover's origin square and that square is a special house
- **THEN** the house effect does not trigger for the displaced token

### Requirement: Protection of consecutive pairs
Two tokens of the same player on consecutive path squares SHALL be immune to capture: an opponent SHALL NOT land on either. Protection SHALL apply across row corners (e.g. 20 and 21) and SHALL NOT apply on squares 27–30.

#### Scenario: Protected pair cannot be swapped
- **WHEN** an opponent's move would land on either token of a consecutive same-player pair on squares 1–26
- **THEN** the move is rejected as illegal

#### Scenario: No protection on 27–30
- **WHEN** two same-player tokens sit on squares 28 and 29 and an opponent's move lands exactly on one of them
- **THEN** the swap proceeds

### Requirement: Walls
Three or more tokens of the same player on consecutive path squares SHALL form a wall that opposing tokens cannot pass, in either direction.

#### Scenario: Forward passage blocked
- **WHEN** an opponent's forward move would pass over a 3-token wall
- **THEN** the move is rejected as illegal

#### Scenario: Backward passage blocked
- **WHEN** an opponent's backward move would pass over a 3-token wall
- **THEN** the move is rejected as illegal

### Requirement: Forced moves
If any forward move is legal, the player MUST move forward. If no forward move is legal, the player MUST move a token backward by the throw value and SHALL forfeit any extra throws earned that turn. If no legal move exists in either direction, the turn SHALL end immediately.

#### Scenario: Backward move forfeits extra throws
- **WHEN** a player who threw a 4 (extra throw) has no legal forward move and moves backward
- **THEN** the pending extra throw is forfeited and the turn passes

#### Scenario: No legal move ends the turn
- **WHEN** a player has no legal forward or backward move after throwing
- **THEN** the turn ends immediately

### Requirement: House of Second Life (square 15)
A token landing on square 15 SHALL be sent immediately to square 1. If square 1 is occupied, the token SHALL be placed on the first empty square encountered scanning forward from square 1. Landing on 15 by a backward move SHALL trigger the same effect.

#### Scenario: Rebirth to square 1
- **WHEN** a token lands on square 15 and square 1 is empty
- **THEN** the token is placed on square 1

#### Scenario: Rebirth target occupied
- **WHEN** a token lands on square 15 and square 1 is occupied
- **THEN** the token is placed on the lowest-numbered empty square greater than 1

### Requirement: House of Beauty (square 26)
No token SHALL move beyond square 26 until that token has first landed on square 26 by an exact throw. The gate SHALL apply to forward movement only; backward moves may cross 26.

#### Scenario: Cannot pass 26 without landing
- **WHEN** a token on square 24 that has never landed on 26 attempts a forward move of 4
- **THEN** the move is rejected as illegal

#### Scenario: Exact landing opens the gate
- **WHEN** a token lands exactly on square 26 and later throws allow forward movement
- **THEN** the token may move beyond 26

### Requirement: House of Waters (square 27)
Landing on square 27 SHALL forfeit any extra throws. On that player's next turn the token MUST either return to square 15 (ending the turn without throwing; if 15 is occupied, the rebirth fallback applies) or throw: a 4 SHALL bear the token off and grant an extra turn; any other value SHALL leave it in place and end the turn.

#### Scenario: Landing forfeits extra throws
- **WHEN** a token lands on square 27 off a throw that granted an extra throw
- **THEN** the extra throw is forfeited and the turn passes

#### Scenario: Throwing a 4 bears off from 27
- **WHEN** the player chooses to throw for the token on 27 and the throw resolves to 4
- **THEN** the token is borne off and the player takes an extra turn

#### Scenario: Non-4 throw leaves the token stuck
- **WHEN** the player chooses to throw for the token on 27 and the throw resolves to any value except 4
- **THEN** the token stays on 27 and the turn ends

### Requirement: Exact-throw exits (squares 28 and 29)
A token on square 28 SHALL bear off only on an exact throw of 3. A token on square 29 SHALL bear off only on an exact throw of 2.

#### Scenario: Square 28 requires a 3
- **WHEN** the player moves the token on square 28 with a throw of 3
- **THEN** the token is borne off

#### Scenario: Wrong value cannot exit
- **WHEN** the player attempts to bear off from square 29 with a throw other than 2
- **THEN** the bear-off is rejected as illegal

### Requirement: House of Horus (square 30)
A token on square 30 SHALL bear off on any throw (value 1 or greater).

#### Scenario: Any throw bears off from 30
- **WHEN** the player moves the token on square 30 with any throw value
- **THEN** the token is borne off

### Requirement: Win condition
The first player to bear off all 5 tokens SHALL win, and the game SHALL enter a terminal state accepting no further moves.

#### Scenario: Fifth bear-off wins
- **WHEN** a player bears off their fifth token
- **THEN** the game state records that player as winner and rejects further throws and moves

### Requirement: Serializable game state
`GameState` SHALL be plain JSON-serializable data (no classes, functions, Maps, Sets, or Dates), and every transition SHALL return a new state without mutating its input.

#### Scenario: JSON round-trip preserves state
- **WHEN** any reachable `GameState` is serialized to JSON and parsed back
- **THEN** the result is deeply equal to the original

#### Scenario: Transitions do not mutate
- **WHEN** any transition function is applied to a state
- **THEN** the input state is unchanged
