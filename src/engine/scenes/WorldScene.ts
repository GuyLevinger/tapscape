import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';
import { InputManager } from '@/engine/InputManager';
import { CharacterController } from '@/engine/CharacterController';
import { CameraController } from '@/engine/CameraController';
import { InfiniteGround } from '@/engine/InfiniteGround';
import { ChunkManager } from '@/engine/ChunkManager';
import { ObstacleManager } from '@/engine/ObstacleManager';
import { CollisionManager } from '@/engine/CollisionManager';
import { ScoreManager } from '@/engine/ScoreManager';
import { SCROLL_SPEED } from '@/config/gameplayConfig';

const GROUND_HEIGHT = 80;

export class WorldScene extends Phaser.Scene {
  private character?: CharacterController;
  private ground?: InfiniteGround;
  private chunkManager?: ChunkManager;
  private obstacleManager?: ObstacleManager;
  private scoreManager?: ScoreManager;
  private scoreText?: Phaser.GameObjects.Text;
  private isRunOver = false;
  private worldKey = '';

  constructor() {
    super('World');
  }

  create(data: { worldKey: string }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
    this.worldKey = world.key;
    this.isRunOver = false;
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(world.color);

    this.add
      .text(width / 2, 60, world.name, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.ground = new InfiniteGround(this, GROUND_HEIGHT, 'ground');

    this.character = new CharacterController(this, width * 0.25, height - GROUND_HEIGHT);
    this.physics.add.collider(this.character.gameObject, this.ground.gameObject);
    new CameraController(this, this.character.gameObject);

    this.obstacleManager = new ObstacleManager(this, height - GROUND_HEIGHT, SCROLL_SPEED);
    this.chunkManager = new ChunkManager(this, SCROLL_SPEED, height - GROUND_HEIGHT, (x, chunkWidth, chunkType) => {
      this.obstacleManager?.spawnForChunk(x, chunkWidth, chunkType);
    });

    new CollisionManager(this, this.character, this.obstacleManager.group, () => this.onPlayerDied());

    // Temporary overlap probe proving non-solid physics detection (distinct from the
    // solid ground collider above); Task 15's coin system will formalize this pattern.
    const coin = this.physics.add.image(width * 0.25, height - GROUND_HEIGHT - 200, 'coin');
    (coin.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.physics.add.overlap(this.character.gameObject, coin, () => {
      coin.destroy();
    });

    new InputManager(this);

    this.scoreManager = new ScoreManager(SCROLL_SPEED);
    this.scoreText = this.add
      .text(width - 24, 24, 'Score: 0', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    const backButton = this.add
      .text(24, 24, '< Home', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    backButton.on('pointerdown', () => {
      this.scene.start('Home');
    });
  }

  update(_time: number, delta: number): void {
    this.character?.update();

    if (this.isRunOver) {
      return;
    }

    this.ground?.update(delta);
    this.chunkManager?.update(delta);
    this.obstacleManager?.update();

    this.scoreManager?.update(delta);
    if (this.scoreManager && this.scoreText) {
      this.scoreText.setText(`Score: ${this.scoreManager.score}`);
    }
  }

  private onPlayerDied(): void {
    this.isRunOver = true;
    this.obstacleManager?.freeze();

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5).setScrollFactor(0);
    this.add
      .text(width / 2, height / 2 - 20, 'Run Over', {
        fontFamily: 'sans-serif',
        fontSize: '36px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    const retryButton = this.add
      .text(width / 2, height / 2 + 30, 'Tap to Retry', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 12, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    retryButton.on('pointerdown', () => {
      this.scene.restart({ worldKey: this.worldKey });
    });
  }
}
