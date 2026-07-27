<script lang="ts">
  import { game } from '../store.svelte';
  import Stage from './Stage.svelte';
  import HouseLore from './HouseLore.svelte';
  import HouseNote from './HouseNote.svelte';
  import Hud from './Hud.svelte';
  import WaterChoice from './WaterChoice.svelte';
  import WinBanner from './WinBanner.svelte';
</script>

<main>
  <!-- A wordmark, not a heading: the page's one h1 is the crawlable one in
       index.html, and two of them flattened the document outline. -->
  <p class="mark" aria-hidden="true">Senet</p>

  <div class="stage-wrap">
    <Stage />
    {#if game.state.phase.kind === 'house-27-choice'}
      <WaterChoice />
    {:else if game.infoHouse !== null}
      <HouseLore />
    {:else if game.houseNote}
      <HouseNote />
    {/if}
  </div>

  <Hud />

  <footer class="colophon">
    <p>
      After the Egyptian game of passing, c. 3100 BC. &middot;
      <a href="https://games.aakkagam.com/">Aakkagam Games</a> &middot;
      <a href="mailto:admin@aakkagam.com?subject=Feedback%20from%20senet">Feedback</a>
    </p>
  </footer>

  {#if game.state.phase.kind === 'game-over'}
    <WinBanner />
  {/if}
</main>

<style>
  main {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 14px 8px 6px;
  }

  .mark {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-xl);
    letter-spacing: var(--tracking-display);
    line-height: 1;
    color: var(--ebony);
  }

  /* main centres its children, so this would otherwise size to the colophon's
     max-content width and push the page into sideways scroll. */
  .colophon {
    flex: none;
    align-self: stretch;
    padding: 0 12px;
  }

  .colophon p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ebony-dim);
    text-align: center;
    text-wrap: pretty;
  }

  .colophon a {
    color: inherit;
    white-space: nowrap;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color var(--duration-ui) var(--ease-out-expo);
  }

  .colophon a:hover,
  .colophon a:focus-visible {
    color: var(--faience-deep);
  }

  /* The box keeps its proportions like a physical object: the wrapper locks
     the stage aspect so overlays anchored by percentage line up with squares,
     and narrow viewports letterbox instead of reflowing.

     Sized by whatever height the flex column has left over rather than by a
     hardcoded chrome allowance: aspect-ratio then derives the width, so the
     board grows into the space and no magic number has to be kept in sync with
     the wordmark and HUD above and below it. */
  .stage-wrap {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    max-height: 435px;
    aspect-ratio: 150 / 68;
    width: auto;
    max-width: min(100%, 960px);
  }

  /* Phones held upright: the wide board plays sideways. The game rotates a
     quarter turn so the first viewport is effectively landscape; the about
     text below the fold stays upright. */
  @media (orientation: portrait) and (max-width: 700px) {
    main {
      width: 100dvh;
      height: 100dvw;
      transform: rotate(90deg) translateY(-100dvw);
      transform-origin: top left;
      padding: 8px 8px 4px;
    }
  }

  /* Short viewports of either orientation: the wordmark is the first thing to
     go, since index.html already names the game above the board. */
  @media (orientation: portrait) and (max-width: 430px), (max-height: 430px) {
    .mark {
      display: none;
    }
  }
</style>
