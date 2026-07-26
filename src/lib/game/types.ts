/** Pure, framework-free Senet types. GameState is plain JSON-safe data:
 *  no classes, functions, Maps, Sets, or Dates — persistence serializes it as-is. */

export type Player = 'light' | 'dark';

export interface ThrowResult {
  value: 1 | 2 | 3 | 4 | 5;
  throwAgain: boolean;
}

export type Direction = 'forward' | 'backward';

/** Explicit turn state machine (design decision 4). */
export type Phase =
  | { kind: 'awaiting-throw' }
  | {
      kind: 'awaiting-move';
      /** Pending throw value the chosen token must move by. */
      value: number;
      /** Forward when any forward move is legal; backward moves are forced otherwise. */
      direction: Direction;
      /** Whether this throw grants another throw after the move (forfeited by backward moves and house 27). */
      extraThrow: boolean;
    }
  /** Current player has a token stuck on the House of Waters and must resolve it. */
  | { kind: 'house-27-choice' }
  | { kind: 'game-over'; winner: Player };

export interface GameState {
  /** 1-indexed linear path, squares 1..30; index 0 is unused and always null.
   *  The 3×10 boustrophedon is purely a rendering concern. */
  squares: (Player | null)[];
  borneOff: { light: number; dark: number };
  turn: Player;
  phase: Phase;
  /** Light's first move must be the token on square 9 (first-move rule);
   *  dark's forced opening 10→11 is already applied by newGame(). */
  lightFirstMoveDone: boolean;
}
