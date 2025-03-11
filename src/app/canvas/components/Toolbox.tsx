import Konva from "konva";
import Select from "./primitives/Select";
import Slider from "./primitives/Slider";
import ColorPicker from "./primitives/ColorPicker";
import { ChangeEvent, useEffect } from "react";
import { ShapeConfig } from "@/app/types/canvas";
import { useCanvasContext } from "@/app/context/canvas";
import { useControlStore, useShapeStore } from "@/app/store/canvas";

type ActionType =
  | "select"
  | "rectangle"
  | "circle"
  | "pencil"
  | "eraser"
  | "arrow"
  | "text";

interface ControlValues {
  action: ActionType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  draggable: boolean;
  lineJoin: string;
  lineCap: string;
  radius: number;
  image: unknown;

  // font
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fontStyle: string;
}

const defaultValues: ControlValues = {
  action: "select",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  draggable: true,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  image: "",
  fontSize: 16,
  fontWeight: 500,
  fontFamily: "Arial",
  fontStyle: "italic",
};

const Toolbox = ({ className }: { className: string }) => {
  const { selectedNodes } = useCanvasContext();

  const setShapes = useShapeStore((state) => state.setShapes);

  const fill = useControlStore((state) => state.fill);
  const stroke = useControlStore((state) => state.stroke);
  const strokeWidth = useControlStore((state) => state.strokeWidth);
  const fontSize = useControlStore((state) => state.fontSize);

  const setFill = useControlStore((state) => state.setFill);
  const setStroke = useControlStore((state) => state.setStroke);
  const setStrokeWidth = useControlStore((state) => state.setFontSize);
  const setFontSize = useControlStore((state) => state.setFontSize);
  // setOpacity(attrs.opacity ?? defaultValues.opacity);
  // setDraggable(
  //   action === "select" ? false : attrs.draggable ?? defaultValues.draggable
  // );
  // setLineJoin(attrs.lineJoin ?? defaultValues.lineJoin);
  // setLineCap(attrs.lineCap ?? defaultValues.lineCap);
  // setRadius(attrs.radius ?? defaultValues.radius);
  // setFontWeight(attrs.fontWeight ?? defaultValues.fontWeight);
  // setFontFamily(attrs.fontFamily ?? defaultValues.fontFamily);
  // setFontStyle(attrs.fontStyle ?? defaultValues.fontStyle);

  useEffect(() => {
    if (selectedNodes.length === 1) {
      const { barColor, textColor, stroke, strokeWidth, fill, fontSize } =
        selectedNodes[0].attrs;

      setFill(barColor ?? fill ?? defaultValues.fill);
      setStroke(textColor ?? stroke ?? defaultValues.stroke);
      setStrokeWidth(strokeWidth ?? defaultValues.strokeWidth);
      setFontSize(fontSize ?? defaultValues.fontSize);
    }
  }, [selectedNodes, setFill, setFontSize, setStroke, setStrokeWidth]);

  const onFillChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFill(e.target.value);
    updateSelectedShapeAttributes({ fill: e.target.value });
  };

  const onStrokeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStroke(e.target.value);
    updateSelectedShapeAttributes({ stroke: e.target.value });
  };

  const onStrokeWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const strokeWidth = Number(e.target.value);
    setStrokeWidth(strokeWidth);
    updateSelectedShapeAttributes({ strokeWidth });
  };

  const onFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setFontSize(size);
    updateSelectedShapeAttributes({ fontSize: size });
  };

  const updateSelectedShapeAttributes = (newAttrs: Konva.ShapeConfig) => {
    const ids = selectedNodes.map((node) => node.attrs.id);
    updateShapeAttributes(ids, newAttrs);
  };

  const updateShapeAttributes = (ids: string[], newAttrs: ShapeConfig) => {
    if (ids.length > 0) {
      setShapes((shapes) =>
        shapes.map((shape) => {
          const shapeId = shape.id;
          return shapeId && ids.includes(shapeId)
            ? { ...shape, ...newAttrs }
            : shape;
        })
      );
    }
  };

  return (
    <div className={className}>
      <ColorPicker color={fill} onChange={onFillChange} />
      <ColorPicker color={stroke} onChange={onStrokeChange} />
      <Slider
        min={1}
        max={50}
        value={strokeWidth}
        onChange={onStrokeWidthChange}
      />
      <Select
        options={[
          { label: "16", value: "16" },
          { label: "20", value: "20" },
        ]}
        label="폰트 사이즈"
        value={String(fontSize)}
        onChange={onFontSizeChange}
      />
    </div>
  );
};

export default Toolbox;
