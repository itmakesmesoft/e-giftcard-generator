import Konva from "konva";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { ShapeHelper, ShapeHelperConfig } from "./ShapeHelper";

const EditableText = (props: Konva.TextConfig) => {
  const {
    id,
    text = "텍스트",
    onDragEnd,
    isDrawing,
    fontStyle,
    textAlign,
    ...restProps
  } = props;
  const { selectedNodes } = useCanvasContext();

  const textRef = useRef<Konva.Text>(null);
  const [value, setValue] = useState<string>(text);
  const [isFocus, setIsFocus] = useState<boolean>(true);
  const [helperConfig, setHelperConfig] = useState<ShapeHelperConfig>();

  useEffect(() => {
    if (!props || !props.isDrawing || props.type !== "text")
      return setHelperConfig({});

    const { x, y, width, height, isDrawing } = props;
    setHelperConfig({ x, y, width, height, visible: isDrawing });
  }, [props]);

  // const node = textRef.current;
  // const width = Math.floor(node?.width() ?? props.width ?? 0);
  // const height = Math.floor(node?.height() ?? props.height ?? 0);

  useEffect(() => {
    if (!textRef.current || selectedNodes.includes(textRef.current)) return;

    textRef.current.setAttrs({ visible: true });
    setIsFocus(false);
  }, [selectedNodes]);
  console.log(props);

  const handleTransform = () => {
    const text = textRef.current as Konva.Text | null;

    text?.setAttrs({
      width: Math.max(text.width() * text.scaleX(), 1),
      height: Math.max(text.height() * text.scaleY(), 1),
      scaleX: 1,
      scaleY: 1,
    });
  };

  const handleValueChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setValue(e.target.value);

  const handleDoubleClick = () => {
    setIsFocus(true);
    textRef.current?.setAttrs({ visible: false });
  };

  return (
    <>
      <Text
        ref={textRef}
        id={id}
        text={value}
        strokeEnabled={false}
        onDragEnd={onDragEnd}
        {...restProps}
        onDblClick={handleDoubleClick}
        onTransform={handleTransform}
        align={textAlign}
        fontStyle={fontStyle}
      />
      {isDrawing && <ShapeHelper config={helperConfig} />}

      {isFocus && (
        <Html>
          <textarea
            value={value}
            onChange={handleValueChange}
            style={{
              ...(restProps as CSSProperties),
              position: "absolute",
              top: props.y,
              left: props.x,
              lineHeight: props.lineHeight ?? 1,
              color: props.fill as string,
              width: props.width,
              height: props.height,
              transformOrigin: "left top",
              transform: `rotateZ(${props.rotation}deg)`,
              fontWeight: fontStyle?.includes("bold") ? "800" : "normal",
              fontStyle: fontStyle?.includes("italic") ? "italic" : "normal",
              textAlign,
              zIndex: 100,
              resize: "none",
              outline: "none",
              border: "none",
              overflow: "hidden",
            }}
          />
        </Html>
      )}
    </>
  );
};

export default EditableText;
