import Phaser from 'phaser';
import { SaveManager } from '@/save/SaveManager';
import {
  CosmeticCategories,
  getCosmeticsByCategory,
  isCosmeticAvailable,
  type CosmeticItem,
} from '@/data/cosmetics';
import { PhoneFrame } from '@/engine/PhoneFrame';

const SWATCH_SIZE = 56;
const SWATCH_GAP = 20;
const ROW_HEIGHT = 150;

export class CustomizeScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super('Customize');
  }

  create(): void {
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor('#111318');

    const frame = new PhoneFrame(this);
    const topRowY = frame.statusBarBottomY + 8;

    this.add
      .text(width / 2, topRowY + 36, 'Customize', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Centered within the usable width (clear of the notch on the left) rather than flush-left
    // against it, so labels and swatch rows both sit centered on the screen like the title above.
    const centerX = (frame.notchRightX + frame.screenRightX) / 2;
    let rowY = topRowY + 106;
    CosmeticCategories.forEach(({ key, label }) => {
      this.add
        .text(centerX, rowY, label, {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#9ca3af',
        })
        .setOrigin(0.5, 0);
      this.buildRow(getCosmeticsByCategory(key), rowY + 60, centerX);
      rowY += ROW_HEIGHT;
    });
  }

  private buildRow(items: CosmeticItem[], y: number, centerX: number): void {
    const totalWidth = items.length * SWATCH_SIZE + (items.length - 1) * SWATCH_GAP;
    let x = centerX - totalWidth / 2 + SWATCH_SIZE / 2;
    items.forEach((item) => {
      this.buildSwatch(item, x, y);
      x += SWATCH_SIZE + SWATCH_GAP;
    });
  }

  private buildSwatch(item: CosmeticItem, x: number, y: number): void {
    const equipped = SaveManager.getEquippedCosmetic(item.category) === item.id;
    const available = isCosmeticAvailable(item);

    const swatch = this.add
      .rectangle(x, y, SWATCH_SIZE, SWATCH_SIZE, item.color)
      .setStrokeStyle(equipped ? 4 : 2, equipped ? 0xffffff : 0x000000, equipped ? 1 : 0.3)
      .setAlpha(available ? 1 : 0.45)
      .setInteractive({ useHandCursor: true });

    swatch.on('pointerdown', () => this.onSwatchClicked(item));

    this.add
      .text(x, y + SWATCH_SIZE / 2 + 10, available ? item.name : `${item.name}\n${item.price}c`, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: available ? '#ffffff' : '#6b7280',
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private onSwatchClicked(item: CosmeticItem): void {
    if (isCosmeticAvailable(item)) {
      SaveManager.equipCosmetic(item.category, item.id);
      this.scene.restart();
      return;
    }

    if (SaveManager.spendCoins(item.price)) {
      SaveManager.unlockCosmetic(item.id);
      SaveManager.equipCosmetic(item.category, item.id);
      this.scene.restart();
      return;
    }

    this.showToast('Not enough coins!');
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
