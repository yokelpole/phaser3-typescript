import * as Player from "../objects/player";
import { Fighter } from "../objects/fighter";
import * as _ from "lodash";
import { WebSocketManager } from "../network/websocket-manager";

export function createNewRandomPlayer(scene: MainScene) {
  const type = _.sample(Player.playerTypes);
  
  if (type === "fighter") {
    return new Fighter({
      scene,
      x: _.random(_.toNumber(scene.sys.game.config.width)),
      y: _.random(_.toNumber(scene.sys.game.config.height)),
      isPlayer: true
    });
  }

  return new Player.Player({
    scene,
    x: _.random(_.toNumber(scene.sys.game.config.width)),
    y: _.random(_.toNumber(scene.sys.game.config.height)),
    type,
    isPlayer: true
  });
}

// TODO: Need to have some kind of game manager to track the player
// types and all of that jazz.
// This is a bad place to track the game's state.
export class MainScene extends Phaser.Scene {
  public webSocketManager: WebSocketManager;
  public player: Player.Player;
  public otherPlayers: Record<string, Player.Player> = {};

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.image("sword", "./assets/boilerplate/sword.png");
    this.load.spritesheet(
      "characters",
      "./assets/boilerplate/characters.png",
      {
        frameWidth: 36,
        frameHeight: 36
      }
    );
  }

  create(): void {
    Player.generateAnimationFrames(this);
    this.player = createNewRandomPlayer(this);
    this.webSocketManager = new WebSocketManager({
      address:
        window.location.hostname === "localhost"
          ? "ws://localhost:8090/ws"
          : "wss://ancient-dawn-33329.herokuapp.com/ws",
      scene: this
    });
  }

  update(): void {
    this.player.update();
    this.webSocketManager.sendMessage();
  }
}
