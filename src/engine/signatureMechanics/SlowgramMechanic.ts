import Phaser from 'phaser';
import type { SignatureMechanic, SignatureMechanicContext } from '@/data/worldContent';

const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = 8000;
const FLASH_PEAK_ALPHA = 0.85;
const FLASH_IN_MS = 150;
const FLASH_OUT_MS = 200;

// Slowgram's signature mechanic: a camera flash briefly whites out the
// screen, per the GDD's "camera flashes briefly blind the player." Purely a
// visual overlay - it never touches collision/physics, so it can't itself
// cause an unavoidable death (per the GDD's obstacle-fairness rule); it's a
// startling moment, not a genuine several-hundred-ms blackout.
export class SlowgramMechanic implements SignatureMechanic {
  private scene: Phaser.Scene;
  private msUntilNextFlash: number;
  private overlay?: Phaser.GameObjects.Rectangle;
  private isDestroyed = false;

  constructor(scene: Phaser.Scene, _ctx: SignatureMechanicContext) {
    this.scene = scene;
    this.msUntilNextFlash = this.randomInterval();
  }

  private randomInterval(): number {
    return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
  }

  update(delta: number): void {
    if (this.isDestroyed) {
      return;
    }
    this.msUntilNextFlash -= delta;
    if (this.msUntilNextFlash <= 0) {
      this.triggerFlash();
      this.msUntilNextFlash = this.randomInterval();
    }
  }

  private triggerFlash(): void {
    const { width, height } = this.scene.scale;
    const overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0xffffff)
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0);
    this.overlay = overlay;

    this.scene.tweens.add({
      targets: overlay,
      alpha: FLASH_PEAK_ALPHA,
      duration: FLASH_IN_MS,
      ease: 'Quad.easeOut',
      yoyo: false,
      onComplete: () => {
        this.scene.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: FLASH_OUT_MS,
          ease: 'Quad.easeIn',
          onComplete: () => {
            overlay.destroy();
            if (this.overlay === overlay) {
              this.overlay = undefined;
            }
          },
        });
      },
    });
  }

  destroy(): void {
    this.isDestroyed = true;
    this.overlay?.destroy();
    this.overlay = undefined;
  }
}
