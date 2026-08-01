import Phaser from 'phaser';
import { ImageAssets, AudioAssets } from '@/config/assetManifest';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const { width, height } = this.scale;

    const barWidth = 240;
    const barHeight = 16;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 - barHeight / 2;

    const track = this.add.rectangle(barX, barY, barWidth, barHeight, 0x1e293b).setOrigin(0, 0);
    const fill = this.add.rectangle(barX, barY, 0, barHeight, 0x2dd4bf).setOrigin(0, 0);

    this.load.on('progress', (value: number) => {
      fill.width = barWidth * value;
    });
    this.load.on('complete', () => {
      track.destroy();
      fill.destroy();
    });

    for (const asset of ImageAssets) {
      this.load.image(asset.key, asset.url);
    }
    for (const asset of AudioAssets) {
      this.load.audio(asset.key, asset.url);
    }
  }

  create(): void {
    this.scene.start('Home');
  }
}
