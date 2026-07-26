import { describe, expect, it } from 'vitest';
import { resolveThrow, type StickFaces } from './sticks';

function combosWithLightCount(n: number): StickFaces[] {
  const all: StickFaces[] = [];
  for (let bits = 0; bits < 16; bits++) {
    const faces = [0, 1, 2, 3].map((i) => Boolean(bits & (1 << i))) as unknown as StickFaces;
    if (faces.filter(Boolean).length === n) all.push(faces);
  }
  return all;
}

describe('resolveThrow (OI table)', () => {
  const table = [
    { light: 0, value: 5, throwAgain: true },
    { light: 1, value: 1, throwAgain: true },
    { light: 2, value: 2, throwAgain: false },
    { light: 3, value: 3, throwAgain: false },
    { light: 4, value: 4, throwAgain: true },
  ] as const;

  for (const { light, value, throwAgain } of table) {
    it(`${light} light side(s) up → move ${value}${throwAgain ? ' + throw again' : ''}`, () => {
      for (const faces of combosWithLightCount(light)) {
        expect(resolveThrow(faces)).toEqual({ value, throwAgain });
      }
    });
  }

  it('covers all 16 face arrangements', () => {
    const total = table.reduce((sum, row) => sum + combosWithLightCount(row.light).length, 0);
    expect(total).toBe(16);
  });
});
