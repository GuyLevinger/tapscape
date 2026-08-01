import Phaser from 'phaser';
import { CharacterController } from './CharacterController';
import { EventBus, GameEvents } from './EventBus';

export class CollisionManager {
  private isRunOver = false;

  constructor(
    scene: Phaser.Scene,
    character: CharacterController,
    obstacles: Phaser.Physics.Arcade.Image[],
    onDeath: () => void,
  ) {
    scene.physics.add.overlap(character.gameObject, obstacles, () => {
      if (this.isRunOver) {
        return;
      }
      this.isRunOver = true;

      EventBus.emit(GameEvents.OBSTACLE_HIT);
      EventBus.emit(GameEvents.PLAYER_DIED);
      character.die();
      onDeath();
    });
  }
}
