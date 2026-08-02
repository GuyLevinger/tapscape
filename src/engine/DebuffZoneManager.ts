import Phaser from 'phaser';
import type { ChunkTypeDef } from '@/data/chunkTypes';
import { EventBus, GameEvents } from './EventBus';

const DEBUFF_MIN_INTERVAL_MS = 22_000;
const DEBUFF_MAX_INTERVAL_MS = 35_000;
const EFFECT_DURATION_MS = 5_000;
const DESPAWN_MARGIN = 400;
const HITBOX_WIDTH_RATIO = 0.65;
const HITBOX_HEIGHT_RATIO = 0.75;

// Three themed zones (Task 39's "Glitch Zone", "Low Battery Zone", "WiFi Dead Zone"), each a
// single non-lethal pickup - touching one triggers a temporary debuff instead of ending the run.
// Modeled closely on PowerupManager (spawn timer, pickup/collect, timed effect) since a debuff
// pickup is structurally identical to a power-up, just with a negative effect and its own texture.
export type DebuffType = 'glitch' | 'battery' | 'wifi';

const DEBUFF_TEXTURES: Record<DebuffType, string> = { glitch: 'glitch', battery: 'battery', wifi: 'wifi_off' };
const DEBUFF_START_EVENTS: Record<DebuffType, string> = {
  glitch: GameEvents.GLITCH_STARTED,
  battery: GameEvents.BATTERY_LOW_STARTED,
  wifi: GameEvents.WIFI_DEAD_STARTED,
};
const DEBUFF_END_EVENTS: Record<DebuffType, string> = {
  glitch: GameEvents.GLITCH_ENDED,
  battery: GameEvents.BATTERY_LOW_ENDED,
  wifi: GameEvents.WIFI_DEAD_ENDED,
};
const DEBUFF_TYPES: DebuffType[] = ['glitch', 'battery', 'wifi'];

export class DebuffZoneManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private zones: Phaser.Physics.Arcade.Image[] = [];
  private pool: Phaser.Physics.Arcade.Image[] = [];
  private msUntilNextSpawn: number;
  private totalSpawned = 0;
  private totalCollected = 0;

  constructor(scene: Phaser.Scene, groundY: number, scrollSpeed: number) {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
    this.msUntilNextSpawn = this.randomInterval();
  }

  get stats(): { active: number; totalSpawned: number; totalCollected: number } {
    return { active: this.zones.length, totalSpawned: this.totalSpawned, totalCollected: this.totalCollected };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.zones;
  }

  private randomInterval(): number {
    return DEBUFF_MIN_INTERVAL_MS + Math.random() * (DEBUFF_MAX_INTERVAL_MS - DEBUFF_MIN_INTERVAL_MS);
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
    for (const zone of this.zones) {
      zone.setVelocityX(-speed);
    }
  }

  // Hooks into ChunkManager's spawn callback like Coin/PowerupManager, but only actually places a
  // zone once the randomized interval has elapsed - these are rarer than per-chunk pickups.
  spawnForChunk(chunkX: number, chunkWidth: number, _chunkType: ChunkTypeDef): void {
    if (this.msUntilNextSpawn > 0) {
      return;
    }

    const type = DEBUFF_TYPES[Math.floor(Math.random() * DEBUFF_TYPES.length)];
    const x = chunkX + chunkWidth / 2;
    const zone = this.pool.pop() ?? this.scene.physics.add.image(x, this.groundY, DEBUFF_TEXTURES[type]);
    zone.setPosition(x, this.groundY);
    zone.setTexture(DEBUFF_TEXTURES[type]);
    zone.setOrigin(0.5, 1);
    zone.setActive(true);
    zone.setVisible(true);
    zone.setData('debuffType', type);
    const body = zone.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);

    // Same ground-anchored hitbox-shrink forgiveness as a plain ground obstacle - a jump clears it
    // exactly the same way, the only difference is what touching it does.
    const fullWidth = zone.width;
    const fullHeight = zone.height;
    const hitboxWidth = fullWidth * HITBOX_WIDTH_RATIO;
    const hitboxHeight = fullHeight * HITBOX_HEIGHT_RATIO;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((fullWidth - hitboxWidth) / 2, fullHeight - hitboxHeight);

    zone.setVelocityX(-this.scrollSpeed);

    this.zones.push(zone);
    this.totalSpawned += 1;
    this.msUntilNextSpawn = this.randomInterval();
  }

  private recycle(zone: Phaser.Physics.Arcade.Image): void {
    zone.setActive(false);
    zone.setVisible(false);
    zone.setVelocity(0, 0);
    (zone.body as Phaser.Physics.Arcade.Body).enable = false;
    this.pool.push(zone);
  }

  collect(zone: Phaser.Physics.Arcade.Image): void {
    const index = this.zones.indexOf(zone);
    if (index === -1) {
      return;
    }
    const type = zone.getData('debuffType') as DebuffType;
    this.zones.splice(index, 1);
    this.recycle(zone);
    this.totalCollected += 1;

    EventBus.emit(DEBUFF_START_EVENTS[type]);
    this.scene.time.delayedCall(EFFECT_DURATION_MS, () => {
      EventBus.emit(DEBUFF_END_EVENTS[type]);
    });
  }

  update(delta: number): void {
    if (this.msUntilNextSpawn > 0) {
      this.msUntilNextSpawn -= delta;
    }

    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.zones.length && this.zones[0].x < despawnX) {
      const zone = this.zones.shift();
      if (zone) {
        this.recycle(zone);
      }
    }
  }

  freeze(): void {
    for (const zone of this.zones) {
      zone.setVelocityX(0);
    }
  }
}
