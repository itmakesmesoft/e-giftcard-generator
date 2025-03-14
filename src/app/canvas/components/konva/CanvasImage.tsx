import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasContext } from "@/app/context/canvas";

interface CanvasImageProps extends Omit<Konva.ImageConfig, "image"> {
  dataURL: string;
}

const CanvasImage = (props: CanvasImageProps) => {
  const { dataURL, ...restProps } = props;
  const [image, setImage] = useState<HTMLImageElement>();
  const { canvasInfo } = useCanvasContext();

  useEffect(() => {
    if (!dataURL) return;
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      setImage(img);
    };
  }, [dataURL]);

  const centerX = Math.floor((canvasInfo.width - (image?.width ?? 0)) / 2);
  const centerY = Math.floor((canvasInfo.height - (image?.height ?? 0)) / 2);

  return (
    <KonvaImage
      image={image}
      width={image?.width}
      height={image?.height}
      dataURL={dataURL}
      x={centerX}
      y={centerY}
      {...restProps}
    />
  );
};

export default CanvasImage;
