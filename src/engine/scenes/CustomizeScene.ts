import Phaser from 'phaser';
import { SaveManager } from '@/save/SaveManager';
import {
  CosmeticCategories,
  getCosmeticsByCategory,
  isCosmeticAvailable,
  type CosmeticItem,
} from '@/data/cosmetics';

const SWATCH_SIZE = 56;
const SWATCH_GAP = 20;
const ROW_HEIGHT = 150;

export class CustomizeScene extends Phaser.Scene {
  private coinText!: Phaser.GameObjects.Text;
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super('Customize');
  }

  create(): void {
    const { width } = this.scale;
    this.cameras.main.setBackgroundColor('#111318');

    this.add
      .text(width / 2, 48, 'Customize', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.coinText = this.add
      .text(width - 24, 24, '', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#facc15',
      })
      .setOrigin(1, 0);
    this.refreshCoinText();

    const backButton = this.add
      .text(24, 24, '< Home', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => this.scene.start('Home'));

    let rowY = 130;
    CosmeticCategories.forEach(({ key, label }) => {
      this.add.text(32, rowY, label, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#9ca3af',
      });
      this.buildRow(getCosmeticsByCategory(key), rowY + 60);
      rowY += ROW_HEIGHT;
    });
  }

  private buildRow(items: CosmeticItem[], y: number): void {
    let x = 32 + SWATCH_SIZE / 2;
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

  private refreshCoinText(): void {
    this.coinText.setText(`Coins: ${SaveManager.totalCoins}`);
  }
}
