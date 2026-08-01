import Phaser from 'phaser';

export class CameraController {
  constructor(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject) {
    const cam = scene.cameras.main;
    // Keeps the player at its original screen position (~25% from the left) instead of
    // recentering it, since the runner's horizontal position never actually changes.
    const offsetX = -scene.scale.width * 0.25;
    cam.startFollow(target, true, 1, 0.15, offsetX, 80);
    cam.setDeadzone(60, 40);
  }
}
