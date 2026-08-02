import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';

const SHAKE_DURATION_MS = 200;
const SHAKE_INTENSITY = 0.015;
const FLASH_DURATION_MS = 250;
const BURST_LIFESPAN_MS = 400;
const FLOAT_TEXT_DURATION_MS = 500;

// Purely cosmetic, event-driven world-space feedback for pickups and impacts - mirrors
// AudioManager's pattern of reacting to existing EventBus events rather than being called
// directly by other managers, so none of them need to know FX exist.
export class FxManager {
  private scene: Phaser.Scene;
  private flash: Phaser.GameObjects.Rectangle;

  private onCoinCollected = (payload: { x: number; y: number }) => {
    this.burst(payload.x, payload.y, 'coin', 0xffe066);
    this.floatText(payload.x, payload.y, '+5', '#facc15');
  };

  private onPowerupPicked = (payload: { x: number; y: number }) => {
    this.burst(payload.x, payload.y, 'powerup', 0x38bdf8);
  };

  private onPlayerDied = () => {
    this.scene.cameras.main.shake(SHAKE_DURATION_MS, SHAKE_INTENSITY);
    this.flash.setAlpha(0.35);
    this.scene.tweens.add({
      targets: this.flash,
      alpha: 0,
      duration: FLASH_DURATION_MS,
      ease: 'Sine.easeOut',
    });
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.flash = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0xff0000, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    EventBus.on(GameEvents.COIN_COLLECTED, this.onCoinCollected);
    EventBus.on(GameEvents.POWERUP_PICKED, this.onPowerupPicked);
    EventBus.on(GameEvents.PLAYER_DIED, this.onPlayerDied);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private burst(x: number, y: number, textureKey: string, tint: number): void {
    const emitter = this.scene.add.particles(x, y, textureKey, {
      lifespan: BURST_LIFESPAN_MS,
      speed: { min: 80, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      tint,
      quantity: 8,
      emitting: false,
    });
    emitter.explode(8);
    this.scene.time.delayedCall(BURST_LIFESPAN_MS + 100, () => emitter.destroy());
  }

  private floatText(x: number, y: number, text: string, color: string): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: label,
      y: y - 50,
      alpha: 0,
      duration: FLOAT_TEXT_DURATION_MS,
      ease: 'Sine.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  destroy(): void {
    EventBus.off(GameEvents.COIN_COLLECTED, this.onCoinCollected);
    EventBus.off(GameEvents.POWERUP_PICKED, this.onPowerupPicked);
    EventBus.off(GameEvents.PLAYER_DIED, this.onPlayerDied);
  }
}
