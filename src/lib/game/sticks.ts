import type { ThrowResult } from './types';

/** Four two-sided casting sticks; true = light side up. */
export type StickFaces = readonly [boolean, boolean, boolean, boolean];

/** Oriental Institute table: 1→1 again, 2→2, 3→3, 4→4 again, 0→5 again. */
export function resolveThrow(faces: StickFaces): ThrowResult {
  const light = faces.filter(Boolean).length;
  switch (light) {
    case 0:
      return { value: 5, throwAgain: true };
    case 1:
      return { value: 1, throwAgain: true };
    case 2:
      return { value: 2, throwAgain: false };
    case 3:
      return { value: 3, throwAgain: false };
    case 4:
      return { value: 4, throwAgain: true };
    default:
      throw new Error(`impossible stick count: ${light}`);
  }
}
