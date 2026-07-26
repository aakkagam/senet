/** Runes-based bridge between the pure rule engine and the UI.
 *  Randomness lives here, never in src/lib/game/. */

import { resolveThrow, type StickFaces } from './game/sticks';
import {
  applyThrow,
  legalOrigins,
  legalTarget,
  move,
  newGame,
  refusalReason,
  waterReturn,
  waterThrow,
} from './game/rules';
import { HOUSE_BEAUTY, HOUSE_WATERS } from './game/board';
import type { GameState, Player, ThrowResult } from './game/types';
import { initialTokens, reconcileTokens, type Token } from './tokens';
import { clear, load, save } from './persist';
import { prefersReducedMotion, REVEAL_FAILSAFE_MS } from './motion';

function randomFaces(): StickFaces {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return [bytes[0] % 2 === 0, bytes[1] % 2 === 0, bytes[2] % 2 === 0, bytes[3] % 2 === 0];
}

/** How long a turn-ending notice holds the floor before the turn indicator flips. */
const NOTICE_MS = 2200;

/** How long a house note stays anchored on the board. */
const HOUSE_NOTE_MS = 3000;

interface Notice {
  text: string;
  /** The player the notice belongs to; the turn indicator stays on them while it shows. */
  player: Player;
}

export interface HouseNote {
  /** Path square the note is anchored at. */
  house: number;
  text: string;
  /** Monotonic, so a replacing note re-triggers the transition. */
  id: number;
}

/** Teach-through-the-board copy: short, names the house, states the rule. */
const LANDING_NOTES: Record<number, string> = {
  15: 'House of Second Life — the token is reborn at the start.',
  27: 'House of Waters — stuck until a throw of 4, or a return to Second Life.',
  28: 'House of Three Judges — leaves only on an exact 3.',
  29: 'House of Two Judges — leaves only on an exact 2.',
  30: 'House of Horus — any throw bears it off.',
};

const GATE_NOTE = 'House of Beauty — a token must land here exactly before passing.';

class Game {
  /** Resumes a saved game when a valid one exists, else starts fresh. */
  state = $state<GameState>(load(localStorage) ?? newGame());
  /** Identity-stable sprites the springs animate; mirrors state.squares. */
  tokens = $state<Token[]>(initialTokens(this.state));
  /** Faces of the most recent throw, for the stick sprites on the stage. */
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
  /** Stick tumble in flight: the result is committed but not yet revealed, so
   *  input and the numeral wait (design decision 1: commit first, reveal later). */
  revealing = $state(false);
  /** Transient teaching note anchored at a special house. */
  houseNote = $state<HouseNote | null>(null);

  /** Notice earned by a throw, held back until its reveal completes. */
  private pendingNotice = $state<Notice | null>(null);

  private noticeTimer: ReturnType<typeof setTimeout> | undefined;
  private revealTimer: ReturnType<typeof setTimeout> | undefined;
  private houseNoteTimer: ReturnType<typeof setTimeout> | undefined;
  private noteId = 0;
  /** Houses whose landing note already fired this game (notes teach once). */
  private seenHouses = new Set<number>();

  /** Whose turn the HUD shows — held on the thrower while their notice
   *  (shown or still waiting for the reveal) has the floor. */
  readonly displayTurn = $derived<Player>(
    this.notice?.player ?? this.pendingNotice?.player ?? this.state.turn,
  );

  /** The token whose destination should glow: a drag wins over a hover. */
  readonly activeToken = $derived(this.dragging ?? this.hovering);

  /** Squares the current player may move from right now. */
  readonly movableSquares = $derived.by((): number[] => {
    if (this.revealing) return [];
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
    if (this.notice || this.revealing) return false;
    const token = this.tokens[id];
    if (token.player !== this.state.turn || token.square === 'off') return false;
    return this.legalTargetOf(token.square) !== null;
  }

  /** A refused grab; when the 26-gate is the reason, the gate explains itself.
   *  Gate notes repeat — they answer a direct action, unlike landing notes. */
  denyGrab(square?: number): void {
    this.denied++;
    if (square !== undefined && refusalReason(this.state, square) === 'beauty-gate') {
      this.showHouseNote(HOUSE_BEAUTY, GATE_NOTE);
    }
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

  /** A throw's turn-passing notice waits for the stick reveal (or shows at
   *  once under reduced motion, where no reveal runs). */
  private queueNotice(text: string, player: Player): void {
    if (prefersReducedMotion()) this.setNotice(text, player);
    else this.pendingNotice = { text, player };
  }

  /** Gate input while the sticks tumble; the fail-safe timer means a lost
   *  animation event can never lock the game (design decision 3). */
  private beginReveal(): void {
    if (prefersReducedMotion()) return;
    this.revealing = true;
    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => this.revealDone(), REVEAL_FAILSAFE_MS);
  }

  /** The sticks have settled (or the fail-safe fired): re-enable input and
   *  let a deferred notice take the floor. */
  revealDone(): void {
    if (!this.revealing) return;
    clearTimeout(this.revealTimer);
    this.revealing = false;
    if (this.pendingNotice) {
      this.setNotice(this.pendingNotice.text, this.pendingNotice.player);
      this.pendingNotice = null;
    }
  }

  private showHouseNote(house: number, text: string): void {
    // The house-27 choice panel outranks any note at the Waters.
    if (house === HOUSE_WATERS && this.state.phase.kind === 'house-27-choice') return;
    clearTimeout(this.houseNoteTimer);
    this.houseNote = { house, text, id: ++this.noteId };
    this.houseNoteTimer = setTimeout(() => {
      this.houseNote = null;
    }, HOUSE_NOTE_MS);
  }

  /** Detect the mover's landing square by diffing a committed move: exactly
   *  one square loses the mover (the origin, even through a swap or rebirth),
   *  and origin ± value is where they landed — which square 15 empties again. */
  private noteLanding(prev: GameState, next: GameState): void {
    if (prev.phase.kind !== 'awaiting-move') return;
    const mover = prev.turn;
    const { value, direction } = prev.phase;
    let origin = 0;
    for (let s = 1; s < prev.squares.length; s++) {
      if (prev.squares[s] === mover && next.squares[s] !== mover) {
        origin = s;
        break;
      }
    }
    if (origin === 0) return;
    const landing = direction === 'forward' ? origin + value : origin - value;
    const text = LANDING_NOTES[landing];
    if (!text || this.seenHouses.has(landing)) return;
    this.seenHouses.add(landing);
    this.showHouseNote(landing, text);
  }

  /** Apply a transition; persists on success, clears the save on game over.
   *  A turn handover retires the previous player's throw display. */
  private commit(next: GameState | null): boolean {
    if (!next) return false;
    const prev = this.state;
    const turnChanged = next.turn !== prev.turn;
    this.state = next;
    this.tokens = reconcileTokens(this.tokens, next);
    if (turnChanged) {
      this.lastFaces = null;
      this.lastThrow = null;
    }
    this.noteLanding(prev, next);
    if (next.phase.kind === 'game-over') {
      clear(localStorage);
    } else {
      save(localStorage, next);
    }
    return true;
  }

  throwSticks(): boolean {
    if (this.state.phase.kind !== 'awaiting-throw' || this.notice || this.revealing) return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    const thrower = this.state.turn;
    const next = applyThrow(this.state, result);
    const ok = this.commit(next);
    if (ok) {
      this.lastFaces = faces;
      this.lastThrow = result;
      if (next!.turn !== thrower) {
        this.queueNotice(`No move possible with a ${result.value} — the turn passes.`, thrower);
      }
      this.beginReveal();
    }
    return ok;
  }

  /** Move the current player's token at `from`. Returns false when illegal. */
  move(from: number): boolean {
    if (this.revealing) return false;
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
    if (this.revealing) return false;
    return this.commit(waterReturn(this.state));
  }

  /** House-27 choice (b): throw for the stuck token. */
  waterThrow(): boolean {
    if (this.state.phase.kind !== 'house-27-choice' || this.notice || this.revealing) return false;
    const faces = randomFaces();
    const result = resolveThrow(faces);
    const thrower = this.state.turn;
    const ok = this.commit(waterThrow(this.state, result));
    if (ok) {
      this.lastFaces = faces;
      this.lastThrow = result;
      if (result.value !== 4) {
        this.queueNotice(`Threw a ${result.value} — only a 4 frees the Waters. The turn passes.`, thrower);
      }
      this.beginReveal();
    }
    return ok;
  }

  newGame(): void {
    clearTimeout(this.noticeTimer);
    clearTimeout(this.revealTimer);
    clearTimeout(this.houseNoteTimer);
    this.state = newGame();
    this.tokens = initialTokens(this.state);
    this.lastFaces = null;
    this.lastThrow = null;
    this.dragging = null;
    this.notice = null;
    this.pendingNotice = null;
    this.revealing = false;
    this.houseNote = null;
    this.seenHouses.clear();
    save(localStorage, this.state);
  }
}

export const game = new Game();
