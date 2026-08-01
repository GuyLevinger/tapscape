import Phaser from 'phaser';

const DEFAULT_SCROLL_SPEED = 300;

export class InfiniteGround {
  private scene: Phaser.Scene;
  private tileSprite: Phaser.GameObjects.TileSprite;
  private scrollSpeed: number;

  constructor(scene: Phaser.Scene, groundHeight: number, textureKey: string, scrollSpeed = DEFAULT_SCROLL_SPEED) {
    this.scene = scene;
    this.scrollSpeed = scrollSpeed;

    const { width, height } = scene.scale;
    const y = height - groundHeight / 2;

    this.tileSprite = scene.add.tileSprite(width / 2, y, width, groundHeight, textureKey);
    scene.physics.add.existing(this.tileSprite, true);

    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  get gameObject(): Phaser.GameObjects.TileSprite {
    return this.tileSprite;
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    const groundHeight = this.tileSprite.height;
    const y = gameSize.height - groundHeight / 2;
    this.tileSprite.setPosition(gameSize.width / 2, y);
    this.tileSprite.setSize(gameSize.width, groundHeight);

    const body = this.tileSprite.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
  }

  update(delta: number): void {
    this.tileSprite.tilePositionX += (this.scrollSpeed * delta) / 1000;
  }

  destroy(): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
  }
}
