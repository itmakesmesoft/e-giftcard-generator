import { ShapeConfig } from "@/app/types/canvas";
import { Command } from "../command-manager";

export class ReorderShapeCommand implements Command {
  private prevShapes: ShapeConfig[];
  private newShapes: ShapeConfig[];
  private getShapes: () => ShapeConfig[];
  private setShapes: (shapes: ShapeConfig[]) => void;

  constructor(
    newShapes: ShapeConfig[],
    getShapes: () => ShapeConfig[],
    setShapes: (shapes: ShapeConfig[]) => void
  ) {
    this.prevShapes = getShapes();
    this.newShapes = newShapes;
    this.getShapes = getShapes;
    this.setShapes = setShapes;
  }

  execute(): void {
    this.setShapes(this.newShapes);
  }

  undo(): void {
    this.setShapes(this.prevShapes);
  }
}
