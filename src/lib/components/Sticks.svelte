<script lang="ts">
  import { game } from '../store.svelte';
  import { STICK, stickPos } from '../geometry';
  import { TUMBLE_MS, TUMBLE_STAGGER_MS } from '../motion';

  /* The sticks are theatre; the HUD numeral is the fact (and the accessible
     record), so the whole group stays aria-hidden. */

  const anims: SVGGElement[] = [];
  const lightFaces: SVGGElement[] = [];
  let running: Animation[] = [];

  /** Offsets where scaleX pinches to nothing — the face swaps at each pinch. */
  const PINCHES = [0.22, 0.5, 0.78];

  /** Rise, flip, settle: three edge-on pinches while airborne, then a soft
     landing overshoot. translateY is in stage units (px = user units here). */
  const TUMBLE_FRAMES: Keyframe[] = [
    { transform: 'translateY(0px) scaleX(1)', offset: 0 },
    { transform: 'translateY(-5.5px) scaleX(0.12)', offset: PINCHES[0] },
    { transform: 'translateY(-6.5px) scaleX(1)', offset: 0.36 },
    { transform: 'translateY(-4.5px) scaleX(0.12)', offset: PINCHES[1] },
    { transform: 'translateY(-2.5px) scaleX(1)', offset: 0.64 },
    { transform: 'translateY(-1px) scaleX(0.12)', offset: PINCHES[2] },
    { transform: 'translateY(0px) scaleX(1.08)', offset: 0.9 },
    { transform: 'translateY(0px) scaleX(1)', offset: 1 },
  ];

  /** Light-face opacity toggling at each pinch; the toggle parity guarantees
     the animation ends on the stick's true face. */
  function faceFrames(finalLight: boolean): Keyframe[] {
    let showing = PINCHES.length % 2 === 1 ? !finalLight : finalLight;
    const frames: Keyframe[] = [{ opacity: showing ? 1 : 0, offset: 0 }];
    for (const at of PINCHES) {
      frames.push({ opacity: showing ? 1 : 0, offset: at });
      showing = !showing;
      frames.push({ opacity: showing ? 1 : 0, offset: at });
    }
    frames.push({ opacity: showing ? 1 : 0, offset: 1 });
    return frames;
  }

  function cancelAll() {
    for (const a of running) a.cancel();
    running = [];
  }

  /* A new throw while revealing starts the tumble; under reduced motion
     `revealing` is never set, so the sticks simply appear settled. */
  $effect(() => {
    const faces = game.lastFaces;
    if (!faces || !game.revealing) return;
    cancelAll();
    let lastTumble: Animation | null = null;
    faces.forEach((light, i) => {
      const el = anims[i];
      const face = lightFaces[i];
      if (!el || !face) return;
      const timing = { duration: TUMBLE_MS, delay: i * TUMBLE_STAGGER_MS, fill: 'both' as const };
      lastTumble = el.animate(TUMBLE_FRAMES, { ...timing, easing: 'ease-in-out' });
      running.push(lastTumble, face.animate(faceFrames(light), timing));
    });
    if (!lastTumble) return;
    (lastTumble as Animation).onfinish = () => {
      // The static markup already shows the true faces; dropping the
      // animations hands rendering back to it before input reopens.
      cancelAll();
      game.revealDone();
    };
  });
</script>

{#if game.lastFaces}
  <g class="sticks" aria-hidden="true">
    {#each game.lastFaces as light, i}
      {@const p = stickPos(i)}
      <g transform="translate({p.x} {p.y})">
        <g class="anim" bind:this={anims[i]}>
          <rect
            class="dark-face"
            x={-STICK.w / 2}
            y={-STICK.h / 2}
            width={STICK.w}
            height={STICK.h}
            rx={STICK.w / 2}
          />
          <!-- light face: ivory AND a carved groove, so faces are never color-alone -->
          <g class="light-face" class:up={light} bind:this={lightFaces[i]}>
            <rect
              x={-STICK.w / 2}
              y={-STICK.h / 2}
              width={STICK.w}
              height={STICK.h}
              rx={STICK.w / 2}
            />
            <line y1={-STICK.h / 2 + 1.4} y2={STICK.h / 2 - 1.4} />
          </g>
        </g>
      </g>
    {/each}
  </g>
{/if}

<style>
  /* scaleX must pinch around each stick's own center, not the stage origin */
  .anim {
    transform-box: fill-box;
    transform-origin: center;
  }

  .dark-face {
    fill: var(--ebony);
    stroke: var(--ebony);
    stroke-width: 0.3;
  }

  .light-face {
    opacity: 0;
  }
  .light-face.up {
    opacity: 1;
  }
  /* ivory rests on the pale table, so its outline carries the legibility */
  .light-face rect {
    fill: var(--ivory);
    stroke: var(--ebony);
    stroke-width: 0.4;
    stroke-opacity: 0.75;
  }
  .light-face line {
    stroke: var(--ebony);
    stroke-width: 0.4;
    stroke-linecap: round;
    opacity: 0.55;
  }
</style>
