import Konva from "konva";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import React, {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { ShapeHelper, ShapeHelperConfig } from "./ShapeHelper";
import useCommandManager from "@/app/hooks/useCommandManager";
import { UpdateShapeCommand } from "@/app/lib/command";
import { useShapeStore } from "@/app/store/canvas";

const EditableText = (props: Konva.TextConfig) => {
  const {
    id,
    text = "텍스트",
    onDragEnd,
    isDrawing,
    fontStyle: fontStyleFromProps,
    fontWeight,
    fontFamily,
    typeFace,
    textAlign,
    align,
    ...restProps
  } = props;
  const { selectedNodes } = useCanvasContext();
  const { execute } = useCommandManager();

  const getShapes = () => useShapeStore.getState().shapes;
  const rawSetShapes = (shapes: ReturnType<typeof getShapes>) =>
    useShapeStore.getState().setShapes(shapes);

  const textRef = useRef<Konva.Text>(null);
  const [value, setValue] = useState<string>(text);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [helperConfig, setHelperConfig] = useState<ShapeHelperConfig>();
  const fontStyle = fontStyleFromProps?.split(" ")[0] ?? "normal";

  useEffect(() => {
    if (!props || !props.isDrawing || props.type !== "text")
      return setHelperConfig({});

    const { x, y, width, height, isDrawing } = props;
    setHelperConfig({ x, y, width, height, visible: isDrawing });
  }, [props]);

  useEffect(() => {
    if (!textRef.current || selectedNodes.includes(textRef.current)) return;

    setIsEditing(false);
  }, [selectedNodes]);

  // 편집 종료 시 텍스트가 변경되었으면 UpdateShapeCommand 실행
  const prevIsEditingRef = useRef(false);
  useEffect(() => {
    if (prevIsEditingRef.current && !isEditing && value !== text) {
      const newShapes = getShapes().map((shape) =>
        shape.id === id ? { ...shape, text: value } : shape
      );
      execute(new UpdateShapeCommand(newShapes, getShapes, rawSetShapes));
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  // Undo/Redo 시 스토어의 text prop 변경을 로컬 value에 동기화
  useEffect(() => {
    if (!isEditing) {
      setValue(text);
    }
  }, [text]);

  const handleTransform = () => {
    const text = textRef.current as Konva.Text | null;

    text?.setAttrs({
      width: Math.max(text.width() * text.scaleX(), 1),
      height: Math.max(text.height() * text.scaleY(), 1),
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleValueChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  return (
    <>
      <Text
        // NOTE. 캔버스 저장 이후 ref 참조가 끊어지는 문제가 있어 동적으로 ref 연결
        ref={(node) => {
          textRef.current = node;
        }}
        id={id}
        text={value}
        strokeEnabled={false}
        onDragEnd={onDragEnd}
        {...restProps}
        onDblClick={handleDoubleClick}
        onTransform={handleTransform}
        align={textAlign ?? align}
        fontStyle={`${fontStyle}${fontWeight ? ` ${fontWeight}` : ""}`}
        fontFamily={fontFamily}
        typeFace={typeFace}
        visible={!isEditing}
      />
      {isDrawing && <ShapeHelper config={helperConfig} />}
      {isEditing && (
        <Html>
          <textarea
            value={value}
            onChange={handleValueChange}
            style={{
              ...(restProps as CSSProperties),
              resize: "none",
              outline: "none",
              border: "none",
              overflow: "hidden",
              position: "absolute",
              top: props.y,
              left: props.x,
              color: props.fill as string,
              width: props.width,
              height: props.height,
              zIndex: 10,
              textAlign,
              fontStyle: fontStyle,
              fontWeight: fontWeight,
              fontFamily: `"${fontFamily}", ${typeFace}`,
              lineHeight: props.lineHeight ?? 1,
              transform: `rotateZ(${props.rotation}deg)`,
              transformOrigin: "left top",
            }}
          />
        </Html>
      )}
    </>
  );
};

export default EditableText;
