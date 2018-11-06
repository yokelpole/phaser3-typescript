import * as _ from "lodash";
import { Player } from "../objects/player";
import { MainScene } from "../scenes/mainScene";

interface ConstructorParams {
  address: string;
  scene: MainScene;
}

export class WebSocketManager {
  private scene: MainScene;
  private websocket: WebSocket;
  private sendLock: boolean;
  private deadPlayers: Player[] = [];

  constructor({ address, scene }: ConstructorParams) {
    this.scene = scene;
    this.websocket = new WebSocket(address);
    this.websocket.onopen = () =>
      this.websocket.send([this.getPlayerJSONString()].toString());
    this.websocket.onmessage = message => this.handleMessage(message);
  }

  sendMessage() {
    if (this.websocket.readyState !== this.websocket.OPEN) return;

    this.sendLock = true;

    const messages = [];
    if (this.scene.player.hasMoved) {
      messages.push(this.getPlayerJSONString());
      this.scene.player.hasMoved = false;
    }
    if (this.scene.player.sword) {
      messages.push(JSON.stringify({
        // TODO: Use proper class to get id on sword
        id: _.get(this.scene.player.sword, 'id'),
        parent_id: this.scene.player.id,
        type: 'sword',
        x: this.scene.player.sword.x,
        y: this.scene.player.sword.y,
      }));
    }
    if (this.deadPlayers.length) {
      _.each(this.deadPlayers, deadPlayer => {
        messages.push(JSON.stringify({
          id: deadPlayer.id,
          type: "dead",
          x: deadPlayer.x,
          y: deadPlayer.y,
        }));
      })

      this.deadPlayers = [];
    }

    // TODO: Probably a better way of sending the websocket array rather than
    // wrapping the array in a string array.
    if (!_.isEmpty(messages)) this.websocket.send(`[${messages.toString()}]`);

    setTimeout(() => (this.sendLock = false), 25);
  }

  handleMessage(message: MessageEvent) {
    // TODO: This needs a BIG refactor.
    // How dead players are handled is ridiculous.
    let resp;
    try {
      resp = JSON.parse(message.data);
    } catch (err) {
      console.log("### error parsing JSON.");
      return;
    }

    // TODO: Scene should probably handle a bunch of this.
    _.each(resp.objects, obj => {
      if (obj.id === this.scene.player.id) {
        if (obj.type !== "dead") return;

        this.scene.player.destroy();
        this.scene.player = this.scene.createNewRandomPlayer();
        return;
      }

      if (_.includes(_.map(this.scene.otherPlayers, "id"), obj.id)) {
        const player = this.scene.otherPlayers.find(
          player => player.id === obj.id
        );
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
      } else if (obj.type === "sword") {
        const player = this.scene.otherPlayers.find(
          player => player.id === obj.parent_id
        );
        if (!player) return;

        player.addSword();
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

  getPlayerJSONString() {
    return JSON.stringify({
      id: this.scene.player.id,
      type: this.scene.player.type,
      x: this.scene.player.x,
      y: this.scene.player.y
    });
  }

  // TODO: Remove this, we shouldn't be sending to the socket outside
  // of the send function.
  addDeadPlayer(deadPlayer: Player) {
    this.deadPlayers.push(_.extend({}, deadPlayer, { type: "dead" }));
  }
}
