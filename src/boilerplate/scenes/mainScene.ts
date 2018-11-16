import * as Player from "../objects/player";
import { Fighter } from "../objects/fighter";
import * as _ from "lodash";
import { WebSocketManager } from "../network/websocket-manager";
import { BlackMage } from "../objects/blackMage";

// TODO: this shouldn't be here, but it doesn't behave well in
// Player because of how it references a subclass of it.
export function createNewRandomPlayer(scene: MainScene) {
  const type = _.sample(Player.PlayerTypes);

  if (type === "fighter") {
    return new Fighter({
      scene,
      x: _.random(_.toNumber(scene.sys.game.config.width)),
      y: _.random(_.toNumber(scene.sys.game.config.height)),
      isPlayer: true
    });
  } /*if (type === "black-mage")*/ else {
    return new BlackMage({
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
    // Fire art is from https://opengameart.org/content/9-frame-fire-animation-16x-32x-64x
    this.load.spritesheet("black-magic", "./assets/boilerplate/black-magic.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image("sword", "./assets/boilerplate/sword.png");
    this.load.spritesheet("characters", "./assets/boilerplate/characters.png", {
      frameWidth: 36,
      frameHeight: 36
    });
  }

  create(): void {
    Player.generateAnimationFrames(this);
    this.player = createNewRandomPlayer(this);
    // TODO: This might be better in a helper.
    this.anims.create({
      key: "black-magic-anim",
      frames: this.anims.generateFrameNames("black-magic", {
        start: 0,
        end: 8
      }),
      frameRate: 10
    });
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
