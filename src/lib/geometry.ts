/** Abstract stage geometry. The engine's linear 1..30 path becomes the 3×10
 *  boustrophedon here and nowhere else; components never do row/column math. */

import type { Player } from './game/types';

/** Landscape stage: the senet box centered, borne-off trays below it. */
export const VIEW = { w: 150, h: 68 } as const;

/** Square cell size in stage units. */
export const SQUARE = 14;

/** Top-left corner of square 1's cell. */
export const BOARD = { x: 5, y: 8, cols: 10, rows: 3 } as const;

/** Wooden box frame extends this far beyond the square grid. */
export const FRAME = 2.5;

/** Vertical center of the borne-off tray row. */
export const TRAY_Y = 60;

/** Drop-capture radius around a destination center, in stage units. */
export const SNAP = 10;

/** Casting-stick sprite size: vertical rounded bars resting on the table. */
export const STICK = { w: 2.2, h: 7 } as const;
/** Center distance between neighbouring stick rests. */
const STICK_GAP = 7;

/** Borne-off tray slots: first slot's inset from the box frame, and the pitch
 *  between slots. Both trays grow inward, so the pair must stop clear of the
 *  stick rests that own the centre strip (see the geometry test). */
const TRAY_INSET = 7;
const TRAY_STEP = 11;
/** Visual radius of a tray slot, and of a stick at rest — the clearance budget. */
export const TRAY_SLOT_R = 4.4;

export interface Pos {
  x: number;
  y: number;
}

/** Center of a path square. Reverse-S: row 1 left→right, row 2 right→left,
 *  row 3 left→right. */
export function squarePos(square: number): Pos {
  const row = Math.floor((square - 1) / 10);
  const along = (square - 1) % 10;
  const col = row === 1 ? 9 - along : along;
  return {
    x: BOARD.x + col * SQUARE + SQUARE / 2,
    y: BOARD.y + row * SQUARE + SQUARE / 2,
  };
}

/** Borne-off tray slot centers: light fills left-to-right from the left edge,
 *  dark right-to-left from the right edge, below the box. */
export function trayPos(player: Player, slot: number): Pos {
  const dx = slot * TRAY_STEP;
  return player === 'light'
    ? { x: BOARD.x + TRAY_INSET + dx, y: TRAY_Y }
    : { x: BOARD.x + BOARD.cols * SQUARE - TRAY_INSET - dx, y: TRAY_Y };
}

/** Rest positions of the four casting sticks: the open strip between the
 *  trays (x ≈ 60–90 once both trays fill), centered on the tray row. */
export function stickPos(i: number): Pos {
  return { x: VIEW.w / 2 + (i - 1.5) * STICK_GAP, y: TRAY_Y };
}

/** Where a legal move lands visually: a square center, or the mover's next
 *  free tray slot for a bear-off. */
export function targetPos(target: number | 'off', player: Player, borneOff: number): Pos {
  return target === 'off' ? trayPos(player, borneOff) : squarePos(target);
}

/** True when a drop point falls inside the capture zone around `center`. */
export function inCaptureZone(x: number, y: number, center: Pos): boolean {
  return Math.hypot(x - center.x, y - center.y) <= SNAP;
}
