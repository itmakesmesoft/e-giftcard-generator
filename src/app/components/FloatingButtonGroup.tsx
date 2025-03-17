import { useCanvasContext } from "@/app/context/canvas";
import { loadFromLocalStorage, saveToLocalStorage } from "@/utils";
import { DownloadIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";
import SaveIcon from "./ui/SaveIcon";
import LoadIcon from "./ui/LoadIcon";
import { Tooltip as RadixTooltip } from "radix-ui";
import { useHotkeys } from "react-hotkeys-hook";

const FloatingButtonGroup = ({ className }: { className?: string }) => {
  const {
    stageRef,
    canvasSize,
    canvasPos,
    exportCanvasAsJSON,
    loadCanvasByJSON,
  } = useCanvasContext();

  const handleExportAsImage = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({
      ...canvasSize,
      ...canvasPos,
    });
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    link.click();
  };

  const handleSaveCanvas = () => {
    const exportedData = exportCanvasAsJSON();

    if (!exportedData) return;
    const key = "autoSaved";
    saveToLocalStorage(key, exportedData);
  };

  const handleLoadCanvas = async () => {
    const key = "autoSaved";
    const loadedData = await loadFromLocalStorage(key);
    loadCanvasByJSON(loadedData);
  };

  useHotkeys("ctrl+s", (e) => {
    handleSaveCanvas();
    e.preventDefault();
  });

  return (
    <RadixTooltip.Provider>
      <div
        className={`flex flex-col items-center rounded-xl bg-white overflow-hidden ${className}`}
      >
        <FloatingButton label="다운로드" onClick={handleExportAsImage}>
          <DownloadIcon width="24" height="24" />
        </FloatingButton>
        <FloatingButton label="임시 저장" onClick={handleSaveCanvas}>
          <SaveIcon width="24" height="24" className="text-black" />
        </FloatingButton>
        <FloatingButton label="불러오기" onClick={handleLoadCanvas}>
          <LoadIcon width="24" height="24" className="text-black" />
        </FloatingButton>
      </div>
    </RadixTooltip.Provider>
  );
};
export default FloatingButtonGroup;

const FloatingButton = ({
  label,
  className,
  children,
  onClick,
}: {
  label?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Tooltip label={label}>
      <button
        className={`p-2 cursor-pointer hover:bg-gray-200 active:bg-gray-300 ${className}`}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
};

const Tooltip = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild tabIndex={-1}>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          className="bg-black px-2 py-1 rounded-sm text-sm text-white"
          sideOffset={5}
          side="right"
        >
          {label}
          <RadixTooltip.Arrow className="fill-black" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};
