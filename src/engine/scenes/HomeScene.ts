import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';

const ICON_SIZE = 96;
const COLUMNS = 3;
const GRID_GAP = 32;

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#111318');

    this.add
      .text(width / 2, 48, '9:41', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const gridWidth = COLUMNS * ICON_SIZE + (COLUMNS - 1) * GRID_GAP;
    const startX = width / 2 - gridWidth / 2 + ICON_SIZE / 2;
    const startY = height / 2 - 120;

    Worlds.forEach((world, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = startX + col * (ICON_SIZE + GRID_GAP);
      const y = startY + row * (ICON_SIZE + GRID_GAP + 28);

      const icon = this.add
        .rectangle(x, y, ICON_SIZE, ICON_SIZE, world.unlocked ? world.color : 0x2a2d34)
        .setStrokeStyle(2, 0x000000, world.unlocked ? 0 : 0.3);
      icon.setAlpha(world.unlocked ? 1 : 0.5);

      this.add
        .text(x, y, world.name.slice(0, 2).toUpperCase(), {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setAlpha(world.unlocked ? 1 : 0.5);

      this.add
        .text(x, y + ICON_SIZE / 2 + 16, world.unlocked ? world.name : 'Not Installed', {
          fontFamily: 'sans-serif',
          fontSize: '14px',
          color: world.unlocked ? '#ffffff' : '#6b7280',
        })
        .setOrigin(0.5);

      if (world.unlocked) {
        icon.setInteractive({ useHandCursor: true });
        icon.on('pointerdown', () => {
          this.scene.start('World', { worldKey: world.key });
        });
      }
    });
  }
}
