import Phaser from 'phaser';
import type { SignatureMechanic, SignatureMechanicContext } from '@/data/worldContent';

// Legbook's signature mechanic (GDD section 5): "Floating reaction bubbles
// partially obscure visibility." Purely a screen-space visual overlay - it
// never touches physics bodies or obstacle placement, so per the GDD's
// fairness rule every obstacle stays avoidable; the bubbles just make
// reading the lane briefly harder, like a notification storm would.
const SPAWN_MIN_DELAY_MS = 4000;
const SPAWN_MAX_DELAY_MS = 6000;
const MIN_BUBBLES_PER_BURST = 3;
const MAX_BUBBLES_PER_BURST = 5;
const BUBBLE_LIFETIME_MS = 1500;
const BUBBLE_RADIUS = 22;
const BUBBLE_ALPHA = 0.55;

// The distinct glyph/color pairs a reaction bubble can be drawn as - keeps
// the "likes/hearts/laughs" flavor from the GDD without needing a texture
// asset per emoji (drawn procedurally with Arc + Text, see spawnBubble()).
const REACTIONS: Array<{ glyph: string; color: number }> = [
  { glyph: '❤', color: 0xf43f5e }, // heart / like
  { glyph: '👍', color: 0x38bdf8 }, // thumbs up
  { glyph: '😂', color: 0xfacc15 }, // laugh
];

// Publicly identifiable name so verification/tests can filter the scene's
// display list for active bubbles without a direct reference to this class.
export const LEGBOOK_BUBBLE_NAME = 'legbook-bubble';

export class LegbookMechanic implements SignatureMechanic {
  private scene: Phaser.Scene;
  private msUntilNextBurst: number;
  private activeBubbles: Phaser.GameObjects.Container[] = [];
  private destroyed = false;

  constructor(scene: Phaser.Scene, _ctx: SignatureMechanicContext) {
    this.scene = scene;
    this.msUntilNextBurst = this.randomDelay();
  }

  update(delta: number): void {
    if (this.destroyed) {
      return;
    }
    this.msUntilNextBurst -= delta;
    if (this.msUntilNextBurst <= 0) {
      this.spawnBurst();
      this.msUntilNextBurst = this.randomDelay();
    }
  }

  destroy(): void {
    this.destroyed = true;
    for (const bubble of this.activeBubbles) {
      this.scene.tweens.killTweensOf(bubble);
      bubble.destroy();
    }
    this.activeBubbles = [];
  }

  private randomDelay(): number {
    return SPAWN_MIN_DELAY_MS + Math.random() * (SPAWN_MAX_DELAY_MS - SPAWN_MIN_DELAY_MS);
  }

  private spawnBurst(): void {
    const { width, height } = this.scene.scale;
    const count =
      MIN_BUBBLES_PER_BURST + Math.floor(Math.random() * (MAX_BUBBLES_PER_BURST - MIN_BUBBLES_PER_BURST + 1));
    for (let i = 0; i < count; i++) {
      this.spawnBubble(width, height);
    }
  }

  // Upper-middle band of the screen (15%-45% of height), spread across most
  // of the width, so bubbles overlap the player's forward view without ever
  // sitting on the ground line where obstacles/coins actually are.
  private spawnBubble(width: number, height: number): void {
    const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    const startX = width * (0.1 + Math.random() * 0.7);
    const startY = height * (0.15 + Math.random() * 0.3);
    const driftX = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 100);
    const driftY = -20 - Math.random() * 40;

    const circle = this.scene.add.circle(0, 0, BUBBLE_RADIUS, reaction.color, BUBBLE_ALPHA);
    const label = this.scene.add.text(0, 0, reaction.glyph, { fontSize: '22px' }).setOrigin(0.5);

    const bubble = this.scene.add.container(startX, startY, [circle, label]);
    bubble.setName(LEGBOOK_BUBBLE_NAME);
    bubble.setScrollFactor(0);
    bubble.setDepth(1000);
    bubble.setAlpha(0);
    this.activeBubbles.push(bubble);

    this.scene.tweens.add({
      targets: bubble,
      alpha: BUBBLE_ALPHA,
      duration: BUBBLE_LIFETIME_MS * 0.2,
      ease: 'Sine.easeOut',
    });
    this.scene.tweens.add({
      targets: bubble,
      x: startX + driftX,
      y: startY + driftY,
      duration: BUBBLE_LIFETIME_MS,
      ease: 'Sine.easeInOut',
    });
    this.scene.tweens.add({
      targets: bubble,
      alpha: 0,
      duration: BUBBLE_LIFETIME_MS * 0.3,
      delay: BUBBLE_LIFETIME_MS * 0.7,
      ease: 'Sine.easeIn',
      onComplete: () => {
        const index = this.activeBubbles.indexOf(bubble);
        if (index !== -1) {
          this.activeBubbles.splice(index, 1);
        }
        bubble.destroy();
      },
    });
  }
}
