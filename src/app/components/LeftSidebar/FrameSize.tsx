import Input from "@/components/Input";
import { useSyncControl, useDebounce } from "@/app/hooks";
import { useEffect, useState } from "react";
import Menubar from "@/components/Menubar";
import { useShapeStore } from "@/app/store/canvas";
import { NodeSize } from "@/app/types/canvas";
import { Frame, Link2, Unlink2 } from "lucide-react";

const FrameSizeWrapper = () => {
  const { getAttributes } = useSyncControl();
  const canvasOption = getAttributes.canvasOption;
  const setCanvasOption = useShapeStore((state) => state.setCanvasOption);

  return (
    <Menubar.MenuGroup
      label="Frame"
      className="p-2 text-center w-[220px]"
      trigger={
        <Menubar.MenuGroupTrigger icon={<Frame width="18" height="18" />} />
      }
    >
      <p className="text-sm font-semibold">프레임 크기 조절</p>
      <FrameSize
        canvasSize={canvasOption.canvasSize}
        onValueChange={(value) =>
          setCanvasOption((prev) => ({ ...prev, canvasSize: value }))
        }
      />
    </Menubar.MenuGroup>
  );
};

export default FrameSizeWrapper;

interface FrameSizeProps {
  canvasSize: NodeSize;
  onValueChange: (value: NodeSize) => void;
}

const FrameSize = ({ canvasSize, onValueChange }: FrameSizeProps) => {
  const [frameSize, setFrameSize] = useState<NodeSize>(canvasSize);
  const [isFrameRatioLock, setIsFrameRatioLock] = useState<boolean>(true);

  const { debounce } = useDebounce();

  useEffect(() => {
    const { width: width, height: height } = canvasSize;
    const { width: innerWidth, height: innerHeight } = frameSize;

    if (innerWidth !== width || innerHeight !== height) {
      const callback = debounce(() => {
        onValueChange(frameSize);
      }, 50);
      callback();
    }
  }, [canvasSize, debounce, frameSize, onValueChange]);

  const handleWidthChange = (value: string | number) => {
    const ratio = frameSize.height > 0 ? frameSize.height / frameSize.width : 1;
    const width = Number(value);
    const height = isFrameRatioLock ? Number(value) * ratio : frameSize.height;

    setFrameSize({ width, height });
  };

  const handleHeightChange = (value: string | number) => {
    const ratio = frameSize.width > 0 ? frameSize.width / frameSize.height : 1;
    const height = Number(value);
    const width = isFrameRatioLock ? Number(value) * ratio : frameSize.width;

    setFrameSize({ width, height });
  };

  return (
    <div className="flex flex-row justify-between gap-4 px-2 py-1">
      <Input
        value={frameSize.width}
        onValueChange={handleWidthChange}
        className="bg-gray-100 rounded-lg"
      />
      <button onClick={() => setIsFrameRatioLock((prev) => !prev)}>
        {isFrameRatioLock ? (
          <Link2 width="18" height="18" />
        ) : (
          <Unlink2 width="18" height="18" />
        )}
      </button>
      <Input
        value={Math.round(frameSize.height)}
        onValueChange={handleHeightChange}
        className="bg-gray-100 rounded-lg"
      />
    </div>
  );
};
