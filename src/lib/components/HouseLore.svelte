<script lang="ts">
  import { fade } from 'svelte/transition';
  import { game } from '../store.svelte';
  import { SQUARE, squarePos, VIEW } from '../geometry';
  import { prefersReducedMotion } from '../motion';
  import { HOUSE_LORE } from '../houseLore';

  /* Anchored above the hovered house, HouseNote's percent pattern. The tail
     stays on the square; near the right edge only the panel slides left. */
  const house = $derived(game.infoHouse);
  const lore = $derived(house === null ? null : HOUSE_LORE[house]);
  const anchor = $derived.by(() => {
    if (house === null) return null;
    const p = squarePos(house);
    return {
      left: (p.x / VIEW.w) * 100,
      top: ((p.y - SQUARE / 2 - 1) / VIEW.h) * 100,
    };
  });

  /** Panel shift in percent of its own width, capped short of the tail. */
  const shift = $derived.by(() => {
    if (!anchor || anchor.left <= 72) return 0;
    return Math.max(-42, -(anchor.left - 72) * 2);
  });

  const fadeMs = $derived(prefersReducedMotion() ? 0 : 150);
</script>

{#if lore && anchor}
  {#key house}
    <!-- the hotspot's aria-label already speaks this text -->
    <div
      class="anchor"
      style="left: {anchor.left}%; top: {anchor.top}%"
      transition:fade={{ duration: fadeMs }}
      aria-hidden="true"
    >
      <p class="panel" style="transform: translateX({shift}%)">
        <strong class="name">{lore.name}</strong>
        {lore.text}
      </p>
      <div class="tail"></div>
    </div>
  {/key}
{/if}

<style>
  .anchor {
    position: absolute;
    transform: translate(-50%, -100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    /* lore never blocks play */
    pointer-events: none;
  }

  .panel {
    margin: 0;
    /* shrink-to-fit would collapse against the stage edge for right-side
       houses; take natural width and let the edge shift handle overflow */
    width: max-content;
    max-width: 34ch;
    padding: 7px 11px;
    font-size: var(--text-sm);
    text-align: left;
    text-wrap: pretty;
    background: var(--ivory);
    border: 1px solid var(--ebony);
    border-radius: 10px;
    box-shadow: 0 4px 14px oklch(0.2 0.02 60 / 0.22);
  }

  .name {
    display: block;
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: var(--tracking-display);
    margin-bottom: 2px;
  }

  .tail {
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid var(--ivory);
    margin-top: -1px;
    filter: drop-shadow(0 1px 0 var(--ebony));
  }
</style>
