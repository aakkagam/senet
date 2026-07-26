<script lang="ts">
  import { game } from '../store.svelte';
  import { SQUARE, squarePos, VIEW } from '../geometry';

  /* Anchored above square 27; the tail points down at the house. */
  const p = squarePos(27);
  const left = (p.x / VIEW.w) * 100;
  const top = ((p.y - SQUARE / 2 - 1) / VIEW.h) * 100;
</script>

<div class="anchor" style="left: {left}%; top: {top}%">
  <div class="panel" role="group" aria-label="House of Waters choice">
    <p class="title">The Waters hold this token</p>
    <button onclick={() => game.waterReturn()}>Return to Second Life</button>
    <button onclick={() => game.waterThrow()} disabled={game.notice !== null}>
      Throw — only a 4 frees it
    </button>
  </div>
  <div class="tail" aria-hidden="true"></div>
</div>

<style>
  .anchor {
    position: absolute;
    transform: translate(-50%, -100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
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

  .title {
    margin: 0;
    font-size: var(--text-sm);
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
  }

  button {
    min-height: 44px;
    padding: 8px 14px;
    font-size: var(--text-sm);
    font-weight: 600;
    background: transparent;
    border: 1.5px solid var(--ebony);
    border-radius: 999px;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color var(--duration-ui);
  }
  button:hover:enabled {
    background: var(--faience);
    color: var(--ivory);
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
</style>
