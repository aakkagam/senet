/** Versioned localStorage persistence for a full in-progress game.
 *  Pure: storage is injected, and no function here ever throws — a corrupt,
 *  stale or unreadable save always degrades to "no save". */

import type { GameState, Phase, Player } from './game/types';
import { LAST_SQUARE } from './game/board';
import { TOKENS_PER_PLAYER } from './game/rules';

export const SAVE_KEY = 'senet.game';
/** Bump on any GameState shape change: a mismatched save is discarded, not migrated. */
export const SAVE_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface Envelope {
  v: number;
  state: GameState;
}

function isPlayer(value: unknown): value is Player {
  return value === 'light' || value === 'dark';
}

function isPhase(value: unknown): value is Phase {
  if (typeof value !== 'object' || value === null) return false;
  const phase = value as Record<string, unknown>;
  switch (phase.kind) {
    case 'awaiting-throw':
      return true;
    case 'awaiting-move':
      return (
        typeof phase.value === 'number' &&
        phase.value >= 1 &&
        phase.value <= 5 &&
        (phase.direction === 'forward' || phase.direction === 'backward') &&
        typeof phase.extraThrow === 'boolean'
      );
    case 'house-27-choice':
      return true;
    // A finished game is never resumed; its save is invalid by definition.
    default:
      return false;
  }
}

function isValidState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  const { squares, borneOff, turn, phase, lightFirstMoveDone } = state;

  if (!Array.isArray(squares) || squares.length !== LAST_SQUARE + 1) return false;
  if (squares[0] !== null) return false;
  if (!squares.slice(1).every((s) => s === null || isPlayer(s))) return false;

  if (typeof borneOff !== 'object' || borneOff === null) return false;
  const off = borneOff as Record<string, unknown>;
  for (const player of ['light', 'dark'] as const) {
    const count = off[player];
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0 || count > TOKENS_PER_PLAYER) {
      return false;
    }
    const onBoard = squares.filter((s) => s === player).length;
    if (onBoard + count !== TOKENS_PER_PLAYER) return false;
  }

  return isPlayer(turn) && isPhase(phase) && typeof lightFirstMoveDone === 'boolean';
}

export function save(storage: StorageLike, state: GameState): void {
  try {
    const envelope: Envelope = { v: SAVE_VERSION, state };
    storage.setItem(SAVE_KEY, JSON.stringify(envelope));
  } catch {
    // storage full or unavailable: play continues without persistence
  }
}

export function clear(storage: StorageLike): void {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

/** Restore a saved game, or null when absent/corrupt/mismatched (bad saves are cleared). */
export function load(storage: StorageLike): GameState | null {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Partial<Envelope> | null;
    if (
      typeof envelope !== 'object' ||
      envelope === null ||
      envelope.v !== SAVE_VERSION ||
      !isValidState(envelope.state)
    ) {
      clear(storage);
      return null;
    }
    return envelope.state;
  } catch {
    clear(storage);
    return null;
  }
}
