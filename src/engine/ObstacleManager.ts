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

// Suspended obstacles float this far above the ground (bottom edge to ground), so a standing/
// running player's hitbox (~102px tall, see CharacterController's HITBOX_HEIGHT_RATIO) never
// reaches them - only a jump's arc does. Comfortably above 102px so normal running never grazes
// one; a jump's ~150px apex (JUMP_VELOCITY/gravity) still carries the player's hitbox into it.
const OVERHEAD_CLEARANCE = 130;
// Fraction of obstacles spawned as "overhead" (jump-punishing) rather than "ground" (jump-required)
// variants. A basic 50/50-ish mix for Task 33 - real per-difficulty tuning is Task 40's job.
const OVERHEAD_VARIANT_CHANCE = 0.35;

export type ObstacleVariant = 'ground' | 'overhead';

export class ObstacleManager {
  private scene: Phaser.Scene;
  private groundY: number;
  private scrollSpeed: number;
  private textureKey: string;
  private obstacleFreeUntilX: number;
  private lastObstacleX = -Infinity;
  private obstacles: Phaser.Physics.Arcade.Image[] = [];
  // Inactive Images kept around instead of destroyed, so a later spawn can reuse the GameObject +
  // Arcade Body instead of paying allocation/GC cost every ~1-2s a chunk recycles.
  private pool: Phaser.Physics.Arcade.Image[] = [];
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

    const variant: ObstacleVariant = Math.random() < OVERHEAD_VARIANT_CHANCE ? 'overhead' : 'ground';
    const y = variant === 'overhead' ? this.groundY - OVERHEAD_CLEARANCE : this.groundY;

    const obstacle = this.pool.pop() ?? this.scene.physics.add.image(x, y, this.textureKey);
    obstacle.setPosition(x, y);
    obstacle.setTexture(this.textureKey);
    obstacle.setOrigin(0.5, 1);
    obstacle.setActive(true);
    obstacle.setVisible(true);
    obstacle.setData('variant', variant);
    const body = obstacle.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(false);

    // Use the display frame's size, not the body's - a reused pooled Image's body may already be
    // shrunk from its previous spawn, and re-deriving the hitbox from that would shrink it again.
    const fullWidth = obstacle.width;
    const fullHeight = obstacle.height;
    const hitboxWidth = fullWidth * HITBOX_WIDTH_RATIO;
    const hitboxHeight = fullHeight * HITBOX_HEIGHT_RATIO;
    // Ground obstacles trim forgiveness off the top (what a clearing jump grazes); overhead ones
    // trim off the bottom instead (what a jump grazes from below) - the graze edge is whichever
    // side a jump actually approaches from for that variant.
    const offsetY = variant === 'overhead' ? 0 : fullHeight - hitboxHeight;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((fullWidth - hitboxWidth) / 2, offsetY);

    obstacle.setVelocityX(-this.scrollSpeed);

    this.obstacles.push(obstacle);
    this.lastObstacleX = x;
    this.totalSpawned += 1;
  }

  update(): void {
    const despawnX = this.scene.cameras.main.scrollX - DESPAWN_MARGIN;
    while (this.obstacles.length && this.obstacles[0].x < despawnX) {
      const obstacle = this.obstacles.shift();
      if (obstacle) {
        obstacle.setActive(false);
        obstacle.setVisible(false);
        obstacle.setVelocity(0, 0);
        (obstacle.body as Phaser.Physics.Arcade.Body).enable = false;
        this.pool.push(obstacle);
      }
      this.totalRecycled += 1;
    }
  }

  freeze(): void {
    for (const obstacle of this.obstacles) {
      obstacle.setVelocityX(0);
    }
  }
}
