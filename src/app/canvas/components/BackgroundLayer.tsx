import Konva from "konva";
import { Layer, Rect } from "react-konva";

const BackgroundLayer = (props: {
  onPointerDown: (e: Konva.KonvaEventObject<PointerEvent>) => void;
  width: number;
  height: number;
  [key: string]: unknown;
}) => {
  const { onPointerDown, width, height, ...restProps } = props;
  return (
    <Layer {...restProps}>
      <Rect
        id="bg"
        x={0}
        fill="white"
        y={0}
        width={width}
        height={height}
        onPointerDown={onPointerDown}
      />
    </Layer>
  );
};

export default BackgroundLayer;
