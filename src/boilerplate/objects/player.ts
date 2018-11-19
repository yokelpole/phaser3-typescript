import * as _ from "lodash";
import { MainScene } from "../scenes/mainScene";
import { BaseObject } from "./baseObject";
import { Weapon } from "./weapon";
import { ResponseObject } from "../network/websocket-manager";

interface ConstructorParams {
  scene: MainScene;
  x: integer;
  y: integer;
  id?: string;
  isPlayer: boolean;
  type?: string; // TODO: This can be removed once all players are repesented by classes.
}

export enum Direction {
  "up",
  "right",
  "down",
  "left"
}

export const PlayerTypes = [
  "fighter",
  "thief",
  "black-belt",
  "red-mage",
  "white-mage",
  "black-mage"
];

export function generateAnimationFrames(scene: MainScene) {
  _.each(PlayerTypes, (characterType: string, x: number) => {
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
  public weapon: Weapon;
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

    if (this.sKey.isDown) this.addWeapon();
  }

  // To be extended by other classes.
  addWeapon(id: string = undefined): void {
    if (this.weapon) this.weapon = null;
  }

  canAddWeapon(id: string = undefined): boolean {
    if (this.weapon) {
      if (this.weapon.active) return false;
      if (this.weapon.id === id) return false;
      if (!this.weapon.canRespawn) return false
    }

    return true;
  }

  updateWeapon(obj: ResponseObject): void {
    if (!this.weapon || !this.weapon.active) return;

    this.weapon.x = obj.x;
    this.weapon.y = obj.y;
  }

  getDirection(): Direction {
    if (this.anims.getCurrentKey() === `${this.type}-down`) return Direction.down;
    if (this.anims.getCurrentKey() === `${this.type}-up`) return Direction.up;
    if (this.anims.getCurrentKey() === `${this.type}-left`) return Direction.left;
    if (this.anims.getCurrentKey() === `${this.type}-right`) return Direction.right;
  }

  handlePlayerCollision(): void {
    const direction = this.getDirection();

    if (direction === Direction.down) this.y -= 4;
    if (direction === Direction.up) this.y += 4;
    if (direction === Direction.left) this.x += 4;
    if (direction === Direction.right) this.x -= 4;
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
