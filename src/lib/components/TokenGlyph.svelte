<script lang="ts">
  import type { Player } from '../game/types';

  /** The two historical senet pieces, drawn once: light spools (waisted) and
   *  dark cones (tapered). Silhouette alone tells the players apart, so this
   *  is the single source for the board pieces, the HUD marker, the win
   *  banner and the move ghost. Paths are centred on the origin and sized for
   *  the stage's 14-unit square; the caller owns fill and stroke via
   *  `.fill` / `.rim`.
   *
   *  `rim` adds the carved band that gives a resting piece its weight — the
   *  ghost and the small markers leave it off. */
  let { player, rim = false }: { player: Player; rim?: boolean } = $props();
</script>

{#if player === 'light'}
  <path
    class="fill"
    d="M -3.6 -4.8 L 3.6 -4.8 C 3.6 -1.6 1.1 -1 1.1 0 C 1.1 1 3.6 1.6 3.6 4.8 L -3.6 4.8 C -3.6 1.6 -1.1 1 -1.1 0 C -1.1 -1 -3.6 -1.6 -3.6 -4.8 Z"
  />
  {#if rim}
    <line class="rim" x1="-3.6" y1="-3.4" x2="3.6" y2="-3.4" />
    <line class="rim" x1="-3.6" y1="3.4" x2="3.6" y2="3.4" />
  {/if}
{:else}
  <path class="fill" d="M 0 -5.2 L 3.9 3.4 Q 3.9 5 0 5 Q -3.9 5 -3.9 3.4 Z" />
  {#if rim}
    <path class="rim" d="M -2.9 1.2 Q 0 2.4 2.9 1.2" />
  {/if}
{/if}
