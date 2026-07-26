import { describe, expect, it } from 'vitest';
import { applyThrow, move, newGame, waterReturn, waterThrow } from './rules';
import { deepFreeze, stateWith, t } from './test-helpers';
import type { GameState } from './types';

/** Representative reachable states: fresh, mid-throw, post-swap, house-27, terminal. */
function representativeStates(): GameState[] {
  const fresh = newGame();
  const midTurn = applyThrow(fresh, t(2))!;
  const afterMove = move(midTurn, 11)!;
  const swap = move(
    applyThrow(stateWith({ tokens: { 12: 'light', 14: 'dark' }, turn: 'light' }), t(2))!,
    12,
  )!;
  const choice = stateWith(
    { tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } },
  );
  const returned = waterReturn(choice)!;
  const won = move(
    applyThrow(
      stateWith({ tokens: { 30: 'light', 5: 'dark' }, turn: 'light', borneOff: { light: 4, dark: 0 } }),
      t(1, true),
    )!,
    30,
  )!;
  return [fresh, midTurn, afterMove, swap, choice, returned, won];
}

describe('serializable game state', () => {
  it('survives a JSON round-trip unchanged', () => {
    for (const state of representativeStates()) {
      expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    }
  });

  it('holds only JSON-safe values', () => {
    for (const state of representativeStates()) {
      const check = (value: unknown): void => {
        expect(['object', 'string', 'number', 'boolean']).toContain(value === null ? 'object' : typeof value);
        if (value && typeof value === 'object') {
          expect(value instanceof Map || value instanceof Set || value instanceof Date).toBe(false);
          Object.values(value).forEach(check);
        }
      };
      check(state);
    }
  });
});

describe('immutability of transitions', () => {
  it('applyThrow, move, waterReturn and waterThrow never mutate their input', () => {
    // Frozen inputs throw on any mutation attempt in strict mode.
    const throwState = deepFreeze(newGame());
    const before = JSON.stringify(throwState);
    const thrown = applyThrow(throwState, t(2))!;
    expect(JSON.stringify(throwState)).toBe(before);

    const moveState = deepFreeze(thrown);
    const beforeMove = JSON.stringify(moveState);
    expect(move(moveState, 11)).not.toBeNull();
    expect(JSON.stringify(moveState)).toBe(beforeMove);

    const choice = deepFreeze(
      stateWith({ tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } }),
    );
    const beforeChoice = JSON.stringify(choice);
    expect(waterReturn(choice)).not.toBeNull();
    expect(waterThrow(choice, t(4, true))).not.toBeNull();
    expect(waterThrow(choice, t(2))).not.toBeNull();
    expect(JSON.stringify(choice)).toBe(beforeChoice);
  });

  it('a swap clones the board rather than mutating it', () => {
    const state = deepFreeze(
      applyThrow(stateWith({ tokens: { 12: 'light', 14: 'dark' }, turn: 'light' }), t(2))!,
    );
    const next = move(state, 12)!;
    expect(state.squares[12]).toBe('light');
    expect(next.squares[12]).toBe('dark');
  });
});
