<script lang="ts">
  import { Spring } from 'svelte/motion';
  import { game } from '../store.svelte';
  import { inCaptureZone, squarePos, targetPos, trayPos, type Pos } from '../geometry';
  import { prefersReducedMotion, SPRING_FOLLOW, SPRING_SETTLE, SPRING_SHAKE } from '../motion';
  import type { Token } from '../tokens';
  import TokenGlyph from './TokenGlyph.svelte';

  let { token }: { token: Token } = $props();

  function restPos(): Pos {
    return token.square === 'off'
      ? trayPos(token.player, token.offOrder ?? 0)
      : squarePos(token.square);
  }

  const anchor = $derived(restPos());

  const pos = new Spring(restPos(), SPRING_SETTLE);

  $effect(() => {
    const a = anchor;
    if (game.dragging !== token.id) {
      if (prefersReducedMotion()) pos.set(a, { instant: true });
      else pos.target = a;
    }
  });

  const grabbable = $derived(game.canGrab(token.id));
  const lifted = $derived(game.dragging === token.id);
  const playing = $derived(game.state.phase.kind !== 'game-over');

  const label = $derived(
    `${token.player === 'light' ? 'Light' : 'Dark'} token ${
      token.square === 'off' ? 'off the board' : `on square ${token.square}`
    }`,
  );

  let moved = false;
  let grabOffset = { x: 0, y: 0 };
  let pointerId = -1;
  // Grabbing reorders the token to the top of the SVG; a DOM move drops
  // element-level pointer capture, so the drag listens on the window instead.
  let svg: SVGSVGElement | null = null;

  function toStage(e: PointerEvent): Pos {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      svg!.getScreenCTM()!.inverse(),
    );
    return { x: pt.x, y: pt.y };
  }

  let bodyEl: SVGGElement;
  let shakeTimer: ReturnType<typeof setTimeout>;

  /** Illegal grab: the token shakes its head, never leaving its square. */
  function refuse() {
    game.denyGrab(typeof token.square === 'number' ? token.square : undefined);
    if (prefersReducedMotion()) {
      bodyEl.animate({ opacity: [1, 0.45, 1] }, { duration: 240, easing: 'ease-out' });
      return;
    }
    clearTimeout(shakeTimer);
    pos.stiffness = SPRING_SHAKE.stiffness;
    pos.damping = SPRING_SHAKE.damping;
    pos.set({ x: anchor.x - 1.7, y: anchor.y }, { instant: true });
    pos.target = anchor;
    shakeTimer = setTimeout(() => {
      if (game.dragging !== token.id) {
        pos.stiffness = SPRING_SETTLE.stiffness;
        pos.damping = SPRING_SETTLE.damping;
      }
    }, 500);
  }

  function down(e: PointerEvent) {
    if (pointerId !== -1) return;
    if (!grabbable) {
      // Mid-tumble taps change nothing at all — not even a head-shake.
      if (playing && !game.notice && !game.revealing) refuse();
      return;
    }
    svg = (e.currentTarget as SVGGraphicsElement).ownerSVGElement;
    pointerId = e.pointerId;
    const p = toStage(e);
    grabOffset = { x: pos.current.x - p.x, y: pos.current.y - p.y };
    moved = false;
    game.dragging = token.id;
    pos.stiffness = SPRING_FOLLOW.stiffness;
    pos.damping = SPRING_FOLLOW.damping;
    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function moveHandler(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    const p = toStage(e);
    const target = { x: p.x + grabOffset.x, y: p.y + grabOffset.y };
    if (Math.hypot(target.x - anchor.x, target.y - anchor.y) > 1.5) moved = true;
    if (prefersReducedMotion()) pos.set(target, { instant: true });
    else pos.target = target;
  }

  function up(e: PointerEvent) {
    if (e.pointerId !== pointerId) return;
    pointerId = -1;
    window.removeEventListener('pointermove', moveHandler);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    game.dragging = null;
    pos.stiffness = SPRING_SETTLE.stiffness;
    pos.damping = SPRING_SETTLE.damping;

    if (!moved) {
      // Tap: the destination is forced by the throw, so a tap commits the move.
      if (!game.moveToken(token.id)) pos.target = anchor;
      return;
    }
    const from = token.square;
    const target = from === 'off' ? null : game.legalTargetOf(from);
    const p = toStage(e);
    const dropX = p.x + grabOffset.x;
    const dropY = p.y + grabOffset.y;
    const center =
      target === null ? null : targetPos(target, token.player, game.state.borneOff[token.player]);
    if (center === null || !inCaptureZone(dropX, dropY, center) || !game.moveToken(token.id)) {
      // Illegal or stray: spring home (the bounce-back IS the error message).
      pos.target = anchor;
    }
  }

  function enter() {
    if (grabbable) game.hovering = token.id;
  }
  function leave() {
    if (game.hovering === token.id) game.hovering = null;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<g
  class="token {token.player}"
  class:grabbable
  class:lifted
  transform="translate({pos.current.x} {pos.current.y})"
  onpointerdown={down}
  onpointerenter={enter}
  onpointerleave={leave}
  role="button"
  tabindex="-1"
  aria-label={label}
>
  {#if grabbable && !lifted}
    <circle class="halo" r="6.4" />
  {/if}
  {#if lifted}
    <ellipse class="shadow" cx="0.7" cy="1.8" rx="5.4" ry="4.2" />
  {/if}
  <g class="body" bind:this={bodyEl}>
    <TokenGlyph player={token.player} rim />
  </g>
  <!-- generous invisible touch target (≥44px even at 360px-wide viewports) -->
  <circle r="10" fill="transparent" />
</g>

<style>
  .token {
    cursor: default;
    touch-action: none;
  }
  .token.grabbable {
    cursor: grab;
  }
  .token.lifted {
    cursor: grabbing;
  }

  .light :global(.fill) {
    fill: var(--ivory);
    stroke: var(--ebony);
    stroke-width: 0.4;
    stroke-opacity: 0.55;
  }
  .light :global(.rim) {
    stroke: var(--ebony);
    stroke-width: 0.35;
    opacity: 0.4;
  }
  .dark :global(.fill) {
    fill: var(--ebony);
  }
  .dark :global(.rim) {
    stroke: var(--ivory);
    stroke-width: 0.35;
    fill: none;
    opacity: 0.45;
  }

  /* Glaze, not base faience: the halo is the "you can lift this" affordance and
     has to survive greyscale, so it needs a luminance step off the wood
     (3.2:1), not just a hue shift (1.25:1). The breathing is a bonus, not the
     signal — under reduced motion the ring alone still reads. */
  .halo {
    fill: none;
    stroke: var(--faience-glaze);
    stroke-width: 0.6;
    animation: breathe 1.3s ease-in-out infinite;
  }

  @keyframes breathe {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.18);
      opacity: 0.6;
    }
  }

  .body {
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .lifted .body {
    transform: scale(1.16);
  }

  .shadow {
    fill: oklch(0.2 0.02 60 / 0.28);
  }

  @media (prefers-reduced-motion: reduce) {
    .body {
      transition: none;
    }
    .halo {
      animation: none;
    }
  }
</style>
