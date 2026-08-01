import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    // Asset pipeline (Task 3) will populate real loading here.
  }

  create(): void {
    this.scene.start('Home');
  }
}
