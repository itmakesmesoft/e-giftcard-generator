import Konva from "konva";
import { Layer, Rect } from "react-konva";

const BackgroundLayer = (props: {
  onPointerDown?: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  width: number;
  height: number;
  viewPortWidth: number;
  viewPortHeight: number;
  x: number;
  y: number;
  [key: string]: unknown;
}) => {
  const { onPointerDown, width, height, x, y, ...restProps } = props;
  return (
    <Layer {...restProps}>
      <Rect
        id="bg"
        fill="white"
        width={width}
        height={height}
        onPointerDown={onPointerDown}
        x={x}
        y={y}
      />
    </Layer>
  );
};

export default BackgroundLayer;
