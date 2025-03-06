import { generateCode } from "@/utils/generator";
import { GeneraterFormatType } from "@/utils/type";
import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as ImageComponent } from "react-konva";

interface BarcodeProps extends Konva.RectConfig {
  text: string;
  codeFormat: GeneraterFormatType;
  dataURL?: string;
}
interface ImageSize {
  width: number;
  height: number;
}

const Barcode = (props: BarcodeProps) => {
  const {
    codeFormat,
    text,
    stroke,
    width = 100,
    height = 100,
    dataURL,
    ...restProps
  } = props;
  const [image, setImage] = useState<HTMLImageElement>(new Image());
  const [imageSize, setImageSize] = useState<ImageSize>({ width, height });

  useEffect(() => {
    const getDataURL = (props: {
      codeFormat: GeneraterFormatType;
      barColor: string;
    }) => {
      const canvas = document.createElement("canvas");
      generateCode({
        canvas,
        options: {
          text,
          bcid: props.codeFormat,
          barcolor: props.barColor ?? "#000000",
        },
      });
      setImageSize({ width: canvas.width, height: canvas.height });
      return canvas.toDataURL();
    };

    const url =
      dataURL !== undefined
        ? dataURL
        : getDataURL({ codeFormat, barColor: stroke as string });

    image.src = url;

    setImage(image);
  }, [codeFormat, stroke, text, dataURL, image]);

  return (
    <ImageComponent
      image={image}
      dataURL={dataURL}
      codeFormat={codeFormat}
      stroke={stroke}
      text={text}
      alt="barcode"
      {...imageSize}
      {...restProps}
    />
  );
};

export default Barcode;
