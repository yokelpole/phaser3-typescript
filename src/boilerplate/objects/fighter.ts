import { Player } from "./player";
import { Sword } from "./sword";

export class Fighter extends Player {
  public type: string = "fighter";
  public sword: Sword;

  constructor(params) {
    super({ ...params, type: "fighter" });
  }

  update(): void {
    super.update();

    if (this.sword) {
      if (this.cursorKeys.left.isDown) this.sword.x -= this.moveRate;
      if (this.cursorKeys.right.isDown) this.sword.x += this.moveRate;
      if (this.cursorKeys.up.isDown) this.sword.y -= this.moveRate;
      if (this.cursorKeys.down.isDown) this.sword.y += this.moveRate;
    }

    if (this.sKey.isDown) this.addSword();
  }

  addSword(id: string = undefined): void {
    // TODO: We shouldn't be destroying and making the sword each time.
    if (this.sword && this.sword.active) return;
    if (this.sword && this.sword.id === id) return;
    if (this.sword && !this.sword.active) this.sword = null;

    this.sword = new Sword({
      id,
      scene: this.scene,
      x: this.x,
      y: this.y,
      parentId: this.id
    });

    this.positionSword();
  }

  positionSword(): void {
    if (!this.sword) return;

    this.sword.resetFlip();

    if (this.anims.getCurrentKey() === `${this.type}-down`) {
      this.sword.y = this.y + 16;
      this.sword.toggleFlipY();
      if (this.sword.scene) this.sword.setDepth(6); // Sword needs to be on top of fighter.
    } else if (this.anims.getCurrentKey() === `${this.type}-up`) {
      this.sword.y = this.y - 16;
      this.sword.toggleFlipX();
    } else if (this.anims.getCurrentKey() === `${this.type}-left`) {
      this.sword.x = this.x - 16;
    } else if (this.anims.getCurrentKey() === `${this.type}-right`) {
      this.sword.x = this.x + 16;
      this.sword.toggleFlipY();
      this.sword.toggleFlipX();
    }
  }

  updatePlayerRemotely(x: number, y: number): void {
    super.updatePlayerRemotely(x, y);
    if (this.sword) this.positionSword();
  }
}
