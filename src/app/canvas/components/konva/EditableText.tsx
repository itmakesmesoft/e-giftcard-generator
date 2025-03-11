import Konva from "konva";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";
import { ShapeHelper, ShapeHelperConfig } from "./ShapeHelper";

const EditableText = (props: Konva.TextConfig) => {
  const { id, text = "텍스트", onDragEnd, isDrawing, ...restProps } = props;
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

  const node = textRef.current;
  const width = node?.width() ?? props.width;
  const height = node?.height() ?? props.height;

  useEffect(() => {
    if (!textRef.current || selectedNodes.includes(textRef.current)) return;

    setIsFocus(false);
  }, [selectedNodes]);

  return (
    <>
      <Text
        ref={(node) => {
          textRef.current = node;
        }}
        id={id}
        text={value}
        strokeEnabled={false}
        onDragEnd={onDragEnd}
        onDblClick={() => setIsFocus(true)}
        {...restProps}
        visible={!isFocus}
        scaleX={1}
        scaleY={1}
        onTransform={() => {
          const node = textRef.current as Konva.Text | null;
          node?.setAttrs({
            scaleX: 1,
            scaleY: 1,
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
          });
        }}
      />
      {isDrawing && <ShapeHelper config={helperConfig} />}
      <Html>
        {isFocus && (
          <textarea
            className=""
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              position: "absolute",
              top: props.y,
              left: props.x,
              lineHeight: props.lineHeight ?? 1,
              width: width,
              height: height,
              color: props.fill as string,
              fontSize: props.fontSize,
              fontWeight: props.fontWeight,
              fontFamily: props.fontFamily,
              fontStyle: props.fontStyle,
              resize: "none",
              outline: "none",
              border: "none",
              overflow: "hidden",
            }}
          />
        )}
      </Html>
    </>
  );
};

export default EditableText;
