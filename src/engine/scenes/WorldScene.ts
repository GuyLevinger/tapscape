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
import { CoinManager } from '@/engine/CoinManager';
import { SCROLL_SPEED } from '@/config/gameplayConfig';

const GROUND_HEIGHT = 80;
const COIN_SCORE_BONUS = 5;

export class WorldScene extends Phaser.Scene {
  private character?: CharacterController;
  private ground?: InfiniteGround;
  private chunkManager?: ChunkManager;
  private obstacleManager?: ObstacleManager;
  private coinManager?: CoinManager;
  private scoreManager?: ScoreManager;
  private scoreText?: Phaser.GameObjects.Text;
  private coinText?: Phaser.GameObjects.Text;
  private isRunOver = false;
  private worldKey = '';
  private worldName = '';

  constructor() {
    super('World');
  }

  create(data: { worldKey: string }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
    this.worldKey = world.key;
    this.worldName = world.name;
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

    this.scoreManager = new ScoreManager(SCROLL_SPEED);

    this.obstacleManager = new ObstacleManager(this, height - GROUND_HEIGHT, SCROLL_SPEED);
    this.coinManager = new CoinManager(this, height - GROUND_HEIGHT, SCROLL_SPEED);
    this.chunkManager = new ChunkManager(this, SCROLL_SPEED, height - GROUND_HEIGHT, (x, chunkWidth, chunkType) => {
      this.obstacleManager?.spawnForChunk(x, chunkWidth, chunkType);
      this.coinManager?.spawnForChunk(x, chunkWidth, chunkType);
    });

    new CollisionManager(this, this.character, this.obstacleManager.group, () => this.onPlayerDied());

    this.physics.add.overlap(this.character.gameObject, this.coinManager.group, (_player, coinObj) => {
      this.coinManager?.collect(coinObj as Phaser.Physics.Arcade.Image);
      this.scoreManager?.addBonus(COIN_SCORE_BONUS);
    });

    new InputManager(this);

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

    this.coinText = this.add
      .text(width - 24, 60, 'Coins: 0', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#facc15',
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
    this.coinManager?.update();

    this.scoreManager?.update(delta);
    if (this.scoreManager && this.scoreText) {
      this.scoreText.setText(`Score: ${this.scoreManager.score}`);
    }
    if (this.coinManager && this.coinText) {
      this.coinText.setText(`Coins: ${this.coinManager.stats.totalCollected}`);
    }
  }

  private onPlayerDied(): void {
    this.isRunOver = true;
    this.obstacleManager?.freeze();
    this.coinManager?.freeze();

    // Brief pause so the player registers the hit before the scene switches,
    // per the GDD's "deaths should feel humorous rather than frustrating" guidance.
    this.time.delayedCall(500, () => {
      this.scene.start('Results', {
        worldKey: this.worldKey,
        worldName: this.worldName,
        score: this.scoreManager?.score ?? 0,
        distance: this.scoreManager?.distanceTraveled ?? 0,
        coins: this.coinManager?.stats.totalCollected ?? 0,
      });
    });
  }
}
