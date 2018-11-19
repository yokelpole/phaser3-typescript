import { Player } from "./player";
import { Sword } from "./sword";

export class Fighter extends Player {
  public type: string = "fighter";
  public weapon: Sword;

  constructor(params) {
    super({ ...params, type: "fighter" });
  }

  update(): void {
    super.update();

    if (this.weapon) {
      if (this.cursorKeys.left.isDown) this.weapon.x -= this.moveRate;
      if (this.cursorKeys.right.isDown) this.weapon.x += this.moveRate;
      if (this.cursorKeys.up.isDown) this.weapon.y -= this.moveRate;
      if (this.cursorKeys.down.isDown) this.weapon.y += this.moveRate;
    }
  }

  addWeapon(id: string = undefined): void {
    if (!this.canAddWeapon()) return;

    super.addWeapon(id);
    
    this.weapon = new Sword({
      id,
      scene: this.scene,
      player: this,
      x: this.x,
      y: this.y,
    });
  }

  updatePlayerRemotely(x: number, y: number): void {
    super.updatePlayerRemotely(x, y);
    if (this.weapon) this.weapon.positionSword();
  }
}
