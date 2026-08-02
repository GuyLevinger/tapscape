import Phaser from 'phaser';
import { Worlds, type WorldDef } from '@/data/worlds';
import { getEquippedColor } from '@/data/cosmetics';
import { SaveManager } from '@/save/SaveManager';
import { EventBus, GameEvents } from '@/engine/EventBus';
import { checkForNewAchievements } from '@/engine/AchievementManager';
import { PhoneFrame } from '@/engine/PhoneFrame';

const ICON_SIZE = 96;
const COLUMNS = 3;
const GRID_GAP = 32;

export class HomeScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super('Home');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(getEquippedColor('wallpaper'));

    // showHomeButton: false - PhoneFrame's persistent circular home button is for navigating BACK
    // to Home from elsewhere; showing it while already on Home would do nothing useful.
    new PhoneFrame(this, { showHomeButton: false });

    const gridWidth = COLUMNS * ICON_SIZE + (COLUMNS - 1) * GRID_GAP;
    const startX = width / 2 - gridWidth / 2 + ICON_SIZE / 2;
    const startY = height / 2 - 120;
    const gridX = (index: number) => startX + (index % COLUMNS) * (ICON_SIZE + GRID_GAP);
    const gridY = (index: number) => startY + Math.floor(index / COLUMNS) * (ICON_SIZE + GRID_GAP + 28);

    Worlds.forEach((world, index) => {
      this.buildWorldIcon(world, gridX(index), gridY(index));
    });

    // Customize is styled as a settings-gear app icon rather than a corner text button, sitting in
    // the grid's next open slot right after the world icons - "just another app icon."
    this.buildCustomizeIcon(gridX(Worlds.length), gridY(Worlds.length));
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

  // A circular settings-gear icon, matching a phone's settings app convention, dropped into the
  // grid's next open slot right after the world icons rather than living as a special corner
  // button - "just another app icon like the other apps."
  private buildCustomizeIcon(x: number, y: number): void {
    const radius = ICON_SIZE / 2;
    const icon = this.add
      .circle(x, y, radius, 0x374151)
      .setInteractive({ useHandCursor: true });

    // Few, chunky teeth (not many thin ones) plus a clearly visible center hole - a scalloped
    // edge with too many small notches reads as a coin/chip, not a gear.
    const gear = this.add.graphics();
    const bodyRadius = radius * 0.42;
    const toothOuterRadius = radius * 0.68;
    const teeth = 6;
    const halfAngle = ((Math.PI * 2) / teeth) * 0.42;
    gear.fillStyle(0xffffff, 1);
    for (let i = 0; i < teeth; i++) {
      const angle = i * ((Math.PI * 2) / teeth);
      gear.fillPoints(
        [
          new Phaser.Math.Vector2(
            x + bodyRadius * Math.cos(angle - halfAngle),
            y + bodyRadius * Math.sin(angle - halfAngle),
          ),
          new Phaser.Math.Vector2(
            x + toothOuterRadius * Math.cos(angle - halfAngle),
            y + toothOuterRadius * Math.sin(angle - halfAngle),
          ),
          new Phaser.Math.Vector2(
            x + toothOuterRadius * Math.cos(angle + halfAngle),
            y + toothOuterRadius * Math.sin(angle + halfAngle),
          ),
          new Phaser.Math.Vector2(
            x + bodyRadius * Math.cos(angle + halfAngle),
            y + bodyRadius * Math.sin(angle + halfAngle),
          ),
        ],
        true,
      );
    }
    gear.fillCircle(x, y, bodyRadius);
    gear.fillStyle(0x374151, 1);
    gear.fillCircle(x, y, bodyRadius * 0.5);

    this.add
      .text(x, y + ICON_SIZE / 2 + 16, 'Customize', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    icon.on('pointerdown', () => this.scene.start('Customize'));
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
