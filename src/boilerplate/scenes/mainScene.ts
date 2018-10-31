/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Fighter } from "../objects/fighter";
import * as _ from "lodash";

export class MainScene extends Phaser.Scene {
  private player: Fighter;
  private otherPlayers: Fighter[] = [];
  private webSocket: WebSocket;

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

  create(): void {
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 0,
        end: 1
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 2,
        end: 3
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 4,
        end: 5
      }),
      frameRate: 10
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("characters", {
        start: 6,
        end: 7
      }),
      frameRate: 10
    });

    this.player = new Fighter({
      scene: this,
      x: _.random(_.toNumber(this.sys.game.config.width)),
      y: _.random(_.toNumber(this.sys.game.config.height)),
      key: "characters",
      isPlayer: true
    });

    this.webSocket = new WebSocket("ws://localhost:8090/ws");
    this.webSocket.onopen = () => this.sendServerPlayerLocation();

    this.webSocket.onmessage = message => {
      // TODO: Make this into a try/catch
      const resp = JSON.parse(message.data);

      _.each(resp.objects, obj => {
        if (obj.id === this.player.id) return;

        if (_.includes(_.map(this.otherPlayers, "id"), obj.id)) {
          const player = this.otherPlayers.find(player => player.id === obj.id);
          if (!player) return;

          if (player.x < obj.x) player.anims.play("right", true);
          else if (player.x > obj.x) player.anims.play("left", true);
          else if (player.y < obj.y) player.anims.play("down", true);
          else if (player.y > obj.y) player.anims.play("up", true);

          player.x = obj.x;
          player.y = obj.y;
        } else {
          const newPlayer = new Fighter({
            scene: this,
            id: obj.id,
            x: obj.x,
            y: obj.y,
            key: "characters",
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
    if (first.anims.getCurrentKey() === "down") first.y -= 4;
    if (first.anims.getCurrentKey() === "up") first.y += 4;
    if (first.anims.getCurrentKey() === "left") first.x += 4;
    if (first.anims.getCurrentKey() === "right") first.x -= 4;
  }

  sendServerPlayerLocation() {
    this.webSocket.send(
      JSON.stringify({
        id: this.player.id,
        type: "player",
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

    /*if (this.player.sword) {
      this.physics.add.collider(
        this.player.sword,
        this.otherDude,
        (
          sword: Phaser.Physics.Arcade.Sprite,
          otherDude: Phaser.Physics.Arcade.Sprite
        ) => {
          otherDude.destroy();
          this.otherDude = null;
        }
      );
    }

    if (!this.otherDude) {
      this.otherDude = new Fighter({
        scene: this,
        x: _.random(320, true),
        y: _.random(320, true),
        key: "characters",
        isPlayer: false
      });

      this.physics.add.collider(
        this.player,
        this.otherDude,
        this.handlePlayerCollision
      );
    }*/
  }
}
