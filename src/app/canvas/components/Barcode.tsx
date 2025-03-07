import Konva from "konva";
import { generateCode, type GeneraterFormatType } from "@/utils";
import { useCallback, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

interface BarcodeProps extends Konva.ShapeConfig {
  text: string;
  codeFormat: GeneraterFormatType;
}
interface ImageSize {
  width: number;
  height: number;
}
interface GetDataURLProps {
  codeFormat: GeneraterFormatType;
  barColor?: string;
  textColor?: string;
}

const Barcode = (props: BarcodeProps) => {
  const {
    codeFormat,
    text,
    // JSON으로 export시 stage의 Shape를 기준으로 하므로,
    // Shape 객체에 fill과 stroke가 들어가지 않도록 구조분해 해야함
    stroke,
    fill,
    textColor: textColorFromProps, // 불러온 객체 내부에 textColor가 존재하는 경우를 대비
    barColor: barColorFromProps, // 불러온 객체 내부에 barColor가 존재하는 경우를 대비
    width = 100,
    height = 100,
    dataURL,
    ...restProps
  } = props;

  const [image, setImage] = useState<HTMLImageElement>(new Image());
  const [imageSize, setImageSize] = useState<ImageSize>({ width, height });

  // props에 textColor와 barColor가 존재할 경우, 해당 값으로 초기화
  const [textColor, setTextColor] = useState<string>(textColorFromProps);
  const [barColor, setBarColor] = useState<string>(barColorFromProps);

  useEffect(() => {
    // Barcode 객체 내부에는 stroke와 fill이 존재하지 않아, 초기에는 undefined 상태
    // 이후 Control을 통해 조작 시, 객체 내부로 fill과 stroke가 들어오게 됨.
    if (stroke) setTextColor(stroke as string);
    if (fill) setBarColor(fill as string);
  }, [stroke, fill]);

  const getDataURL = useCallback(
    (props: GetDataURLProps) => {
      const canvas = document.createElement("canvas");
      generateCode({
        canvas,
        options: {
          text,
          bcid: props.codeFormat,
          barcolor: props.barColor ?? "#000000",
          textcolor: props.textColor ?? "#000000",
        },
      });
      setImageSize({ width: canvas.width, height: canvas.height });
      return canvas.toDataURL();
    },
    [text]
  );

  useEffect(() => {
    const url = getDataURL({
      codeFormat,
      barColor,
      textColor,
    });
    image.src = url;
    setImage(image);
  }, [codeFormat, text, dataURL, image, getDataURL, barColor, textColor]);

  return (
    <KonvaImage
      name="shape"
      alt="barcode"
      text={text} // decode에 필요한 코드값
      image={image}
      barColor={barColor}
      textColor={textColor}
      strokeEnabled={false}
      codeFormat={codeFormat} // decode에 필요한 코드의 포멧
      {...imageSize}
      {...restProps}
    />
  );
};

export default Barcode;
