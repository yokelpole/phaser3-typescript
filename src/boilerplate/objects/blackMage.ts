import { Player } from "./player";
import { BlackMagic } from "./blackMagic";

export class BlackMage extends Player {
  public type: string = "black-mage";
  public weapon: BlackMagic;

  constructor(params) {
    super({ ...params, type: "black-mage" });
  }

  addWeapon(id: string = undefined): void {
    super.addWeapon(id);

    if (this.weapon) {
      if (this.weapon.active) return;
      if (this.weapon.id === id) return;
    }
    
    this.weapon = new BlackMagic({
      id,
      player: this,
      scene: this.scene,
      x: this.x,
      y: this.y
    });
  }
}
