import { describe, expect, it } from 'vitest';
import { applyThrow, legalOrigins, move, waterReturn, waterThrow } from './rules';
import { stateWith, t } from './test-helpers';

describe('house 15 — Second Life (rebirth)', () => {
  it('sends a token landing on 15 to square 1', () => {
    const state = stateWith({ tokens: { 12: 'light', 20: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(3))!, 12);
    expect(next?.squares[15]).toBeNull();
    expect(next?.squares[1]).toBe('light');
  });

  it('falls back to the lowest empty square when 1 is occupied', () => {
    const state = stateWith({ tokens: { 12: 'light', 1: 'dark', 20: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(3))!, 12);
    expect(next?.squares[1]).toBe('dark');
    expect(next?.squares[2]).toBe('light');
  });

  it('scans past several occupied squares', () => {
    const state = stateWith(
      { tokens: { 12: 'light', 1: 'dark', 2: 'light', 3: 'dark' }, turn: 'light' },
    );
    const next = move(applyThrow(state, t(3))!, 12);
    expect(next?.squares[4]).toBe('light');
  });

  it('triggers on a backward landing too', () => {
    // Light on 18 with no forward move: 18→21 lands on a protected dark pair.
    const state = stateWith(
      { tokens: { 18: 'light', 21: 'dark', 22: 'dark' }, turn: 'light' },
    );
    const thrown = applyThrow(state, t(3))!;
    expect(thrown.phase).toMatchObject({ kind: 'awaiting-move', direction: 'backward' });
    const next = move(thrown, 18);
    expect(next?.squares[15]).toBeNull();
    expect(next?.squares[1]).toBe('light');
  });

  it('keeps a pending extra throw after rebirth', () => {
    const state = stateWith({ tokens: { 11: 'light', 20: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(4, true))!, 11);
    expect(next?.squares[1]).toBe('light');
    expect(next?.turn).toBe('light');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });
});

describe('house 26 — Beauty (the gate)', () => {
  it('rejects forward moves that would end beyond 26 from before it', () => {
    const state = stateWith({ tokens: { 24: 'light', 5: 'dark' }, turn: 'light' });
    expect(legalOrigins(state, 4, 'forward')).toEqual([]);
  });

  it('allows an exact landing on 26', () => {
    const state = stateWith({ tokens: { 22: 'light', 5: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(4, true))!, 22);
    expect(next?.squares[26]).toBe('light');
  });

  it('lets a token on 26 move beyond it', () => {
    const state = stateWith({ tokens: { 26: 'light', 5: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(4, true))!, 26);
    expect(next?.squares[30]).toBe('light');
  });

  it('does not bear off from 26: a 5 overshoots and is illegal', () => {
    const state = stateWith({ tokens: { 26: 'light', 5: 'dark' }, turn: 'light' });
    expect(legalOrigins(state, 5, 'forward')).toEqual([]);
  });

  it('allows backward moves across 26', () => {
    // Light on 28 threw a 2 = the exact exit; force a backward crossing with a 1:
    // 28 leaves only on a 3, so a 1 has no forward move and goes backward to 27?
    // no — pick 29 with throw 4: forward illegal (29 exits only on 2), backward 29→25 crosses 26.
    const state = stateWith({ tokens: { 29: 'light', 5: 'dark' }, turn: 'light' });
    const thrown = applyThrow(state, t(4, true))!;
    expect(thrown.phase).toMatchObject({ kind: 'awaiting-move', direction: 'backward' });
    const next = move(thrown, 29);
    expect(next?.squares[25]).toBe('light');
  });
});

describe('house 27 — Waters', () => {
  it('landing forfeits the extra throw and ends the turn', () => {
    // Only reachable from 26 (the gate blocks landing beyond 26 from behind);
    // a 1 grants an extra throw, which the House of Waters must forfeit.
    const state = stateWith({ tokens: { 26: 'light', 5: 'dark' }, turn: 'light' });
    const next = move(applyThrow(state, t(1, true))!, 26);
    expect(next?.squares[27]).toBe('light');
    expect(next?.turn).toBe('dark');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });

  it('forces the house-27 choice at the start of the owner’s next turn', () => {
    const state = stateWith({ tokens: { 27: 'light', 5: 'dark' }, turn: 'dark' });
    const next = move(applyThrow(state, t(2))!, 5);
    expect(next?.turn).toBe('light');
    expect(next?.phase).toEqual({ kind: 'house-27-choice' });
  });

  it('rejects normal actions during the choice', () => {
    const state = stateWith(
      { tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } },
    );
    expect(applyThrow(state, t(3))).toBeNull();
    expect(move(state, 27)).toBeNull();
  });

  it('return option places the token on 15 and ends the turn without throwing', () => {
    const state = stateWith(
      { tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } },
    );
    const next = waterReturn(state);
    expect(next?.squares[27]).toBeNull();
    expect(next?.squares[15]).toBe('light');
    expect(next?.turn).toBe('dark');
  });

  it('return option uses the rebirth fallback when 15 is occupied', () => {
    const state = stateWith(
      {
        tokens: { 27: 'light', 15: 'dark', 5: 'dark' },
        turn: 'light',
        phase: { kind: 'house-27-choice' },
      },
    );
    const next = waterReturn(state);
    expect(next?.squares[15]).toBe('dark');
    expect(next?.squares[16]).toBe('light');
  });

  it('throwing a 4 bears the token off and grants an extra turn', () => {
    const state = stateWith(
      { tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } },
    );
    const next = waterThrow(state, t(4, true));
    expect(next?.squares[27]).toBeNull();
    expect(next?.borneOff.light).toBe(1);
    expect(next?.turn).toBe('light');
    expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
  });

  it('any other throw leaves the token stuck and ends the turn', () => {
    const state = stateWith(
      { tokens: { 27: 'light', 5: 'dark' }, turn: 'light', phase: { kind: 'house-27-choice' } },
    );
    for (const value of [1, 2, 3, 5] as const) {
      const next = waterThrow(state, t(value, value === 1 || value === 5));
      expect(next?.squares[27]).toBe('light');
      expect(next?.turn).toBe('dark');
      expect(next?.phase).toEqual({ kind: 'awaiting-throw' });
    }
  });

  it('waterReturn/waterThrow are rejected outside the choice phase', () => {
    const state = stateWith({ tokens: { 27: 'light', 5: 'dark' }, turn: 'light' });
    expect(waterReturn(state)).toBeNull();
    expect(waterThrow(state, t(4, true))).toBeNull();
  });
});

describe('exact exits — houses 28, 29, 30', () => {
  it('square 28 bears off only on a 3', () => {
    const state = stateWith({ tokens: { 28: 'light', 5: 'dark' }, turn: 'light' });
    const off = move(applyThrow(state, t(3))!, 28);
    expect(off?.squares[28]).toBeNull();
    expect(off?.borneOff.light).toBe(1);
    for (const value of [1, 2, 4, 5] as const) {
      expect(legalOrigins(state, value, 'forward')).toEqual([]);
    }
  });

  it('square 29 bears off only on a 2', () => {
    const state = stateWith({ tokens: { 29: 'light', 5: 'dark' }, turn: 'light' });
    const off = move(applyThrow(state, t(2))!, 29);
    expect(off?.borneOff.light).toBe(1);
    for (const value of [1, 3, 4, 5] as const) {
      expect(legalOrigins(state, value, 'forward')).toEqual([]);
    }
  });

  it('square 30 bears off on any throw', () => {
    for (const value of [1, 2, 3, 4, 5] as const) {
      const state = stateWith({ tokens: { 30: 'light', 5: 'dark' }, turn: 'light' });
      const off = move(applyThrow(state, t(value))!, 30);
      expect(off?.squares[30]).toBeNull();
      expect(off?.borneOff.light).toBe(1);
    }
  });
});

describe('win condition', () => {
  it('the fifth bear-off wins and freezes the game', () => {
    const state = stateWith(
      { tokens: { 30: 'light', 5: 'dark' }, turn: 'light', borneOff: { light: 4, dark: 0 } },
    );
    const next = move(applyThrow(state, t(1, true))!, 30);
    expect(next?.borneOff.light).toBe(5);
    expect(next?.phase).toEqual({ kind: 'game-over', winner: 'light' });
    expect(applyThrow(next!, t(2))).toBeNull();
    expect(move(next!, 5)).toBeNull();
    expect(waterReturn(next!)).toBeNull();
    expect(waterThrow(next!, t(4, true))).toBeNull();
  });

  it('winning from the House of Waters ends the game instead of granting a turn', () => {
    const state = stateWith(
      {
        tokens: { 27: 'dark', 5: 'light' },
        turn: 'dark',
        borneOff: { light: 0, dark: 4 },
        phase: { kind: 'house-27-choice' },
      },
    );
    const next = waterThrow(state, t(4, true));
    expect(next?.borneOff.dark).toBe(5);
    expect(next?.phase).toEqual({ kind: 'game-over', winner: 'dark' });
  });

  it('a win takes precedence over a pending extra throw', () => {
    const state = stateWith(
      { tokens: { 30: 'dark', 5: 'light' }, turn: 'dark', borneOff: { light: 0, dark: 4 } },
    );
    const next = move(applyThrow(state, t(4, true))!, 30);
    expect(next?.phase).toEqual({ kind: 'game-over', winner: 'dark' });
  });
});
