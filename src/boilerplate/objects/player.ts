import * as _ from "lodash";
import { MainScene } from "../scenes/mainScene";
import { Sword } from "./sword";
import { BaseObject } from "./baseObjectAttributes";

interface ConstructorParams {
  scene: MainScene;
  x: integer;
  y: integer;
  key: string;
  id?: string;
  isPlayer: boolean;
  type: string;
}

const playerTypes = [
  "fighter",
  "thief",
  "black-belt",
  "red-mage",
  "white-mage",
  "black-mage"
];

export function createNewRandomPlayer(scene: MainScene) {
  return new Player({
    scene,
    x: _.random(_.toNumber(scene.sys.game.config.width)),
    y: _.random(_.toNumber(scene.sys.game.config.height)),
    key: "characters",
    type: _.sample(playerTypes),
    isPlayer: true
  });
}

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
  public sword: Sword;
  public hasMoved: boolean = true;
  private cursorKeys: CursorKeys;
  private sKey: Phaser.Input.Keyboard.Key;

  constructor({ scene, x, y, key, id, isPlayer, type }: ConstructorParams) {
    super({ scene, x, y, key, id, type });

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

    this.positionSword();
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

    if (this.sword) this.positionSword();
  }
}
