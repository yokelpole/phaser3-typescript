import * as uuidv4 from "uuid/v4";
import * as _ from "lodash";
import { MainScene } from "../scenes/mainScene";
import { Sword } from "./sword";

interface ConstructorParams {
  scene: MainScene;
  x: integer;
  y: integer;
  key: string;
  id?: string;
  isPlayer: boolean;
  type: string;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public id: string = uuidv4();
  public sword: Sword;
  public hasMoved: boolean = true;
  public type: string;
  public status: string; // TODO: Implement this.
  public scene: MainScene;
  public timestamp: number = Math.floor(Date.now() / 1000);

  private cursorKeys: CursorKeys;
  private sKey: Phaser.Input.Keyboard.Key;

  constructor({ scene, x, y, key, id, isPlayer, type }: ConstructorParams) {
    super(scene, x, y, key);

    if (isPlayer) {
      this.cursorKeys = scene.input.keyboard.createCursorKeys();
      this.sKey = scene.input.keyboard.addKey("S");
    }

    // TODO: Might be able to not have to pass `type` as a param.
    this.type = type;
    this.anims.play(`${this.type}-down`);
    this.setDepth(5);
    this.id = id || uuidv4();

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
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
      this.anims.play(`${this.type}-left`, true);
    } else if (this.cursorKeys.right.isDown) {
      this.x += 4;
      if (this.sword) this.sword.x += 4;
      this.anims.play(`${this.type}-right`, true);
    } else if (this.cursorKeys.up.isDown) {
      this.y -= 4;
      if (this.sword) this.sword.y -= 4;
      this.anims.play(`${this.type}-up`, true);
    } else if (this.cursorKeys.down.isDown) {
      this.y += 4;
      if (this.sword) this.sword.y += 4;
      this.anims.play(`${this.type}-down`, true);
    }

    if (this.sKey.isDown) this.addSword();
  }

  addSword(id: string = undefined) {
    // TODO: We shouldn't be destroying and making the sword each time.
    if (this.sword && this.sword.active) return;
    if (this.sword && this.sword.id === id) return;
    if (this.sword && !this.sword.active) this.sword = null;

    this.sword = new Sword({
      id,
      scene: this.scene,
      x: this.x,
      y: this.y,
      parentId: this.id
    });

    this.positionSword()
  }

  positionSword() {
    if (!this.sword) return;

    this.sword.resetFlip();

    if (this.anims.getCurrentKey() === `${this.type}-down`) {
      this.sword.y = this.y + 16;
      this.sword.toggleFlipY();
      if (this.sword.scene) this.sword.setDepth(6); // Sword needs to be on top of fighter.
    } else if (this.anims.getCurrentKey() === `${this.type}-up`) {
      this.sword.y = this.y - 16;
      this.sword.toggleFlipX();
    } else if (this.anims.getCurrentKey() === `${this.type}-left`) {
      this.sword.x = this.x - 16;
    } else if (this.anims.getCurrentKey() === `${this.type}-right`) {
      this.sword.x = this.x + 16;
      this.sword.toggleFlipY();
      this.sword.toggleFlipX();
    }
  }
}
