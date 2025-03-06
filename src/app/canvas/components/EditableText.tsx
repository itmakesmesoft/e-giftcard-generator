import { useCanvasContext } from "@/app/context/canvas";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";

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
    for (const node of selectedNodes) {
      if (node === textRef.current) return;
    }
    return setIsFocus(false);
  }, [selectedNodes]);

  useEffect(() => {
    if (!isFocus && value !== backupTextRef.current) {
      backupTextRef.current = value;
      onValueChange(id, value);
    }
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
        visible={!isFocus}
        {...restProps}
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
      {isFocus && (
        <Html>
          <textarea
            className=""
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              position: "absolute",
              top: props.y,
              left: props.x,
              marginTop: -5,
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
        </Html>
      )}
    </>
  );
};

export default EditableText;
