import { useEffect, useState } from "react";
import { useCanvasContext } from "../context/canvas";

type ActionType =
  | "select"
  | "rectangle"
  | "circle"
  | "pencil"
  | "eraser"
  | "arrow"
  | "image"
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

interface Controls extends ControlValues {
  setAction: (prop: ActionType) => void;
  setFill: (prop: string) => void;
  setStroke: (prop: string) => void;
  setStrokeWidth: (prop: number) => void;
  setOpacity: (prop: number) => void;
  setDraggable: (prop: boolean) => void;
  setLineJoin: (prop: string) => void;
  setLineCap: (prop: string) => void;
  setRadius: (prop: number) => void;
  setImage: (prop: unknown) => void;
  // font
  setFontSize: (prop: number) => void;
  setFontWeight: (prop: number) => void;
  setFontFamily: (prop: string) => void;
  setFontStyle: (prop: string) => void;
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

const useControl = (props?: ControlValues): Controls => {
  const config = { ...defaultValues, ...props };

  const [action, setAction] = useState<ActionType>(config.action);
  const [fill, setFill] = useState<string>(config.fill);
  const [stroke, setStroke] = useState<string>(config.stroke);
  const [strokeWidth, setStrokeWidth] = useState<number>(config.strokeWidth);
  const [opacity, setOpacity] = useState<number>(config.opacity);
  const [draggable, setDraggable] = useState<boolean>(config.draggable);
  const [lineJoin, setLineJoin] = useState<string>(config.lineJoin);
  const [lineCap, setLineCap] = useState<string>(config.lineCap);
  const [radius, setRadius] = useState<number>(config.radius);
  const [image, setImage] = useState<unknown>(config.image);
  const [fontSize, setFontSize] = useState<number>(config.fontSize);
  const [fontWeight, setFontWeight] = useState<number>(config.fontWeight);
  const [fontFamily, setFontFamily] = useState<string>(config.fontFamily);
  const [fontStyle, setFontStyle] = useState<string>(config.fontStyle);

  const { selectedNodes } = useCanvasContext();

  useEffect(() => {
    if (selectedNodes.length === 1) {
      const attrs = selectedNodes[0].attrs;

      setFill(attrs.barColor ?? attrs.fill ?? defaultValues.fill);
      setStroke(attrs.textColor ?? attrs.stroke ?? defaultValues.stroke);
      setStrokeWidth(attrs.strokeWidth ?? defaultValues.strokeWidth);
      setOpacity(attrs.opacity ?? defaultValues.opacity);
      setDraggable(
        action === "select" ? false : attrs.draggable ?? defaultValues.draggable
      );
      setLineJoin(attrs.lineJoin ?? defaultValues.lineJoin);
      setLineCap(attrs.lineCap ?? defaultValues.lineCap);
      setRadius(attrs.radius ?? defaultValues.radius);
      setFontSize(attrs.fontSize ?? defaultValues.fontSize);
      setFontWeight(attrs.fontWeight ?? defaultValues.fontWeight);
      setFontFamily(attrs.fontFamily ?? defaultValues.fontFamily);
      setFontStyle(attrs.fontStyle ?? defaultValues.fontStyle);
    }
  }, [action, selectedNodes]);

  return {
    // for Shape
    action,
    fill,
    stroke,
    strokeWidth,
    opacity,
    draggable,
    setAction,
    setFill,
    setStroke,
    setStrokeWidth,
    setOpacity,
    setDraggable,
    // line
    lineCap,
    lineJoin,
    setLineJoin,
    setLineCap,

    // for Elipse
    radius,
    setRadius,

    // for image
    image,
    setImage,

    // font
    fontSize,
    fontWeight,
    fontFamily,
    fontStyle,
    setFontSize,
    setFontWeight,
    setFontFamily,
    setFontStyle,
  };
};

export default useControl;
