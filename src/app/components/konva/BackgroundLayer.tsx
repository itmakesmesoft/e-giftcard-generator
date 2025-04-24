import { useShapeStore } from "@/app/store/canvas";
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
  const {
    onPointerDown,
    width,
    height,
    viewPortWidth,
    viewPortHeight,
    x,
    y,
    ...restProps
  } = props;
  const bgColor = useShapeStore((state) => state.canvasOption.bgColor);
  return (
    <Layer {...restProps}>
      <Rect
        id="bg"
        fill={bgColor}
        width={width}
        height={height}
        x={x}
        y={y}
        viewPortWidth={viewPortWidth}
        viewPortHeight={viewPortHeight}
      />
      <Rect
        width={viewPortWidth}
        height={viewPortHeight}
        onPointerDown={onPointerDown}
      />
    </Layer>
  );
};

export default BackgroundLayer;
