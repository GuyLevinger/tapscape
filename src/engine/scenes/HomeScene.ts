import Phaser from 'phaser';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#111318');

    this.add.image(width / 2, height / 2 - 80, 'player');

    this.add
      .text(width / 2, height / 2 + 60, 'TapScape\nHome Screen', {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
