import { describe, expect, it } from 'vitest';
import {
  BOARD,
  SNAP,
  SQUARE,
  STICK,
  TRAY_SLOT_R,
  VIEW,
  inCaptureZone,
  squarePos,
  stickPos,
  targetPos,
  trayPos,
} from './geometry';

describe('squarePos boustrophedon', () => {
  it('row corners are vertically adjacent: 11 directly below 10', () => {
    const a = squarePos(10);
    const b = squarePos(11);
    expect(b.x).toBe(a.x);
    expect(b.y - a.y).toBe(SQUARE);
  });

  it('row corners are vertically adjacent: 21 directly below 20', () => {
    const a = squarePos(20);
    const b = squarePos(21);
    expect(b.x).toBe(a.x);
    expect(b.y - a.y).toBe(SQUARE);
  });

  it('middle row runs right-to-left: 11 at the right end, 20 at the left end', () => {
    expect(squarePos(11).x).toBeGreaterThan(squarePos(20).x);
    expect(squarePos(11).x).toBe(squarePos(10).x);
    expect(squarePos(20).x).toBe(squarePos(1).x);
  });

  it('top and bottom rows run left-to-right', () => {
    expect(squarePos(1).x).toBeLessThan(squarePos(10).x);
    expect(squarePos(21).x).toBeLessThan(squarePos(30).x);
  });

  it('consecutive path squares are exactly one cell apart', () => {
    for (let s = 1; s < 30; s++) {
      const a = squarePos(s);
      const b = squarePos(s + 1);
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBe(SQUARE);
    }
  });

  it('visually stacked squares across rows are not path-adjacent: 18 above 23', () => {
    const a = squarePos(18);
    const b = squarePos(23);
    expect(a.x).toBe(b.x); // same column…
    expect(Math.abs(18 - 23)).not.toBe(1); // …but far apart on the path
  });

  it('all 30 squares stay inside the stage', () => {
    for (let s = 1; s <= 30; s++) {
      const p = squarePos(s);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(VIEW.w);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(VIEW.h);
    }
  });

  it('squares occupy 30 distinct cells on a 10-wide grid', () => {
    const seen = new Set<string>();
    for (let s = 1; s <= 30; s++) {
      const p = squarePos(s);
      seen.add(`${p.x},${p.y}`);
    }
    expect(seen.size).toBe(30);
  });
});

describe('trayPos', () => {
  it('slots are distinct, below the board, inside the stage', () => {
    const seen = new Set<string>();
    for (const player of ['light', 'dark'] as const) {
      for (let slot = 0; slot < 5; slot++) {
        const p = trayPos(player, slot);
        seen.add(`${p.x},${p.y}`);
        expect(p.y).toBeGreaterThan(BOARD.y + 3 * SQUARE);
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(VIEW.w);
        expect(p.y).toBeLessThan(VIEW.h);
      }
    }
    expect(seen.size).toBe(10);
  });

  it('light fills from the left, dark from the right', () => {
    expect(trayPos('light', 1).x).toBeGreaterThan(trayPos('light', 0).x);
    expect(trayPos('dark', 1).x).toBeLessThan(trayPos('dark', 0).x);
    expect(trayPos('light', 0).x).toBeLessThan(trayPos('dark', 0).x);
  });

  it('the two trays are mirror images about the box centre', () => {
    const centre = BOARD.x + (BOARD.cols * SQUARE) / 2;
    for (let slot = 0; slot < 5; slot++) {
      const light = trayPos('light', slot).x;
      const dark = trayPos('dark', slot).x;
      expect(centre - light).toBeCloseTo(dark - centre);
    }
  });

  it('a full tray never collides with the sticks resting in the centre strip', () => {
    // The last slot to fill is the innermost one, so slot 4 is the worst case.
    const lightEdge = trayPos('light', 4).x + TRAY_SLOT_R;
    const darkEdge = trayPos('dark', 4).x - TRAY_SLOT_R;
    for (let i = 0; i < 4; i++) {
      const stick = stickPos(i);
      expect(stick.x - STICK.w / 2).toBeGreaterThan(lightEdge);
      expect(stick.x + STICK.w / 2).toBeLessThan(darkEdge);
    }
  });
});

describe('capture zone', () => {
  it('targetPos maps a square target to its center and off to the next tray slot', () => {
    expect(targetPos(12, 'light', 0)).toEqual(squarePos(12));
    expect(targetPos('off', 'dark', 2)).toEqual(trayPos('dark', 2));
  });

  it('accepts drops within SNAP of the center and rejects beyond', () => {
    const c = squarePos(26);
    expect(inCaptureZone(c.x, c.y, c)).toBe(true);
    expect(inCaptureZone(c.x + SNAP - 0.1, c.y, c)).toBe(true);
    expect(inCaptureZone(c.x + SNAP + 0.1, c.y, c)).toBe(false);
  });
});
