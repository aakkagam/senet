import type { Player } from './types';

export const FIRST_SQUARE = 1;
export const LAST_SQUARE = 30;

export const HOUSE_REBIRTH = 15;
export const HOUSE_BEAUTY = 26;
export const HOUSE_WATERS = 27;
export const HOUSE_THREE_JUDGES = 28;
export const HOUSE_TWO_JUDGES = 29;
export const HOUSE_HORUS = 30;

export function opponent(p: Player): Player {
  return p === 'light' ? 'dark' : 'light';
}

export function isOnPath(square: number): boolean {
  return Number.isInteger(square) && square >= FIRST_SQUARE && square <= LAST_SQUARE;
}

/** Path adjacency: purely linear, so 20|21 are adjacent (row corner) while
 *  visually stacked squares like 18|23 are not. */
export function isAdjacent(a: number, b: number): boolean {
  return isOnPath(a) && isOnPath(b) && Math.abs(a - b) === 1;
}

/** Length of the consecutive same-player run containing `square`. */
export function runLength(squares: readonly (Player | null)[], square: number): number {
  const p = squares[square];
  if (!p) return 0;
  let lo = square;
  while (lo - 1 >= FIRST_SQUARE && squares[lo - 1] === p) lo--;
  let hi = square;
  while (hi + 1 <= LAST_SQUARE && squares[hi + 1] === p) hi++;
  return hi - lo + 1;
}

/** A token is protected from capture when it has a same-player neighbour on the
 *  path — except on squares 27–30, where protection never applies. */
export function isProtectedAt(squares: readonly (Player | null)[], square: number): boolean {
  const p = squares[square];
  if (!p || square >= HOUSE_WATERS) return false;
  return squares[square - 1] === p || squares[square + 1] === p;
}

/** Member of a 3+ consecutive same-player run (an impassable wall). */
export function isWallMember(squares: readonly (Player | null)[], square: number): boolean {
  return runLength(squares, square) >= 3;
}

/** True when a move by `mover` from `from` to `to` would pass over an opposing
 *  wall. Walls block passage in both directions; the landing square itself is
 *  governed by capture/protection rules, not passage. */
export function wallBlocksPassage(
  squares: readonly (Player | null)[],
  mover: Player,
  from: number,
  to: number,
): boolean {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  for (let s = lo + 1; s < hi; s++) {
    const occ = squares[s];
    if (occ && occ !== mover && isWallMember(squares, s)) return true;
  }
  return false;
}
