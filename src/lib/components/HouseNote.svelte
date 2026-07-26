<script lang="ts">
  import { fade } from 'svelte/transition';
  import { game } from '../store.svelte';
  import { SQUARE, squarePos, VIEW } from '../geometry';
  import { prefersReducedMotion } from '../motion';

  /* Anchored above the note's house, WaterChoice's percent pattern; the store
     owns the ~3 s lifetime, so this component only renders and announces. */
  const note = $derived(game.houseNote);
  const anchor = $derived.by(() => {
    if (!note) return null;
    const p = squarePos(note.house);
    return {
      left: (p.x / VIEW.w) * 100,
      top: ((p.y - SQUARE / 2 - 1) / VIEW.h) * 100,
    };
  });

  const fadeMs = $derived(prefersReducedMotion() ? 0 : 150);
</script>

{#if note && anchor}
  {#key note.id}
    <div
      class="anchor"
      style="left: {anchor.left}%; top: {anchor.top}%"
      transition:fade={{ duration: fadeMs }}
    >
      <p class="panel" aria-live="polite">{note.text}</p>
      <div class="tail" aria-hidden="true"></div>
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
    /* teaching never blocks play */
    pointer-events: none;
  }

  .panel {
    margin: 0;
    max-width: 30ch;
    padding: 6px 10px;
    font-size: var(--text-sm);
    text-align: center;
    text-wrap: balance;
    background: var(--ivory);
    border: 1px solid var(--ebony);
    border-radius: 10px;
    box-shadow: 0 4px 14px oklch(0.2 0.02 60 / 0.22);
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
