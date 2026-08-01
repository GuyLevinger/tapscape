import Phaser from 'phaser';
import type { ChunkTypeDef } from '@/data/chunkTypes';
import { EventBus, GameEvents } from './EventBus';

const COINS_PER_CHUNK = 3;
const COIN_HEIGHT_ABOVE_GROUND = 140;
const COIN_SPACING = 60;
const DESPAWN_MARGIN = 400;

export class CoinManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private coins: Phaser.Physics.Arcade.Image[] = [];
  private totalSpawned = 0;
  private totalCollected = 0;

  constructor(scene: Phaser.Scene, groundY: number, scrollSpeed: number) {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
  }

  get stats(): { active: number; totalSpawned: number; totalCollected: number } {
    return { active: this.coins.length, totalSpawned: this.totalSpawned, totalCollected: this.totalCollected };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.coins;
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
    for (const coin of this.coins) {
      coin.setVelocityX(-speed);
    }
  }

  // Chunk type is currently unused (a flat line-of-3 formation, per the GDD's
  // recognizable formation guidance) but kept in the signature to mirror
  // ObstacleManager's shape, since later formations will vary with difficulty.
  spawnForChunk(chunkX: number, chunkWidth: number, _chunkType: ChunkTypeDef): void {
    const centerX = chunkX + chunkWidth / 2;
    const startX = centerX - ((COINS_PER_CHUNK - 1) * COIN_SPACING) / 2;
    for (let i = 0; i < COINS_PER_CHUNK; i++) {
      this.spawnCoin(startX + i * COIN_SPACING);
    }
  }

  private spawnCoin(x: number): void {
    const coin = this.scene.physics.add.image(x, this.groundY - COIN_HEIGHT_ABOVE_GROUND, 'coin');
    const body = coin.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    coin.setVelocityX(-this.scrollSpeed);

    this.coins.push(coin);
    this.totalSpawned += 1;
  }

  collect(coin: Phaser.Physics.Arcade.Image): void {
    const index = this.coins.indexOf(coin);
    if (index === -1) {
      return;
    }
    this.coins.splice(index, 1);
    coin.destroy();
    this.totalCollected += 1;
    EventBus.emit(GameEvents.COIN_COLLECTED);
  }

  update(): void {
    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.coins.length && this.coins[0].x < despawnX) {
      const coin = this.coins.shift();
      coin?.destroy();
    }
  }

  freeze(): void {
    for (const coin of this.coins) {
      coin.setVelocityX(0);
    }
  }
}
