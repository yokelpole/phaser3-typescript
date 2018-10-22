/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Fighter } from "../objects/fighter";

export class MainScene extends Phaser.Scene {
  private phaserSprite: Phaser.GameObjects.Sprite;
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
    
    if (s.isDown) {
      const sword = this.add.sprite(this.actionDude.x, this.actionDude.y, "sword");

      if (this.actionDude.anims.getCurrentKey() === "down") {
        sword.y += 16;
        sword.toggleFlipY();
      } else if (this.actionDude.anims.getCurrentKey() === "up") {
        sword.y -= 16;
        sword.toggleFlipX();
      } else if (this.actionDude.anims.getCurrentKey() === "left") {
        sword.x -= 16;
      } else if (this.actionDude.anims.getCurrentKey() === "right") {
        sword.x += 16;
        sword.toggleFlipY();
        sword.toggleFlipX();
      }

      this.tweens.add({
        targets: sword,
        duration: 50,
        angle: -90,
      });
      setTimeout(() => sword.destroy(), 75);
    }
  }
}
