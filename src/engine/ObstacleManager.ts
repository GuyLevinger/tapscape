import Phaser from 'phaser';
import type { ChunkTypeDef } from '@/data/chunkTypes';

// Keeps obstacles off chunk edges (so they don't spawn flush against a
// neighboring chunk's obstacle) and far enough apart to always be avoidable
// by a jump or slide - a lightweight stand-in for full fairness validation,
// which Task 13's collision consequences and later polish will build on.
const EDGE_MARGIN = 100;
const MIN_GAP = 220;
const DESPAWN_MARGIN = 400;

export class ObstacleManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private obstacles: Phaser.Physics.Arcade.Image[] = [];
  private totalSpawned = 0;
  private totalRecycled = 0;

  constructor(scene: Phaser.Scene, groundY: number, scrollSpeed: number) {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
  }

  get stats(): { active: number; totalSpawned: number; totalRecycled: number } {
    return { active: this.obstacles.length, totalSpawned: this.totalSpawned, totalRecycled: this.totalRecycled };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.obstacles;
  }

  spawnForChunk(chunkX: number, chunkWidth: number, chunkType: ChunkTypeDef): void {
    const usableWidth = chunkWidth - EDGE_MARGIN * 2;
    if (usableWidth < 0) {
      return;
    }

    const maxByGap = Math.floor(usableWidth / MIN_GAP) + 1;
    const count = Math.min(chunkType.difficulty, maxByGap);

    for (let i = 0; i < count; i++) {
      const slot = count === 1 ? 0.5 : i / (count - 1);
      const x = chunkX + EDGE_MARGIN + slot * usableWidth;
      this.spawnObstacle(x);
    }
  }

  private spawnObstacle(x: number): void {
    const obstacle = this.scene.physics.add.image(x, this.groundY, 'obstacle');
    obstacle.setOrigin(0.5, 1);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    obstacle.setVelocityX(-this.scrollSpeed);

    this.obstacles.push(obstacle);
    this.totalSpawned += 1;
  }

  update(): void {
    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.obstacles.length && this.obstacles[0].x < despawnX) {
      const obstacle = this.obstacles.shift();
      obstacle?.destroy();
      this.totalRecycled += 1;
    }
  }
}
