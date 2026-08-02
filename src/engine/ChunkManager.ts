import Phaser from 'phaser';
import { ChunkSelector } from './ChunkSelector';
import type { ChunkTypeDef } from '@/data/chunkTypes';

export const CHUNK_WIDTH = 600;
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
  private selector = new ChunkSelector();
  private difficultyBias = 0;
  private onChunkSpawned?: (x: number, width: number, chunkType: ChunkTypeDef) => void;

  constructor(
    scene: Phaser.Scene,
    scrollSpeed: number,
    groundY: number,
    onChunkSpawned?: (x: number, width: number, chunkType: ChunkTypeDef) => void,
  ) {
    this.scene = scene;
    this.scrollSpeed = scrollSpeed;
    this.groundY = groundY;
    this.onChunkSpawned = onChunkSpawned;

    const seedWidth = scene.scale.width * (1 + SPAWN_AHEAD_MULTIPLIER);
    while (this.nextSpawnX < seedWidth) {
      this.spawnChunk();
    }
  }

  get stats(): {
    active: number;
    totalSpawned: number;
    totalRecycled: number;
    validSequence: boolean;
    history: readonly string[];
  } {
    return {
      active: this.chunks.length,
      totalSpawned: this.totalSpawned,
      totalRecycled: this.totalRecycled,
      validSequence: this.selector.isValidSequence(),
      history: this.selector.getHistory(),
    };
  }

  setScrollSpeed(speed: number): void {
    this.scrollSpeed = speed;
  }

  setDifficultyBias(bias: number): void {
    this.difficultyBias = bias;
  }

  private spawnChunk(): void {
    const id = this.chunkCounter++;
    const x = this.nextSpawnX;
    const chunkType = this.selector.next(this.difficultyBias);

    // Chunk-type markers are a dev-only debugging aid for verifying valid chunk sequences (Task
    // 11) - a Text object per chunk is a real per-recycle cost (canvas texture generation) and was
    // never part of the shipped visual design, so it's stripped from production builds.
    const children: Phaser.GameObjects.GameObject[] = [];
    if (import.meta.env.DEV) {
      const marker = this.scene.add.rectangle(
        CHUNK_WIDTH / 2,
        this.groundY - MARKER_HEIGHT / 2,
        CHUNK_WIDTH - 4,
        MARKER_HEIGHT,
        chunkType.color,
        0.5,
      );
      const label = this.scene.add
        .text(CHUNK_WIDTH / 2, this.groundY - MARKER_HEIGHT / 2, `#${id} (${chunkType.id})`, {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      children.push(marker, label);
    }

    const container = this.scene.add.container(x, 0, children);
    this.chunks.push(container);
    this.nextSpawnX += CHUNK_WIDTH;
    this.totalSpawned += 1;

    this.onChunkSpawned?.(x, CHUNK_WIDTH, chunkType);
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
