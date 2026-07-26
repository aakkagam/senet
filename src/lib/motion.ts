/** Live reduced-motion preference; springs snap and CSS falls back to fades. */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Spring tuning: drag-follow is taut, settling is soft and weighty. */
export const SPRING_FOLLOW = { stiffness: 0.28, damping: 0.72 };
export const SPRING_SETTLE = { stiffness: 0.12, damping: 0.5 };
/** Underdamped: one sideways kick decays into a head-shake "no". */
export const SPRING_SHAKE = { stiffness: 0.4, damping: 0.22 };

/** Stick-throw theatre: per-stick tumble length and start stagger. The whole
 *  reveal spans TUMBLE_MS + 3 × TUMBLE_STAGGER_MS ≈ 900 ms. */
export const TUMBLE_MS = 660;
export const TUMBLE_STAGGER_MS = 80;
/** Store fail-safe clearing the reveal gate even if animation events are lost. */
export const REVEAL_FAILSAFE_MS = 1600;
