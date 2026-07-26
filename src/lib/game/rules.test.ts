import { describe, expect, it } from 'vitest';
import { applyThrow, legalOrigins, move, newGame, setupSquares } from './rules';
import { stateWith, t } from './test-helpers';
import type { GameState } from './types';

function throwThenMove(state: GameState, value: 1 | 2 | 3 | 4 | 5, from: number): GameState | null {
  const thrown = applyThrow(state, t(value));
  if (!thrown) return null;
  return move(thrown, from);
}

describe('initial setup', () => {
  it('places light on odd 1–9 and dark on even 2–10, rest empty', () => {
    const squares = setupSquares();
    for (const s of [1, 3, 5, 7, 9]) expect(squares[s]).toBe('light');
    for (const s of [2, 4, 6, 8, 10]) expect(squares[s]).toBe('dark');
    for (let s = 11; s <= 30; s++) expect(squares[s]).toBeNull();
    expect(squares[0]).toBeNull();
  });

  it('newGame applies dark’s forced opening 10→11 with an extra throw pending', () => {
    const state = newGame();
    expect(state.squares[10]).toBeNull();
    expect(state.squares[11]).toBe('dark');
    expect(state.turn).toBe('dark');
    expect(state.phase).toEqual({ kind: 'awaiting-throw' });
    expect(state.borneOff).toEqual({ light: 0, dark: 0 });
    expect(state.lightFirstMoveDone).toBe(false);
  });
});

describe('basic movement', () => {
  it('moves one token forward by exactly the throw value', () => {
    const state = stateWith({ tokens: { 5: 'light', 20: 'dark' }, turn: 'light' });
    const next = throwThenMove(state, 2, 5);
    expect(next?.squares[5]).toBeNull();
    expect(next?.squares[7]).toBe('light');
  });

  it('passes the turn after the move when no extra throw is pending', () => {
    const state = stateWith({ tokens: { 5: 'light', 20: 'dark' }, turn: 'light' });
    const next = throwThenMove(state, 2, 5);
    expect(next?.turn).toBe('dark');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });

  it('keeps the turn with an extra throw after moving', () => {
    const state = stateWith({ tokens: { 5: 'light', 20: 'dark' }, turn: 'light' });
    const thrown = applyThrow(state, t(4, true));
    const next = move(thrown!, 5);
    expect(next?.turn).toBe('light');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });

  it('rejects landing on an own token', () => {
    const state = stateWith({ tokens: { 5: 'light', 7: 'light', 20: 'dark' }, turn: 'light' });
    const thrown = applyThrow(state, t(2));
    expect(move(thrown!, 5)).toBeNull();
    expect(move(thrown!, 7)).not.toBeNull();
  });

  it('rejects moving an opponent token or an empty square', () => {
    const state = stateWith({ tokens: { 5: 'light', 20: 'dark' }, turn: 'light' });
    const thrown = applyThrow(state, t(2));
    expect(move(thrown!, 20)).toBeNull();
    expect(move(thrown!, 12)).toBeNull();
  });

  it('rejects moves outside the awaiting-move phase', () => {
    const state = stateWith({ tokens: { 5: 'light' }, turn: 'light' });
    expect(move(state, 5)).toBeNull();
    expect(applyThrow(state, t(2))).not.toBeNull();
    const midMove = applyThrow(state, t(2))!;
    expect(applyThrow(midMove, t(3))).toBeNull();
  });
});

describe('capture by swap', () => {
  it('swaps with an unprotected opponent token', () => {
    const state = stateWith({ tokens: { 12: 'light', 14: 'dark' }, turn: 'light' });
    const next = throwThenMove(state, 2, 12);
    expect(next?.squares[14]).toBe('light');
    expect(next?.squares[12]).toBe('dark');
  });

  it('does not trigger house effects for the displaced token', () => {
    // Light moves off the House of Second Life; the swapped dark token lands
    // there and must stay put rather than being reborn to square 1.
    const state = stateWith({ tokens: { 15: 'light', 17: 'dark' }, turn: 'light' });
    const next = throwThenMove(state, 2, 15);
    expect(next?.squares[17]).toBe('light');
    expect(next?.squares[15]).toBe('dark');
    expect(next?.squares[1]).toBeNull();
  });

  it('cannot land on either token of a protected pair', () => {
    const state = stateWith(
      { tokens: { 3: 'light', 11: 'light', 13: 'dark', 14: 'dark' }, turn: 'light' },
    );
    const thrown = applyThrow(state, t(2));
    expect(move(thrown!, 11)).toBeNull(); // 13 is protected
    const via12 = stateWith({ tokens: { 3: 'light', 12: 'light', 13: 'dark', 14: 'dark' }, turn: 'light' });
    const thrown2 = applyThrow(via12, t(2));
    expect(move(thrown2!, 12)).toBeNull(); // 14 is protected
  });

  it('swaps on 27–30 where protection does not apply', () => {
    const state = stateWith({ tokens: { 26: 'light', 28: 'dark', 29: 'dark' }, turn: 'light' });
    const next = throwThenMove(state, 2, 26);
    expect(next?.squares[28]).toBe('light');
    expect(next?.squares[26]).toBe('dark');
  });
});

describe('walls in movement', () => {
  it('an opposing 3-wall blocks forward passage', () => {
    const state = stateWith(
      { tokens: { 12: 'light', 3: 'light', 14: 'dark', 15: 'dark', 16: 'dark' }, turn: 'light' },
    );
    const thrown = applyThrow(state, t(5));
    expect(thrown?.phase).toMatchObject({ kind: 'awaiting-move', direction: 'forward' });
    expect(move(thrown!, 12)).toBeNull(); // 12→17 passes over the wall
    expect(move(thrown!, 3)).not.toBeNull();
  });

  it('an opposing 3-wall blocks backward passage too', () => {
    // Light on 18 threw a 5: forward 18→23 is open only if not blocked; block it
    // with dark on 23’s pair? Simpler: forward landing occupied by own token.
    const state = stateWith(
      {
        tokens: { 18: 'light', 23: 'light', 24: 'light', 14: 'dark', 15: 'dark', 16: 'dark' },
        turn: 'light',
      },
    );
    // value 5: 18→23 own token, 23→28 gate, 24→29 gate; no forward → backward.
    const thrown = applyThrow(state, t(5));
    expect(thrown?.phase).toMatchObject({ kind: 'awaiting-move', direction: 'backward' });
    expect(move(thrown!, 18)).toBeNull(); // 18→13 passes over the wall
  });
});

describe('forced moves', () => {
  it('forces forward when any forward move is legal', () => {
    const state = stateWith({ tokens: { 5: 'light', 20: 'dark' }, turn: 'light' });
    const thrown = applyThrow(state, t(2));
    expect(thrown?.phase).toMatchObject({ kind: 'awaiting-move', direction: 'forward' });
  });

  it('falls back to backward and forfeits the extra throw', () => {
    // Light’s only token on 12; dark wall on 14–16 blocks 12→16 (throw 4).
    const state = stateWith(
      { tokens: { 12: 'light', 14: 'dark', 15: 'dark', 16: 'dark' }, turn: 'light' },
    );
    const thrown = applyThrow(state, t(4, true));
    expect(thrown?.phase).toEqual({
      kind: 'awaiting-move',
      value: 4,
      direction: 'backward',
      extraThrow: false,
    });
    const next = move(thrown!, 12);
    expect(next?.squares[8]).toBe('light');
    expect(next?.turn).toBe('dark'); // extra throw forfeited
  });

  it('ends the turn immediately when no move is legal in either direction', () => {
    // Light on 1: backward impossible, forward 1→6 passes the dark wall 2–4.
    const state = stateWith(
      { tokens: { 1: 'light', 2: 'dark', 3: 'dark', 4: 'dark' }, turn: 'light' },
    );
    const next = applyThrow(state, t(5, true));
    expect(next?.turn).toBe('dark');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });
});

describe('first-move rule', () => {
  it('restricts light’s first move to the token on square 9', () => {
    let state = newGame();
    state = applyThrow(state, t(2))!; // dark’s extra throw after the forced opening
    state = move(state, 11)!; // dark 11→13
    expect(state.turn).toBe('light');
    const thrown = applyThrow(state, t(2))!;
    expect(move(thrown, 7)).toBeNull();
    expect(move(thrown, 5)).toBeNull();
    const next = move(thrown, 9);
    expect(next?.squares[11]).toBe('light');
    expect(next?.lightFirstMoveDone).toBe(true);
  });

  it('lifts the restriction after light’s first move', () => {
    const state = stateWith(
      { tokens: { 5: 'light', 9: 'light', 20: 'dark' }, turn: 'light', lightFirstMoveDone: true },
    );
    expect(legalOrigins(state, 2, 'forward')).toContain(5);
  });

  it('lifts the restriction if the square-9 token was displaced', () => {
    const state = stateWith(
      { tokens: { 5: 'light', 9: 'dark', 20: 'dark' }, turn: 'light', lightFirstMoveDone: false },
    );
    expect(legalOrigins(state, 2, 'forward')).toContain(5);
  });
});
