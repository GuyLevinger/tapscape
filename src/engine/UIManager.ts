import Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { EventBus, GameEvents } from './EventBus';

export class UIManager {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private coinText: Phaser.GameObjects.Text;
  private powerupText: Phaser.GameObjects.Text;
  private muteButton: Phaser.GameObjects.Text;
  private powerupName: string;

  private onCoinCollected = () => this.punch(this.coinText);
  private onPowerupPicked = () => this.punch(this.powerupText);

  constructor(
    scene: Phaser.Scene,
    worldName: string,
    audioManager: AudioManager,
    onBack: () => void,
    powerupName = 'Shield',
  ) {
    this.scene = scene;
    this.powerupName = powerupName;
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

    EventBus.on(GameEvents.COIN_COLLECTED, this.onCoinCollected);
    EventBus.on(GameEvents.POWERUP_PICKED, this.onPowerupPicked);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.COIN_COLLECTED, this.onCoinCollected);
      EventBus.off(GameEvents.POWERUP_PICKED, this.onPowerupPicked);
    });
  }

  // A quick scale punch on whichever HUD label just changed, so a pickup registers as a discrete
  // event rather than just a number silently ticking up - setCoins/setPowerup are called every
  // frame regardless of whether the value changed, so the punch is driven off the pickup events
  // themselves rather than a value comparison inside those setters.
  private punch(target: Phaser.GameObjects.Text): void {
    this.scene.tweens.killTweensOf(target);
    target.setScale(1.4);
    this.scene.tweens.add({
      targets: target,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
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
    this.powerupText.setText(`${this.powerupName}: ${remainingSeconds}s`).setVisible(true);
  }
}
