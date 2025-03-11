"use client";

import { CanvasProvider } from "@/app/context/canvas";
import Toolbar from "./Sidebar";
import Canvas from "./konva/Canvas";
import Stage from "./konva/Stage";
import Toolbox from "./Toolbox";

const CanvasContainer = () => {
  return (
    <CanvasProvider>
      <div className="relative w-full h-screen overflow-hidden flex flex-row justify-center items-center">
        <Toolbar className="fixed left-2" />
        <Toolbox className="fixed top-2" />
        <Stage>
          <Canvas />
        </Stage>
      </div>
    </CanvasProvider>
  );
};

export default CanvasContainer;
