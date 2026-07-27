<script lang="ts">
  import type { Player } from '../game/types';
  import TokenGlyph from './TokenGlyph.svelte';

  /** The small inline piece used wherever text names a player: the turn
   *  indicator and the win banner. Decorative — the adjacent word carries the
   *  meaning — so it stays out of the accessibility tree. */
  let { player }: { player: Player } = $props();
</script>

<svg class="marker {player}" viewBox="-6 -6.5 12 13" aria-hidden="true">
  <TokenGlyph {player} />
</svg>

<style>
  .marker {
    width: 18px;
    height: 20px;
    flex: none;
  }

  .light :global(.fill) {
    fill: var(--ivory);
    stroke: var(--ebony);
    stroke-width: 0.4;
  }

  .dark :global(.fill) {
    fill: var(--ebony);
  }
</style>
