import Phaser from 'phaser';
import type { SignatureMechanic, SignatureMechanicContext } from '@/data/worldContent';

// ChatZap's signature mechanic (GDD section 7): "incoming messages push
// nearby obstacles." Every few seconds, the 1-2 nearest oncoming obstacles
// get a brief extra leftward speed boost, as if an incoming message just
// shoved them toward the player. The boost is modest and time-limited so it
// never closes a gap enough to violate the GDD's "every obstacle must
// always be avoidable" fairness rule - it's well under ObstacleManager's
// built-in minimum gap between obstacles.
const TRIGGER_MIN_MS = 4000;
const TRIGGER_MAX_MS = 6000;
const LOOKAHEAD_MIN_PX = 200;
const LOOKAHEAD_MAX_PX = 500;
const MAX_TARGETS = 2;
const PUSH_EXTRA_VELOCITY = 260; // px/s added on top of the normal scroll speed
const PUSH_DURATION_MS = 300;
const BUBBLE_TRAVEL_MS = 300;

interface PushEntry {
  obstacle: Phaser.Physics.Arcade.Image;
  remainingMs: number;
}

export class ChatZapMechanic implements SignatureMechanic {
  private scene: Phaser.Scene;
  private ctx: SignatureMechanicContext;
  private msUntilTrigger: number;
  private pushed: PushEntry[] = [];

  constructor(scene: Phaser.Scene, ctx: SignatureMechanicContext) {
    this.scene = scene;
    this.ctx = ctx;
    this.msUntilTrigger = this.randomInterval();
  }

  private randomInterval(): number {
    return TRIGGER_MIN_MS + Math.random() * (TRIGGER_MAX_MS - TRIGGER_MIN_MS);
  }

  update(delta: number): void {
    this.msUntilTrigger -= delta;
    if (this.msUntilTrigger <= 0) {
      this.msUntilTrigger = this.randomInterval();
      this.triggerPush();
    }
    this.reapplyPushes(delta);
  }

  private triggerPush(): void {
    const playerX = this.ctx.character.gameObject.x;
    const targets = this.ctx
      .getObstacles()
      .filter(
        (obstacle) =>
          obstacle.active &&
          obstacle.x > playerX + LOOKAHEAD_MIN_PX &&
          obstacle.x <= playerX + LOOKAHEAD_MAX_PX,
      )
      .sort((a, b) => a.x - b.x)
      .slice(0, MAX_TARGETS);

    for (const obstacle of targets) {
      const existing = this.pushed.find((entry) => entry.obstacle === obstacle);
      if (existing) {
        existing.remainingMs = PUSH_DURATION_MS;
      } else {
        this.pushed.push({ obstacle, remainingMs: PUSH_DURATION_MS });
      }
      this.spawnMessageBubble(obstacle);
    }
  }

  // ObstacleManager.setScrollSpeed() runs every frame before this and
  // unconditionally resets each obstacle's velocityX to -scrollSpeed, so a
  // one-off setVelocityX() here would get clobbered almost immediately.
  // Instead, re-boost every frame the push window is still open (WorldScene
  // calls this mechanic's update() after ObstacleManager's).
  private reapplyPushes(delta: number): void {
    for (let i = this.pushed.length - 1; i >= 0; i--) {
      const entry = this.pushed[i];
      entry.remainingMs -= delta;
      const body = entry.obstacle.active
        ? (entry.obstacle.body as Phaser.Physics.Arcade.Body | null)
        : null;
      if (!body || entry.remainingMs <= 0) {
        this.pushed.splice(i, 1);
        continue;
      }
      entry.obstacle.setVelocityX(body.velocity.x - PUSH_EXTRA_VELOCITY);
    }
  }

  // Optional visual polish: a small speech-bubble glyph flies from the
  // player toward the pushed obstacle to make the "incoming message" cause
  // legible, then fades out.
  private spawnMessageBubble(obstacle: Phaser.Physics.Arcade.Image): void {
    const startX = this.ctx.character.gameObject.x;
    const startY = obstacle.y - obstacle.displayHeight - 20;
    const bubble = this.scene.add.text(startX, startY, '\u{1F4AC}', { fontSize: '26px' });
    bubble.setOrigin(0.5, 0.5);
    bubble.setDepth(50);

    this.scene.tweens.add({
      targets: bubble,
      x: obstacle.x,
      y: obstacle.y - obstacle.displayHeight - 10,
      alpha: { from: 1, to: 0 },
      duration: BUBBLE_TRAVEL_MS,
      onComplete: () => bubble.destroy(),
    });
  }

  destroy(): void {
    this.pushed = [];
  }
}
