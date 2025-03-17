import Konva from "konva";
import { generateCode, type GeneraterFormatType } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasContext } from "@/app/context/canvas";

interface BarcodeProps extends Konva.ShapeConfig {
  code?: string;
  codeFormat?: GeneraterFormatType;
}
interface ImageSize {
  width: number;
  height: number;
}
interface GetDataURLProps {
  code: string;
  codeFormat: GeneraterFormatType;
  barColor?: string;
  textColor?: string;
}

const Barcode = (props: BarcodeProps) => {
  // JSON으로 export시 stage의 Shape를 기준으로 하므로, Shape 객체에 fill과 stroke가 들어가지 않도록 구조분해 해야함
  const {
    codeFormat,
    code,
    stroke,
    fill,
    textColor: textColorFromProps, // 불러온 객체 내부에 textColor가 존재하는 경우를 대비
    barColor: barColorFromProps, // 불러온 객체 내부에 barColor가 존재하는 경우를 대비
    width = 100,
    height = 100,
    image: _,
    ...restProps
  } = props;

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>({ width, height });
  const { canvasSize, canvasPos } = useCanvasContext();
  const [textColor, setTextColor] = useState<string>(textColorFromProps);
  const [barColor, setBarColor] = useState<string>(barColorFromProps);
  // props에 textColor와 barColor가 존재할 경우, 해당 값으로 초기화

  const getDataURL = useCallback((props: GetDataURLProps) => {
    const canvas = document.createElement("canvas");
    generateCode({
      canvas,
      options: {
        text: props.code,
        bcid: props.codeFormat,
        barcolor: props.barColor ?? "#000000",
        textcolor: props.textColor ?? "#000000",
      },
    });
    setImageSize({ width: canvas.width, height: canvas.height });
    return canvas.toDataURL();
  }, []);

  useEffect(() => {
    const img = new Image();
    if (!code || !codeFormat) return setImage(img);

    const url = getDataURL({ code, codeFormat, barColor, textColor });
    img.src = url;
    img.onload = () => {
      setImage(img);
    };
  }, [barColor, code, codeFormat, getDataURL, textColor]);

  useEffect(() => {
    if (stroke) setTextColor(stroke as string);
    if (fill) setBarColor(fill as string);
    // Barcode 객체 내부에는 stroke와 fill이 존재하지 않아, 초기에는 undefined 상태
    // 이후 Control을 통해 조작 시, 객체 내부로 fill과 stroke가 들어오게 됨.
  }, [stroke, fill]);

  const centerX = Math.floor(
    canvasPos.x + (canvasSize.width - (image?.width ?? 1)) / 2
  );
  const centerY = Math.floor(
    canvasPos.y + (canvasSize.height - (image?.height ?? 1)) / 2
  );

  if (!image) return null;

  return (
    <KonvaImage
      name="shape"
      alt="barcode"
      code={code} // decode에 필요한 코드값
      image={image}
      barColor={barColor}
      textColor={textColor}
      strokeEnabled={false}
      codeFormat={codeFormat} // decode에 필요한 코드의 포멧
      {...imageSize}
      x={centerX}
      y={centerY}
      {...restProps}
    />
  );
};

export default Barcode;
