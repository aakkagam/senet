/** Identity-stable token sprites for the UI. `GameState.squares` says where
 *  tokens ARE; these say which token is which, so springs can animate a swap
 *  as two crossing moves and a rebirth as one long flight. Pure and
 *  framework-free — the store owns the array, this module owns the logic. */

import type { GameState, Player } from './game/types';
import { FIRST_SQUARE, LAST_SQUARE } from './game/board';

export interface Token {
  id: number;
  player: Player;
  /** Path square while on the board, 'off' once borne off. */
  square: number | 'off';
  /** Bear-off order (0-based per player), for stable tray slots. */
  offOrder: number | null;
}

/** Tokens for a state as loaded or freshly started: light ids 0–4, dark 5–9,
 *  on-board tokens in path order, any borne-off remainder filling the tray. */
export function initialTokens(state: GameState): Token[] {
  const tokens: Token[] = [];
  for (const player of ['light', 'dark'] as const) {
    const base = player === 'light' ? 0 : 5;
    let id = base;
    for (let s = FIRST_SQUARE; s <= LAST_SQUARE; s++) {
      if (state.squares[s] === player) {
        tokens.push({ id: id++, player, square: s, offOrder: null });
      }
    }
    for (let off = 0; off < state.borneOff[player]; off++) {
      tokens.push({ id: id++, player, square: 'off', offOrder: off });
    }
  }
  return tokens.sort((a, b) => a.id - b.id);
}

/** Re-derive token positions after an engine transition. Tokens still on
 *  their square stay put; the rest match to the vacant new squares by minimal
 *  path distance; anything unmatched was borne off. */
export function reconcileTokens(tokens: readonly Token[], state: GameState): Token[] {
  const next = tokens.map((t) => ({ ...t }));

  for (const player of ['light', 'dark'] as const) {
    const mine = next.filter((t) => t.player === player);
    const onBoard = mine.filter((t) => t.square !== 'off');

    const vacant = new Set<number>();
    for (let s = FIRST_SQUARE; s <= LAST_SQUARE; s++) {
      if (state.squares[s] === player) vacant.add(s);
    }
    const moving: Token[] = [];
    for (const t of onBoard) {
      if (vacant.has(t.square as number)) vacant.delete(t.square as number);
      else moving.push(t);
    }

    // Assign displaced tokens to vacant squares, closest pair first.
    const free = [...vacant];
    while (moving.length > 0 && free.length > 0) {
      let bestT = 0;
      let bestS = 0;
      let bestD = Infinity;
      for (let i = 0; i < moving.length; i++) {
        for (let j = 0; j < free.length; j++) {
          const d = Math.abs((moving[i].square as number) - free[j]);
          if (d < bestD) {
            bestD = d;
            bestT = i;
            bestS = j;
          }
        }
      }
      moving[bestT].square = free[bestS];
      moving.splice(bestT, 1);
      free.splice(bestS, 1);
    }

    // Leftovers went off the board; hand out the next tray slots in order.
    let offOrder = mine.filter((t) => t.square === 'off').length;
    for (const t of moving) {
      t.square = 'off';
      t.offOrder = offOrder++;
    }
  }

  return next;
}
