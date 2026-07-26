/** Runes-based bridge between the pure rule engine and the UI.
 *  Randomness lives here, never in src/lib/game/. */

import { resolveThrow, type StickFaces } from './game/sticks';
import { applyThrow, legalOrigins, legalTarget, move, newGame, waterReturn, waterThrow } from './game/rules';
import type { GameState, Player, ThrowResult } from './game/types';
import { initialTokens, reconcileTokens, type Token } from './tokens';
import { clear, load, save } from './persist';

function randomFaces(): StickFaces {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return [bytes[0] % 2 === 0, bytes[1] % 2 === 0, bytes[2] % 2 === 0, bytes[3] % 2 === 0];
}

/** How long a turn-ending notice holds the floor before the turn indicator flips. */
const NOTICE_MS = 2200;

interface Notice {
  text: string;
  /** The player the notice belongs to; the turn indicator stays on them while it shows. */
  player: Player;
}

class Game {
  /** Resumes a saved game when a valid one exists, else starts fresh. */
  state = $state<GameState>(load(localStorage) ?? newGame());
  /** Identity-stable sprites the springs animate; mirrors state.squares. */
  tokens = $state<Token[]>(initialTokens(this.state));
  /** Faces of the most recent throw, for the stick glyphs. */
  lastFaces = $state<StickFaces | null>(null);
  lastThrow = $state<ThrowResult | null>(null);
  /** Token currently pressed or dragged (its destination glows). */
  dragging = $state<number | null>(null);
  /** Token under a hovering pointer (destination glows before commit). */
  hovering = $state<number | null>(null);
  /** Bumped on an illegal grab; the HUD answers by pointing at whose turn it is. */
  denied = $state(0);
  /** Turn-ending message shown before the turn indicator flips. */
  notice = $state<Notice | null>(null);

  private noticeTimer: ReturnType<typeof setTimeout> | undefined;

  /** Whose turn the HUD shows — held on the notice's player while one is up. */
  readonly displayTurn = $derived<Player>(this.notice?.player ?? this.state.turn);

  /** The token whose destination should glow: a drag wins over a hover. */
  readonly activeToken = $derived(this.dragging ?? this.hovering);

  /** Squares the current player may move from right now. */
  readonly movableSquares = $derived.by((): number[] => {
    const { phase } = this.state;
    if (phase.kind !== 'awaiting-move') return [];
    return legalOrigins(this.state, phase.value, phase.direction);
  });

  /** Only backward moves were possible this turn. */
  readonly backwardTurn = $derived(
    this.state.phase.kind === 'awaiting-move' && this.state.phase.direction === 'backward',
  );

  /** The pending move keeps the thrown extra throw alive. */
  readonly extraThrowPending = $derived(
    this.state.phase.kind === 'awaiting-move' && this.state.phase.extraThrow,
  );

  /** The value the pending move must use; survives a reload (it lives in the phase). */
  readonly pendingValue = $derived(
    this.state.phase.kind === 'awaiting-move' ? this.state.phase.value : null,
  );

  /** Where the pending throw would take the token at `from`. */
  legalTargetOf(from: number): number | 'off' | null {
    return legalTarget(this.state, from);
  }

  /** Can this token be picked up right now? */
  canGrab(id: number): boolean {
    if (this.notice) return false;
    const token = this.tokens[id];
    if (token.player !== this.state.turn || token.square === 'off') return false;
    return this.legalTargetOf(token.square) !== null;
  }

  denyGrab(): void {
    this.denied++;
  }

  private setNotice(text: string, player: Player): void {
    clearTimeout(this.noticeTimer);
    this.notice = { text, player };
    this.noticeTimer = setTimeout(() => {
      // The failed throw held the floor with the notice; both leave together.
      this.notice = null;
      this.lastFaces = null;
      this.lastThrow = null;
    }, NOTICE_MS);
  }

  /** Apply a transition; persists on success, clears the save on game over.
   *  A turn handover retires the previous player's throw display. */
  private commit(next: GameState | null): boolean {
    if (!next) return false;
    const turnChanged = next.turn !== this.state.turn;
    this.state = next;
    this.tokens = reconcileTokens(this.tokens, next);
    if (turnChanged) {
      this.lastFaces = null;
      this.lastThrow = null;
    }
    if (next.phase.kind === 'game-over') {
      clear(localStorage);
    } else {
      save(localStorage, next);
    }
    return true;
  }

  throwSticks(): boolean {
    if (this.state.phase.kind !== 'awaiting-throw' || this.notice) return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    const thrower = this.state.turn;
    const next = applyThrow(this.state, result);
    if (next && next.turn !== thrower) {
      this.setNotice(`No move possible with a ${result.value} — the turn passes.`, thrower);
    }
    const ok = this.commit(next);
    if (ok) {
      this.lastFaces = faces;
      this.lastThrow = result;
    }
    return ok;
  }

  /** Move the current player's token at `from`. Returns false when illegal. */
  move(from: number): boolean {
    return this.commit(move(this.state, from));
  }

  /** Move by token id (the sprites the UI holds). */
  moveToken(id: number): boolean {
    const token = this.tokens[id];
    if (token.square === 'off') return false;
    return this.move(token.square);
  }

  /** House-27 choice (a): send the stuck token back to the House of Second Life. */
  waterReturn(): boolean {
    return this.commit(waterReturn(this.state));
  }

  /** House-27 choice (b): throw for the stuck token. */
  waterThrow(): boolean {
    if (this.state.phase.kind !== 'house-27-choice' || this.notice) return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    const thrower = this.state.turn;
    if (result.value !== 4) {
      this.setNotice(`Threw a ${result.value} — only a 4 frees the Waters. The turn passes.`, thrower);
    }
    const ok = this.commit(waterThrow(this.state, result));
    if (ok) {
      this.lastFaces = faces;
      this.lastThrow = result;
    }
    return ok;
  }

  newGame(): void {
    clearTimeout(this.noticeTimer);
    this.state = newGame();
    this.tokens = initialTokens(this.state);
    this.lastFaces = null;
    this.lastThrow = null;
    this.dragging = null;
    this.notice = null;
    save(localStorage, this.state);
  }
}

export const game = new Game();
