import { ChunkTypes, type ChunkTypeDef } from '@/data/chunkTypes';

export class ChunkSelector {
  private lastType: ChunkTypeDef = ChunkTypes.easy;
  private history: string[] = [];

  // `bias` (0-1) skews the pick toward higher-difficulty candidates as a run
  // progresses - at 0 every allowed candidate is equally likely (today's
  // behavior), at 1 harder candidates are weighted well above easier ones.
  next(bias = 0): ChunkTypeDef {
    const candidates = this.lastType.allowedNext.map((id) => ChunkTypes[id]);
    const weights = candidates.map((c) => 1 + bias * (c.difficulty - 1) * 3);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let roll = Math.random() * totalWeight;
    let chosen = candidates[candidates.length - 1];
    for (let i = 0; i < candidates.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        chosen = candidates[i];
        break;
      }
    }

    this.lastType = chosen;
    this.history.push(chosen.id);
    return chosen;
  }

  isValidSequence(): boolean {
    for (let i = 1; i < this.history.length; i++) {
      const prev = ChunkTypes[this.history[i - 1]];
      const curr = this.history[i];
      if (!prev.allowedNext.includes(curr)) {
        return false;
      }
    }
    return true;
  }

  getHistory(): readonly string[] {
    return this.history;
  }
}
