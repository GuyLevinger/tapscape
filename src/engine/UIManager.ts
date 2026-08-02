import Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { EventBus, GameEvents } from './EventBus';

// Task 41: the in-run HUD's top row is redesigned to read as a phone status bar (the same visual
// language the GDD leans on everywhere else - "browser-first endless runner set inside a
// smartphone UI") instead of a stack of separately-boxed labels. Score and coins move INTO that
// bar as compact icon+number readouts (matching the fixed "9:41" clock joke Home already makes -
// a real status bar's contents don't change, so ours doesn't either, aside from the numbers this
// game actually tracks); signal bars, wifi and battery are drawn as decorative chrome via
// Graphics primitives (no new art needed) purely to sell the status-bar read, exactly like a
// screenshot phone always shows full signal/wifi/battery regardless of anything.
const STATUS_BAR_HEIGHT = 40;
const STATUS_BAR_PAD = 16;
const ICON_GAP = 10;
const BATTERY_W = 22;
const BATTERY_H = 11;
const BATTERY_NUB_W = 2;
const WIFI_W = 20;
const SIGNAL_W = 18;
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
    const barY = STATUS_BAR_HEIGHT / 2;

    scene.add
      .rectangle(width / 2, barY, width, STATUS_BAR_HEIGHT, 0x000000, 0.55)
      .setScrollFactor(0);

    scene.add
      .text(STATUS_BAR_PAD, barY, '9:41', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    // Decorative chrome cluster (signal/wifi/battery), laid out right-to-left from the bar's
    // right edge, then the score/coin readouts continue the same right-to-left layout further in.
    const chrome = scene.add.graphics().setScrollFactor(0);
    chrome.fillStyle(0xffffff, 1);
    chrome.lineStyle(1.5, 0xffffff, 1);

    let cursor = width - STATUS_BAR_PAD;
    const batteryLeft = cursor - BATTERY_W;
    chrome.strokeRoundedRect(batteryLeft, barY - BATTERY_H / 2, BATTERY_W, BATTERY_H, 2);
    chrome.fillRect(cursor, barY - BATTERY_NUB_W, BATTERY_NUB_W, BATTERY_NUB_W * 2);
    chrome.fillRect(batteryLeft + 2, barY - BATTERY_H / 2 + 2, BATTERY_W - 4, BATTERY_H - 4);
    cursor = batteryLeft - ICON_GAP;

    const wifiCenterX = cursor - WIFI_W / 2;
    chrome.fillCircle(wifiCenterX, barY + 5, 1.5);
    for (const radius of [4, 7, 10]) {
      chrome.beginPath();
      chrome.arc(wifiCenterX, barY + 5, radius, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      chrome.strokePath();
    }
    cursor -= WIFI_W + ICON_GAP;

    const signalLeft = cursor - SIGNAL_W;
    const barHeights = [5, 8, 11, 14];
    const barWidth = 3;
    barHeights.forEach((h, i) => {
      const barX = signalLeft + i * (barWidth + 2);
      chrome.fillRect(barX, barY + 7 - h, barWidth, h);
    });
    cursor = signalLeft - ICON_GAP;

    // Coin readout: a small filled circle (matches the coin pickup's yellow tint) plus a
    // fixed-slot, right-anchored number so the digits grow leftward without disturbing the icon.
    const coinNumberX = cursor;
    cursor -= NUMBER_SLOT;
    const coinIconX = cursor - ICON_GLYPH_W / 2;
    chrome.fillStyle(0xfacc15, 1);
    chrome.fillCircle(coinIconX, barY, ICON_GLYPH_W / 2 - 2);
    cursor -= ICON_GLYPH_W + ICON_GAP;

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

    scene.add
      .text(width / 2, 60, worldName, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.powerupText = scene.add
      .text(width - 24, STATUS_BAR_HEIGHT + 8, '', {
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
      .text(24, STATUS_BAR_HEIGHT + 8, '< Home', {
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
      .text(24, STATUS_BAR_HEIGHT + 48, scene.sound.mute ? 'Unmute' : 'Mute', {
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
