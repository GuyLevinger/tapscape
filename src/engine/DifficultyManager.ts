import { SCROLL_SPEED } from '@/config/gameplayConfig';

// Per the GDD's difficulty scaling section: speed and chunk difficulty both
// ramp gradually and continuously through a run, and the transition should
// always feel smooth - so both are simple time-based curves rather than
// step changes, and both cap out (an "endless mode" ceiling) instead of
// growing unbounded.
const SPEED_RAMP_DURATION_MS = 90_000;
const MAX_SPEED_MULTIPLIER = 1.5;
const CHUNK_BIAS_RAMP_DURATION_MS = 60_000;

export class DifficultyManager {
  private elapsedMs = 0;
  private baseScrollSpeed: number;

  constructor(baseScrollSpeed: number = SCROLL_SPEED) {
    this.baseScrollSpeed = baseScrollSpeed;
  }

  update(delta: number): void {
    this.elapsedMs += delta;
  }

  get scrollSpeed(): number {
    const t = Math.min(this.elapsedMs / SPEED_RAMP_DURATION_MS, 1);
    return this.baseScrollSpeed * (1 + t * (MAX_SPEED_MULTIPLIER - 1));
  }

  // 0 (run start) to 1 (full ramp) - fed into ChunkSelector to bias chunk
  // choice toward higher-difficulty chunk types as a run goes on, on top of
  // the adjacency rules ChunkSelector already enforces.
  get chunkDifficultyBias(): number {
    return Math.min(this.elapsedMs / CHUNK_BIAS_RAMP_DURATION_MS, 1);
  }
}
