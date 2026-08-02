import Phaser from 'phaser';
import { getEquippedColor } from '@/data/cosmetics';
import { SaveManager } from '@/save/SaveManager';

// Shared "this is a phone" chrome, drawn identically on every scene per the user's explicit
// request that the whole app - not just the in-run HUD (Task 41) - read as a phone. Four pieces:
// a case-bezel border, a top status bar (real local time + decorative signal/wifi/battery,
// entirely inside the bezel rather than drawn under/over it), a speaker+camera cutout on the LEFT
// edge, and a circular home button on the RIGHT edge - both vertically centered on the screen. The
// user described this as "the phone rotated 90 degrees left": a real phone's top edge (speaker +
// camera) rotates to the left side, and its bottom edge (home button) rotates to the right side,
// while the status bar itself stays unrotated at the top.
//
// The whole frame is inset from the canvas edges by SCREEN_PADDING and drawn with rounded corners
// (a plain edge-to-edge rectangle read as an app border, not a device) - per user feedback that
// the frame needs breathing room and a more accurate silhouette to actually look like a phone.
const SCREEN_PADDING = 20;
const CORNER_RADIUS = 40;
const BEZEL_THICKNESS = 14;
// Neutral backdrop for the padding outside the phone - distinct from whatever color the phone's
// own screen happens to be showing (wallpaper, a world's color, etc.), so the device visibly
// floats over it instead of blending in.
const OUTSIDE_BACKGROUND_COLOR = 0xffffff;

const STATUS_BAR_HEIGHT = 40;
// The status bar sits flush against the top of the screen, so its own top-right corner is drawn
// rounded too - otherwise its sharp corner pokes past the phone's rounded corner into the bezel.
const STATUS_BAR_CORNER_RADIUS = 16;
const STATUS_BAR_PAD = 16;
const ICON_GAP = 10;
const BATTERY_W = 22;
const BATTERY_H = 11;
const BATTERY_NUB_W = 2;
const WIFI_W = 20;
const SIGNAL_W = 18;
// Generous fixed slot per number readout so the layout never has to reflow as digits are gained -
// the icon to a number's left stays put rather than chasing the number's growing edge.
const NUMBER_SLOT = 54;
const ICON_GLYPH_W = 12;
// How often the clock re-reads the system time - a phone status bar clock only needs
// minute-level freshness, but a short interval keeps it feeling "live" without meaningful cost.
const CLOCK_REFRESH_MS = 10_000;

// The notch sits a little clear of the bezel ("slightly to the right" per the user, so it doesn't
// crowd the border) and is vertically centered on the screen, not tied to the status bar at all.
const NOTCH_LEFT_MARGIN = 8;
const NOTCH_WIDTH = 34;
const NOTCH_PAD = 12;
const NOTCH_RADIUS = 12;
const SPEAKER_W = 10;
const SPEAKER_H = 140;
const SPEAKER_CAMERA_GAP = 16;
const CAMERA_RADIUS = 6;
const NOTCH_HEIGHT = NOTCH_PAD * 2 + SPEAKER_H + SPEAKER_CAMERA_GAP + CAMERA_RADIUS * 2;

// Physical home button, mirrored to the RIGHT edge and vertically centered - per the same "phone
// rotated 90 degrees left" framing as the notch: a real phone's home button lives on the BOTTOM
// edge, and rotating the device 90 degrees left carries the bottom edge to the right side.
const HOME_BUTTON_RADIUS = 30;
const HOME_BUTTON_RIGHT_MARGIN = 20;

export class PhoneFrame {
  readonly statusBarHeight = STATUS_BAR_HEIGHT;
  // Vertical center of the status bar - callers adding their own content into the bar (e.g.
  // WorldScene's score/coins) vertically-center their text/icons on this.
  readonly statusBarCenterY: number;
  // y-coordinate immediately below the status bar - callers anchor their own next content row here.
  readonly statusBarBottomY: number;
  // x-coordinate immediately left of the decorative signal/wifi/battery cluster - callers that
  // need to add their own right-aligned readouts into the status bar (WorldScene's score/coins)
  // anchor their own content starting here instead of re-deriving the same layout math.
  readonly statusBarContentRightX: number;
  // Left padding that clears the bezel - callers position their own left-aligned content here.
  readonly contentLeftX: number;
  // x-coordinate immediately right of the left-edge notch - callers with static content that
  // spans the screen's vertical middle (e.g. Customize's swatch grid) should start there instead
  // of at `contentLeftX`, since the notch itself sits in that band and would otherwise overlap it.
  readonly notchRightX: number;
  // Right inner edge of the screen (before the bezel) - callers centering content within the
  // usable width (e.g. Customize's swatch rows, which must also clear the notch on the left) use
  // this as the right bound.
  readonly screenRightX: number;

  // `showCoins`: whether PhoneFrame draws the wallet coin balance into the bar itself. Defaults
  // to true (Home/Results/Customize/Boot all want it there instead of a separate box). WorldScene
  // passes false because it already shows a *different* number in that exact slot - the live
  // count of coins collected so far *this run* (Task 41), not the lifetime wallet balance - so it
  // builds its own readout rather than getting a second, conflicting one from here.
  // `showHomeButton`: whether PhoneFrame draws the physical-style circular home button. Defaults
  // to true; HomeScene passes false since navigating "home" from Home is meaningless, and
  // ResultsScene passes false because it already has its own explicit "Home" choice alongside
  // "Retry" as its primary CTA pair - a second, redundant home affordance would be confusing there.
  constructor(scene: Phaser.Scene, options: { showCoins?: boolean; showHomeButton?: boolean } = {}) {
    const { width, height } = scene.scale;
    const showCoins = options.showCoins ?? true;
    const showHomeButton = options.showHomeButton ?? true;

    // `outerX0/Y0/X1/Y1` is the phone's true visible outer edge (SCREEN_PADDING in from the
    // canvas). `strokeRoundedRect` centers its line on the path it's given, so the path itself
    // has to be inset by half the bezel thickness for the stroke's OUTER edge to land exactly on
    // that boundary - and by the same logic, the stroke's INNER edge (where the screen starts)
    // lands a full bezel thickness in from `outerX0/Y0`, not the half-thickness a naive read of
    // the path position would suggest. Getting this wrong is what previously left a gap between
    // the border and the status bar, showing the background color through it.
    const outerX0 = SCREEN_PADDING;
    const outerY0 = SCREEN_PADDING;
    const outerX1 = width - SCREEN_PADDING;
    const outerY1 = height - SCREEN_PADDING;
    const pathX0 = outerX0 + BEZEL_THICKNESS / 2;
    const pathY0 = outerY0 + BEZEL_THICKNESS / 2;
    const pathWidth = outerX1 - outerX0 - BEZEL_THICKNESS;
    const pathHeight = outerY1 - outerY0 - BEZEL_THICKNESS;
    const screenX0 = outerX0 + BEZEL_THICKNESS;
    const screenY0 = outerY0 + BEZEL_THICKNESS;
    const screenX1 = outerX1 - BEZEL_THICKNESS;
    const screenY1 = outerY1 - BEZEL_THICKNESS;
    const screenCenterY = (screenY0 + screenY1) / 2;

    this.statusBarCenterY = screenY0 + STATUS_BAR_HEIGHT / 2;
    this.statusBarBottomY = screenY0 + STATUS_BAR_HEIGHT;
    this.contentLeftX = screenX0 + 10;
    this.notchRightX = screenX0 + NOTCH_LEFT_MARGIN + NOTCH_WIDTH;
    this.screenRightX = screenX1;

    // Neutral backdrop for the area outside the phone, drawn as four strips around its bounding
    // box (not one full-canvas fill) so it never paints over the phone's own screen content -
    // WorldScene in particular constructs PhoneFrame *after* its gameplay is already drawn, so an
    // opaque fill spanning the whole canvas would have hidden it.
    const backdrop = scene.add.graphics().setScrollFactor(0);
    backdrop.fillStyle(OUTSIDE_BACKGROUND_COLOR, 1);
    backdrop.fillRect(0, 0, width, outerY0);
    backdrop.fillRect(0, outerY1, width, height - outerY1);
    backdrop.fillRect(0, outerY0, outerX0, outerY1 - outerY0);
    backdrop.fillRect(outerX1, outerY0, width - outerX1, outerY1 - outerY0);

    // A soft drop shadow (a slightly larger, faint rounded rect offset down-right) sits behind the
    // body outline to lift it off the background, then the body itself - both just strokes, so
    // nothing behind them (a scene's own content) is ever painted over.
    const shadow = scene.add.graphics().setScrollFactor(0);
    shadow.lineStyle(BEZEL_THICKNESS, 0x000000, 0.25);
    shadow.strokeRoundedRect(pathX0 + 3, pathY0 + 5, pathWidth, pathHeight, CORNER_RADIUS);

    scene.add
      .graphics()
      .setScrollFactor(0)
      .lineStyle(BEZEL_THICKNESS, getEquippedColor('phoneSkin'), 1)
      .strokeRoundedRect(pathX0, pathY0, pathWidth, pathHeight, CORNER_RADIUS);

    // The left-edge notch (drawn below) is conceptually part of the phone's body, not the
    // display - so the bar (and everything in it) starts clear of that whole column rather than
    // just the bezel, even though the notch itself only occupies the screen's vertical middle.
    const barX0 = this.notchRightX;
    const barWidth = screenX1 - barX0;
    const barY = this.statusBarCenterY;
    // A sharp-cornered rect here would poke its top-right corner past the phone's rounded corner
    // (the bar sits flush against the top of the screen, right where that curve is) - rounding it
    // keeps the bar's own corner inside the frame.
    scene.add
      .graphics()
      .setScrollFactor(0)
      .fillStyle(0x000000, 0.55)
      .fillRoundedRect(barX0, screenY0, barWidth, STATUS_BAR_HEIGHT, {
        tl: 0,
        tr: STATUS_BAR_CORNER_RADIUS,
        bl: 0,
        br: 0,
      });

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

    let cursor = screenX1 - STATUS_BAR_PAD;
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

    if (showCoins) {
      // Coin readout: a small filled circle (matches the coin pickup's yellow tint) plus a
      // fixed-slot, right-anchored number so the digits grow leftward without disturbing the icon.
      const coinNumberX = cursor;
      cursor -= NUMBER_SLOT;
      const coinIconX = cursor - ICON_GLYPH_W / 2;
      chrome.fillStyle(0xfacc15, 1);
      chrome.fillCircle(coinIconX, barY, ICON_GLYPH_W / 2 - 2);
      cursor -= ICON_GLYPH_W + ICON_GAP;

      scene.add
        .text(coinNumberX, barY, `${SaveManager.totalCoins}`, {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#facc15',
        })
        .setOrigin(1, 0.5)
        .setScrollFactor(0);
    }

    this.statusBarContentRightX = cursor;

    // Left-edge speaker + camera cutout, vertically centered on the screen and "rotated 90
    // degrees" from a normal phone's top-center notch - see TASKS.md's Task 41 follow-up note for
    // why.
    const notchX = screenX0 + NOTCH_LEFT_MARGIN;
    const notchY = screenCenterY - NOTCH_HEIGHT / 2;
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

    if (showHomeButton) {
      const homeX = screenX1 - HOME_BUTTON_RIGHT_MARGIN - HOME_BUTTON_RADIUS;
      const homeY = screenCenterY;
      const homeButton = scene.add
        .circle(homeX, homeY, HOME_BUTTON_RADIUS, 0x1e293b)
        .setStrokeStyle(2, 0x94a3b8)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      homeButton.on('pointerdown', () => scene.scene.start('Home'));
    }
  }
}

function formatClockTime(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
