import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasContext } from "@/app/context/canvas";

interface CanvasImageProps extends Omit<Konva.ImageConfig, "image"> {
  dataURL: string;
}

const CanvasImage = (props: CanvasImageProps) => {
  const { dataURL, image: _, ...restProps } = props;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { canvasSize, canvasPos } = useCanvasContext();

  useEffect(() => {
    if (!dataURL) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataURL;
    img.onload = () => {
      setImage(img);
    };
  }, [dataURL]);

  const centerX = Math.floor(
    canvasPos.x + (canvasSize.width - (image?.width ?? 1)) / 2
  );
  const centerY = Math.floor(
    canvasPos.y + (canvasSize.height - (image?.height ?? 1)) / 2
  );

  if (!image) return null;

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
