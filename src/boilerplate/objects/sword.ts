import * as _ from "lodash";
import { Weapon } from "./weapon";
import { Player } from "./player";

export class Sword extends Weapon {
  public player: Player;
  protected destroyTimeout;

  constructor({ scene, player, x, y, id }) {
    super({ scene, player, x, y, key: "sword", id, type: "sword", timeAlive: 200 });

    this.scene.tweens.add({
      targets: this,
      duration: this.timeAlive,
      angle: this.angle + 90
    });

    // TODO: This will probably need to be outside of this class -
    // feels like more of a game state management concern.
    // Might go in weapon class well.
    this.scene.physics.add.collider(
      this,
      _.map(this.scene.otherPlayers),
      (sword: Sword, player: Player) => {
        if (player.id === this.parentId) return;

        sword.makeDead();
        player.makeDead();

        this.scene.webSocketManager.addSprite(player);
        this.scene.webSocketManager.addSprite(sword);

        sword.destroy();
        player.destroy();
        clearTimeout(this.destroyTimeout);
      }
    );
  }
}
