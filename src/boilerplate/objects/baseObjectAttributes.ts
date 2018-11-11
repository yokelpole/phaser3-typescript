import * as uuidv4 from "uuid/v4";
import { MainScene } from "../scenes/mainScene";

interface ConstructorParams {
  scene: MainScene;
  x: integer;
  y: integer;
  key: string;
  id?: string;
  parentId?: string;
  type: string;
}

export class BaseObject extends Phaser.Physics.Arcade.Sprite {
  public id: string = uuidv4();
  public parentId: string;
  public type: string; // TODO: Should this be handled by the classes?
  public status: string; // TODO: Implement this.
  public timestamp: number = Math.floor(Date.now() / 1000);

  constructor({ scene, x, y, key, id, parentId, type }: ConstructorParams) {
    super(scene, x, y, key);

    if (id) this.id = id;
    this.parentId = parentId;
    this.type = type;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }
}
