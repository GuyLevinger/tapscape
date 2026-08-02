import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';
import { getWorldContent, type SignatureMechanic } from '@/data/worldContent';
import { InputManager } from '@/engine/InputManager';
import { CharacterController } from '@/engine/CharacterController';
import { CameraController } from '@/engine/CameraController';
import { InfiniteGround } from '@/engine/InfiniteGround';
import { ChunkManager } from '@/engine/ChunkManager';
import { ObstacleManager } from '@/engine/ObstacleManager';
import { CollisionManager } from '@/engine/CollisionManager';
import { ScoreManager } from '@/engine/ScoreManager';
import { DifficultyManager } from '@/engine/DifficultyManager';
import { CoinManager } from '@/engine/CoinManager';
import { PowerupManager } from '@/engine/PowerupManager';
import { AudioManager } from '@/engine/AudioManager';
import { UIManager } from '@/engine/UIManager';
import { SCROLL_SPEED, FIRST_ATTEMPT_CLEAR_DISTANCE, RETRY_CLEAR_DISTANCE } from '@/config/gameplayConfig';

const GROUND_HEIGHT = 80;
const COIN_SCORE_BONUS = 5;

export class WorldScene extends Phaser.Scene {
  private character?: CharacterController;
  private ground?: InfiniteGround;
  private chunkManager?: ChunkManager;
  private obstacleManager?: ObstacleManager;
  private coinManager?: CoinManager;
  private powerupManager?: PowerupManager;
  private scoreManager?: ScoreManager;
  private difficultyManager?: DifficultyManager;
  private audioManager?: AudioManager;
  private uiManager?: UIManager;
  private signatureMechanic?: SignatureMechanic;
  private isRunOver = false;
  private worldKey = '';
  private worldName = '';
  private survivalMs = 0;

  constructor() {
    super('World');
  }

  create(data: { worldKey: string; isRetry?: boolean }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
    const content = getWorldContent(world.key);
    this.worldKey = world.key;
    this.worldName = world.name;
    this.isRunOver = false;
    this.survivalMs = 0;
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(world.color);

    this.ground = new InfiniteGround(this, GROUND_HEIGHT, 'ground');

    const playerX = width * 0.25;
    this.character = new CharacterController(this, playerX, height - GROUND_HEIGHT, GROUND_HEIGHT);
    this.physics.add.collider(this.character.gameObject, this.ground.gameObject);
    new CameraController(this, this.character.gameObject);

    this.scoreManager = new ScoreManager();
    this.difficultyManager = new DifficultyManager(SCROLL_SPEED);

    // First attempt gets a longer, welcoming obstacle-free runway to learn the controls; a retry
    // after dying only needs enough room to react, so the retry loop stays fast (see
    // gameplayConfig.ts for the rationale behind these two distances).
    const clearDistance = data.isRetry ? RETRY_CLEAR_DISTANCE : FIRST_ATTEMPT_CLEAR_DISTANCE;
    const obstacleFreeUntilX = playerX + clearDistance;

    this.obstacleManager = new ObstacleManager(
      this,
      height - GROUND_HEIGHT,
      SCROLL_SPEED,
      content.obstacleTextureKey,
      obstacleFreeUntilX,
    );
    this.coinManager = new CoinManager(this, height - GROUND_HEIGHT, SCROLL_SPEED, content.coinTextureKey);
    this.powerupManager = new PowerupManager(this, height - GROUND_HEIGHT, SCROLL_SPEED, content.powerupTextureKey);
    this.chunkManager = new ChunkManager(this, SCROLL_SPEED, height - GROUND_HEIGHT, (x, chunkWidth, chunkType) => {
      this.obstacleManager?.spawnForChunk(x, chunkWidth, chunkType);
      this.coinManager?.spawnForChunk(x, chunkWidth, chunkType);
      this.powerupManager?.spawnForChunk(x, chunkWidth, chunkType);
    });

    new CollisionManager(
      this,
      this.character,
      this.obstacleManager.group,
      () => this.onPlayerDied(),
      () => this.powerupManager?.isEffectActive ?? false,
    );

    this.physics.add.overlap(this.character.gameObject, this.coinManager.group, (_player, coinObj) => {
      this.coinManager?.collect(coinObj as Phaser.Physics.Arcade.Image);
      this.scoreManager?.addBonus(COIN_SCORE_BONUS);
    });

    this.physics.add.overlap(this.character.gameObject, this.powerupManager.group, (_player, powerupObj) => {
      this.powerupManager?.collect(powerupObj as Phaser.Physics.Arcade.Image);
    });

    new InputManager(this);

    this.audioManager = new AudioManager(this);
    this.audioManager.playMusic('music_theme');

    this.uiManager = new UIManager(
      this,
      world.name,
      this.audioManager,
      () => {
        this.scene.start('Home');
      },
      content.powerupName,
    );

    this.signatureMechanic = content.createSignatureMechanic?.(this, {
      character: this.character,
      groundY: height - GROUND_HEIGHT,
      getObstacles: () => this.obstacleManager?.group ?? [],
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.signatureMechanic?.destroy?.();
    });
  }

  update(_time: number, delta: number): void {
    this.character?.update();

    if (this.isRunOver) {
      return;
    }

    this.survivalMs += delta;

    this.difficultyManager?.update(delta);
    const scrollSpeed = this.difficultyManager?.scrollSpeed ?? SCROLL_SPEED;
    const difficultyBias = this.difficultyManager?.chunkDifficultyBias ?? 0;

    this.ground?.setScrollSpeed(scrollSpeed);
    this.ground?.update(delta);
    this.chunkManager?.setScrollSpeed(scrollSpeed);
    this.chunkManager?.setDifficultyBias(difficultyBias);
    this.chunkManager?.update(delta);
    this.obstacleManager?.setScrollSpeed(scrollSpeed);
    this.obstacleManager?.update();
    this.coinManager?.setScrollSpeed(scrollSpeed);
    this.coinManager?.update();
    this.powerupManager?.setScrollSpeed(scrollSpeed);
    this.powerupManager?.update(delta);
    this.character?.setInvincible(this.powerupManager?.isEffectActive ?? false);
    this.signatureMechanic?.update(delta);

    this.scoreManager?.update(delta, scrollSpeed);
    if (this.scoreManager) {
      this.uiManager?.setScore(this.scoreManager.score);
    }
    if (this.coinManager) {
      this.uiManager?.setCoins(this.coinManager.stats.totalCollected);
    }
    this.uiManager?.setPowerup(
      this.powerupManager?.isEffectActive ? this.powerupManager.effectRemainingSeconds : null,
    );
  }

  private onPlayerDied(): void {
    this.isRunOver = true;
    this.obstacleManager?.freeze();
    this.coinManager?.freeze();
    this.powerupManager?.freeze();

    // Brief pause so the player registers the hit before the scene switches,
    // per the GDD's "deaths should feel humorous rather than frustrating" guidance.
    this.time.delayedCall(500, () => {
      this.scene.start('Results', {
        worldKey: this.worldKey,
        worldName: this.worldName,
        score: this.scoreManager?.score ?? 0,
        distance: this.scoreManager?.distanceTraveled ?? 0,
        coins: this.coinManager?.stats.totalCollected ?? 0,
        survivalMs: this.survivalMs,
      });
    });
  }
}
