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
      respawnDelay: 250,
      timeAlive: 200
    });

    this.scene.tweens.add({
      targets: this,
      duration: this.timeAlive,
      angle: this.angle + 90
    });

    this.positionSword();
  }

  positionSword(): void {
    const playerAnimKey = this.player.anims.getCurrentKey();
    const playerType = this.player.type;
    
    if (playerAnimKey === `${playerType}-down`) {
      this.y = this.player.y + 16;
      this.setDepth(6); // Sword needs to be on top of fighter.
    } else if (playerAnimKey === `${playerType}-up`) {
      this.y = this.player.y - 16;
    } else if (playerAnimKey === `${playerType}-left`) {
      this.x = this.player.x - 16;
    } else if (playerAnimKey === `${playerType}-right`) {
      this.x = this.player.x + 16;
    }
  }
}
