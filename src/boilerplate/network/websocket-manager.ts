import * as _ from "lodash";
import { Player } from "../objects/player";
import { MainScene } from "../scenes/mainScene";

interface ConstructorParams {
  address: string,
  scene: MainScene;
}

export class WebSocketManager extends WebSocket {
  private scene: MainScene;

  constructor({ address, scene }: ConstructorParams) {
    super(address);

    this.scene = scene;
    this.onopen = () => {
      this.sendServerPlayerLocation();
      setTimeout(() => this.sendServerPlayerLocation(), 50);
    }
    this.onmessage = message => this.handleMessage(message);
  }

  handleMessage(message: MessageEvent) {
    // TODO: This needs a BIG refactor.
    // How dead players are handled is ridiculous.
    let resp;
    try {
      resp = JSON.parse(message.data);
    } catch (err) {
      console.log('### error parsing JSON.');
      return;
    }

    // TODO: Scene should probably handle a bunch of this.
    _.each(resp.objects, obj => {
      if (obj.id === this.scene.player.id) {
        if (obj.type !== "dead") return;

        this.scene.player.destroy();
        this.scene.player = this.scene.createNewRandomPlayer();
        this.sendServerPlayerLocation();
        return;
      }

      if (_.includes(_.map(this.scene.otherPlayers, "id"), obj.id)) {
        const player = this.scene.otherPlayers.find(player => player.id === obj.id);
        if (!player) return;
        if (obj.type === "dead") {
          player.destroy();
          return;
        }

        if (player.x < obj.x) player.anims.play(`${player.type}-right`, true);
        else if (player.x > obj.x)
          player.anims.play(`${player.type}-left`, true);
        else if (player.y < obj.y)
          player.anims.play(`${player.type}-down`, true);
        else if (player.y > obj.y) player.anims.play(`${player.type}-up`, true);

        player.x = obj.x;
        player.y = obj.y;
      } else {
        if (obj.type === "dead") return;

        const newPlayer = new Player({
          scene: this.scene,
          id: obj.id,
          x: obj.x,
          y: obj.y,
          key: "characters",
          type: obj.type,
          isPlayer: false
        });
        this.scene.otherPlayers.push(newPlayer);
        this.scene.physics.add.collider(
          this.scene.player,
          newPlayer,
          this.scene.handlePlayerCollision
        );
      }
    });
  }

  sendServerPlayerLocation() {
    if (!this.scene.player.hasMoved) return;

    this.send(
      JSON.stringify({
        id: this.scene.player.id,
        type: this.scene.player.type, 
        x: this.scene.player.x,
        y: this.scene.player.y
      })
    );

    this.scene.player.hasMoved = false;
  }
}
