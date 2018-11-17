import * as _ from "lodash";
import { Weapon } from "./weapon";
import { Player } from "./player";

export class Sword extends Weapon {
  public player: Player;
  protected destroyTimeout;

  constructor({ scene, player, x, y, id }) {
    super({
      scene,
      id,
      player,
      x,
      y,
      key: "sword",
      type: "sword",
      damageAmount: 100,
      timeAlive: 200
    });

    this.scene.tweens.add({
      targets: this,
      duration: this.timeAlive,
      angle: this.angle + 90
    });
  }
}
