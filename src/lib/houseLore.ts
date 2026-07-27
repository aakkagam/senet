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
    text: 'A token that lands here is reborn: it goes back to square 1 and starts over. Tokens returned from the House of Waters land here too.',
  },
  26: {
    name: 'House of Beauty',
    text: 'Every token must land here on an exact throw before it can go further. Until it does, any move that would carry it past this square is blocked.',
  },
  27: {
    name: 'House of Waters',
    text: 'Landing here costs you any extra throw and traps the token. On your next turn, either return it to the House of Second Life and end your turn, or throw for a 4: that takes it off the board and earns another turn, while anything else leaves it stuck. From here on, two of your tokens side by side no longer protect each other.',
  },
  28: {
    name: 'House of Three Judges',
    text: 'A token here leaves the board only on an exact throw of 3. Any other throw must move a different token.',
  },
  29: {
    name: 'House of Two Judges',
    text: 'A token here leaves the board only on an exact throw of 2. Any other throw must move a different token.',
  },
  30: {
    name: 'House of Horus',
    text: 'The last square. A token here leaves the board on any throw, and the first player to get all five off wins.',
  },
};

/** Path squares that carry a mark and lore, in path order. */
export const LORE_HOUSES = [15, 26, 27, 28, 29, 30] as const;
