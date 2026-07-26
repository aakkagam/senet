<script lang="ts">
  import { game } from '../store.svelte';
  import { SQUARE, targetPos, VIEW } from '../geometry';
  import Board from './Board.svelte';
  import Token from './Token.svelte';

  /** Active (dragged/hovered) token renders last = on top. */
  const ordered = $derived(
    [...game.tokens].sort(
      (a, b) => Number(a.id === game.activeToken) - Number(b.id === game.activeToken),
    ),
  );

  /** The Faience destination glow for the active token, straight from the engine. */
  const glow = $derived.by(() => {
    const id = game.activeToken;
    if (id === null) return null;
    const token = game.tokens[id];
    if (token.square === 'off') return null;
    const target = game.legalTargetOf(token.square);
    if (target === null) return null;
    return {
      off: target === 'off',
      pos: targetPos(target, token.player, game.state.borneOff[token.player]),
    };
  });
</script>

<svg viewBox="0 0 {VIEW.w} {VIEW.h}" preserveAspectRatio="xMidYMid meet" aria-label="Senet board">
  <defs>
    <!-- chisel wobble: slight, controlled -->
    <filter id="carve" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06 0.09" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" />
    </filter>
  </defs>

  <Board />

  {#if glow}
    {#if glow.off}
      <circle class="glow-slot" cx={glow.pos.x} cy={glow.pos.y} r="5.4" />
    {:else}
      <rect
        class="glow-square"
        x={glow.pos.x - SQUARE / 2 + 0.7}
        y={glow.pos.y - SQUARE / 2 + 0.7}
        width={SQUARE - 1.4}
        height={SQUARE - 1.4}
        rx="1"
      />
    {/if}
  {/if}

  {#each ordered as token (token.id)}
    <Token {token} />
  {/each}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }

  .glow-square {
    fill: var(--faience);
    fill-opacity: 0.28;
    stroke: var(--faience);
    stroke-width: 0.7;
    animation: pulse 1.1s ease-in-out infinite;
  }

  .glow-slot {
    fill: var(--faience);
    fill-opacity: 0.28;
    stroke: var(--faience);
    stroke-width: 0.7;
    animation: pulse 1.1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      stroke-opacity: 1;
    }
    50% {
      stroke-opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .glow-square,
    .glow-slot {
      animation: none;
    }
  }
</style>
