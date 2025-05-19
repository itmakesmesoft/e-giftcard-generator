import { useEffect, useMemo } from "react";
import { useCanvasContext } from "../context/canvas";
import { useShapeStore, useControlStore, defaultValues } from "../store/canvas";
import { ActionType } from "../types/canvas";
import Konva from "konva";

const useSyncControl = () => {
  // shape 관련  개별 속성
  const shape = useControlStore((state) => state.shape);
  const shapeFill = useControlStore((state) => state.shape.fill);
  const shapeHasStroke = useControlStore((state) => state.shape.hasStroke);
  const shapeStroke = useControlStore((state) => state.shape.stroke);
  const shapeStrokeWidth = useControlStore((state) => state.shape.strokeWidth);
  const shapeOpacity = useControlStore((state) => state.shape.opacity);
  const shapeLineJoin = useControlStore((state) => state.shape.lineJoin);
  const shapeLineCap = useControlStore((state) => state.shape.lineCap);
  const shapeCornerRadius = useControlStore(
    (state) => state.shape.cornerRadius
  );

  // font 관련  개별 속성
  const font = useControlStore((state) => state.font);
  const fontFill = useControlStore((state) => state.font.fill);
  const fontStroke = useControlStore((state) => state.font.stroke);
  const fontSize = useControlStore((state) => state.font.fontSize);
  const fontWeight = useControlStore((state) => state.font.fontWeight);
  const fontFamily = useControlStore((state) => state.font.fontFamily);
  const fontStyle = useControlStore((state) => state.font.fontStyle);
  const fontOpacity = useControlStore((state) => state.font.opacity);
  const fontTypeFace = useControlStore((state) => state.font.typeFace);
  const fontTextAlign = useControlStore((state) => state.font.textAlign);

  // brush 관련 개별 속성
  const brush = useControlStore((state) => state.brush);
  const brushFill = useControlStore((state) => state.brush.fill);
  const brushStroke = useControlStore((state) => state.brush.stroke);
  const brushStrokeWidth = useControlStore((state) => state.brush.strokeWidth);
  const brushOpacity = useControlStore((state) => state.brush.opacity);
  const brushLineJoin = useControlStore((state) => state.brush.lineJoin);
  const brushLineCap = useControlStore((state) => state.brush.lineCap);
  const brushRadius = useControlStore((state) => state.brush.radius);

  // shape 관련 setter 함수들
  const setShapeFill = useControlStore((state) => state.shape.setFill);
  const setShapeOpacity = useControlStore((state) => state.shape.setOpacity);
  const setShapeHasStroke = useControlStore(
    (state) => state.shape.setHasStroke
  );
  const setShapeStroke = useControlStore((state) => state.shape.setStroke);
  const setShapeStrokeWidth = useControlStore(
    (state) => state.shape.setStrokeWidth
  );
  const setShapeLineJoin = useControlStore((state) => state.shape.setLineJoin);
  const setShapeLineCap = useControlStore((state) => state.shape.setLineCap);
  const setShapeCornerRadius = useControlStore(
    (state) => state.shape.setCornerRadius
  );

  // font 관련 setter 함수들
  const setFontFill = useControlStore((state) => state.font.setFill);
  const setFontStroke = useControlStore((state) => state.font.setStroke);
  const setFontSize = useControlStore((state) => state.font.setFontSize);
  const setFontOpacity = useControlStore((state) => state.font.setOpacity);
  const setFontWeight = useControlStore((state) => state.font.setFontWeight);
  const setFontFamily = useControlStore((state) => state.font.setFontFamily);
  const setFontStyle = useControlStore((state) => state.font.setFontStyle);
  const setFontTypeFace = useControlStore((state) => state.font.setTypeFace);
  const setFontTextAlign = useControlStore((state) => state.font.setTextAlign);

  // brush 관련 setter 함수들
  const setBrushFill = useControlStore((state) => state.brush.setFill);
  const setBrushOpacity = useControlStore((state) => state.brush.setOpacity);
  const setBrushStroke = useControlStore((state) => state.brush.setStroke);
  const setBrushStrokeWidth = useControlStore(
    (state) => state.brush.setStrokeWidth
  );
  const setBrushLineJoin = useControlStore((state) => state.brush.setLineJoin);
  const setBrushLineCap = useControlStore((state) => state.brush.setLineCap);
  const setBrushRadius = useControlStore((state) => state.brush.setRadius);

  const action = useControlStore((state) => state.action);
  const canvasOption = useShapeStore((state) => state.canvasOption);
  // const setCanvasOption = useShapeStore((state) => state.setCanvasOption);

  const { selectedNodes } = useCanvasContext();

  const types = useMemo(() => getNodeType(selectedNodes), [selectedNodes]);

  useEffect(() => {
    // shape 속성 설정
    if (
      selectedNodes.length === 1 &&
      types?.isSubsetOf(
        new Set([
          "rectangle",
          "circle",
          "arrow",
          "line",
          "triangle",
          "ellipse",
          "star",
        ])
      )
    ) {
      const attrs = selectedNodes[0].attrs;

      setShapeFill(attrs.barColor ?? attrs.fill ?? defaultValues.shape.fill);
      setShapeHasStroke(
        (attrs.strokeWidth && attrs.hasStroke) ?? defaultValues.shape.hasStroke
      );
      setShapeStroke(attrs.stroke ?? defaultValues.shape.stroke);
      setShapeStrokeWidth(
        Math.max(1, attrs.strokeWidth ?? defaultValues.shape.strokeWidth)
      );
      setShapeOpacity(attrs.opacity ?? defaultValues.shape.opacity);
      setShapeLineJoin(attrs.lineJoin ?? defaultValues.shape.lineJoin);
      setShapeLineCap(attrs.lineCap ?? defaultValues.shape.lineCap);
      setShapeCornerRadius(
        attrs.cornerRadius ?? defaultValues.shape.cornerRadius
      );
    }
  }, [
    action,
    selectedNodes,
    setShapeFill,
    setShapeLineCap,
    setShapeLineJoin,
    setShapeOpacity,
    setShapeCornerRadius,
    setShapeHasStroke,
    setShapeStroke,
    setShapeStrokeWidth,
    types,
  ]);

  useEffect(() => {
    // font 속성 설정
    if (selectedNodes.length === 1 && types?.isSubsetOf(new Set(["text"]))) {
      const attrs = selectedNodes[0].attrs;
      const [fontStyleValue, fontWeightValue] = attrs.fontStyle?.split(" ") ?? [
        undefined,
        undefined,
      ];
      setFontFill(attrs.fill ?? defaultValues.font.fill);
      setFontStroke(attrs.textColor ?? defaultValues.font.stroke);
      setFontSize(attrs.fontSize ?? defaultValues.font.fontSize);
      setFontWeight(fontWeightValue ?? defaultValues.font.fontWeight);
      setFontFamily(attrs.fontFamily ?? defaultValues.font.fontFamily);
      setFontStyle(fontStyleValue ?? defaultValues.font.fontStyle);
      setFontTypeFace(attrs.typeFace ?? defaultValues.font.typeFace);
      setFontOpacity(attrs.fontOpacity ?? defaultValues.font.opacity);
      setFontTextAlign(attrs.align ?? defaultValues.font.textAlign);
    }
  }, [
    selectedNodes,
    setFontFamily,
    setFontFill,
    setFontOpacity,
    setFontSize,
    setFontStroke,
    setFontStyle,
    setFontTextAlign,
    setFontTypeFace,
    setFontWeight,
    types,
  ]);

  useEffect(() => {
    // brush 속성 설정
    if (
      selectedNodes.length === 1 &&
      types?.isSubsetOf(new Set(["eraser", "pencil"]))
    ) {
      const attrs = selectedNodes[0].attrs;

      setBrushFill(attrs.barColor ?? attrs.fill ?? defaultValues.brush.fill);
      setBrushStroke(attrs.stroke ?? defaultValues.brush.stroke);
      setBrushStrokeWidth(attrs.strokeWidth ?? defaultValues.brush.strokeWidth);
      setBrushOpacity(attrs.opacity ?? defaultValues.brush.opacity);
      setBrushLineJoin(attrs.lineJoin ?? defaultValues.brush.lineJoin);
      setBrushLineCap(attrs.lineCap ?? defaultValues.brush.lineCap);
      setBrushRadius(attrs.radius ?? defaultValues.brush.radius);
    }
  }, [
    selectedNodes,
    setBrushFill,
    setBrushLineCap,
    setBrushLineJoin,
    setBrushOpacity,
    setBrushRadius,
    setBrushStroke,
    setBrushStrokeWidth,
    types,
  ]);

  const getAttributes = useMemo(
    () => ({
      canvasOption,
      // 전체 객체
      shape,
      font,
      brush,
      // shape 속성
      shapeFill,
      shapeHasStroke,
      shapeStroke,
      shapeStrokeWidth,
      shapeOpacity,
      shapeLineJoin,
      shapeLineCap,
      shapeCornerRadius,
      // font 속성
      fontFill,
      fontStroke,
      fontSize,
      fontWeight,
      fontFamily,
      fontStyle,
      fontOpacity, // fontOpacity가 명확하게 정의되지 않은 것 같아 font.fontOpacity로 접근
      fontTypeFace,
      fontTextAlign,
      // brush 속성
      brushFill,
      brushStroke,
      brushStrokeWidth,
      brushOpacity,
      brushLineJoin,
      brushLineCap,
      brushRadius,
    }),
    [
      canvasOption,
      shape,
      font,
      brush,
      shapeFill,
      shapeHasStroke,
      shapeStroke,
      shapeStrokeWidth,
      shapeOpacity,
      shapeLineJoin,
      shapeLineCap,
      shapeCornerRadius,
      fontFill,
      fontStroke,
      fontSize,
      fontWeight,
      fontFamily,
      fontStyle,
      fontOpacity,
      fontTypeFace,
      fontTextAlign,
      brushFill,
      brushStroke,
      brushStrokeWidth,
      brushOpacity,
      brushLineJoin,
      brushLineCap,
      brushRadius,
    ]
  );
  return {
    getAttributes,
  };
};

export default useSyncControl;

const getNodeType = (selectedNodes: Konva.Node[]): Set<ActionType> | null => {
  if (selectedNodes.length === 0) return null;
  const types: ActionType[] = selectedNodes.map((node) => node.attrs.type);
  return new Set(types);
};
