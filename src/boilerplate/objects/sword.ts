import * as _ from "lodash";
import { BaseObject } from "./baseObject";
import { Player } from "./player";

export class Sword extends BaseObject {
  public player: Player;
  private destroyTimeout;

  constructor({ scene, x, y, parentId, id }) {
    super({ scene, x, y, key: "sword", id, parentId, type: "sword" });

    this.scene.tweens.add({
      targets: this,
      duration: 200,
      angle: -90
    });

    this.scene.webSocketManager.addSprite(this);

    // TODO: This will probably need to be outside of this class -
    // feels like more of a game state management concern.
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

    this.destroyTimeout = setTimeout(() => {
      this.makeDead();
      this.scene.webSocketManager.addSprite(this);
      this.destroy();
    }, 200);
  }
}
