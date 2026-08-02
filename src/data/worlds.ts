export interface WorldDef {
  key: string;
  name: string;
  color: number;
  /** Coins required to unlock via HomeScene; 0 for the free starting world. */
  price: number;
}

// The GDD specifies "players begin with one world, additional worlds are purchased with coins"
// but names no actual prices - these are a placeholder progression curve (Task 27 used the same
// kind of placeholder pricing for cosmetics).
export const Worlds: WorldDef[] = [
  { key: 'legbook', name: 'Legbook', color: 0x3b5998, price: 0 },
  { key: 'slowgram', name: 'Slowgram', color: 0xc13584, price: 200 },
  { key: 'chatzap', name: 'ChatZap', color: 0x25d366, price: 300 },
  { key: 'metube', name: 'MeTube', color: 0xff0033, price: 400 },
  { key: 'wrongturn', name: 'WrongTurn', color: 0x4285f4, price: 500 },
];
