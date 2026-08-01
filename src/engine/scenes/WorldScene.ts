import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';
import { InputManager } from '@/engine/InputManager';
import { CharacterController } from '@/engine/CharacterController';
import { CameraController } from '@/engine/CameraController';
import { InfiniteGround } from '@/engine/InfiniteGround';
import { ChunkManager } from '@/engine/ChunkManager';
import { SCROLL_SPEED } from '@/config/gameplayConfig';

const GROUND_HEIGHT = 80;

export class WorldScene extends Phaser.Scene {
  private character?: CharacterController;
  private ground?: InfiniteGround;
  private chunkManager?: ChunkManager;

  constructor() {
    super('World');
  }

  create(data: { worldKey: string }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
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

    this.chunkManager = new ChunkManager(this, SCROLL_SPEED, height - GROUND_HEIGHT);

    // Temporary overlap probe proving non-solid physics detection (distinct from the
    // solid ground collider above); Task 15's coin system will formalize this pattern.
    const coin = this.physics.add.image(width * 0.25, height - GROUND_HEIGHT - 200, 'coin');
    (coin.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.physics.add.overlap(this.character.gameObject, coin, () => {
      coin.destroy();
    });

    new InputManager(this);

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
    this.ground?.update(delta);
    this.chunkManager?.update(delta);
  }
}
