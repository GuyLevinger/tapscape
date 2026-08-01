export type ChunkDifficulty = 1 | 2 | 3;

export interface ChunkTypeDef {
  id: string;
  difficulty: ChunkDifficulty;
  color: number;
  allowedNext: string[];
}

// Adjacency rules keep difficulty transitions smooth: no jumping straight from
// easy to hard (or back), matching the GDD's "procedural validation prevents
// impossible layouts" guidance. Real obstacle placement (Task 12) will layer
// its own fairness rules on top of whatever chunk type is chosen here.
export const ChunkTypes: Record<string, ChunkTypeDef> = {
  easy: { id: 'easy', difficulty: 1, color: 0x22c55e, allowedNext: ['easy', 'medium'] },
  medium: { id: 'medium', difficulty: 2, color: 0xeab308, allowedNext: ['easy', 'medium', 'hard'] },
  hard: { id: 'hard', difficulty: 3, color: 0xef4444, allowedNext: ['medium', 'hard'] },
};
