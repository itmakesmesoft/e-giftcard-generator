import { Rect } from "react-konva";

export const ShapeHelper = ({ config }: { config: ShapeHelperConfig }) => (
  <Rect
    fill={"transparent"}
    stroke={"#7a7a7a"}
    strokeWidth={1}
    dash={[5, 5]}
    {...config}
  />
);

export interface ShapeHelperConfig {
  visible: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}
