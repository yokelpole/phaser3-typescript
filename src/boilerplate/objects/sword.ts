export class Sword extends Phaser.GameObjects.Sprite {
  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);

    params.scene.add.existing(this);
  }
}