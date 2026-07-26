<script lang="ts">
  import { game } from '../store.svelte';
  import Stage from './Stage.svelte';
  import Hud from './Hud.svelte';
  import WaterChoice from './WaterChoice.svelte';
  import WinBanner from './WinBanner.svelte';
</script>

<main>
  <h1 class="mark">Senet</h1>

  <div class="stage-wrap">
    <Stage />
    {#if game.state.phase.kind === 'house-27-choice'}
      <WaterChoice />
    {/if}
  </div>

  <Hud />

  {#if game.state.phase.kind === 'game-over'}
    <WinBanner />
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px 6px;
  }

  .mark {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-md);
    letter-spacing: var(--tracking-display);
    color: var(--ebony);
  }

  /* The box keeps its proportions like a physical object: the wrapper locks
     the stage aspect so overlays anchored by percentage line up with squares,
     and narrow viewports letterbox instead of reflowing. */
  .stage-wrap {
    position: relative;
    width: min(100%, 960px);
    aspect-ratio: 150 / 68;
  }
</style>
