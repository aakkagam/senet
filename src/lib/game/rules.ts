/** Senet rule engine — Oriental Institute ruleset (the spec in CLAUDE.md).
 *  Every transition is immutable: it returns a new GameState, or null for an
 *  illegal action in the current state. */

import type { Direction, GameState, Phase, Player, ThrowResult } from './types';
import {
  FIRST_SQUARE,
  HOUSE_BEAUTY,
  HOUSE_HORUS,
  HOUSE_REBIRTH,
  HOUSE_THREE_JUDGES,
  HOUSE_TWO_JUDGES,
  HOUSE_WATERS,
  LAST_SQUARE,
  isProtectedAt,
  opponent,
  wallBlocksPassage,
} from './board';

export const TOKENS_PER_PLAYER = 5;

/** Board before the first-throw ritual: light on odd 1–9, dark on even 2–10. */
export function setupSquares(): (Player | null)[] {
  const squares: (Player | null)[] = Array.from({ length: LAST_SQUARE + 1 }, () => null);
  for (let s = 1; s <= 10; s++) squares[s] = s % 2 === 1 ? 'light' : 'dark';
  return squares;
}

/** Playable start, after the first-throw determination: the winner of the
 *  ritual takes dark, has already made the forced opening 10→11, and throws
 *  again. Light's first move is restricted to the square-9 token. */
export function newGame(): GameState {
  const squares = setupSquares();
  squares[10] = null;
  squares[11] = 'dark';
  return {
    squares,
    borneOff: { light: 0, dark: 0 },
    turn: 'dark',
    phase: { kind: 'awaiting-throw' },
    lightFirstMoveDone: false,
  };
}

type MoveOutcome = { kind: 'bear-off' } | { kind: 'land'; to: number; swap: boolean };

function landingOutcome(
  squares: readonly (Player | null)[],
  mover: Player,
  to: number,
): { swap: boolean } | null {
  const occupant = squares[to];
  if (!occupant) return { swap: false };
  if (occupant === mover) return null;
  if (isProtectedAt(squares, to)) return null;
  return { swap: true };
}

/** Legality of moving the current player's token at `from` by `value` in
 *  `direction`. Returns the outcome or null when illegal. */
function moveOutcome(
  state: GameState,
  from: number,
  value: number,
  direction: Direction,
): MoveOutcome | null {
  const { squares, turn } = state;
  if (squares[from] !== turn) return null;
  // A token on the House of Waters moves only via the house-27 choice.
  if (from === HOUSE_WATERS) return null;

  if (direction === 'forward') {
    // Exact-throw exits: tokens in the last houses leave the board, never move within 27–30.
    if (from === HOUSE_HORUS) return { kind: 'bear-off' };
    if (from === HOUSE_TWO_JUDGES) return value === 2 ? { kind: 'bear-off' } : null;
    if (from === HOUSE_THREE_JUDGES) return value === 3 ? { kind: 'bear-off' } : null;
    const to = from + value;
    if (to > LAST_SQUARE) return null;
    // House of Beauty gate: forward movement beyond 26 only from 26 itself
    // (a token on 26 has, by construction, landed there).
    if (from < HOUSE_BEAUTY && to > HOUSE_BEAUTY) return null;
    if (wallBlocksPassage(squares, turn, from, to)) return null;
    const landing = landingOutcome(squares, turn, to);
    return landing ? { kind: 'land', to, swap: landing.swap } : null;
  }

  const to = from - value;
  if (to < FIRST_SQUARE) return null;
  // The 26-gate applies to forward passage only; backward moves may cross it.
  if (wallBlocksPassage(squares, turn, from, to)) return null;
  const landing = landingOutcome(squares, turn, to);
  return landing ? { kind: 'land', to, swap: landing.swap } : null;
}

/** Squares the current player may move from, honouring light's first-move
 *  restriction to the token on square 9 (lifted if that token was displaced). */
function candidateOrigins(state: GameState): number[] {
  if (!state.lightFirstMoveDone && state.turn === 'light' && state.squares[9] === 'light') {
    return [9];
  }
  const origins: number[] = [];
  for (let s = FIRST_SQUARE; s <= LAST_SQUARE; s++) {
    if (state.squares[s] === state.turn) origins.push(s);
  }
  return origins;
}

/** Origins with a legal move for `value` in `direction`. */
export function legalOrigins(state: GameState, value: number, direction: Direction): number[] {
  return candidateOrigins(state).filter((from) => moveOutcome(state, from, value, direction) !== null);
}

/** Read-only UI helper: where the pending throw would take the token at
 *  `from` — a destination square, 'off' for a bear-off, or null when the
 *  move is illegal (or no move is pending). */
export function legalTarget(state: GameState, from: number): number | 'off' | null {
  if (state.phase.kind !== 'awaiting-move') return null;
  if (!candidateOrigins(state).includes(from)) return null;
  const outcome = moveOutcome(state, from, state.phase.value, state.phase.direction);
  if (!outcome) return null;
  return outcome.kind === 'bear-off' ? 'off' : outcome.to;
}

/** Place a token on `target`, or on the first empty square scanning forward
 *  from it when occupied (the rebirth fallback). */
function placeWithFallback(squares: (Player | null)[], target: number, token: Player): void {
  for (let s = target; s <= LAST_SQUARE; s++) {
    if (!squares[s]) {
      squares[s] = token;
      return;
    }
  }
  throw new Error('no empty square found — impossible with 10 tokens on 30 squares');
}

/** Hand the turn to the opponent; a token of theirs stuck on the House of
 *  Waters forces the house-27 choice before anything else. */
function endTurn(state: GameState): GameState {
  const next = opponent(state.turn);
  const phase: Phase =
    state.squares[HOUSE_WATERS] === next ? { kind: 'house-27-choice' } : { kind: 'awaiting-throw' };
  return { ...state, turn: next, phase };
}

function withWinCheck(state: GameState): GameState {
  if (state.borneOff[state.turn] === TOKENS_PER_PLAYER) {
    return { ...state, phase: { kind: 'game-over', winner: state.turn } };
  }
  return state;
}

/** Resolve a throw for the current player: forward moves are forced when any
 *  exist; otherwise backward moves (forfeiting the extra throw); with no legal
 *  move at all the turn ends immediately. */
export function applyThrow(state: GameState, throwResult: ThrowResult): GameState | null {
  if (state.phase.kind !== 'awaiting-throw') return null;
  const { value, throwAgain } = throwResult;
  if (legalOrigins(state, value, 'forward').length > 0) {
    return { ...state, phase: { kind: 'awaiting-move', value, direction: 'forward', extraThrow: throwAgain } };
  }
  if (legalOrigins(state, value, 'backward').length > 0) {
    return { ...state, phase: { kind: 'awaiting-move', value, direction: 'backward', extraThrow: false } };
  }
  return endTurn(state);
}

/** Move the current player's token at `from` by the pending throw. */
export function move(state: GameState, from: number): GameState | null {
  if (state.phase.kind !== 'awaiting-move') return null;
  const { value, direction, extraThrow } = state.phase;
  if (!candidateOrigins(state).includes(from)) return null;
  const outcome = moveOutcome(state, from, value, direction);
  if (!outcome) return null;

  const squares = state.squares.slice();
  const borneOff = { ...state.borneOff };
  const mover = state.turn;
  const lightFirstMoveDone = state.lightFirstMoveDone || mover === 'light';
  let landedOnWaters = false;

  if (outcome.kind === 'bear-off') {
    squares[from] = null;
    borneOff[mover]++;
  } else {
    const victim = squares[outcome.to];
    squares[from] = null;
    if (victim) squares[from] = victim; // swap: displaced token takes the origin, no house effects
    if (outcome.to === HOUSE_REBIRTH) {
      // House of Second Life: the arriving token is reborn on square 1
      // (forward-scan fallback when occupied). Triggers on backward landings too.
      // A swapped-out victim has already taken the origin, so 15 ends empty.
      squares[outcome.to] = null;
      placeWithFallback(squares, FIRST_SQUARE, mover);
    } else {
      squares[outcome.to] = mover;
      landedOnWaters = outcome.to === HOUSE_WATERS;
    }
  }

  const moved = withWinCheck({ ...state, squares, borneOff, lightFirstMoveDone });
  if (moved.phase.kind === 'game-over') return moved;
  // Landing on the House of Waters forfeits extra throws; backward moves
  // already forfeited theirs in applyThrow.
  if (extraThrow && direction === 'forward' && !landedOnWaters) {
    return { ...moved, phase: { kind: 'awaiting-throw' } };
  }
  return endTurn(moved);
}

/** House-27 choice (a): return the stuck token to the House of Second Life
 *  (square 15, rebirth fallback when occupied) and end the turn without throwing. */
export function waterReturn(state: GameState): GameState | null {
  if (state.phase.kind !== 'house-27-choice') return null;
  const squares = state.squares.slice();
  squares[HOUSE_WATERS] = null;
  placeWithFallback(squares, HOUSE_REBIRTH, state.turn);
  return endTurn({ ...state, squares });
}

/** House-27 choice (b): throw for the stuck token. A 4 bears it off and grants
 *  an extra turn; any other value leaves it stuck and ends the turn. */
export function waterThrow(state: GameState, throwResult: ThrowResult): GameState | null {
  if (state.phase.kind !== 'house-27-choice') return null;
  if (throwResult.value !== 4) return endTurn(state);
  const squares = state.squares.slice();
  squares[HOUSE_WATERS] = null;
  const borneOff = { ...state.borneOff };
  borneOff[state.turn]++;
  const next = withWinCheck({ ...state, squares, borneOff });
  if (next.phase.kind === 'game-over') return next;
  return { ...next, phase: { kind: 'awaiting-throw' } };
}
