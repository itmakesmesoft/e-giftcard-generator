import { useCanvasContext } from "@/app/context/canvas";
import { loadFromLocalStorage, saveToLocalStorage } from "@/utils";
import { DownloadIcon } from "@radix-ui/react-icons";
import SaveIcon from "./assets/SaveIcon";
import LoadIcon from "./assets/LoadIcon";
import { useHotkeys } from "react-hotkeys-hook";
import Menubar from "./ui/Menubar";
import Toast from "./ui/Toast";

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
    <Menubar
      className={`flex flex-col items-center rounded-xl bg-white overflow-hidden ${className}`}
    >
      <Menubar.MenuItem label="다운로드" onClick={handleExportAsImage}>
        <DownloadIcon width="24" height="24" />
      </Menubar.MenuItem>
      <Menubar.Separator className="my-1" />
      <Menubar.MenuItem label="임시 저장" onClick={handleSaveCanvas}>
        <SaveIcon width="24" height="24" className="text-black" />
      </Menubar.MenuItem>
      <Menubar.MenuItem label="불러오기" onClick={handleLoadCanvas}>
        <LoadIcon width="24" height="24" className="text-black" />
      </Menubar.MenuItem>
      <Toast />
    </Menubar>
  );
};
export default FloatingButtonGroup;
