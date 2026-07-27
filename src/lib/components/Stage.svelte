<script lang="ts">
  import { game } from '../store.svelte';
  import { SQUARE, targetPos, TRAY_SLOT_R, VIEW } from '../geometry';
  import Board from './Board.svelte';
  import Sticks from './Sticks.svelte';
  import Token from './Token.svelte';
  import TokenGlyph from './TokenGlyph.svelte';

  /** Active (dragged/hovered) token renders last = on top. */
  const ordered = $derived(
    [...game.tokens].sort(
      (a, b) => Number(a.id === game.activeToken) - Number(b.id === game.activeToken),
    ),
  );

  /** The Faience destination for the active token, straight from the engine. */
  const glow = $derived.by(() => {
    const id = game.activeToken;
    if (id === null) return null;
    const token = game.tokens[id];
    if (token.square === 'off') return null;
    const target = game.legalTargetOf(token.square);
    if (target === null) return null;
    return {
      off: target === 'off',
      player: token.player,
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
  <Sticks />

  <!-- Where the piece lands. Colour alone cannot carry this: on the wood the
       accent is a hue shift with barely any luminance behind it, so the state
       is spoken twice — a glazed cell (3:1 off the wood) and a ghost of the
       mover's own silhouette, which survives greyscale on shape alone. -->
  {#if glow}
    <g class="destination" class:off={glow.off}>
      {#if glow.off}
        <!-- Same radius as the resting tray slot: this one lights up, rather
             than a second ring appearing around it. -->
        <circle class="slot" cx={glow.pos.x} cy={glow.pos.y} r={TRAY_SLOT_R} />
      {:else}
        <rect
          class="cell"
          x={glow.pos.x - SQUARE / 2 + 0.7}
          y={glow.pos.y - SQUARE / 2 + 0.7}
          width={SQUARE - 1.4}
          height={SQUARE - 1.4}
          rx="1"
        />
      {/if}
      <!-- A tray slot is smaller than a board square, so the ghost shrinks to
           sit inside it rather than spilling over the rim. -->
      <g
        class="ghost"
        transform="translate({glow.pos.x} {glow.pos.y}) scale({glow.off ? 0.72 : 1})"
      >
        <TokenGlyph player={glow.player} />
      </g>
    </g>
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

  .destination {
    pointer-events: none;
    animation: pulse 1.1s ease-in-out infinite;
  }

  /* On the board: the glaze step, bright against the timber. */
  .cell {
    fill: var(--faience-glaze);
    fill-opacity: 0.3;
    stroke: var(--faience-glaze);
    stroke-width: 0.9;
  }

  .ghost :global(.fill) {
    fill: var(--faience-glaze);
    fill-opacity: 0.42;
    stroke: var(--faience-glaze);
    stroke-width: 0.55;
  }

  /* Bear-off slots sit on the pale table, where the same glaze would vanish
     (1.1:1) — the deep step is what carries contrast on this ground. */
  .off .slot {
    fill: var(--faience-deep);
    fill-opacity: 0.16;
    stroke: var(--faience-deep);
    stroke-width: 0.6;
  }

  .off .ghost :global(.fill) {
    fill: var(--faience-deep);
    fill-opacity: 0.3;
    stroke: var(--faience-deep);
    stroke-width: 0.45;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .destination {
      animation: none;
    }
  }
</style>
