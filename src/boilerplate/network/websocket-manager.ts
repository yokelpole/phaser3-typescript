import * as _ from "lodash";
import { Player, createNewRandomPlayer } from "../objects/player";
import { MainScene } from "../scenes/mainScene";

interface ConstructorParams {
  address: string;
  scene: MainScene;
}

interface ResponseObject {
  id: string;
  parentId?: string;
  x: number;
  y: number;
  health: number;
  type: string;
  timestamp: number;
}

export class WebSocketManager {
  private scene: MainScene;
  private websocket: WebSocket;
  private sendLock: boolean;
  private queuedSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private baseAttributes: string[] = [
    "id",
    "type",
    "x",
    "y",
    "timestamp",
    "parentId",
    "health"
  ];

  constructor({ address, scene }: ConstructorParams) {
    this.scene = scene;
    this.websocket = new WebSocket(address);
    this.websocket.onopen = () =>
      this.websocket.send([this.getPlayerJSONString()].toString());
    this.websocket.onmessage = message => this.handleMessage(message);
    this.websocket.onclose = message => {
      console.log("### WEBSOCKET CLOSED");
      console.log(message);
    }
  }

  sendMessage() {
    if (this.websocket.readyState !== this.websocket.OPEN) return;

    this.sendLock = true;

    const messages = [];
    if (this.scene.player.hasMoved) {
      messages.push(this.getPlayerJSONString());
      this.scene.player.hasMoved = false;
    }

    if (!_.isEmpty(this.queuedSprites)) {
      _.each(this.queuedSprites, sprite => {
        messages.push(JSON.stringify(_.pick(sprite, this.baseAttributes)));
      });
      this.queuedSprites = [];
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
    _.each(resp.objects, (obj: ResponseObject) => {
      if (obj.id === this.scene.player.id) {
        // TODO: Helper method to deal w/ health on response objects?
        if (obj.health > 0) return;

        this.scene.player.destroy();
        this.scene.player = createNewRandomPlayer(this.scene);
        return;
      }

      const otherPlayer = this.scene.otherPlayers[obj.id];
      if (otherPlayer) {
        if (obj.health <= 0) {
          otherPlayer.destroy();
          this.scene.otherPlayers[obj.id] = undefined;
          return;
        }

        otherPlayer.updatePlayerRemotely(obj.x, obj.y);
      } else if (obj.type === "sword") {
        if (obj.health <= 0) return;

        const player = _.first(_.filter(this.scene.otherPlayers, { id: obj.parentId }));
        if (!player) return;
        
        player.addSword(obj.id);
      } else {
        if (obj.health <= 0) return;

        const newPlayer = new Player({
          scene: this.scene,
          id: obj.id,
          x: obj.x,
          y: obj.y,
          key: "characters",
          type: obj.type,
          isPlayer: false
        });

        this.scene.otherPlayers[newPlayer.id] = newPlayer;
        this.scene.physics.add.collider(
          this.scene.player,
          newPlayer,
          this.scene.player.handlePlayerCollision.bind(this.scene.player)
        );
      }
    });
  }

  getPlayerJSONString() {
    return JSON.stringify(_.pick(this.scene.player, this.baseAttributes));
  }

  addSprite(sprite: Phaser.Physics.Arcade.Sprite) {
    this.queuedSprites.push(sprite);
  }
}
