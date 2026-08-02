import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';

const JUMP_VELOCITY = -600;
const SLIDE_DURATION_MS = 700;
const SLIDE_SCALE_Y = 0.5;

// The player's sprite (and every obstacle's, see ObstacleManager) is noticeably bigger than the
// shape actually drawn on it, so a hit/overlap box sized to the full texture registers collisions
// well before the sprites visually touch ("I jumped/landed and wasn't even touching it" -
// reported directly). Shrinking the box and anchoring it to the ground (trimming only off the
// top) keeps grounded collision with InfiniteGround accurate while giving real forgiveness on the
// axis that actually matters for clearing an obstacle mid-jump.
const HITBOX_WIDTH_RATIO = 0.6;
const HITBOX_HEIGHT_RATIO = 0.8;

export type CharacterState = 'idle' | 'running' | 'jump' | 'slide' | 'hit' | 'victory';

export class CharacterController {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private isSliding = false;
  private slideEndTime = 0;
  private normalBodyHeight = 0;
  private normalBodyOffsetY = 0;
  private state: CharacterState = 'idle';
  private isDead = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setCollideWorldBounds(false);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const fullWidth = body.width;
    const fullHeight = body.height;
    const hitboxWidth = fullWidth * HITBOX_WIDTH_RATIO;
    const hitboxHeight = fullHeight * HITBOX_HEIGHT_RATIO;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((fullWidth - hitboxWidth) / 2, fullHeight - hitboxHeight);

    this.normalBodyHeight = body.height;
    this.normalBodyOffsetY = body.offset.y;
    // Caps how far the body can move in a single physics step, so a large frame-time
    // spike (tab backgrounded, device locked, slow resize) can't tunnel the player
    // through the ground instead of colliding with it.
    body.deltaMax.y = this.normalBodyHeight;

    EventBus.on(GameEvents.PLAYER_JUMPED, this.onJump, this);
    EventBus.on(GameEvents.PLAYER_SLID, this.onSlide, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get gameObject(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  get currentState(): CharacterState {
    return this.state;
  }

  private isGrounded(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  private onJump(): void {
    if (this.isDead || this.isSliding || !this.isGrounded()) {
      return;
    }
    this.sprite.setVelocityY(JUMP_VELOCITY);
    this.setState('jump');
  }

  private onSlide(): void {
    if (this.isDead || this.isSliding || !this.isGrounded()) {
      return;
    }
    this.isSliding = true;
    this.slideEndTime = this.scene.time.now + SLIDE_DURATION_MS;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const slideHeight = this.normalBodyHeight * SLIDE_SCALE_Y;
    body.setSize(body.width, slideHeight);
    body.setOffset(body.offset.x, this.normalBodyOffsetY + (this.normalBodyHeight - slideHeight));
    this.sprite.setScale(1, SLIDE_SCALE_Y);
    this.setState('slide');
  }

  private endSlide(): void {
    this.isSliding = false;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(body.width, this.normalBodyHeight);
    body.setOffset(body.offset.x, this.normalBodyOffsetY);
    this.sprite.setScale(1, 1);
  }

  private setState(state: CharacterState): void {
    this.state = state;
  }

  setInvincible(active: boolean): void {
    if (this.isDead) {
      return;
    }
    if (active) {
      this.sprite.setTint(0x38bdf8);
    } else {
      this.sprite.clearTint();
    }
  }

  die(): void {
    if (this.isDead) {
      return;
    }
    this.isDead = true;
    this.setState('hit');
    this.sprite.setTint(0xff4444);
    this.sprite.setVelocityX(0);
  }

  update(): void {
    if (this.isDead) {
      return;
    }

    if (this.isSliding && this.scene.time.now >= this.slideEndTime) {
      this.endSlide();
    }

    if (!this.isSliding) {
      this.setState(this.isGrounded() ? 'running' : 'jump');
    }
  }

  destroy(): void {
    EventBus.off(GameEvents.PLAYER_JUMPED, this.onJump, this);
    EventBus.off(GameEvents.PLAYER_SLID, this.onSlide, this);
  }
}
