/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Player } from "../objects/player";
import * as _ from "lodash";

export class MainScene extends Phaser.Scene {
  private player: Player;
  private otherPlayers: Player[] = [];
  private webSocket: WebSocket;
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

    this.webSocket = new WebSocket("ws://localhost:8090/ws");
    this.webSocket.onopen = () => this.sendServerPlayerLocation();

    this.webSocket.onmessage = message => {
      // TODO: This needs a BIG refactor.
      // How dead players are handled is ridiculous.
      let resp;
      console.log(message.data);
      try {
        resp = JSON.parse(message.data);
      } catch(err) {
        throw err;
      }

      if (!resp) return;

      _.each(resp.objects, obj => {
        if (obj.id === this.player.id) {
          if (obj.type !== 'dead') return;

          this.player.destroy();
          this.player = this.createNewRandomPlayer();
          this.sendServerPlayerLocation();
          return;
        };

        if (_.includes(_.map(this.otherPlayers, "id"), obj.id)) {
          const player = this.otherPlayers.find(player => player.id === obj.id);
          if (!player) return;
          if (obj.type === 'dead') {
            player.destroy();
            return;
          }

          if (player.x < obj.x) player.anims.play(`${player.type}-right`, true);
          else if (player.x > obj.x) player.anims.play(`${player.type}-left`, true);
          else if (player.y < obj.y) player.anims.play(`${player.type}-down`, true);
          else if (player.y > obj.y) player.anims.play(`${player.type}-up`, true);

          player.x = obj.x;
          player.y = obj.y;
        } else {
          if (obj.type === "dead") return;

          const newPlayer = new Player({
            scene: this,
            id: obj.id,
            x: obj.x,
            y: obj.y,
            key: "characters",
            type: obj.type,
            isPlayer: false
          });
          this.otherPlayers.push(newPlayer);
          this.physics.add.collider(
            this.player,
            newPlayer,
            this.handlePlayerCollision
          );
        }
      });
    };
  }

  handlePlayerCollision(first: Phaser.Physics.Arcade.Sprite): void {
    if (first.anims.getCurrentKey() === `${first.type}-down`) first.y -= 4;
    if (first.anims.getCurrentKey() === `${first.type}-up`) first.y += 4;
    if (first.anims.getCurrentKey() === `${first.type}-left`) first.x += 4;
    if (first.anims.getCurrentKey() === `${first.type}-right`) first.x -= 4;
  }

  sendServerPlayerLocation() {
    this.webSocket.send(
      JSON.stringify({
        id: this.player.id,
        type: this.player.type, 
        x: this.player.x,
        y: this.player.y
      })
    );
  }

  update(): void {
    this.player.update();
    const s = this.input.keyboard.addKey("S");

    // TODO: Add tracking for when user changes their position.
    if (
      this.player.hasMoved &&
      this.webSocket.readyState === this.webSocket.OPEN
    ) {
      this.sendServerPlayerLocation();
      this.player.hasMoved = false;
    }

    if (this.player.sword) {
      this.physics.add.collider(
        this.player.sword,
        this.otherPlayers,
        (
          sword: Phaser.Physics.Arcade.Sprite,
          deadPlayer: Player
        ) => {
          deadPlayer.destroy();
          this.webSocket.send(
            JSON.stringify({
              id: deadPlayer.id,
              type: 'dead',
            })
          )
        }
      );
    }
  }
}
