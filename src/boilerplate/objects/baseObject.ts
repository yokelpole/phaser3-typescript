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
  health?: number;
}

export class BaseObject extends Phaser.Physics.Arcade.Sprite {
  public id: string = uuidv4();
  public parentId: string;
  public type: string; // TODO: Should this be handled by the classes?
  public health: number = 100;
  public timestamp: number = Math.floor(Date.now() / 1000);
  public scene: MainScene;

  constructor({ scene, x, y, key, id, parentId, type, health }: ConstructorParams) {
    super(scene, x, y, key);

    if (id) this.id = id;
    if (health) this.health = health;
    this.parentId = parentId;
    this.type = type;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
  }

  isDead() {
    return this.health <= 0;
  }

  makeDead() {
    this.health = 0;
  }
}
