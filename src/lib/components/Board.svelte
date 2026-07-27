<script lang="ts">
  import { BOARD, FRAME, SQUARE, squarePos, trayPos } from '../geometry';
  import { HOUSE_LORE, LORE_HOUSES } from '../houseLore';
  import { game } from '../store.svelte';

  /** A touch tap has no hover; hold the tooltip long enough to be read. */
  const TOUCH_LINGER_MS = 3500;

  const bx = BOARD.x;
  const by = BOARD.y;
  const bw = BOARD.cols * SQUARE;
  const bh = BOARD.rows * SQUARE;

  const p15 = squarePos(15);
  const p26 = squarePos(26);
  const p27 = squarePos(27);
  const p28 = squarePos(28);
  const p29 = squarePos(29);
  const p30 = squarePos(30);

  /* The path turns down at 10→11 and 20→21; a quiet chevron on each shared edge. */
  const turn1 = { x: squarePos(10).x, y: by + SQUARE };
  const turn2 = { x: squarePos(20).x, y: by + 2 * SQUARE };

  const traySlots = ([0, 1, 2, 3, 4] as const).flatMap((slot) =>
    (['light', 'dark'] as const).map((player) => trayPos(player, slot)),
  );
</script>

<g class="board">
  <rect class="box" x={bx - FRAME} y={by - FRAME} width={bw + 2 * FRAME} height={bh + 2 * FRAME} rx="1.8" />

  <!-- grid reads as inlaid into the wood; the carve filter adds hand irregularity -->
  <g class="inlay" filter="url(#carve)">
    {#each { length: 11 } as _, i}
      <line x1={bx + i * SQUARE} y1={by} x2={bx + i * SQUARE} y2={by + bh} />
    {/each}
    {#each { length: 4 } as _, r}
      <line x1={bx} y1={by + r * SQUARE} x2={bx + bw} y2={by + r * SQUARE} />
    {/each}
  </g>

  <!-- house marks: shape-distinct carved glyphs, legible in grayscale -->
  <g class="marks" filter="url(#carve)">
    <!-- 15, House of Second Life: the life mark -->
    <g transform="translate({p15.x} {p15.y})">
      <circle cy="-1.6" r="1.8" />
      <line y1="0.4" y2="4" />
      <line x1="-1.9" y1="1.5" x2="1.9" y2="1.5" />
    </g>
    <!-- 26, House of Beauty: a cut diamond -->
    <g transform="translate({p26.x} {p26.y})">
      <path d="M 0 -3.4 L 2.7 0 L 0 3.4 L -2.7 0 Z" />
    </g>
    <!-- 27, House of Waters: two water zigzags -->
    <g transform="translate({p27.x} {p27.y})">
      <path d="M -3.5 -1.4 l 1.75 -1.5 l 1.75 1.5 l 1.75 -1.5 l 1.75 1.5" />
      <path d="M -3.5 1.8 l 1.75 -1.5 l 1.75 1.5 l 1.75 -1.5 l 1.75 1.5" />
    </g>
    <!-- 28, House of Three Judges: three strokes -->
    <g transform="translate({p28.x} {p28.y})">
      <line x1="-2.2" y1="-2.6" x2="-2.2" y2="2.6" />
      <line y1="-2.6" y2="2.6" />
      <line x1="2.2" y1="-2.6" x2="2.2" y2="2.6" />
    </g>
    <!-- 29, House of Two Judges: two strokes -->
    <g transform="translate({p29.x} {p29.y})">
      <line x1="-1.3" y1="-2.6" x2="-1.3" y2="2.6" />
      <line x1="1.3" y1="-2.6" x2="1.3" y2="2.6" />
    </g>
    <!-- 30, House of Horus: the sun disc -->
    <g transform="translate({p30.x} {p30.y})">
      <circle r="2.6" />
      <circle class="dot" r="0.7" />
    </g>
  </g>

  <!-- hover/focus targets over the marked houses; lore renders in HouseLore -->
  <g class="hotspots">
    {#each LORE_HOUSES as house}
      {@const p = squarePos(house)}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <rect
        class="hotspot"
        x={p.x - SQUARE / 2}
        y={p.y - SQUARE / 2}
        width={SQUARE}
        height={SQUARE}
        rx="1"
        role="img"
        tabindex="0"
        aria-label="{HOUSE_LORE[house].name}. {HOUSE_LORE[house].text}"
        onpointerenter={() => game.showHouseInfo(house)}
        onpointerleave={(e) =>
          game.hideHouseInfo(house, e.pointerType === 'touch' ? TOUCH_LINGER_MS : 0)}
        onfocus={() => game.showHouseInfo(house)}
        onblur={() => game.hideHouseInfo(house)}
      />
    {/each}
  </g>

  <!-- the reverse-S turns, hinted where the path bends down -->
  <g class="chevrons">
    <path d="M -1.6 -0.9 L 0 0.9 L 1.6 -0.9" transform="translate({turn1.x} {turn1.y})" />
    <path d="M -1.6 -0.9 L 0 0.9 L 1.6 -0.9" transform="translate({turn2.x} {turn2.y})" />
  </g>

  <!-- borne-off trays: shallow resting spots on the table -->
  <g class="tray">
    {#each traySlots as slot}
      <circle cx={slot.x} cy={slot.y} r="4.4" />
    {/each}
  </g>
</g>

<style>
  .box {
    fill: var(--carved-wood);
    stroke: var(--ebony);
    stroke-opacity: 0.35;
    stroke-width: 0.5;
  }

  .inlay line {
    stroke: var(--ivory);
    stroke-width: 0.4;
    stroke-linecap: round;
    opacity: 0.55;
  }

  .marks {
    stroke: var(--ivory);
    stroke-width: 0.65;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0.8;
  }

  .marks .dot {
    fill: var(--ivory);
    stroke: none;
  }

  .hotspot {
    fill: transparent;
    stroke: none;
    cursor: help;
    outline: none;
  }

  .hotspot:focus-visible {
    stroke: var(--faience);
    stroke-width: 0.7;
  }

  .chevrons path {
    stroke: var(--ivory);
    stroke-width: 0.55;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0.5;
  }

  .tray circle {
    fill: none;
    stroke: var(--ebony);
    stroke-width: 0.4;
    opacity: 0.25;
  }
</style>
