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
    isInvincible: () => boolean = () => false,
  ) {
    scene.physics.add.overlap(character.gameObject, obstacles, (_player, obstacleObj) => {
      if (this.isRunOver || isInvincible()) {
        return;
      }
      // Laser gates (Task 37) are only lethal while cycled to their "on" phase - overlapping one
      // during "off"/"warning" is exactly the intended safe passage, not a near-miss to forgive.
      const obstacle = obstacleObj as Phaser.Physics.Arcade.Image;
      if (obstacle.getData('variant') === 'laser' && obstacle.getData('laserPhase') !== 'on') {
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
