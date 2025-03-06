import { generateCode } from "@/utils/generator";
import { GeneraterFormatType } from "@/utils/type";
import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as ImageComponent } from "react-konva";

interface BarcodeProps extends Konva.ShapeConfig {
  text: string;
  codeFormat: GeneraterFormatType;
  dataURL?: string;
}
interface ImageSize {
  width: number;
  height: number;
}
interface GetDataURLProps {
  codeFormat: GeneraterFormatType;
  barColor: string;
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
    const getDataURL = (props: GetDataURLProps) => {
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
      name="shape"
      {...imageSize}
      {...restProps}
      fill={"transparent"}
      strokeEnabled={false}
    />
  );
};

export default Barcode;
