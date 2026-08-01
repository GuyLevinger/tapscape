import { ChunkTypes, type ChunkTypeDef } from '@/data/chunkTypes';

export class ChunkSelector {
  private lastType: ChunkTypeDef = ChunkTypes.easy;
  private history: string[] = [];

  next(): ChunkTypeDef {
    const candidates = this.lastType.allowedNext.map((id) => ChunkTypes[id]);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
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
