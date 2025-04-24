import Input from "../../../components/Input";
import { useDebounce } from "@/app/hooks";
import { useEffect, useState } from "react";
import { useCanvasContext } from "@/app/context/canvas";

const FrameSize = () => {
  const { canvasSize, setCanvasSize } = useCanvasContext();
  const [isFrameRatioLock, setIsFrameRatioLock] = useState<boolean>(true);
  const [frameSize, setFrameSize] = useState<{
    width: number;
    height: number;
  }>(canvasSize);

  const debounce = useDebounce();

  useEffect(() => {
    const { width: cWeight, height: cHeight } = canvasSize;
    const { width: fWeight, height: fHeight } = frameSize;
    if (fWeight === cWeight && fHeight === cHeight) return;

    const callback = debounce(
      () => setCanvasSize({ width: fWeight ?? 1, height: fHeight ?? 1 }),
      50
    );

    callback();
  }, [canvasSize, debounce, frameSize, setCanvasSize]);

  const handleWidthChange = (value: string | number) =>
    setFrameSize((prev) => {
      const ratio = prev.height > 0 ? prev.height / prev.width : 1;
      const width = Number(value);
      const height = isFrameRatioLock ? Number(value) * ratio : prev.height;
      return { width, height };
    });

  const handleHeightChange = (value: string | number) =>
    setFrameSize((prev) => {
      const ratio = prev.width > 0 ? prev.width / prev.height : 1;
      const height = Number(value);
      const width = isFrameRatioLock ? Number(value) * ratio : prev.width;
      return { width, height };
    });

  return (
    <>
      <p className="text-sm font-semibold">프레임 크기 조절</p>
      <div className="grid grid-cols-2 gap-4 px-2 py-1">
        <Input value={frameSize.width} onValueChange={handleWidthChange} />
        <Input value={frameSize.height} onValueChange={handleHeightChange} />
        <button
          onClick={() => setIsFrameRatioLock((prev) => !prev)}
          className={isFrameRatioLock ? "bg-black text-white" : ""}
        >
          비율 유지
        </button>
      </div>
    </>
  );
};

export default FrameSize;
