import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';

const SWIPE_DISTANCE_THRESHOLD = 40;
const TAP_MAX_DISTANCE = 20;
const TAP_MAX_DURATION_MS = 250;

export class InputManager {
  private scene: Phaser.Scene;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private pointerStartTime = 0;
  private pointerStartedOnUi = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    scene.input.keyboard?.on('keydown-SPACE', this.onJumpKey, this);
    scene.input.keyboard?.on('keydown-DOWN', this.onSlideKey, this);

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointerup', this.onPointerUp, this);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private onJumpKey(): void {
    EventBus.emit(GameEvents.PLAYER_JUMPED);
  }

  private onSlideKey(): void {
    EventBus.emit(GameEvents.PLAYER_SLID);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.pointerStartX = pointer.x;
    this.pointerStartY = pointer.y;
    this.pointerStartTime = pointer.downTime;
    this.pointerStartedOnUi = this.scene.input.hitTestPointer(pointer).length > 0;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.pointerStartedOnUi) {
      return;
    }

    const dx = pointer.upX - this.pointerStartX;
    const dy = pointer.upY - this.pointerStartY;
    const duration = pointer.upTime - this.pointerStartTime;
    const distance = Math.hypot(dx, dy);

    if (dy > SWIPE_DISTANCE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      EventBus.emit(GameEvents.PLAYER_SLID);
      return;
    }

    if (distance <= TAP_MAX_DISTANCE && duration <= TAP_MAX_DURATION_MS) {
      EventBus.emit(GameEvents.PLAYER_JUMPED);
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.onJumpKey, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.onSlideKey, this);
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
  }
}
