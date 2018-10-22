export class Fighter extends Phaser.GameObjects.Sprite {
  private cursorKeys: CursorKeys;
  private sword;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);

    this.cursorKeys = params.scene.input.keyboard.createCursorKeys();

    params.scene.add.existing(this);

    params.scene.anims.create({
      targets: this,
      key: "down",
      frames: params.scene.anims.generateFrameNumbers("characters", {
        start: 0,
        end: 1
      }),
      frameRate: 10
    });
    params.scene.anims.create({
      targets: this,
      key: "up",
      frames: params.scene.anims.generateFrameNumbers("characters", {
        start: 2,
        end: 3
      }),
      frameRate: 10
    });
    params.scene.anims.create({
      targets: this,
      key: "right",
      frames: params.scene.anims.generateFrameNumbers("characters", {
        start: 4,
        end: 5
      }),
      frameRate: 10
    });
    params.scene.anims.create({
      targets: this,
      key: "left",
      frames: params.scene.anims.generateFrameNumbers("characters", {
        start: 6,
        end: 7
      }),
      frameRate: 10
    });
  }

  update(): void {
    if (this.cursorKeys.left.isDown) {
      this.x -= 4;
      this.anims.play("left", true);
    } else if (this.cursorKeys.right.isDown) {
      this.x += 4;
      this.anims.play("right", true);
    } else if (this.cursorKeys.up.isDown) {
      this.y -= 4;
      this.anims.play("up", true);
    } else if (this.cursorKeys.down.isDown) {
      this.y += 4;
      this.anims.play("down", true);
    }
  }
}
