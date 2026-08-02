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
  // The swatch grid's vertical extent overlaps PhoneFrame's left-edge notch (centered on the
  // screen's vertical middle), unlike other scenes' left-aligned content - so it needs to start
  // clear of the notch specifically, not just the bezel.
  private rowStartX = 0;

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

    this.rowStartX = frame.notchRightX + 16;
    let rowY = topRowY + 106;
    CosmeticCategories.forEach(({ key, label }) => {
      this.add.text(this.rowStartX, rowY, label, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#9ca3af',
      });
      this.buildRow(getCosmeticsByCategory(key), rowY + 60);
      rowY += ROW_HEIGHT;
    });
  }

  private buildRow(items: CosmeticItem[], y: number): void {
    let x = this.rowStartX + SWATCH_SIZE / 2;
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
