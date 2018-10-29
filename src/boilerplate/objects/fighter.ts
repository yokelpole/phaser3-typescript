import * as uuidv4 from "uuid/v4";

interface ConstructorParams {
  scene: Phaser.Scene;
  x: integer;
  y: integer;
  key: string;
  id?: string;
  isPlayer: boolean;
}

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  public id: string = uuidv4();
  public sword: Phaser.Physics.Arcade.Sprite;
  public hasMoved: boolean = false;

  private cursorKeys: CursorKeys;
  private sKey: Phaser.Input.Keyboard.Key;

  constructor({ scene, x, y, key, id, isPlayer }: ConstructorParams) {
    super(scene, x, y, key);

    if (isPlayer) {
      this.cursorKeys = scene.input.keyboard.createCursorKeys();
      this.sKey = scene.input.keyboard.addKey("S");
    }

    this.setDepth(5);
    this.id = id || uuidv4();

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  update(): void {
    if (
      this.cursorKeys.down.isDown ||
      this.cursorKeys.up.isDown ||
      this.cursorKeys.left.isDown ||
      this.cursorKeys.right.isDown
    ) {
      this.hasMoved = true;
    }

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
      this.sword = this.scene.physics.add.sprite(this.x, this.y, "sword");

      if (this.anims.getCurrentKey() === "down") {
        this.sword.y += 16;
        this.sword.toggleFlipY();
        this.sword.setDepth(6); // Sword needs to be on top of fighter.
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

      this.sword;
      this.scene.tweens.add({
        targets: this.sword,
        duration: 200,
        angle: -90
      });

      setTimeout(() => {
        this.sword.destroy();
        this.sword = null;
      }, 200);
    }
  }
}
