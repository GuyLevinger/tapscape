import Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { EventBus, GameEvents } from './EventBus';
import { PhoneFrame } from './PhoneFrame';

// Task 41: the in-run HUD's top row is redesigned to read as a phone status bar (the same visual
// language the GDD leans on everywhere else - "browser-first endless runner set inside a
// smartphone UI") instead of a stack of separately-boxed labels. Score and coins move INTO that
// bar as compact icon+number readouts (matching the fixed "9:41" clock joke Home already makes -
// a real status bar's contents don't change, so ours doesn't either, aside from the numbers this
// game actually tracks). The bar itself (time, decorative signal/wifi/battery, bezel, left-edge
// speaker/camera notch) is shared chrome built by `PhoneFrame` - the same follow-up request that
// asked for it on every screen, not just here.
const ICON_GAP = 10;
// Generous fixed slot per number readout so the layout never has to reflow as digits are gained
// mid-run - the icon to a number's left stays put rather than chasing the number's growing edge.
const NUMBER_SLOT = 54;
const ICON_GLYPH_W = 12;

export class UIManager {
  private scene: Phaser.Scene;
  private scoreText: Phaser.GameObjects.Text;
  private coinText: Phaser.GameObjects.Text;
  private powerupText: Phaser.GameObjects.Text;
  private muteButton: Phaser.GameObjects.Text;
  private powerupName: string;

  private onCoinCollected = () => this.punch(this.coinText);
  private onPowerupPicked = () => this.punch(this.powerupText);

  constructor(scene: Phaser.Scene, worldName: string, audioManager: AudioManager, powerupName = 'Shield') {
    this.scene = scene;
    this.powerupName = powerupName;
    const { width } = scene.scale;
    // showCoins: false - this run's live coin count (built below) occupies the same slot PhoneFrame
    // would otherwise use for the lifetime wallet balance; showing both would be redundant/confusing.
    const frame = new PhoneFrame(scene, { showCoins: false });
    const barY = frame.statusBarCenterY;
    const chrome = scene.add.graphics().setScrollFactor(0);

    // Coin readout: a small filled circle (matches the coin pickup's yellow tint) plus a
    // fixed-slot, right-anchored number so the digits grow leftward without disturbing the icon.
    let cursor = frame.statusBarContentRightX;
    const coinNumberX = cursor;
    cursor -= NUMBER_SLOT;
    const coinIconX = cursor - ICON_GLYPH_W / 2;
    chrome.fillStyle(0xfacc15, 1);
    chrome.fillCircle(coinIconX, barY, ICON_GLYPH_W / 2 - 2);
    cursor -= ICON_GLYPH_W + ICON_GAP;

    const coinLabel = scene.add
      .text(cursor, barY, 'Coins', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#facc15',
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);
    cursor -= coinLabel.width + ICON_GAP;

    this.coinText = scene.add
      .text(coinNumberX, barY, '0', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#facc15',
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Score readout: a small diamond marker (distinct silhouette from the coin's circle) plus the
    // same fixed-slot number pattern.
    const scoreNumberX = cursor;
    cursor -= NUMBER_SLOT;
    const scoreIconX = cursor - ICON_GLYPH_W / 2;
    const d = ICON_GLYPH_W / 2 - 1;
    chrome.fillStyle(0xffffff, 1);
    chrome.fillPoints(
      [
        new Phaser.Math.Vector2(scoreIconX, barY - d),
        new Phaser.Math.Vector2(scoreIconX + d, barY),
        new Phaser.Math.Vector2(scoreIconX, barY + d),
        new Phaser.Math.Vector2(scoreIconX - d, barY),
      ],
      true,
    );

    this.scoreText = scene.add
      .text(scoreNumberX, barY, '0', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Anchored off the bar's actual bottom edge rather than a hardcoded y - the padding/notch
    // rework moved the bar down from the canvas top, and this text was left behind at its old
    // fixed position, so it ended up overlapping and spilling below the (now lower) bar.
    scene.add
      .text(width / 2, frame.statusBarBottomY + 26, worldName, {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.powerupText = scene.add
      .text(width - 24, frame.statusBarBottomY + 8, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#38bdf8',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.muteButton = scene.add
      .text(frame.contentLeftX, frame.statusBarBottomY + 8, scene.sound.mute ? 'Unmute' : 'Mute', {
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
    this.scoreText.setText(`${score}`);
  }

  setCoins(coins: number): void {
    this.coinText.setText(`${coins}`);
  }

  setPowerup(remainingSeconds: number | null): void {
    if (remainingSeconds === null) {
      this.powerupText.setVisible(false);
      return;
    }
    this.powerupText.setText(`${this.powerupName}: ${remainingSeconds}s`).setVisible(true);
  }
}
