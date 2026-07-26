import { describe, expect, it } from 'vitest';
import {
  isAdjacent,
  isProtectedAt,
  isWallMember,
  runLength,
  wallBlocksPassage,
} from './board';
import { boardWith } from './test-helpers';

describe('path adjacency', () => {
  it('squares 20 and 21 are consecutive across the row corner, like 10 and 11', () => {
    expect(isAdjacent(20, 21)).toBe(true);
    expect(isAdjacent(10, 11)).toBe(true);
  });

  it('visually stacked squares 18 and 23 are not adjacent on the path', () => {
    expect(isAdjacent(18, 23)).toBe(false);
  });

  it('off-path squares are never adjacent', () => {
    expect(isAdjacent(30, 31)).toBe(false);
    expect(isAdjacent(0, 1)).toBe(false);
  });
});

describe('consecutive runs and protection', () => {
  it('detects run length around a corner', () => {
    const squares = boardWith({ 19: 'dark', 20: 'dark', 21: 'dark' });
    expect(runLength(squares, 20)).toBe(3);
    expect(isWallMember(squares, 21)).toBe(true);
  });

  it('a lone token is not protected', () => {
    const squares = boardWith({ 12: 'dark' });
    expect(isProtectedAt(squares, 12)).toBe(false);
  });

  it('a consecutive pair protects both tokens', () => {
    const squares = boardWith({ 13: 'dark', 14: 'dark' });
    expect(isProtectedAt(squares, 13)).toBe(true);
    expect(isProtectedAt(squares, 14)).toBe(true);
  });

  it('a pair spanning the 20|21 corner is protected', () => {
    const squares = boardWith({ 20: 'light', 21: 'light' });
    expect(isProtectedAt(squares, 20)).toBe(true);
    expect(isProtectedAt(squares, 21)).toBe(true);
  });

  it('mixed-player neighbours give no protection', () => {
    const squares = boardWith({ 13: 'dark', 14: 'light' });
    expect(isProtectedAt(squares, 13)).toBe(false);
    expect(isProtectedAt(squares, 14)).toBe(false);
  });

  it('protection never applies on squares 27–30', () => {
    const squares = boardWith({ 28: 'dark', 29: 'dark', 30: 'dark' });
    expect(isProtectedAt(squares, 28)).toBe(false);
    expect(isProtectedAt(squares, 29)).toBe(false);
    expect(isProtectedAt(squares, 30)).toBe(false);
  });

  it('a token on 26 partnered from 27 is still protected (26 is outside 27–30)', () => {
    const squares = boardWith({ 26: 'dark', 27: 'dark' });
    expect(isProtectedAt(squares, 26)).toBe(true);
    expect(isProtectedAt(squares, 27)).toBe(false);
  });
});

describe('walls', () => {
  const squares = boardWith({ 14: 'dark', 15: 'dark', 16: 'dark', 20: 'light' });

  it('two consecutive tokens are protected but not a wall', () => {
    const pair = boardWith({ 14: 'dark', 15: 'dark' });
    expect(isWallMember(pair, 14)).toBe(false);
    expect(wallBlocksPassage(pair, 'light', 12, 17)).toBe(false);
  });

  it('a 3-token wall blocks forward passage', () => {
    expect(wallBlocksPassage(squares, 'light', 12, 17)).toBe(true);
  });

  it('a 3-token wall blocks backward passage', () => {
    expect(wallBlocksPassage(squares, 'light', 18, 13)).toBe(true);
  });

  it('moving up to the wall edge is not passage', () => {
    expect(wallBlocksPassage(squares, 'light', 12, 14)).toBe(false);
  });

  it('a wall never blocks its own player', () => {
    expect(wallBlocksPassage(squares, 'dark', 12, 17)).toBe(false);
  });
});
