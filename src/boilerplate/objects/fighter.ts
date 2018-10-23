export class Fighter extends Phaser.GameObjects.Sprite {
  private cursorKeys: CursorKeys;
  private sKey: Phaser.Input.Keyboard.Key;
  private sword;

  constructor(params) {
    super(params.scene, params.x, params.y, params.key, params.frame);

    this.cursorKeys = params.scene.input.keyboard.createCursorKeys();
    this.sKey = params.scene.input.keyboard.addKey("S");

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

    params.scene.add.existing(this);
  }

  update(): void {
    if (this.cursorKeys.left.isDown) {
      this.x -= 4;
      if (this.sword) this.sword.x -= 4;
      this.anims.play("left", true);
    } else if (this.cursorKeys.right.isDown) {
      this.x += 4;
      if (this.sword) this.sword.x += 4;
      this.anims.play("right", true);
    } else if (this.cursorKeys.up.isDown) {
      this.y -= 4;
      if (this.sword) this.sword.y -= 4;
      this.anims.play("up", true);
    } else if (this.cursorKeys.down.isDown) {
      this.y += 4;
      if (this.sword) this.sword.y += 4;
      this.anims.play("down", true);
    }

    if (this.sKey.isDown && !this.sword) {
      this.sword = this.scene.add.sprite(this.x, this.y, "sword");

        if (this.anims.getCurrentKey() === "down") {
          this.sword.y += 16;
          this.sword.toggleFlipY();
        } else if (this.anims.getCurrentKey() === "up") {
          this.sword.y -= 16;
          this.sword.toggleFlipX();
        } else if (this.anims.getCurrentKey() === "left") {
          this.sword.x -= 16;
        } else if (this.anims.getCurrentKey() === "right") {
          this.sword.x += 16;
          this.sword.toggleFlipY();
          this.sword.toggleFlipX();
        }

        this.scene.tweens.add({
          targets: this.sword,
          duration: 200,
          angle: -90,
        });

        setTimeout(() => { 
          this.sword.destroy();
          this.sword = null;
        }, 200);
    }
  }
}
