import Phaser from 'phaser';

const CHUNK_WIDTH = 600;
const MARKER_HEIGHT = 40;
const SPAWN_AHEAD_MULTIPLIER = 1.5;
const DESPAWN_BEHIND_MULTIPLIER = 1;

export class ChunkManager {
  private scene: Phaser.Scene;
  private scrollSpeed: number;
  private groundY: number;
  private chunks: Phaser.GameObjects.Container[] = [];
  private nextSpawnX = 0;
  private chunkCounter = 0;
  private totalSpawned = 0;
  private totalRecycled = 0;

  constructor(scene: Phaser.Scene, scrollSpeed: number, groundY: number) {
    this.scene = scene;
    this.scrollSpeed = scrollSpeed;
    this.groundY = groundY;

    const seedWidth = scene.scale.width * (1 + SPAWN_AHEAD_MULTIPLIER);
    while (this.nextSpawnX < seedWidth) {
      this.spawnChunk();
    }
  }

  get stats(): { active: number; totalSpawned: number; totalRecycled: number } {
    return { active: this.chunks.length, totalSpawned: this.totalSpawned, totalRecycled: this.totalRecycled };
  }

  private spawnChunk(): void {
    const id = this.chunkCounter++;
    const x = this.nextSpawnX;

    const marker = this.scene.add.rectangle(
      CHUNK_WIDTH / 2,
      this.groundY - MARKER_HEIGHT / 2,
      CHUNK_WIDTH - 4,
      MARKER_HEIGHT,
      id % 2 === 0 ? 0x334155 : 0x475569,
      0.5,
    );
    const label = this.scene.add
      .text(CHUNK_WIDTH / 2, this.groundY - MARKER_HEIGHT / 2, `#${id}`, {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const container = this.scene.add.container(x, 0, [marker, label]);
    this.chunks.push(container);
    this.nextSpawnX += CHUNK_WIDTH;
    this.totalSpawned += 1;
  }

  update(delta: number): void {
    const dx = (this.scrollSpeed * delta) / 1000;

    for (const chunk of this.chunks) {
      chunk.x -= dx;
    }
    this.nextSpawnX -= dx;

    const despawnThreshold = -CHUNK_WIDTH * (1 + DESPAWN_BEHIND_MULTIPLIER);
    while (this.chunks.length && this.chunks[0].x + CHUNK_WIDTH < despawnThreshold) {
      const chunk = this.chunks.shift();
      chunk?.destroy();
      this.totalRecycled += 1;
    }

    const spawnThreshold = this.scene.scale.width * SPAWN_AHEAD_MULTIPLIER;
    while (this.nextSpawnX < spawnThreshold) {
      this.spawnChunk();
    }
  }
}
