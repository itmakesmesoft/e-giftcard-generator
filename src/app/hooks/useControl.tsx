import { useEffect } from "react";
import { useCanvasContext } from "../context/canvas";
import { State, useShapeStore, useControlStore } from "../store/canvas";

const defaultValues: State = {
  action: "select",
  bgColor: "#ffffff",
  fill: "#ff0000",
  stroke: "#000000",
  strokeWidth: 2,
  opacity: 1,
  lineJoin: "round",
  lineCap: "round",
  radius: 0,
  fontSize: 16,
  fontWeight: "500",
  fontFamily: "Arial",
  fontStyle: "normal",
  typeFace: "sans-serif",
  textAlign: "center",
};

const useControl = () => {
  const action = useControlStore((state) => state.action);
  const setAction = useControlStore((state) => state.setAction);

  const fill = useControlStore((state) => state.fill);
  const stroke = useControlStore((state) => state.stroke);
  const strokeWidth = useControlStore((state) => state.strokeWidth);
  const opacity = useControlStore((state) => state.opacity);
  const lineJoin = useControlStore((state) => state.lineJoin);
  const lineCap = useControlStore((state) => state.lineCap);
  const radius = useControlStore((state) => state.radius);
  const fontSize = useControlStore((state) => state.fontSize);
  const fontWeight = useControlStore((state) => state.fontWeight);
  const fontFamily = useControlStore((state) => state.fontFamily);
  const fontStyle = useControlStore((state) => state.fontStyle);
  const typeFace = useControlStore((state) => state.typeFace);
  const textAlign = useControlStore((state) => state.textAlign);
  const setFill = useControlStore((state) => state.setFill);
  const setOpacity = useControlStore((state) => state.setOpacity);
  const setStroke = useControlStore((state) => state.setStroke);
  const setStrokeWidth = useControlStore((state) => state.setStrokeWidth);
  const setLineJoin = useControlStore((state) => state.setLineJoin);
  const setLineCap = useControlStore((state) => state.setLineCap);
  const setRadius = useControlStore((state) => state.setRadius);
  const setFontSize = useControlStore((state) => state.setFontSize);
  const setFontWeight = useControlStore((state) => state.setFontWeight);
  const setFontFamily = useControlStore((state) => state.setFontFamily);
  const setFontStyle = useControlStore((state) => state.setFontStyle);
  const setTypeFace = useControlStore((state) => state.setTypeFace);
  const setTextAlign = useControlStore((state) => state.setTextAlign);

  const canvasOption = useShapeStore((state) => state.canvasOption);
  const setCanvasOption = useShapeStore((state) => state.setCanvasOption);

  const { selectedNodes } = useCanvasContext();

  useEffect(() => {
    if (selectedNodes.length === 1) {
      const attrs = selectedNodes[0].attrs;
      const [fontStyle, fontWeight] = attrs.fontStyle?.split(" ") ?? [
        undefined,
        undefined,
      ];

      // setBgColor(attrs.bgColor ?? defaultValues.bgColor);
      setFill(attrs.barColor ?? attrs.fill ?? defaultValues.fill);
      setStroke(attrs.textColor ?? attrs.stroke ?? defaultValues.stroke);
      setStrokeWidth(attrs.strokeWidth ?? defaultValues.strokeWidth);
      setOpacity(attrs.opacity ?? defaultValues.opacity);
      setLineJoin(attrs.lineJoin ?? defaultValues.lineJoin);
      setLineCap(attrs.lineCap ?? defaultValues.lineCap);
      setRadius(attrs.radius ?? defaultValues.radius);
      setFontSize(attrs.fontSize ?? defaultValues.fontSize);
      setFontWeight(fontWeight ?? defaultValues.fontWeight);
      setFontFamily(attrs.fontFamily ?? defaultValues.fontFamily);
      setFontStyle(fontStyle ?? defaultValues.fontStyle);
      setTypeFace(attrs.typeFace ?? defaultValues.typeFace);
      setTextAlign(attrs.align ?? defaultValues.textAlign);
    }
  }, [
    action,
    selectedNodes,
    // setBgColor,
    setFill,
    setFontFamily,
    setFontSize,
    setFontStyle,
    setFontWeight,
    setLineCap,
    setLineJoin,
    setOpacity,
    setRadius,
    setStroke,
    setStrokeWidth,
    setTextAlign,
    setTypeFace,
  ]);

  return {
    action,
    setAction,
    getAttributes: {
      canvasOption,
      fill,
      stroke,
      strokeWidth,
      opacity,
      fontSize,
      fontWeight,
      fontFamily,
      fontStyle,
      typeFace,
      lineCap,
      lineJoin,
      radius,
      textAlign,
    },
    setAttributes: {
      setCanvasOption,
      setFill,
      setStroke,
      setStrokeWidth,
      setOpacity,
      setLineJoin,
      setLineCap,
      setRadius,
      setFontSize,
      setFontWeight,
      setFontFamily,
      setTypeFace,
      setFontStyle,
      setTextAlign,
    },
  };
};

export default useControl;
