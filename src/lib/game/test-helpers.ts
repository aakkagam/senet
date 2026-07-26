import type { GameState, Phase, Player, ThrowResult } from './types';
import { LAST_SQUARE } from './board';

export function boardWith(tokens: Record<number, Player>): (Player | null)[] {
  const squares: (Player | null)[] = Array.from({ length: LAST_SQUARE + 1 }, () => null);
  for (const [square, player] of Object.entries(tokens)) squares[Number(square)] = player;
  return squares;
}

export function stateWith(opts: {
  tokens: Record<number, Player>;
  turn: Player;
  phase?: Phase;
  borneOff?: { light: number; dark: number };
  lightFirstMoveDone?: boolean;
}): GameState {
  return {
    squares: boardWith(opts.tokens),
    borneOff: opts.borneOff ?? { light: 0, dark: 0 },
    turn: opts.turn,
    phase: opts.phase ?? { kind: 'awaiting-throw' },
    lightFirstMoveDone: opts.lightFirstMoveDone ?? true,
  };
}

export function t(value: ThrowResult['value'], throwAgain = false): ThrowResult {
  return { value, throwAgain };
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) deepFreeze((value as Record<string, unknown>)[key]);
    Object.freeze(value);
  }
  return value;
}
