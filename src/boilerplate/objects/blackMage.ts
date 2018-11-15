import { Player } from "./player";
import { BaseObject } from "./baseObject";

// TODO: Might be good to have a base 'weapon' class.
export class BlackMagic extends BaseObject {
  public player: Player;

  constructor({ scene, player, x, y, id }) {
    super({ scene, x, y, key: "black-magic", id, parentId: player.id, type: "black-magic" })
  
    this.scene.webSocketManager.addSprite(this);
    this.player = player;

    this.anims.play("black-magic-anim", true);
    this.scene.tweens.add({
      targets: this,
      duration: 1000,
      x: this.player.x + 300,
    });
  }
}

export class BlackMage extends Player {
  public type: string = "black-mage";
  public weapon: BlackMagic;

  constructor(params) {
    super({ ...params, type: "black-mage" });
  }

  update(): void {
    super.update();

    if (this.sKey.isDown) this.addMagic();
  }

  addMagic(id: string = undefined): void {
    this.weapon = new BlackMagic({
      id,
      player: this,
      scene: this.scene,
      x: this.x,
      y: this.y,
    })
  }
}