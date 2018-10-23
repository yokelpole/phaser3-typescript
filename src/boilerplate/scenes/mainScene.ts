/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Fighter } from "../objects/fighter";

export class MainScene extends Phaser.Scene {
  private actionDude: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload(): void {
    this.load.image("sword", "./assets/boilerplate/sword.png");
    this.load.spritesheet("characters", "./assets/boilerplate/ff1characters-trans.png", {
      frameWidth: 36, frameHeight: 36
    });
  }

  create(): void {
    this.actionDude = new Fighter({
      scene: this,
      x: 32,
      y: 32,
      key: "characters",
    })
  }

  update(): void {
    this.actionDude.update();
    const s = this.input.keyboard.addKey('S');
  }
}
