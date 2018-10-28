/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Fighter } from "../objects/fighter";
import * as _ from "lodash";

export class MainScene extends Phaser.Scene {
  private actionDude: Fighter;
  private otherDude: Fighter;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    this.load.image("sword", "./assets/boilerplate/sword.png");
    this.load.spritesheet(
      "characters",
      "./assets/boilerplate/ff1characters-trans.png",
      {
        frameWidth: 36,
        frameHeight: 36
      }
    );
  }

  create(): void {
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 0,
        end: 1
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 2,
        end: 3
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 4,
        end: 5
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 6,
        end: 7
      }),
      frameRate: 10
    });

    this.actionDude = new Fighter({
      scene: this,
      x: 32,
      y: 32,
      key: "characters",
      isPlayer: true
    });

    // TODO: Need to make options for non player.
    // TODO: Need to think of incoporating other classes into fighter -
    //       maybe have a parent class for all playable units?
    this.otherDude = new Fighter({
      scene: this,
      x: 128,
      y: 128,
      key: "characters",
      isPlayer: false
    });

    this.physics.add.collider(
      this.actionDude,
      this.otherDude,
      (
        first: Phaser.Physics.Arcade.Sprite,
        second: Phaser.Physics.Arcade.Sprite
      ) => {
        if (first.anims.getCurrentKey() === "down") first.y -= 4;
        if (first.anims.getCurrentKey() === "up") first.y += 4;
        if (first.anims.getCurrentKey() === "left") first.x += 4;
        if (first.anims.getCurrentKey() === "right") first.x -= 4;
      }
    );
  }

  update(): void {
    this.actionDude.update();
    const s = this.input.keyboard.addKey("S");

    if (this.actionDude.sword) {
      this.physics.add.collider(
        this.actionDude.sword,
        this.otherDude,
        (
          sword: Phaser.Physics.Arcade.Sprite,
          otherDude: Phaser.Physics.Arcade.Sprite
        ) => {
          otherDude.destroy();
          this.otherDude = null;
        }
      );
    }

    if (!this.otherDude) {
      this.otherDude = new Fighter({
        scene: this,
        x: _.random(320, true),
        y: _.random(320, true),
        key: "characters",
        isPlayer: false
      });
    }
  }
}
