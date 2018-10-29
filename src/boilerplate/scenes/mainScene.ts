/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @license      Digitsensitive
 */

import { Fighter } from "../objects/fighter";
import * as _ from "lodash";

export class MainScene extends Phaser.Scene {
  private actionDude: Fighter;
  private otherDude: Fighter;
  private otherDudes: Fighter[] = [];
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

    this.actionDude = new Fighter({
      scene: this,
      x: _.random(_.toNumber(this.sys.game.config.width)),
      y: _.random(_.toNumber(this.sys.game.config.height)),
      key: "characters",
      isPlayer: true
    });

    // TODO: Need to make options for non player.
    // TODO: Need to think of incoporating other classes into fighter -
    //       maybe have a parent class for all playable units?
    /*this.otherDude = new Fighter({
      scene: this,
      x: 128,
      y: 128,
      key: "characters",
      isPlayer: false
    });

    this.physics.add.collider(
      this.actionDude,
      this.otherDude,
      this.handlePlayerCollision
    );*/

    this.webSocket = new WebSocket("ws://localhost:8090/ws");
    this.webSocket.onopen = event => {
      // TODO: Report to server that new character has joined.
      console.log(event);
      console.log("### WE ARE CONNECTED");
    };

    this.webSocket.onmessage = message => {
      console.log('### MESSAGE RECEIVED');
      console.log(message.data);
      const resp = JSON.parse(message.data);

      _.each(resp.objects, obj => {
        if (obj.id === this.actionDude.id) return;

        if (_.includes(_.map(this.otherDudes, 'id'), obj.id)) {
          const dude = this.otherDudes.find(dude => dude.id === obj.id);
          if (!dude) return;
          dude.x = obj.x;
          dude.y = obj.y;
        } else {
          // ADD TO BOARD
          this.otherDudes.push(
            new Fighter({
              scene: this,
              id: obj.id,
              x: obj.x,
              y: obj.y,
              key: "characters",
              isPlayer: false,
            })
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

  update(): void {
    this.actionDude.update();
    const s = this.input.keyboard.addKey("S");

    // TODO: Add tracking for when user changes their position.
    if (
      this.actionDude.hasMoved &&
      this.webSocket.readyState === this.webSocket.OPEN
    ) {
      this.webSocket.send(
        JSON.stringify({
          id: this.actionDude.id,
          type: "player",
          x: this.actionDude.x,
          y: this.actionDude.y
        })
      );
      this.actionDude.hasMoved = false;
    }

    /*if (this.actionDude.sword) {
      this.physics.add.collider(
        this.actionDude.sword,
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
        this.actionDude,
        this.otherDude,
        this.handlePlayerCollision
      );
    }*/
  }
}
