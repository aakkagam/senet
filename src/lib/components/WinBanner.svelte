<script lang="ts">
  import { fade } from 'svelte/transition';
  import { game } from '../store.svelte';
  import { prefersReducedMotion } from '../motion';
  import TokenMarker from './TokenMarker.svelte';

  const winner = $derived(
    game.state.phase.kind === 'game-over' ? game.state.phase.winner : null,
  );
  const who = $derived(winner === 'light' ? 'Light' : 'Dark');
  const delay = prefersReducedMotion() ? 0 : 450;
  const dur = prefersReducedMotion() ? 0 : 220;

  /* The game is over and there is exactly one thing left to do, so hand the
     keyboard straight to it rather than leaving focus on a board nobody can
     play any more. Waits out the entrance so the move doesn't fight the fade. */
  let playAgain: HTMLButtonElement | null = $state(null);
  $effect(() => {
    if (!playAgain) return;
    const t = setTimeout(() => playAgain?.focus(), delay + dur);
    return () => clearTimeout(t);
  });
</script>

<div class="veil" in:fade={{ duration: dur, delay }} out:fade={{ duration: dur }}>
  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="win-title"
    aria-describedby="win-detail"
  >
    <p class="win-title" id="win-title">{who} passes beyond</p>
    <p class="detail" id="win-detail">
      {#if winner}<TokenMarker player={winner} />{/if}
      All five tokens off the board. {who} wins.
    </p>
    <button class="again" bind:this={playAgain} onclick={() => game.newGame()}>Play again</button>
  </div>
</div>

<style>
  /* The panel needs ground. Floating it straight onto the board read as a
     sticker; a warm scrim settles the finished position back and makes the one
     remaining action unmistakable. */
  .veil {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: oklch(0.32 0.03 60 / 0.42);
  }

  .panel {
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

  .again {
    font-weight: 700;
    background: transparent;
    border: 1.5px solid var(--ebony);
    border-radius: 999px;
    padding: 10px 30px;
    min-height: 44px;
    cursor: pointer;
    transition: background-color var(--duration-ui) var(--ease-out-expo);
  }
  /* Ebony on the glaze, not ivory: ivory on faience is 2.3:1, ebony is 6.0:1. */
  .again:hover {
    background: var(--faience);
    color: var(--ebony);
  }
  .again:active {
    background: var(--faience);
    border-color: var(--faience-deep);
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      animation: none;
    }
  }
</style>
