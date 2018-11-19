import { Weapon } from "./weapon";
import { Direction } from "./player";

export class BlackMagic extends Weapon {
  public distance: number = 300;

  constructor({ scene, player, x, y, id }) {
    super({
      scene,
      id,
      player,
      x,
      y,
      key: "black-magic",
      type: "black-magic",
      damageAmount: 50,
      respawnDelay: 500,
      timeAlive: 1000,
    });

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
      duration: this.timeAlive,
      x: destinationX(),
      y: destinationY()
    });
  }
}