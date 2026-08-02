import Phaser from 'phaser';
import { getEquippedColor } from '@/data/cosmetics';

// Shared "this is a phone" chrome, drawn identically on every scene per the user's explicit
// request that the whole app - not just the in-run HUD (Task 41) - read as a phone. Three pieces:
// a case-bezel border (previously only drawn ad hoc by HomeScene), a top status bar (time +
// decorative signal/wifi/battery, factored out of Task 41's UIManager), and a speaker+camera
// cutout on the LEFT edge rather than top-center - the user described this as "the phone rotated
// 90 degrees," i.e. the hardware cluster that's normally centered on a portrait phone's top edge
// now sits on the left edge instead, while the status bar itself stays unrotated at the top.
const BEZEL_THICKNESS = 14;

const STATUS_BAR_HEIGHT = 40;
const STATUS_BAR_PAD = 16;
const ICON_GAP = 10;
const BATTERY_W = 22;
const BATTERY_H = 11;
const BATTERY_NUB_W = 2;
const WIFI_W = 20;
const SIGNAL_W = 18;

const NOTCH_X = 6;
const NOTCH_WIDTH = 26;
const NOTCH_HEIGHT = 90;
const NOTCH_RADIUS = 10;
const SPEAKER_W = 6;
const SPEAKER_H = 30;
const SPEAKER_TOP_MARGIN = 14;
const CAMERA_RADIUS = 4;
const CAMERA_TOP_MARGIN = 16;

export class PhoneFrame {
  readonly statusBarHeight = STATUS_BAR_HEIGHT;
  // x-coordinate immediately left of the decorative signal/wifi/battery cluster - callers that
  // need to add their own right-aligned readouts into the status bar (WorldScene's score/coins)
  // anchor their own content starting here instead of re-deriving the same layout math.
  readonly statusBarContentRightX: number;
  // Right edge of the left-side notch, in x - content that would otherwise sit flush against the
  // left edge (back buttons, balance readouts) should start no earlier than this.
  readonly notchRightX = NOTCH_X + NOTCH_WIDTH;
  // Bottom edge of the notch, in y - content below the status bar but still near the left edge
  // should clear this too.
  readonly notchBottomY = STATUS_BAR_HEIGHT + 6 + NOTCH_HEIGHT;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    scene.add
      .rectangle(width / 2, height / 2, width - BEZEL_THICKNESS, height - BEZEL_THICKNESS)
      .setStrokeStyle(BEZEL_THICKNESS, getEquippedColor('phoneSkin'))
      .setOrigin(0.5)
      .setScrollFactor(0);

    const barY = STATUS_BAR_HEIGHT / 2;
    scene.add.rectangle(width / 2, barY, width, STATUS_BAR_HEIGHT, 0x000000, 0.55).setScrollFactor(0);
    scene.add
      .text(STATUS_BAR_PAD, barY, '9:41', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

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

    this.statusBarContentRightX = cursor;

    const notch = scene.add.graphics().setScrollFactor(0);
    const notchY = STATUS_BAR_HEIGHT + 6;
    notch.fillStyle(0x000000, 0.85);
    notch.fillRoundedRect(NOTCH_X, notchY, NOTCH_WIDTH, NOTCH_HEIGHT, NOTCH_RADIUS);
    notch.fillStyle(0x334155, 1);
    notch.fillRoundedRect(
      NOTCH_X + (NOTCH_WIDTH - SPEAKER_W) / 2,
      notchY + SPEAKER_TOP_MARGIN,
      SPEAKER_W,
      SPEAKER_H,
      SPEAKER_W / 2,
    );
    const cameraY = notchY + SPEAKER_TOP_MARGIN + SPEAKER_H + CAMERA_TOP_MARGIN;
    notch.fillStyle(0x0f172a, 1);
    notch.fillCircle(NOTCH_X + NOTCH_WIDTH / 2, cameraY, CAMERA_RADIUS);
    notch.lineStyle(1, 0x475569, 1);
    notch.strokeCircle(NOTCH_X + NOTCH_WIDTH / 2, cameraY, CAMERA_RADIUS);
  }
}
