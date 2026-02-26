import { ShapeConfig } from "@/app/types/canvas";
import { Command } from "../command-manager";

export class AddShapeCommand implements Command {
  private shape: ShapeConfig;
  private getShapes: () => ShapeConfig[];
  private setShapes: (shapes: ShapeConfig[]) => void;

  constructor(
    shape: ShapeConfig,
    getShapes: () => ShapeConfig[],
    setShapes: (shapes: ShapeConfig[]) => void
  ) {
    this.shape = shape;
    this.getShapes = getShapes;
    this.setShapes = setShapes;
  }

  execute(): void {
    this.setShapes([...this.getShapes(), this.shape]);
  }

  undo(): void {
    this.setShapes(
      this.getShapes().filter((s) => s.id !== this.shape.id)
    );
  }
}
