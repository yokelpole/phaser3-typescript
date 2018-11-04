import { Player } from "../objects/player";
import * as _ from "lodash";
import { WebSocketManager } from "../network/websocket-manager";

// TODO: Need to have some kind of game manager to track the player
// types and all of that jazz.
// This is a bad place to track the game's state.
export class MainScene extends Phaser.Scene {
  private webSocket: WebSocketManager;
  public player: Player;
  public otherPlayers: Player[] = [];
  private playerTypes: string[] = [
    "fighter",
    "thief",
    "black-belt",
    "red-mage",
    "white-mage",
    "black-mage"
  ];

  constructor() {
    super({
      key: "MainScene"
    });
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

  generateAnimationFrames() {
    _.each(this.playerTypes, (characterType, x) => {
      this.anims.create({
        key: `${characterType}-down`,
        frames: this.anims.generateFrameNumbers("characters", {
          start: 0 + x * 27,
          end: 1 + x * 27
        }),
        frameRate: 10
      });
      this.anims.create({
        key: `${characterType}-up`,
        frames: this.anims.generateFrameNumbers("characters", {
          start: 2 + x * 27,
          end: 3 + x * 27
        }),
        frameRate: 10
      });
      this.anims.create({
        key: `${characterType}-right`,
        frames: this.anims.generateFrameNumbers("characters", {
          start: 4 + x * 27,
          end: 5 + x * 27
        }),
        frameRate: 10
      });
      this.anims.create({
        key: `${characterType}-left`,
        frames: this.anims.generateFrameNumbers("characters", {
          start: 6 + x * 27,
          end: 7 + x * 27
        }),
        frameRate: 10
      });
    });
  }

  createNewRandomPlayer() {
    return new Player({
      scene: this,
      x: _.random(_.toNumber(this.sys.game.config.width)),
      y: _.random(_.toNumber(this.sys.game.config.height)),
      key: "characters",
      type: _.sample(this.playerTypes),
      isPlayer: true
    });
  }

  create(): void {
    this.generateAnimationFrames();

    this.player = this.createNewRandomPlayer();
    this.webSocket = new WebSocketManager({
      address: "ws://localhost:8090/ws" || "wss://ancient-dawn-33329.herokuapp.com/ws", // ws://localhost:8090/ws
      scene: this,
    });
  }

  handlePlayerCollision(first: Phaser.Physics.Arcade.Sprite): void {
    if (first.anims.getCurrentKey() === `${first.type}-down`) first.y -= 4;
    if (first.anims.getCurrentKey() === `${first.type}-up`) first.y += 4;
    if (first.anims.getCurrentKey() === `${first.type}-left`) first.x += 4;
    if (first.anims.getCurrentKey() === `${first.type}-right`) first.x -= 4;
  }

  update(): void {
    this.player.update();
    const s = this.input.keyboard.addKey("S");

    if (this.player.sword) {
      this.physics.add.collider(
        this.player.sword,
        this.otherPlayers,
        (sword: Phaser.Physics.Arcade.Sprite, deadPlayer: Player) => {
          deadPlayer.destroy();
          this.webSocket.send(
            JSON.stringify({
              id: deadPlayer.id,
              type: "dead"
            })
          );
        }
      );
    }
  }
}
