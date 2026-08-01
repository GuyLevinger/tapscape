import Phaser from 'phaser';
import { Worlds } from '@/data/worlds';
import { InputManager } from '@/engine/InputManager';
import { EventBus, GameEvents } from '@/engine/EventBus';

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('World');
  }

  create(data: { worldKey: string }): void {
    const world = Worlds.find((w) => w.key === data.worldKey) ?? Worlds[0];
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor(world.color);

    this.add
      .text(width / 2, height / 2 - 60, world.name, {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 10, 'Gameplay coming soon', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const counters = this.add
      .text(width / 2, height / 2 + 40, 'Jumps: 0   Slides: 0', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    let jumps = 0;
    let slides = 0;
    const onJump = () => {
      jumps += 1;
      counters.setText(`Jumps: ${jumps}   Slides: ${slides}`);
    };
    const onSlide = () => {
      slides += 1;
      counters.setText(`Jumps: ${jumps}   Slides: ${slides}`);
    };
    EventBus.on(GameEvents.PLAYER_JUMPED, onJump);
    EventBus.on(GameEvents.PLAYER_SLID, onSlide);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.PLAYER_JUMPED, onJump);
      EventBus.off(GameEvents.PLAYER_SLID, onSlide);
    });

    new InputManager(this);

    const backButton = this.add
      .text(24, 24, '< Home', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#00000055',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('Home');
    });
  }
}
