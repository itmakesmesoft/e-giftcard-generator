import Konva from "konva";
import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasContext } from "@/app/context/canvas";

interface CanvasImageProps extends Omit<Konva.ImageConfig, "image"> {
  dataURL: string;
}

const CanvasImage = (props: CanvasImageProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [width, height] = getProperImageSize(canvasSize, image);

  const centerX = Math.floor(canvasPos.x + (canvasSize.width - width) / 2);
  const centerY = Math.floor(canvasPos.y + (canvasSize.height - height) / 2);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
      dataURL={dataURL}
      {...restProps}
      x={centerX}
      y={centerY}
    />
  );
};

export default CanvasImage;

// 이미지의 사이즈가 캔버스보다 큰 경우를 대비해 캔버스 사이즈로 맞춰주는 함수
const getProperImageSize = (
  canvasSize: { width: number; height: number },
  image: HTMLImageElement | null
) => {
  if (!image) return [1, 1];

  let newWidth = image.width;
  let newHeight = image.height;

  // xHeight = canvasSize.width * height / width
  if (newWidth > canvasSize.width) {
    newHeight = (canvasSize.width * newHeight) / newWidth;
    newWidth = canvasSize.width;
  }

  // xWidth = canvasSize.height * width / height
  if (newHeight > canvasSize.height) {
    newWidth = (canvasSize.height * newWidth) / newHeight;
    newHeight = canvasSize.height;
  }

  return [newWidth, newHeight];
};
