import Phaser from 'phaser';
import type { ChunkTypeDef } from '@/data/chunkTypes';

// Keeps obstacles off chunk edges (so they don't spawn flush against a
// neighboring chunk's obstacle) and far enough apart to always be avoidable
// by a jump or slide - a lightweight stand-in for full fairness validation,
// which Task 13's collision consequences and later polish will build on.
const EDGE_MARGIN = 100;
const DESPAWN_MARGIN = 400;

// Minimum time a player must have to react to one obstacle before the next one arrives, so two
// obstacles can never end up too close to jump/slide through in sequence. Derived from
// CharacterController's jump arc (JUMP_VELOCITY -600 / gravity 1200 => 0.5s up + 0.5s down = 1.0s
// airtime before the player can jump again), plus a small safety margin. This is expressed as
// TIME rather than a fixed world-distance because DifficultyManager ramps scrollSpeed up over a
// run - a fixed-distance gap (the old approach) shrinks in real reaction time as speed increases,
// which is what let two obstacles end up unfairly close together later in a run.
const MIN_REACTION_TIME_S = 1.1;

// Same reasoning as CharacterController's hitbox shrink: a hit box matching the full obstacle
// texture registers a collision before the sprites visually touch. Trimmed off the top (obstacles
// sit on the ground, origin (0.5, 1)) so the box stays grounded but is meaningfully shorter than
// the sprite - directly what a player needs to actually clear it with a jump that looked clean.
const HITBOX_WIDTH_RATIO = 0.65;
const HITBOX_HEIGHT_RATIO = 0.75;

export class ObstacleManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private textureKey: string;
  private obstacleFreeUntilX: number;
  private lastObstacleX = -Infinity;
  private obstacles: Phaser.Physics.Arcade.Image[] = [];
  private totalSpawned = 0;
  private totalRecycled = 0;

  constructor(
    scene: Phaser.Scene,
    groundY: number,
    scrollSpeed: number,
    textureKey = 'obstacle',
    obstacleFreeUntilX = 0,
  ) {
    this.scene = scene;
    this.groundY = groundY;
    this.scrollSpeed = scrollSpeed;
    this.textureKey = textureKey;
    this.obstacleFreeUntilX = obstacleFreeUntilX;
  }

  get stats(): { active: number; totalSpawned: number; totalRecycled: number } {
    return { active: this.obstacles.length, totalSpawned: this.totalSpawned, totalRecycled: this.totalRecycled };
  }

  get group(): Phaser.Physics.Arcade.Image[] {
    return this.obstacles;
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
    for (const obstacle of this.obstacles) {
      obstacle.setVelocityX(-speed);
    }
  }

  spawnForChunk(chunkX: number, chunkWidth: number, chunkType: ChunkTypeDef): void {
    const usableWidth = chunkWidth - EDGE_MARGIN * 2;
    if (usableWidth < 0) {
      return;
    }

    // Candidate slots come straight from chunk difficulty - spawnObstacle is what actually
    // enforces the minimum gap (against the last obstacle spawned, whether it came from this
    // chunk or the previous one), so crowded candidates are thinned out rather than placed.
    const count = chunkType.difficulty;
    for (let i = 0; i < count; i++) {
      const slot = count === 1 ? 0.5 : i / (count - 1);
      const x = chunkX + EDGE_MARGIN + slot * usableWidth;
      this.spawnObstacle(x);
    }
  }

  private spawnObstacle(x: number): void {
    if (x < this.obstacleFreeUntilX) {
      return;
    }

    const minGap = this.scrollSpeed * MIN_REACTION_TIME_S;
    if (x - this.lastObstacleX < minGap) {
      return;
    }

    const obstacle = this.scene.physics.add.image(x, this.groundY, this.textureKey);
    obstacle.setOrigin(0.5, 1);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    const fullWidth = body.width;
    const fullHeight = body.height;
    const hitboxWidth = fullWidth * HITBOX_WIDTH_RATIO;
    const hitboxHeight = fullHeight * HITBOX_HEIGHT_RATIO;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((fullWidth - hitboxWidth) / 2, fullHeight - hitboxHeight);

    obstacle.setVelocityX(-this.scrollSpeed);

    this.obstacles.push(obstacle);
    this.lastObstacleX = x;
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

  freeze(): void {
    for (const obstacle of this.obstacles) {
      obstacle.setVelocityX(0);
    }
  }
}
