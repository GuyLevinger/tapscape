import Phaser from 'phaser';
import { EventBus, GameEvents } from './EventBus';
import { SaveManager } from '@/save/SaveManager';

export class AudioManager {
  private scene: Phaser.Scene;
  private music?: Phaser.Sound.BaseSound;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.sound.mute = SaveManager.settings.muted;

    const onJump = () => this.playSfx('sfx_jump');
    const onCoin = () => this.playSfx('sfx_coin');
    const onDied = () => this.playSfx('sfx_hit');
    // Reuses the coin pickup tone - no dedicated power-up asset yet, matching
    // this task's "generic framework" scope rather than adding new content.
    const onPowerup = () => this.playSfx('sfx_coin');

    EventBus.on(GameEvents.PLAYER_JUMPED, onJump);
    EventBus.on(GameEvents.COIN_COLLECTED, onCoin);
    EventBus.on(GameEvents.PLAYER_DIED, onDied);
    EventBus.on(GameEvents.POWERUP_PICKED, onPowerup);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.PLAYER_JUMPED, onJump);
      EventBus.off(GameEvents.COIN_COLLECTED, onCoin);
      EventBus.off(GameEvents.PLAYER_DIED, onDied);
      EventBus.off(GameEvents.POWERUP_PICKED, onPowerup);
      this.music?.stop();
    });
  }

  playSfx(key: string): void {
    this.scene.sound.play(key, { volume: SaveManager.settings.sfxVolume });
  }

  playMusic(key: string): void {
    if (this.music && this.music.key === key) {
      return;
    }
    this.music?.stop();
    this.music = this.scene.sound.add(key, { loop: true, volume: SaveManager.settings.musicVolume });
    this.music.play();
  }

  stopMusic(): void {
    this.music?.stop();
  }

  toggleMute(): boolean {
    const muted = !this.scene.sound.mute;
    this.scene.sound.mute = muted;
    SaveManager.setMuted(muted);
    return muted;
  }
}
