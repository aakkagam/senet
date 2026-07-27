<script lang="ts">
  import { game } from '../store.svelte';
  import TokenMarker from './TokenMarker.svelte';

  /** The numeral is the fact — and it waits for the stick reveal. */
  const shownValue = $derived(
    game.revealing ? null : (game.pendingValue ?? game.lastThrow?.value ?? null),
  );

  /** "Extra throw" marker: pending on the current move, or granted and waiting.
   *  Never during a turn-passing notice — that throw earned nothing. */
  const throwAgain = $derived(
    !game.notice &&
      !game.revealing &&
      (game.extraThrowPending ||
        (game.state.phase.kind === 'awaiting-throw' && (game.lastThrow?.throwAgain ?? false))),
  );

  const message = $derived.by(() => {
    if (game.revealing) return '';
    if (game.notice) return game.notice.text;
    const st = game.state;
    // The Waters panel is anchored on the square and says this itself; repeating
    // it down here was the same sentence twice on one screen.
    if (st.phase.kind === 'house-27-choice') return '';
    if (game.backwardTurn) {
      return game.lastThrow?.throwAgain
        ? 'No token can move forward. Move one backward; you lose the extra throw.'
        : 'No token can move forward. Move one backward instead.';
    }
    if (
      st.phase.kind === 'awaiting-move' &&
      st.turn === 'light' &&
      !st.lightFirstMoveDone &&
      st.squares[9] === 'light'
    ) {
      return "Light's first move must be the token on square 9.";
    }
    // Last, so any live instruction outranks it: the board never states the
    // goal, so the first screen of a new game does.
    if (game.showOpening) {
      return 'Throw the sticks, then move a token. First side to get all five off the board wins.';
    }
    return '';
  });

  const who = $derived(game.displayTurn === 'light' ? 'Light' : 'Dark');

  /** The whole HUD as one sentence. The turn glyph, the numeral and the notice
   *  are three views of one state; announcing them from three live regions
   *  reads it out three times, so they stay silent and this speaks instead. */
  const spoken = $derived.by(() => {
    const parts = [`${who} to play`];
    if (shownValue !== null) parts.push(`Threw a ${shownValue}`);
    if (throwAgain) parts.push('Extra throw earned');
    if (message) parts.push(message);
    // Only the sighted player gets this from the panel pointing at square 27.
    if (game.state.phase.kind === 'house-27-choice') {
      parts.push('A token is stuck in the House of Waters');
    }
    // Notices arrive already punctuated; joining them raw doubled the stop.
    return parts.map((part) => part.replace(/\.$/, '')).join('. ') + '.';
  });

  const canThrow = $derived(
    game.state.phase.kind === 'awaiting-throw' && !game.notice && !game.revealing,
  );
  /* The throw is committed before it is revealed, so the button stays rendered
     (disabled) for the length of the tumble rather than blinking out the
     instant the phase changes under it. */
  const showThrow = $derived(
    game.state.phase.kind === 'awaiting-throw' || game.notice !== null || game.revealing,
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

<!-- Three fixed slots. The throw button comes and goes twice a turn, and the
     numeral appears and vanishes; on a centred flex row that shunted the whole
     HUD sideways by 66px each time. Anchoring the outer slots to the rail's
     edges lets the middle change size without moving anything. -->
<div class="hud">
  <p class="sr-only" aria-live="polite">{spoken}</p>

  <div class="turn" bind:this={indicator}>
    <span class="glyph"><TokenMarker player={game.displayTurn} /></span>
    <span class="who">{who}</span>
  </div>

  <!-- the stage sticks are the record of the throw; here only the fact remains -->
  <div class="reading" aria-hidden="true">
    <div class="result">
      {#if shownValue !== null}
        <span class="numeral">{shownValue}</span>
        {#if throwAgain}
          <!-- A fact about the throw, not an instruction: the extra throw is
               owed but the move comes first, so an imperative sent players
               hunting for a throw button that was not there yet. -->
          <span class="again">extra throw</span>
        {/if}
      {/if}
    </div>
    <p class="msg">{message}</p>
  </div>

  <div class="action">
    {#if showThrow}
      <button class="throw" onclick={() => game.throwSticks()} disabled={!canThrow}>
        Throw sticks
      </button>
    {/if}
  </div>
</div>

<style>
  .hud {
    /* Narrower than the board on purpose. Spanning the full box scattered the
       three slots to opposite corners on a phone, where the rail runs the long
       axis; this keeps them one readable cluster at every size. */
    width: min(100%, 34rem);
    margin-inline: auto;
    display: grid;
    grid-template-columns: 1fr minmax(0, auto) 1fr;
    align-items: center;
    gap: 12px;
    padding: 6px 18px;
    /* Reserves the tallest reading (numeral over a two-line notice) so the
       board above never has to move to make room. */
    min-height: 76px;
  }

  .turn {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-self: start;
  }

  .who {
    font-weight: 700;
    font-size: var(--text-sm);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .reading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .action {
    justify-self: end;
  }

  .glyph {
    display: flex;
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
      color: var(--faience-deep);
    }
  }

  .result {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
  }

  .numeral {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    line-height: 1;
    color: var(--ebony);
    min-width: 1.1em;
    text-align: center;
  }

  /* The one place the accent carries text, and it sits on the pale table:
     the deep step reads at 4.7:1 where the base faience managed 2.0:1. */
  .again {
    font-size: var(--text-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--faience-deep);
  }

  /* No reserved height here: the rail's min-height already holds the room, and
     reserving it twice pushed the numeral off the turn indicator's centre line. */
  .msg {
    margin: 0;
    max-width: 46ch;
    font-size: var(--text-sm);
    text-wrap: balance;
    text-align: center;
  }

  .throw {
    min-height: 44px;
    padding: 10px 26px;
    font-weight: 700;
    white-space: nowrap;
    background: transparent;
    border: 1.5px solid var(--ebony);
    border-radius: 999px;
    cursor: pointer;
    transition:
      background-color var(--duration-ui) var(--ease-out-expo),
      opacity var(--duration-ui) var(--ease-out-expo);
  }
  .throw:hover:enabled {
    background: var(--ivory);
  }
  .throw:active:enabled {
    background: var(--faience);
    border-color: var(--faience-deep);
  }
  .throw:disabled {
    opacity: 0.45;
    cursor: default;
  }

  /* Short axis: the rail is competing with the board for the scarce dimension,
     so it gives some back. */
  @media (orientation: portrait) and (max-width: 430px), (max-height: 430px) {
    .hud {
      min-height: 62px;
      gap: 8px;
    }

    .numeral {
      font-size: var(--text-lg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .turn:global(.nudged) .glyph,
    .turn:global(.nudged) .who {
      animation: none;
    }
  }
</style>
