import Phaser from 'phaser';
import { AudioManager } from './AudioManager';

export class UIManager {
  private scoreText: Phaser.GameObjects.Text;
  private coinText: Phaser.GameObjects.Text;
  private powerupText: Phaser.GameObjects.Text;
  private muteButton: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    worldName: string,
    audioManager: AudioManager,
    onBack: () => void,
  ) {
    const { width } = scene.scale;

    scene.add
      .text(width / 2, 60, worldName, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.scoreText = scene.add
      .text(width - 24, 24, 'Score: 0', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.coinText = scene.add
      .text(width - 24, 60, 'Coins: 0', {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#facc15',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.powerupText = scene.add
      .text(width - 24, 96, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#38bdf8',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setVisible(false);

    const backButton = scene.add
      .text(24, 24, '< Home', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    backButton.on('pointerdown', onBack);

    this.muteButton = scene.add
      .text(24, 64, scene.sound.mute ? 'Unmute' : 'Mute', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    this.muteButton.on('pointerdown', () => {
      const muted = audioManager.toggleMute();
      this.muteButton.setText(muted ? 'Unmute' : 'Mute');
    });
  }

  setScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  setCoins(coins: number): void {
    this.coinText.setText(`Coins: ${coins}`);
  }

  setPowerup(remainingSeconds: number | null): void {
    if (remainingSeconds === null) {
      this.powerupText.setVisible(false);
      return;
    }
    this.powerupText.setText(`Shield: ${remainingSeconds}s`).setVisible(true);
  }
}
