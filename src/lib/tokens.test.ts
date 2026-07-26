import { describe, expect, it } from 'vitest';
import { initialTokens, reconcileTokens, type Token } from './tokens';
import { applyThrow, move, newGame, waterReturn, waterThrow } from './game/rules';
import { stateWith, t } from './game/test-helpers';
import type { GameState } from './game/types';

function tokenOn(tokens: Token[], square: number | 'off'): Token[] {
  return tokens.filter((tk) => tk.square === square);
}

/** Sanity: token positions must always mirror the state exactly. */
function expectConsistent(tokens: Token[], state: GameState): void {
  for (let s = 1; s <= 30; s++) {
    const occupants = tokenOn(tokens, s);
    if (state.squares[s]) {
      expect(occupants).toHaveLength(1);
      expect(occupants[0].player).toBe(state.squares[s]);
    } else {
      expect(occupants).toHaveLength(0);
    }
  }
  for (const player of ['light', 'dark'] as const) {
    const off = tokens.filter((tk) => tk.player === player && tk.square === 'off');
    expect(off).toHaveLength(state.borneOff[player]);
    expect(off.map((tk) => tk.offOrder).sort()).toEqual([...off.keys()]);
  }
}

describe('initialTokens', () => {
  it('mirrors the opening position with stable ids', () => {
    const state = newGame();
    const tokens = initialTokens(state);
    expect(tokens).toHaveLength(10);
    expectConsistent(tokens, state);
  });

  it('fills tray slots for a restored save with borne-off tokens', () => {
    const state = stateWith({
      tokens: { 5: 'light', 28: 'dark' },
      turn: 'light',
      borneOff: { light: 4, dark: 4 },
    });
    const tokens = initialTokens(state);
    expectConsistent(tokens, state);
  });
});

describe('reconcileTokens', () => {
  it('a plain move relocates exactly one token, identity preserved', () => {
    const state = stateWith({
      tokens: { 5: 'light', 12: 'light', 8: 'dark' },
      turn: 'light',
      phase: { kind: 'awaiting-move', value: 4, direction: 'forward', extraThrow: false },
      borneOff: { light: 3, dark: 4 },
    });
    const before = initialTokens(state);
    const mover = tokenOn(before, 12)[0];
    const next = move(state, 12)!;
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    expect(after.find((tk) => tk.id === mover.id)!.square).toBe(16);
  });

  it('a swap animates both tokens: mover and victim exchange squares', () => {
    const state = stateWith({
      tokens: { 5: 'light', 8: 'dark', 20: 'dark' },
      turn: 'light',
      phase: { kind: 'awaiting-move', value: 3, direction: 'forward', extraThrow: false },
      borneOff: { light: 4, dark: 3 },
    });
    const before = initialTokens(state);
    const mover = tokenOn(before, 5)[0];
    const victim = tokenOn(before, 8)[0];
    const next = move(state, 5)!;
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    expect(after.find((tk) => tk.id === mover.id)!.square).toBe(8);
    expect(after.find((tk) => tk.id === victim.id)!.square).toBe(5);
  });

  it('a rebirth flies the landing token to square 1', () => {
    const state = stateWith({
      tokens: { 12: 'light', 22: 'light' },
      turn: 'light',
      phase: { kind: 'awaiting-move', value: 3, direction: 'forward', extraThrow: false },
      borneOff: { light: 3, dark: 5 },
    });
    const before = initialTokens(state);
    const mover = tokenOn(before, 12)[0];
    const bystander = tokenOn(before, 22)[0];
    const next = move(state, 12)!; // lands on 15, House of Second Life
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    expect(after.find((tk) => tk.id === mover.id)!.square).toBe(1);
    expect(after.find((tk) => tk.id === bystander.id)!.square).toBe(22);
  });

  it('a bear-off sends the token to the tray with the next offOrder', () => {
    const state = stateWith({
      tokens: { 30: 'light', 3: 'light' },
      turn: 'light',
      phase: { kind: 'awaiting-move', value: 2, direction: 'forward', extraThrow: false },
      borneOff: { light: 3, dark: 0 },
    });
    const before = initialTokens(state);
    const mover = tokenOn(before, 30)[0];
    const next = move(state, 30)!;
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    const moved = after.find((tk) => tk.id === mover.id)!;
    expect(moved.square).toBe('off');
    expect(moved.offOrder).toBe(3);
  });

  it('the water return sends the stuck token from 27 to 15', () => {
    const state = stateWith({
      tokens: { 27: 'dark', 4: 'dark', 9: 'light' },
      turn: 'dark',
      phase: { kind: 'house-27-choice' },
      borneOff: { light: 4, dark: 3 },
    });
    const before = initialTokens(state);
    const stuck = tokenOn(before, 27)[0];
    const next = waterReturn(state)!;
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    expect(after.find((tk) => tk.id === stuck.id)!.square).toBe(15);
  });

  it('a water throw of 4 bears the stuck token off', () => {
    const state = stateWith({
      tokens: { 27: 'dark', 4: 'dark' },
      turn: 'dark',
      phase: { kind: 'house-27-choice' },
      borneOff: { light: 0, dark: 3 },
    });
    const before = initialTokens(state);
    const stuck = tokenOn(before, 27)[0];
    const next = waterThrow(state, t(4, true))!;
    const after = reconcileTokens(before, next);
    expectConsistent(after, next);
    const off = after.find((tk) => tk.id === stuck.id)!;
    expect(off.square).toBe('off');
    expect(off.offOrder).toBe(3);
  });

  it('tracks a real opening sequence from newGame', () => {
    let state = newGame();
    let tokens = initialTokens(state);
    state = applyThrow(state, t(2))!;
    expect(state.phase.kind).toBe('awaiting-move');
    const next = move(state, 11)!;
    tokens = reconcileTokens(tokens, next);
    expectConsistent(tokens, next);
  });
});

describe('reconcileTokens on a swap into the House of Second Life', () => {
  it('moves the victim to the origin and reborns the mover to square 1', () => {
    const state = stateWith({
      tokens: { 12: 'light', 15: 'dark', 20: 'dark' },
      turn: 'light',
      phase: { kind: 'awaiting-move', value: 3, direction: 'forward', extraThrow: false },
      borneOff: { light: 4, dark: 3 },
    });
    const before = initialTokens(state);
    const mover = before.find((tk) => tk.square === 12)!;
    const victim = before.find((tk) => tk.square === 15)!;
    const next = move(state, 12)!;
    const after = reconcileTokens(before, next);
    expect(after.find((tk) => tk.id === mover.id)!.square).toBe(1);
    expect(after.find((tk) => tk.id === victim.id)!.square).toBe(12);
  });
});
