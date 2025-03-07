import Konva from "konva";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import { useEffect, useRef, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";

interface EditableTextProps extends Konva.TextConfig {
  onValueChange: (id: string | undefined, text: string) => void;
}

const EditableText = (props: EditableTextProps) => {
  const { id, text = "텍스트", onDragEnd, onValueChange, ...restProps } = props;

  const textRef = useRef<Konva.Text>(null);
  const backupTextRef = useRef<string>("");

  const { selectedNodes } = useCanvasContext();
  const [value, setValue] = useState<string>(text);
  const [isFocus, setIsFocus] = useState<boolean>(true);

  const node = textRef.current;
  const width = node?.width() ?? props.width;
  const height = node?.height() ?? props.height;

  useEffect(() => {
    if (!textRef.current) return;
    if (selectedNodes.includes(textRef.current)) return;
    return setIsFocus(false);
  }, [selectedNodes]);

  useEffect(() => {
    if (isFocus || value === backupTextRef.current) return;
    backupTextRef.current = value;
    onValueChange(id, value);
  }, [isFocus, value, id, onValueChange]);

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
