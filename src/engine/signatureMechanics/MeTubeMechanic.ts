import Phaser from 'phaser';
import type { SignatureMechanic, SignatureMechanicContext } from '@/data/worldContent';

const AD_MIN_INTERVAL_MS = 10_000;
const AD_MAX_INTERVAL_MS = 15_000;
const AD_DURATION_MS = 1_800;
const AD_DEPTH = 1_000;

// MeTube's signature mechanic: an unskippable "ad" briefly interrupts the
// view every ~10-15s. Per the task scope this is visual-only and
// timing-based - it does not pause physics/scrolling/input, since that would
// require deeper WorldScene changes out of scope for this pass. A
// translucent overlay plus "Ad" + fake skip-countdown text is drawn
// screen-space (scrollFactor 0, high depth) and removed after ~1.5-2s.
export class MeTubeMechanic implements SignatureMechanic {
  private scene: Phaser.Scene;
  private msUntilNextAd: number;
  private adRemainingMs = 0;
  private overlay?: Phaser.GameObjects.Rectangle;
  private adText?: Phaser.GameObjects.Text;
  private skipText?: Phaser.GameObjects.Text;

  // ctx is unused by this mechanic (no obstacle/character interaction),
  // kept in the signature to match the shared SignatureMechanic factory shape.
  constructor(scene: Phaser.Scene, _ctx: SignatureMechanicContext) {
    this.scene = scene;
    this.msUntilNextAd = this.randomInterval();
  }

  get isAdShowing(): boolean {
    return this.adRemainingMs > 0;
  }

  private randomInterval(): number {
    return AD_MIN_INTERVAL_MS + Math.random() * (AD_MAX_INTERVAL_MS - AD_MIN_INTERVAL_MS);
  }

  update(delta: number): void {
    if (this.adRemainingMs > 0) {
      this.adRemainingMs = Math.max(0, this.adRemainingMs - delta);
      this.updateSkipText();
      if (this.adRemainingMs === 0) {
        this.hideAd();
      }
      return;
    }

    this.msUntilNextAd -= delta;
    if (this.msUntilNextAd <= 0) {
      this.showAd();
      this.msUntilNextAd = this.randomInterval();
    }
  }

  private showAd(): void {
    const { width, height } = this.scene.scale;
    this.adRemainingMs = AD_DURATION_MS;

    this.overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(AD_DEPTH);
    this.adText = this.scene.add
      .text(width / 2, height / 2 - 20, 'Ad', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(AD_DEPTH + 1);
    this.skipText = this.scene.add
      .text(width / 2, height / 2 + 24, '', {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'sans-serif',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(AD_DEPTH + 1);
    this.updateSkipText();
  }

  private updateSkipText(): void {
    if (!this.skipText) {
      return;
    }
    const secondsLeft = Math.max(1, Math.ceil(this.adRemainingMs / 1000));
    this.skipText.setText(`Skip in ${secondsLeft}...`);
  }

  private hideAd(): void {
    this.overlay?.destroy();
    this.adText?.destroy();
    this.skipText?.destroy();
    this.overlay = undefined;
    this.adText = undefined;
    this.skipText = undefined;
  }

  destroy(): void {
    this.hideAd();
  }
}
