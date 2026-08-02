import { SCROLL_SPEED } from '@/config/gameplayConfig';

// Per the GDD's difficulty scaling section: speed and chunk difficulty both
// ramp gradually and continuously through a run, and the transition should
// always feel smooth - so both are simple time-based curves rather than
// step changes, and both cap out (an "endless mode" ceiling) instead of
// growing unbounded.
const SPEED_RAMP_DURATION_MS = 90_000;
const MAX_SPEED_MULTIPLIER = 1.5;
const CHUNK_BIAS_RAMP_DURATION_MS = 60_000;

// Task 39's "Low Battery Zone" - temporarily slows the whole world (everything reads scrollSpeed
// from here) rather than the character specifically, so the effect reads as "everything is
// sluggish" and needs no special-casing in CharacterController/ObstacleManager/etc. A plain boolean
// set externally (not an EventBus subscription here, since this class has no scene reference or
// shutdown hook of its own) - WorldScene owns translating DebuffZoneManager's
// BATTERY_LOW_STARTED/ENDED events into setSlowed(true/false) calls, so the effect's actual
// duration lives in exactly one place (DebuffZoneManager's timer) instead of being duplicated here.
const BATTERY_SLOW_FACTOR = 0.5;

export class DifficultyManager {
  private elapsedMs = 0;
  private baseScrollSpeed: number;
  private slowed = false;

  constructor(baseScrollSpeed: number = SCROLL_SPEED) {
    this.baseScrollSpeed = baseScrollSpeed;
  }

  setSlowed(slowed: boolean): void {
    this.slowed = slowed;
  }

  update(delta: number): void {
    this.elapsedMs += delta;
  }

  get scrollSpeed(): number {
    const t = Math.min(this.elapsedMs / SPEED_RAMP_DURATION_MS, 1);
    const base = this.baseScrollSpeed * (1 + t * (MAX_SPEED_MULTIPLIER - 1));
    return this.slowed ? base * BATTERY_SLOW_FACTOR : base;
  }

  // 0 (run start) to 1 (full ramp) - fed into ChunkSelector to bias chunk
  // choice toward higher-difficulty chunk types as a run goes on, on top of
  // the adjacency rules ChunkSelector already enforces.
  get chunkDifficultyBias(): number {
    return Math.min(this.elapsedMs / CHUNK_BIAS_RAMP_DURATION_MS, 1);
  }
}
