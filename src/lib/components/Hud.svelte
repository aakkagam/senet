<script lang="ts">
  import { game } from '../store.svelte';

  const shownValue = $derived(game.pendingValue ?? game.lastThrow?.value ?? null);

  /** "Throw again" marker: pending on the current move, or granted and waiting.
   *  Never during a turn-passing notice — that throw earned nothing. */
  const throwAgain = $derived(
    !game.notice &&
      (game.extraThrowPending ||
        (game.state.phase.kind === 'awaiting-throw' && (game.lastThrow?.throwAgain ?? false))),
  );

  const message = $derived.by(() => {
    if (game.notice) return game.notice.text;
    const st = game.state;
    if (st.phase.kind === 'house-27-choice') return 'A token is caught in the House of Waters.';
    if (game.backwardTurn) {
      return game.lastThrow?.throwAgain
        ? 'No forward moves — move a token backward. The extra throw is forfeited.'
        : 'No forward moves — move a token backward.';
    }
    if (
      st.phase.kind === 'awaiting-move' &&
      st.turn === 'light' &&
      !st.lightFirstMoveDone &&
      st.squares[9] === 'light'
    ) {
      return 'Light begins with the token on square 9.';
    }
    return '';
  });

  const canThrow = $derived(game.state.phase.kind === 'awaiting-throw' && !game.notice);
  const showThrow = $derived(
    game.state.phase.kind === 'awaiting-throw' || game.notice !== null,
  );

  /* Illegal grab: the turn indicator pulses once to say "their move". */
  let indicator: HTMLDivElement | null = null;
  let seenDenials = 0;
  $effect(() => {
    if (game.denied === seenDenials) return;
    seenDenials = game.denied;
    if (indicator) {
      // remove + reflow + re-add so rapid grabs restart the one-shot animation
      indicator.classList.remove('nudged');
      void indicator.offsetWidth;
      indicator.classList.add('nudged');
    }
  });
</script>

<div class="hud">
  <div class="turn" bind:this={indicator}>
    <svg viewBox="-6 -6.5 12 13" class="glyph" aria-hidden="true">
      {#if game.displayTurn === 'light'}
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
    <span class="who" aria-live="polite">{game.displayTurn === 'light' ? 'Light' : 'Dark'}</span>
  </div>

  <div class="result" aria-live="polite">
    {#if game.lastFaces}
      <svg viewBox="0 0 30 18" class="sticks" aria-hidden="true">
        {#each game.lastFaces as up, i}
          <rect
            x={2 + i * 7}
            y="2"
            width="4"
            height="14"
            rx="2"
            class="stick"
            class:up
          />
        {/each}
      </svg>
    {/if}
    {#if shownValue !== null}
      <span class="numeral">{shownValue}</span>
      {#if throwAgain}
        <span class="again">throw again</span>
      {/if}
    {/if}
  </div>

  <p class="msg" aria-live="polite">{message}</p>

  {#if showThrow}
    <button class="throw" onclick={() => game.throwSticks()} disabled={!canThrow}>
      Throw sticks
    </button>
  {/if}
</div>

<style>
  .hud {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px 18px;
    padding: 6px 12px;
    min-height: 64px;
  }

  .turn {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 74px;
  }

  .glyph {
    width: 18px;
    height: 20px;
  }

  .who {
    font-weight: 700;
    font-size: var(--text-sm);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .turn:global(.nudged) .glyph {
    animation: bob 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .turn:global(.nudged) .who {
    animation: flare 0.55s ease-out;
  }

  @keyframes bob {
    30% {
      transform: translateY(-3.5px) scale(1.3);
    }
    65% {
      transform: translateY(1px) scale(0.96);
    }
  }

  @keyframes flare {
    30% {
      color: var(--faience);
    }
  }

  .result {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
  }

  .sticks {
    width: 40px;
    height: 26px;
  }

  .stick {
    fill: var(--ebony);
    stroke: var(--ebony);
    stroke-width: 0.8;
  }
  .stick.up {
    fill: var(--ivory);
  }

  .numeral {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    line-height: 1;
    color: var(--ebony);
    min-width: 1.1em;
    text-align: center;
  }

  .again {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--faience);
  }

  .msg {
    margin: 0;
    max-width: 34ch;
    font-size: var(--text-sm);
    text-wrap: balance;
    text-align: center;
    min-height: 1.2em;
  }

  .throw {
    min-height: 44px;
    padding: 10px 26px;
    font-weight: 700;
    background: transparent;
    border: 1.5px solid var(--ebony);
    border-radius: 999px;
    cursor: pointer;
    transition: background-color var(--duration-ui), opacity var(--duration-ui);
  }
  .throw:hover:enabled {
    background: var(--ivory);
  }
  .throw:disabled {
    opacity: 0.45;
    cursor: default;
  }

  @media (prefers-reduced-motion: reduce) {
    .turn:global(.nudged) .glyph,
    .turn:global(.nudged) .who {
      animation: none;
    }
  }
</style>
