export interface WorldDef {
  key: string;
  name: string;
  color: number;
  unlocked: boolean;
}

export const Worlds: WorldDef[] = [
  { key: 'legbook', name: 'Legbook', color: 0x3b5998, unlocked: true },
  { key: 'slowgram', name: 'Slowgram', color: 0xc13584, unlocked: false },
  { key: 'chatzap', name: 'ChatZap', color: 0x25d366, unlocked: false },
  { key: 'metube', name: 'MeTube', color: 0xff0033, unlocked: false },
  { key: 'wrongturn', name: 'WrongTurn', color: 0x4285f4, unlocked: false },
];
