"use client";

import { CanvasProvider } from "@/app/context/canvas";
import Sidebar from "./Sidebar";
import Canvas from "./konva/Canvas";
import Stage from "./konva/Stage";
import Menubar from "./Menubar";
import FloatingButtonGroup from "./FloatingButtonGroup";

const CanvasContainer = () => {
  return (
    <CanvasProvider>
      <div className="relative w-full h-screen overflow-hidden flex flex-row justify-center items-center">
        <div className="fixed top-2 left-4">
          <span className="text-2xl font-bold text-white">
            Gifticon Generator
          </span>
        </div>
        <Sidebar className="fixed left-2 z-100" />
        <Menubar className="fixed top-2 z-100" />
        <FloatingButtonGroup className="fixed bottom-2 right-2 z-100" />
        <Stage>
          <Canvas />
        </Stage>
      </div>
    </CanvasProvider>
  );
};

export default CanvasContainer;
