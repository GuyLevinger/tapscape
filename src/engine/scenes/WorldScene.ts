import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';
import { InputManager } from '@/engine/InputManager';
import { CharacterController } from '@/engine/CharacterController';
import { CameraController } from '@/engine/CameraController';

const GROUND_HEIGHT = 80;

export class WorldScene extends Phaser.Scene {
  private character?: CharacterController;

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

    const groundY = height - GROUND_HEIGHT / 2;
    const ground = this.add.rectangle(width / 2, groundY, width, GROUND_HEIGHT, 0x1e293b);
    this.physics.add.existing(ground, true);

    this.character = new CharacterController(this, width * 0.25, height - GROUND_HEIGHT);
    this.physics.add.collider(this.character.gameObject, ground);
    new CameraController(this, this.character.gameObject);

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

  update(): void {
    this.character?.update();
  }
}
