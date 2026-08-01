import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create(data: { worldKey: string }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(world.color);

    this.add
      .text(width / 2, height / 2 - 20, world.name, {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 40, 'Gameplay coming soon\nTap to return home', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Home');
    });
  }
}
