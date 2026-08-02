import Phaser from 'phaser';
import { getEquippedColor } from '@/data/cosmetics';

// Shared "this is a phone" chrome, drawn identically on every scene per the user's explicit
// request that the whole app - not just the in-run HUD (Task 41) - read as a phone. Three pieces:
// a case-bezel border, a top status bar (real local time + decorative signal/wifi/battery,
// entirely inside the bezel rather than drawn under/over it), and a speaker+camera cutout on the
// LEFT edge, vertically centered on the screen - the user described this as "the phone rotated 90
// degrees," i.e. the hardware cluster that's normally centered on a portrait phone's top edge now
// sits on the left edge instead, while the status bar itself stays unrotated at the top.
const BEZEL_THICKNESS = 14;

const STATUS_BAR_HEIGHT = 40;
const STATUS_BAR_PAD = 16;
const ICON_GAP = 10;
const BATTERY_W = 22;
const BATTERY_H = 11;
const BATTERY_NUB_W = 2;
const WIFI_W = 20;
const SIGNAL_W = 18;
// How often the clock re-reads the system time - a phone status bar clock only needs
// minute-level freshness, but a short interval keeps it feeling "live" without meaningful cost.
const CLOCK_REFRESH_MS = 10_000;

// The notch sits a little clear of the bezel ("slightly to the right" per the user, so it doesn't
// crowd the border) and is vertically centered on the whole screen height, not tied to the status
// bar at all.
const NOTCH_LEFT_MARGIN = 8;
const NOTCH_WIDTH = 34;
const NOTCH_PAD = 12;
const NOTCH_RADIUS = 12;
const SPEAKER_W = 10;
const SPEAKER_H = 140;
const SPEAKER_CAMERA_GAP = 16;
const CAMERA_RADIUS = 6;
const NOTCH_HEIGHT = NOTCH_PAD * 2 + SPEAKER_H + SPEAKER_CAMERA_GAP + CAMERA_RADIUS * 2;

export class PhoneFrame {
  readonly statusBarHeight = STATUS_BAR_HEIGHT;
  // Vertical center of the status bar - callers adding their own content into the bar (e.g.
  // WorldScene's score/coins) vertically-center their text/icons on this.
  readonly statusBarCenterY = BEZEL_THICKNESS + STATUS_BAR_HEIGHT / 2;
  // y-coordinate immediately below the status bar - callers anchor their own next content row here.
  readonly statusBarBottomY = BEZEL_THICKNESS + STATUS_BAR_HEIGHT;
  // x-coordinate immediately left of the decorative signal/wifi/battery cluster - callers that
  // need to add their own right-aligned readouts into the status bar (WorldScene's score/coins)
  // anchor their own content starting here instead of re-deriving the same layout math.
  readonly statusBarContentRightX: number;
  // Left padding that clears the bezel - callers position their own left-aligned content here.
  readonly contentLeftX = BEZEL_THICKNESS + 10;
  // x-coordinate immediately right of the left-edge notch - callers with static content that
  // spans the screen's vertical middle (e.g. Customize's swatch grid) should start there instead
  // of at `contentLeftX`, since the notch itself sits in that band and would otherwise overlap it.
  readonly notchRightX = BEZEL_THICKNESS + NOTCH_LEFT_MARGIN + NOTCH_WIDTH;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    scene.add
      .rectangle(width / 2, height / 2, width - BEZEL_THICKNESS, height - BEZEL_THICKNESS)
      .setStrokeStyle(BEZEL_THICKNESS, getEquippedColor('phoneSkin'))
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Inset inside the bezel's inner edge on every side, so the bar sits on the screen area the
    // border frames rather than painting over (or under) the border itself.
    const barX0 = BEZEL_THICKNESS;
    const barWidth = width - BEZEL_THICKNESS * 2;
    const barY = this.statusBarCenterY;
    scene.add
      .rectangle(barX0 + barWidth / 2, barY, barWidth, STATUS_BAR_HEIGHT, 0x000000, 0.55)
      .setScrollFactor(0);

    const timeText = scene.add
      .text(barX0 + STATUS_BAR_PAD, barY, formatClockTime(), {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    const clockTimer = scene.time.addEvent({
      delay: CLOCK_REFRESH_MS,
      loop: true,
      callback: () => timeText.setText(formatClockTime()),
    });
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => clockTimer.remove());

    // Decorative chrome cluster (signal/wifi/battery), laid out right-to-left from the bar's
    // inner right edge.
    const chrome = scene.add.graphics().setScrollFactor(0);
    chrome.fillStyle(0xffffff, 1);
    chrome.lineStyle(1.5, 0xffffff, 1);

    let cursor = width - BEZEL_THICKNESS - STATUS_BAR_PAD;
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
    const barWidth2 = 3;
    barHeights.forEach((h, i) => {
      const barX = signalLeft + i * (barWidth2 + 2);
      chrome.fillRect(barX, barY + 7 - h, barWidth2, h);
    });
    cursor = signalLeft - ICON_GAP;

    this.statusBarContentRightX = cursor;

    // Left-edge speaker + camera cutout, vertically centered on the full screen height and
    // "rotated 90 degrees" from a normal phone's top-center notch - see TASKS.md's Task 41
    // follow-up note for why.
    const notchX = BEZEL_THICKNESS + NOTCH_LEFT_MARGIN;
    const notchY = height / 2 - NOTCH_HEIGHT / 2;
    const notch = scene.add.graphics().setScrollFactor(0);
    notch.fillStyle(0x000000, 0.85);
    notch.fillRoundedRect(notchX, notchY, NOTCH_WIDTH, NOTCH_HEIGHT, NOTCH_RADIUS);

    notch.fillStyle(0x334155, 1);
    notch.fillRoundedRect(
      notchX + (NOTCH_WIDTH - SPEAKER_W) / 2,
      notchY + NOTCH_PAD,
      SPEAKER_W,
      SPEAKER_H,
      SPEAKER_W / 2,
    );

    const cameraY = notchY + NOTCH_PAD + SPEAKER_H + SPEAKER_CAMERA_GAP + CAMERA_RADIUS;
    notch.fillStyle(0x0f172a, 1);
    notch.fillCircle(notchX + NOTCH_WIDTH / 2, cameraY, CAMERA_RADIUS);
    notch.lineStyle(1, 0x475569, 1);
    notch.strokeCircle(notchX + NOTCH_WIDTH / 2, cameraY, CAMERA_RADIUS);
  }
}

function formatClockTime(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
