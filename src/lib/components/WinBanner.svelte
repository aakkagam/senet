<script lang="ts">
  import { fade } from 'svelte/transition';
  import { game } from '../store.svelte';
  import { prefersReducedMotion } from '../motion';

  const winner = $derived(
    game.state.phase.kind === 'game-over' ? game.state.phase.winner : null,
  );
  const delay = prefersReducedMotion() ? 0 : 450;
  const dur = prefersReducedMotion() ? 0 : 220;
</script>

<div class="veil" in:fade={{ duration: dur, delay }} out:fade={{ duration: dur }}>
  <div class="panel">
    <p class="win-title">{winner === 'light' ? 'Light' : 'Dark'} passes beyond</p>
    <p class="detail">
      <svg viewBox="-6 -6.5 12 13" class="glyph" aria-hidden="true">
        {#if winner === 'light'}
          <path
            d="M -3.6 -4.8 L 3.6 -4.8 C 3.6 -1.6 1.1 -1 1.1 0 C 1.1 1 3.6 1.6 3.6 4.8 L -3.6 4.8 C -3.6 1.6 -1.1 1 -1.1 0 C -1.1 -1 -3.6 -1.6 -3.6 -4.8 Z"
            fill="var(--ivory)"
            stroke="var(--ebony)"
            stroke-width="0.4"
          />
        {:else}
          <path d="M 0 -5.2 L 3.9 3.4 Q 3.9 5 0 5 Q -3.9 5 -3.9 3.4 Z" fill="var(--ebony)" />
        {/if}
      </svg>
      All five tokens borne off the board
    </p>
    <button class="again" onclick={() => game.newGame()}>Play again</button>
  </div>
</div>

<style>
  .veil {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .panel {
    pointer-events: auto;
    background: var(--ivory);
    border: 1px solid var(--ebony);
    border-radius: 14px;
    padding: 22px 34px 24px;
    text-align: center;
    color: var(--ebony);
    animation: thump 0.28s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes thump {
    from {
      scale: 1.08;
    }
    to {
      scale: 1;
    }
  }

  .win-title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: var(--text-lg);
    letter-spacing: var(--tracking-display);
    margin: 0 0 10px;
  }

  .detail {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 0 18px;
    font-size: var(--text-sm);
  }

  .glyph {
    width: 18px;
    height: 20px;
  }

  .again {
    font-weight: 700;
    background: transparent;
    border: 1.5px solid var(--ebony);
    border-radius: 999px;
    padding: 10px 30px;
    min-height: 44px;
    cursor: pointer;
  }
  .again:hover {
    background: var(--faience);
    color: var(--ivory);
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      animation: none;
    }
  }
</style>
