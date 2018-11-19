import { Player } from "./player";
import { BlackMagic } from "./blackMagic";

export class BlackMage extends Player {
  public type: string = "black-mage";
  public weapon: BlackMagic;

  constructor(params) {
    super({ ...params, type: "black-mage" });
  }

  addWeapon(id: string = undefined): void {
    if (!this.canAddWeapon()) return;
    
    super.addWeapon(id);
    
    this.weapon = new BlackMagic({
      id,
      player: this,
      scene: this.scene,
      x: this.x,
      y: this.y
    });
  }
}
