// In-memory best-score tracking, scoped to the current browser session only.
// Task 17 (Save manager) replaces/extends this with real LocalStorage persistence.
const bestScores = new Map<string, number>();

export function recordScore(worldKey: string, score: number): { best: number; isNewBest: boolean } {
  const previousBest = bestScores.get(worldKey) ?? 0;
  const isNewBest = score > previousBest;
  const best = isNewBest ? score : previousBest;
  bestScores.set(worldKey, best);
  return { best, isNewBest };
}
