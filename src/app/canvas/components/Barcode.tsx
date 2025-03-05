import { generateCode } from "@/utils/generator";
import { GeneraterFormatType } from "@/utils/type";
import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as ImageComponent } from "react-konva";

interface BarcodeProps extends Konva.RectConfig {
  codeFormat: GeneraterFormatType;
  text: string;
}

const Barcode = (props: BarcodeProps) => {
  const {
    codeFormat,
    text,
    stroke,
    width: widthFromProps,
    height: heightFromProps,
    ...restProps
  } = props;
  const [image, setImage] = useState<HTMLImageElement>();
  const [width, setWidth] = useState<number>(widthFromProps ?? 100);
  const [height, setHeight] = useState<number>(heightFromProps ?? 100);

  useEffect(() => {
    // TODO. 저장된 캔버스에서 바코드를 불러오는 경우, 오류가 발생함.
    // generateCode를 Barcode 컴포넌트가 아닌, useShapes나 Canvas로 옮겨야 함 => shapeConfig에 저장 필요

    const canvas = document.createElement("canvas");
    const barColor = (stroke as string) ?? "#000000";
    generateCode({
      canvas,
      options: {
        text,
        bcid: codeFormat,
        barcolor: barColor,
      },
    });
    const url = canvas.toDataURL();
    const image = new Image();
    image.src = url;

    setImage(image);
    setWidth(canvas.width);
    setHeight(canvas.height);
  }, [codeFormat, stroke, text]);

  return (
    <ImageComponent
      image={image}
      alt="barcode"
      width={width}
      height={height}
      {...restProps}
    />
  );
};

export default Barcode;
