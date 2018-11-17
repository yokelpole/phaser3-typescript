import { Player, Direction } from "./player";
import { BaseObject } from "./baseObject";

export class Weapon extends BaseObject {
  public player: Player;
  protected timeAlive: number;
  protected destroyTimeout;

  constructor({ scene, player, key, x, y, id, type, timeAlive }) {
    super({
      scene,
      id,
      x,
      y,
      key,
      parentId: player.id,
      type,
    });

    this.player = player;
    this.timeAlive = timeAlive;
    this.scene.webSocketManager.addSprite(this);
    this.flipWeapon();

    this.destroyTimeout = setTimeout(() => {
      this.makeDead();
      this.scene.webSocketManager.addSprite(this);
      this.destroy();
    }, this.timeAlive);
  }

  flipWeapon(): void {
    const direction = this.player.getDirection();
    
    if (direction === Direction.down) this.setAngle(180);
    if (direction === Direction.left) this.setAngle(270);
    if (direction === Direction.right) this.setAngle(90);
  }
}