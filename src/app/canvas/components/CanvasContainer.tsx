"use client";

import { CanvasProvider } from "@/app/context/canvas";
import Sidebar from "./Sidebar";
import Canvas from "./konva/Canvas";
import Stage from "./konva/Stage";
import Menubar from "./Menubar";

const CanvasContainer = () => {
  return (
    <CanvasProvider>
      <div className="relative w-full h-screen overflow-hidden flex flex-row justify-center items-center">
        <Sidebar className="fixed left-2" />
        <Menubar className="fixed top-2" />
        <Stage>
          <Canvas />
        </Stage>
      </div>
    </CanvasProvider>
  );
};

export default CanvasContainer;
