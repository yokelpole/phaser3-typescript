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
    super.addWeapon(id);
    
    if (this.weapon) {
      if (this.weapon.active) return;
      if (this.weapon.id === id) return;
    }

    this.weapon = new Sword({
      id,
      scene: this.scene,
      player: this,
      x: this.x,
      y: this.y,
    });

    this.positionSword();
  }

  positionSword(): void {
    if (!this.weapon) return;

    if (this.anims.getCurrentKey() === `${this.type}-down`) {
      this.weapon.y = this.y + 16;
      if (this.weapon.scene) this.weapon.setDepth(6); // Sword needs to be on top of fighter.
    } else if (this.anims.getCurrentKey() === `${this.type}-up`) {
      this.weapon.y = this.y - 16;
    } else if (this.anims.getCurrentKey() === `${this.type}-left`) {
      this.weapon.x = this.x - 16;
    } else if (this.anims.getCurrentKey() === `${this.type}-right`) {
      this.weapon.x = this.x + 16;
    }
  }

  updatePlayerRemotely(x: number, y: number): void {
    super.updatePlayerRemotely(x, y);
    if (this.weapon) this.positionSword();
  }
}