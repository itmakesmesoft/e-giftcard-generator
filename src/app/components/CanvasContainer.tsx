"use client";

import { CanvasProvider } from "@/app/context/canvas";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import Canvas from "./konva/Canvas";
import Stage from "./konva/Stage";
import Topbar from "./Topbar/Topbar";
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
        <LeftSidebar className="fixed left-2 z-50" />
        <Topbar className="fixed top-2 z-50" />
        <FloatingButtonGroup className="fixed bottom-2 right-2 z-50" />
        <Stage>
          <Canvas />
        </Stage>
      </div>
    </CanvasProvider>
  );
};

export default CanvasContainer;
