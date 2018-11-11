import * as Player from "../objects/player";
import * as _ from "lodash";
import { WebSocketManager } from "../network/websocket-manager";

// TODO: Need to have some kind of game manager to track the player
// types and all of that jazz.
// This is a bad place to track the game's state.
export class MainScene extends Phaser.Scene {
  public webSocketManager: WebSocketManager;
  public player: Player.Player;
  public otherPlayers: Player.Player[] = [];

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {
    this.load.image("sword", "./assets/boilerplate/sword.png");
    this.load.spritesheet(
      "characters",
      "./assets/boilerplate/ff1characters-trans.png",
      {
        frameWidth: 36,
        frameHeight: 36
      }
    );
  }

  create(): void {
    Player.generateAnimationFrames(this);
    this.player = Player.createNewRandomPlayer(this);
    this.webSocketManager = new WebSocketManager({
      address: "ws://localhost:8090/ws", // "wss://ancient-dawn-33329.herokuapp.com/ws", // ws://localhost:8090/ws
      scene: this
    });
  }

  update(): void {
    this.player.update();
    this.webSocketManager.sendMessage();
  }
}
