import Phaser from 'phaser';
import type { ChunkTypeDef } from '@/data/chunkTypes';
import { EventBus, GameEvents } from './EventBus';
import {
  POWERUP_EFFECT_DURATION_MS,
  POWERUP_MAX_INTERVAL_MS,
  POWERUP_MIN_INTERVAL_MS,
} from '@/config/gameplayConfig';

const POWERUP_HEIGHT_ABOVE_GROUND = 200;
const DESPAWN_MARGIN = 400;

// A generic, reusable power-up: pickups spawn on a randomized ~60-90s timer
// (per the GDD) and grant temporary invincibility, the one power-up effect
// the GDD's collision rules define ("protected by an active power-up").
// World-specific power-ups (Verified Badge, Perfect Filter, etc.) can build
// on this same pickup/timer/expiry framework in later per-world tasks.
export class PowerupManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private textureKey: string;
  private pickups: Phaser.Physics.Arcade.Image[] = [];
  // Inactive Images kept around instead of destroyed, so a later spawn can reuse the GameObject +
  // Arcade Body instead of paying allocation/GC cost.
  private pool: Phaser.Physics.Arcade.Image[] = [];
  private msUntilNextSpawn: number;
  private effectRemainingMs = 0;
  private totalSpawned = 0;
  private totalCollected = 0;

  constructor(scene: Phaser.Scene, groundY: number, scrollSpeed: number, textureKey = 'powerup') {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
    this.textureKey = textureKey;
    this.msUntilNextSpawn = this.randomInterval();
  }

  get stats(): { active: number; totalSpawned: number; totalCollected: number } {
    return { active: this.pickups.length, totalSpawned: this.totalSpawned, totalCollected: this.totalCollected };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.pickups;
  }

  get isEffectActive(): boolean {
    return this.effectRemainingMs > 0;
  }

  get effectRemainingSeconds(): number {
    return Math.ceil(this.effectRemainingMs / 1000);
  }

  private randomInterval(): number {
    return POWERUP_MIN_INTERVAL_MS + Math.random() * (POWERUP_MAX_INTERVAL_MS - POWERUP_MIN_INTERVAL_MS);
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
    for (const pickup of this.pickups) {
      pickup.setVelocityX(-speed);
    }
  }

  // Hooks into ChunkManager's spawn callback like Obstacle/CoinManager, but
  // only actually places a pickup once the randomized interval has elapsed -
  // power-ups are far rarer than per-chunk obstacles/coins.
  spawnForChunk(chunkX: number, chunkWidth: number, _chunkType: ChunkTypeDef): void {
    if (this.msUntilNextSpawn > 0) {
      return;
    }

    const x = chunkX + chunkWidth / 2;
    const y = this.groundY - POWERUP_HEIGHT_ABOVE_GROUND;
    const pickup = this.pool.pop() ?? this.scene.physics.add.image(x, y, this.textureKey);
    pickup.setPosition(x, y);
    pickup.setActive(true);
    pickup.setVisible(true);
    const body = pickup.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);
    pickup.setVelocityX(-this.scrollSpeed);

    this.pickups.push(pickup);
    this.totalSpawned += 1;
    this.msUntilNextSpawn = this.randomInterval();
  }

  private recycle(pickup: Phaser.Physics.Arcade.Image): void {
    pickup.setActive(false);
    pickup.setVisible(false);
    pickup.setVelocity(0, 0);
    (pickup.body as Phaser.Physics.Arcade.Body).enable = false;
    this.pool.push(pickup);
  }

  collect(pickup: Phaser.Physics.Arcade.Image): void {
    const index = this.pickups.indexOf(pickup);
    if (index === -1) {
      return;
    }
    this.pickups.splice(index, 1);
    this.recycle(pickup);
    this.totalCollected += 1;
    this.effectRemainingMs = POWERUP_EFFECT_DURATION_MS;
    EventBus.emit(GameEvents.POWERUP_PICKED);
  }

  update(delta: number): void {
    if (this.msUntilNextSpawn > 0) {
      this.msUntilNextSpawn -= delta;
    }

    if (this.effectRemainingMs > 0) {
      this.effectRemainingMs = Math.max(0, this.effectRemainingMs - delta);
      if (this.effectRemainingMs === 0) {
        EventBus.emit(GameEvents.POWERUP_EXPIRED);
      }
    }

    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.pickups.length && this.pickups[0].x < despawnX) {
      const pickup = this.pickups.shift();
      if (pickup) {
        this.recycle(pickup);
      }
    }
  }

  freeze(): void {
    for (const pickup of this.pickups) {
      pickup.setVelocityX(0);
    }
  }
}
