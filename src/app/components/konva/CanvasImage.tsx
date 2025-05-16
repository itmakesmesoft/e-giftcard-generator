/* eslint-disable @typescript-eslint/no-unused-vars */
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import { useCanvasContext } from "@/app/context/canvas";
import { Vector2d } from "konva/lib/types";
import { useShapeStore } from "@/app/store/canvas";

interface CanvasImageProps extends Omit<Konva.ImageConfig, "image"> {
  dataURL: string;
}

const CanvasImage = (props: CanvasImageProps) => {
  const { dataURL, x, y, image: _, ...restProps } = props;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<Vector2d>({ x, y });
  const { canvasPos } = useCanvasContext();
  const loadedImage = useRef<HTMLImageElement | null>(null);
  const loadedURL = useRef<string | null>(null);
  const canvasSize = useShapeStore((state) => state.canvasOption.canvasSize);

  const [width, height] = getProperImageSize(canvasSize, image);

  useEffect(() => {
    if (!dataURL) return;

    if (dataURL === loadedURL.current && loadedImage.current) {
      setImage(loadedImage.current);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataURL;
    img.onload = () => {
      setImage(img);
      loadedImage.current = img;
      loadedURL.current = dataURL;
    };
  }, [dataURL]);

  useEffect(() => {
    if (!x || !y) {
      const centerX = Math.floor(canvasPos.x + (canvasSize.width - width) / 2);
      const centerY = Math.floor(
        canvasPos.y + (canvasSize.height - height) / 2
      );
      setPosition({ x: centerX, y: centerY });
    } else {
      setPosition({ x, y });
    }
  }, [canvasPos, canvasSize.height, canvasSize.width, height, width, x, y]);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
      dataURL={dataURL}
      x={position.x}
      y={position.y}
      {...restProps}
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
