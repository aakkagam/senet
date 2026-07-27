/** Hover lore for the six marked houses: the house name, the rule its carving
 *  stands for, and what that rule does to the flow of play. Surfaced by the
 *  Board hotspots on hover/focus; distinct from the one-shot landing notes. */

export interface HouseLoreEntry {
  name: string;
  text: string;
}

export const HOUSE_LORE: Record<number, HouseLoreEntry> = {
  15: {
    name: 'House of Second Life',
    text: 'A token that lands here is reborn: it returns to square 1 and starts the journey over. Tokens sent home from the House of Waters arrive here as well.',
  },
  26: {
    name: 'House of Beauty',
    text: 'Every token must land here on an exact throw before it can go further. Until it does, any move that would carry it past this square is illegal.',
  },
  27: {
    name: 'House of Waters',
    text: 'Landing here forfeits your extra throws and traps the token. On your next turn, either send it back to the House of Second Life and end your turn, or throw: a 4 bears it off and earns another turn, anything else leaves it stuck. Pairs give no protection from here to the end of the board.',
  },
  28: {
    name: 'House of Three Judges',
    text: 'A token here bears off only on an exact throw of 3. Any other throw must be spent elsewhere.',
  },
  29: {
    name: 'House of Two Judges',
    text: 'A token here bears off only on an exact throw of 2. Any other throw must be spent elsewhere.',
  },
  30: {
    name: 'House of Horus',
    text: 'The last square. A token here bears off on any throw, and the first player to bear off all five wins.',
  },
};

/** Path squares that carry a mark and lore, in path order. */
export const LORE_HOUSES = [15, 26, 27, 28, 29, 30] as const;
