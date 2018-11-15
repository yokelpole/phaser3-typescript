import * as _ from "lodash";
import { MainScene } from "../scenes/mainScene";
import { BaseObject } from "./baseObject";

interface ConstructorParams {
  scene: MainScene;
  x: integer;
  y: integer;
  id?: string;
  isPlayer: boolean;
  type?: string; // TODO: This can be removed once all players are repesented by classes.
}

export const playerTypes = [
  "fighter",
  "thief",
  "black-belt",
  "red-mage",
  "white-mage",
  "black-mage"
];

export function generateAnimationFrames(scene: MainScene) {
  _.each(playerTypes, (characterType: string, x: number) => {
    const startFrame = x * 8;

    scene.anims.create({
      key: `${characterType}-down`,
      frames: scene.anims.generateFrameNumbers("characters", {
        start: startFrame + 0,
        end: startFrame + 1
      }),
      frameRate: 10
    });
    scene.anims.create({
      key: `${characterType}-up`,
      frames: scene.anims.generateFrameNumbers("characters", {
        start: startFrame + 2,
        end: startFrame + 3
      }),
      frameRate: 10
    });
    scene.anims.create({
      key: `${characterType}-right`,
      frames: scene.anims.generateFrameNumbers("characters", {
        start: startFrame + 4,
        end: startFrame + 5
      }),
      frameRate: 10
    });
    scene.anims.create({
      key: `${characterType}-left`,
      frames: scene.anims.generateFrameNumbers("characters", {
        start: startFrame + 6,
        end: startFrame + 7
      }),
      frameRate: 10
    });
  });
}

export class Player extends BaseObject {
  public hasMoved: boolean = true;
  public moveRate: number = 4;
  protected cursorKeys: CursorKeys;
  protected sKey: Phaser.Input.Keyboard.Key;

  constructor({ scene, x, y, id, isPlayer, type }: ConstructorParams) {
    super({ scene, x, y, key: "characters", id, type });

    if (isPlayer) {
      this.cursorKeys = scene.input.keyboard.createCursorKeys();
      this.sKey = scene.input.keyboard.addKey("S");
    }

    this.anims.play(`${this.type}-down`);
    this.setDepth(5);
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
      this.x -= this.moveRate;
      this.anims.play(`${this.type}-left`, true);
    } else if (this.cursorKeys.right.isDown) {
      this.x += this.moveRate;
      this.anims.play(`${this.type}-right`, true);
    } else if (this.cursorKeys.up.isDown) {
      this.y -= this.moveRate;
      this.anims.play(`${this.type}-up`, true);
    } else if (this.cursorKeys.down.isDown) {
      this.y += this.moveRate;
      this.anims.play(`${this.type}-down`, true);
    }
  }

  handlePlayerCollision(): void {
    if (this.anims.getCurrentKey() === `${this.type}-down`) this.y -= 4;
    if (this.anims.getCurrentKey() === `${this.type}-up`) this.y += 4;
    if (this.anims.getCurrentKey() === `${this.type}-left`) this.x += 4;
    if (this.anims.getCurrentKey() === `${this.type}-right`) this.x -= 4;
  }

  updatePlayerRemotely(x: number, y: number): void {
    if (this.x < x) this.anims.play(`${this.type}-right`, true);
    else if (this.x > x) this.anims.play(`${this.type}-left`, true);
    else if (this.y < y) this.anims.play(`${this.type}-down`, true);
    else if (this.y > y) this.anims.play(`${this.type}-up`, true);

    this.x = x;
    this.y = y;
  }
}
