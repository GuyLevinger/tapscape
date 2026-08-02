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
  // Task 39's "Glitch Zone" - jump/slide inputs swap for the effect's duration, per the GDD-adjacent
  // request's "briefly inverts jump controls." Handled here (where the raw input is turned into a
  // PLAYER_JUMPED/PLAYER_SLID event) rather than in CharacterController, so it's a pure input remap
  // - the character never knows its controls were inverted, same as a real input-device swap.
  private controlsInverted = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    scene.input.keyboard?.on('keydown-SPACE', this.onJumpKey, this);
    scene.input.keyboard?.on('keydown-DOWN', this.onSlideKey, this);

    scene.input.on('pointerdown', this.onPointerDown, this);
    scene.input.on('pointerup', this.onPointerUp, this);

    EventBus.on(GameEvents.GLITCH_STARTED, this.onGlitchStarted, this);
    EventBus.on(GameEvents.GLITCH_ENDED, this.onGlitchEnded, this);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private onGlitchStarted(): void {
    this.controlsInverted = true;
  }

  private onGlitchEnded(): void {
    this.controlsInverted = false;
  }

  private emitJump(): void {
    EventBus.emit(this.controlsInverted ? GameEvents.PLAYER_SLID : GameEvents.PLAYER_JUMPED);
  }

  private emitSlide(): void {
    EventBus.emit(this.controlsInverted ? GameEvents.PLAYER_JUMPED : GameEvents.PLAYER_SLID);
  }

  private onJumpKey(): void {
    this.emitJump();
  }

  private onSlideKey(): void {
    this.emitSlide();
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
      this.emitSlide();
      return;
    }

    if (distance <= TAP_MAX_DISTANCE && duration <= TAP_MAX_DURATION_MS) {
      this.emitJump();
    }
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.onJumpKey, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.onSlideKey, this);
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    EventBus.off(GameEvents.GLITCH_STARTED, this.onGlitchStarted, this);
    EventBus.off(GameEvents.GLITCH_ENDED, this.onGlitchEnded, this);
  }
}
