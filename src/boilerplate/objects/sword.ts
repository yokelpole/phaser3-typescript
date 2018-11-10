import * as uuidv4 from "uuid/v4";
import { MainScene } from "../scenes/mainScene";

export class Sword extends Phaser.Physics.Arcade.Sprite {
  public id: string = uuidv4();
  public parentId: string;
  public scene: MainScene;
  public type: string = 'sword';
  public status: string; // TODO: Implement this.
  public timestamp: number = Math.floor(Date.now() / 1000);

  constructor(params) {
    super(params.scene, params.x, params.y, "sword");

    if (params.id) this.id = params.id;
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.parentId = params.parentId;
    this.scene.tweens.add({
      targets: this,
      duration: 200,
      angle: -90
    });

    this.scene.webSocketManager.addSprite(this);

    setTimeout(() => {
      this.scene.webSocketManager.addDeadSprite(this);
      this.type = "dead";
      this.destroy();
    }, 200);
  }
}