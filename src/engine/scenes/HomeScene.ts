import Phaser from 'phaser';
import { Worlds, type WorldDef } from '@/data/worlds';
import { getEquippedColor } from '@/data/cosmetics';
import { SaveManager } from '@/save/SaveManager';
import { EventBus, GameEvents } from '@/engine/EventBus';
import { checkForNewAchievements } from '@/engine/AchievementManager';

const ICON_SIZE = 96;
const COLUMNS = 3;
const GRID_GAP = 32;
const BEZEL_THICKNESS = 14;

export class HomeScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super('Home');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(getEquippedColor('wallpaper'));

    // Placeholder "phone skin": a colored case border, since no phone-chrome art exists yet.
    this.add
      .rectangle(width / 2, height / 2, width - BEZEL_THICKNESS, height - BEZEL_THICKNESS)
      .setStrokeStyle(BEZEL_THICKNESS, getEquippedColor('phoneSkin'))
      .setOrigin(0.5);

    this.add
      .text(width / 2, 48, '9:41', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const customizeButton = this.add
      .text(width - 24, 24, 'Customize', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    customizeButton.on('pointerdown', () => {
      this.scene.start('Customize');
    });

    this.add
      .text(24, 24, `Coins: ${SaveManager.totalCoins}`, {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#facc15',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0, 0);

    const gridWidth = COLUMNS * ICON_SIZE + (COLUMNS - 1) * GRID_GAP;
    const startX = width / 2 - gridWidth / 2 + ICON_SIZE / 2;
    const startY = height / 2 - 120;

    Worlds.forEach((world, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = startX + col * (ICON_SIZE + GRID_GAP);
      const y = startY + row * (ICON_SIZE + GRID_GAP + 28);
      this.buildWorldIcon(world, x, y);
    });
  }

  private buildWorldIcon(world: WorldDef, x: number, y: number): void {
    const unlocked = SaveManager.isWorldUnlocked(world.key);

    const icon = this.add
      .rectangle(x, y, ICON_SIZE, ICON_SIZE, unlocked ? world.color : 0x2a2d34)
      .setStrokeStyle(2, 0x000000, unlocked ? 0 : 0.3)
      .setAlpha(unlocked ? 1 : 0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, world.name.slice(0, 2).toUpperCase(), {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(unlocked ? 1 : 0.5);

    this.add
      .text(x, y + ICON_SIZE / 2 + 16, unlocked ? world.name : `Unlock: ${world.price}c`, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: unlocked ? '#ffffff' : '#6b7280',
      })
      .setOrigin(0.5);

    icon.on('pointerdown', () => {
      if (unlocked) {
        this.scene.start('World', { worldKey: world.key });
        return;
      }
      this.attemptUnlock(world);
    });
  }

  private attemptUnlock(world: WorldDef): void {
    if (!SaveManager.spendCoins(world.price)) {
      this.showToast('Not enough coins!');
      return;
    }
    SaveManager.unlockWorld(world.key);
    EventBus.emit(GameEvents.WORLD_UNLOCKED, { worldKey: world.key });
    checkForNewAchievements();
    this.scene.restart();
  }

  private showToast(message: string): void {
    this.toast?.destroy();
    const { width, height } = this.scale;
    this.toast = this.add
      .text(width / 2, height - 80, message, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#ef4444',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.toast,
      alpha: 0,
      delay: 900,
      duration: 400,
      onComplete: () => this.toast?.destroy(),
    });
  }
}
