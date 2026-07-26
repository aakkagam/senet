/** Runes-based bridge between the pure rule engine and the UI (next change).
 *  Randomness lives here, never in src/lib/game/. */

import { resolveThrow, type StickFaces } from './game/sticks';
import { applyThrow, move, newGame, waterReturn, waterThrow } from './game/rules';
import type { GameState, ThrowResult } from './game/types';
import { clear, load, save } from './persist';

function randomFaces(): StickFaces {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return [bytes[0] % 2 === 0, bytes[1] % 2 === 0, bytes[2] % 2 === 0, bytes[3] % 2 === 0];
}

class Game {
  /** Resumes a saved game when a valid one exists, else starts fresh. */
  state = $state<GameState>(load(localStorage) ?? newGame());
  /** Faces of the most recent throw, for the sticks animation. */
  lastFaces = $state<StickFaces | null>(null);
  lastThrow = $state<ThrowResult | null>(null);

  /** Apply a transition; persists on success, clears the save on game over. */
  private commit(next: GameState | null): boolean {
    if (!next) return false;
    this.state = next;
    if (next.phase.kind === 'game-over') {
      clear(localStorage);
    } else {
      save(localStorage, next);
    }
    return true;
  }

  throwSticks(): boolean {
    if (this.state.phase.kind !== 'awaiting-throw') return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    this.lastFaces = faces;
    this.lastThrow = result;
    return this.commit(applyThrow(this.state, result));
  }

  /** Move the current player's token at `from`. Returns false when illegal. */
  move(from: number): boolean {
    return this.commit(move(this.state, from));
  }

  /** House-27 choice (a): send the stuck token back to the House of Second Life. */
  waterReturn(): boolean {
    return this.commit(waterReturn(this.state));
  }

  /** House-27 choice (b): throw for the stuck token. */
  waterThrow(): boolean {
    if (this.state.phase.kind !== 'house-27-choice') return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    this.lastFaces = faces;
    this.lastThrow = result;
    return this.commit(waterThrow(this.state, result));
  }

  newGame(): void {
    this.state = newGame();
    this.lastFaces = null;
    this.lastThrow = null;
    save(localStorage, this.state);
  }
}

export const game = new Game();
