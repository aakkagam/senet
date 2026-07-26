import { describe, expect, it } from 'vitest';
import { SAVE_KEY, SAVE_VERSION, clear, load, save, type StorageLike } from './persist';
import { applyThrow, newGame } from './game/rules';
import { stateWith, t } from './game/test-helpers';

function fakeStorage(initial?: Record<string, string>): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial ?? {}));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

describe('save / load round trip', () => {
  it('captures a mid-turn state exactly, pending throw included', () => {
    const storage = fakeStorage();
    const state = applyThrow(newGame(), t(4, true))!;
    expect(state.phase).toMatchObject({ kind: 'awaiting-move', value: 4 });
    save(storage, state);
    expect(load(storage)).toEqual(state);
  });

  it('persists the house-27 choice phase', () => {
    const storage = fakeStorage();
    const state = stateWith({
      tokens: { 27: 'light', 3: 'light', 5: 'light', 7: 'light', 9: 'light', 2: 'dark', 4: 'dark', 6: 'dark', 8: 'dark', 10: 'dark' },
      turn: 'light',
      phase: { kind: 'house-27-choice' },
    });
    save(storage, state);
    expect(load(storage)).toEqual(state);
  });

  it('returns null when no save exists', () => {
    expect(load(fakeStorage())).toBeNull();
  });
});

describe('invalid saves are discarded', () => {
  it('clears a corrupt (non-JSON) payload without throwing', () => {
    const storage = fakeStorage({ [SAVE_KEY]: 'not json {' });
    expect(load(storage)).toBeNull();
    expect(storage.data.has(SAVE_KEY)).toBe(false);
  });

  it('discards a version mismatch', () => {
    const storage = fakeStorage();
    save(storage, newGame());
    const tampered = JSON.parse(storage.data.get(SAVE_KEY)!);
    tampered.v = SAVE_VERSION + 1;
    storage.data.set(SAVE_KEY, JSON.stringify(tampered));
    expect(load(storage)).toBeNull();
    expect(storage.data.has(SAVE_KEY)).toBe(false);
  });

  it('discards structurally invalid states', () => {
    const bad = [
      { v: SAVE_VERSION, state: { squares: [] } },
      { v: SAVE_VERSION, state: null },
      { v: SAVE_VERSION }, // no state at all
      { v: SAVE_VERSION, state: { ...newGame(), turn: 'green' } },
      { v: SAVE_VERSION, state: { ...newGame(), phase: { kind: 'nonsense' } } },
      { v: SAVE_VERSION, state: { ...newGame(), borneOff: { light: 9, dark: 0 } } },
    ];
    for (const payload of bad) {
      const storage = fakeStorage({ [SAVE_KEY]: JSON.stringify(payload) });
      expect(load(storage)).toBeNull();
      expect(storage.data.has(SAVE_KEY)).toBe(false);
    }
  });

  it('rejects a state whose token count does not add up', () => {
    const state = newGame();
    const squares = state.squares.slice();
    squares[1] = null; // light now has 4 on board + 0 borne off
    const storage = fakeStorage({
      [SAVE_KEY]: JSON.stringify({ v: SAVE_VERSION, state: { ...state, squares } }),
    });
    expect(load(storage)).toBeNull();
  });

  it('discards a finished game instead of resuming it', () => {
    const won = {
      ...newGame(),
      squares: newGame().squares.map((s) => (s === 'light' ? null : s)),
      borneOff: { light: 5, dark: 0 },
      phase: { kind: 'game-over', winner: 'light' },
    };
    const storage = fakeStorage({ [SAVE_KEY]: JSON.stringify({ v: SAVE_VERSION, state: won }) });
    expect(load(storage)).toBeNull();
  });
});

describe('storage failures never throw', () => {
  const broken: StorageLike = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('quota');
    },
    removeItem: () => {
      throw new Error('denied');
    },
  };

  it('save, load and clear swallow storage exceptions', () => {
    expect(() => save(broken, newGame())).not.toThrow();
    expect(() => clear(broken)).not.toThrow();
    expect(load(broken)).toBeNull();
  });
});
