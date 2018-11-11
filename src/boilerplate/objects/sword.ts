import { MainScene } from "../scenes/mainScene";
import { BaseObject } from "./baseObjectAttributes";
import { Player } from "./player";

export class Sword extends BaseObject {
  public scene: MainScene;
  public player: Player;

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
      this.scene.otherPlayers,
      (sword: Sword, deadPlayer: Player) => {
        if (deadPlayer.id === this.parentId) return;
        this.scene.webSocketManager.addDeadSprite(deadPlayer);
        this.scene.webSocketManager.addDeadSprite(sword);
        deadPlayer.destroy();
      }
    );

    setTimeout(() => {
      this.scene.webSocketManager.addDeadSprite(this);
      this.type = "dead";
      this.destroy();
    }, 200);
  }
}
