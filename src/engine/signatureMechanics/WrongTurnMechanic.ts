import Phaser from 'phaser';
import type { SignatureMechanic, SignatureMechanicContext } from '@/data/worldContent';

const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = 7000;
const SLIDE_IN_MS = 350;
const HOLD_MS = 900;
const FADE_OUT_MS = 400;
const SIGN_TEXTURE_KEY = 'wrongturn_sign';

// WrongTurn's signature mechanic per the GDD is "roads split into multiple
// lanes requiring quick choices." The engine currently has no lateral
// input or lane system at all - the player's x-position is fixed, and only
// jump/slide exist as inputs (see CharacterController/InputManager). Adding
// real lane-switching (new input, lane-aware obstacle placement, new
// collision logic) is a much bigger feature than any other world's
// signature mechanic and is out of scope for this task.
//
// This is a lighter visual approximation instead: a periodic "fork ahead"
// road-sign cue that slides in from the right edge of the screen, holds
// briefly, then fades out. It's purely decorative screen-space dressing -
// it never reads or writes obstacle/coin/player state - just enough to
// signal the theme at the same scope level as the other worlds' mechanics.
export class WrongTurnMechanic implements SignatureMechanic {
  private scene: Phaser.Scene;
  private msUntilNextSign: number;
  private sign?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, _ctx: SignatureMechanicContext) {
    this.scene = scene;
    this.msUntilNextSign = this.randomInterval();
  }

  private randomInterval(): number {
    return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
  }

  update(delta: number): void {
    this.msUntilNextSign -= delta;
    if (this.msUntilNextSign <= 0) {
      this.msUntilNextSign = this.randomInterval();
      this.spawnSign();
    }
  }

  private spawnSign(): void {
    const { width, height } = this.scene.scale;
    const targetX = width - 140;
    const y = height * 0.32;

    // Only one sign cue on screen at a time - replace any still-fading one
    // rather than stacking them.
    this.sign?.destroy();

    const sign = this.scene.add
      .image(width + 60, y, SIGN_TEXTURE_KEY)
      .setScrollFactor(0)
      .setDepth(50)
      .setAlpha(0);
    this.sign = sign;

    this.scene.tweens.add({
      targets: sign,
      x: targetX,
      alpha: 1,
      duration: SLIDE_IN_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: sign,
          alpha: 0,
          duration: FADE_OUT_MS,
          delay: HOLD_MS,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            sign.destroy();
            if (this.sign === sign) {
              this.sign = undefined;
            }
          },
        });
      },
    });
  }

  destroy(): void {
    this.sign?.destroy();
    this.sign = undefined;
  }
}
