import { Player, Direction } from "./player";
import { BaseObject } from "./baseObject";

// TODO: Might be good to have a base 'weapon' class.
export class BlackMagic extends BaseObject {
  public player: Player;
  public distance: number = 300;

  constructor({ scene, player, x, y, id }) {
    super({
      scene,
      x,
      y,
      key: "black-magic",
      id,
      parentId: player.id,
      type: "black-magic"
    });

    this.scene.webSocketManager.addSprite(this);
    this.player = player;
    const playerDirection = this.player.getDirection();

    const destinationX = () => {
      if (playerDirection === Direction.right) return this.player.x + this.distance;
      if (playerDirection === Direction.left) return this.player.x - this.distance;
      return this.player.x;
    };

    const destinationY = () => {
      if (playerDirection === Direction.up) return this.player.y - this.distance;
      if (playerDirection === Direction.down) return this.player.y + this.distance;
      return this.player.y;
    };

    this.anims.play("black-magic-anim", true);
    this.scene.tweens.add({
      targets: this,
      duration: 1000,
      x: destinationX(),
      y: destinationY()
    });

    // TODO: This is shared among the weapon classes.
    setTimeout(() => {
      this.makeDead();
      this.scene.webSocketManager.addSprite(this);
      this.destroy();
    }, 1000);
  }

  update() {

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
    // TODO: This is shared among the add classes.
    if (this.weapon) {
      if (this.weapon.active) return;
      if (this.weapon.id === id) return;
      if (!this.weapon.active) this.weapon = null;
    }

    this.weapon = new BlackMagic({
      id,
      player: this,
      scene: this.scene,
      x: this.x,
      y: this.y
    });

    this.flipWeapon();
  }
}
