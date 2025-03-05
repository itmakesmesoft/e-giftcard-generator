import Konva from "konva";
import { createContext, ReactNode, useContext, useState } from "react";

interface CanvasContextValueProps {
  setSelectedNodes: (node: Konva.Node[]) => void;
  selectedNodes: Konva.Node[];
}

const defaultValue: CanvasContextValueProps = {
  setSelectedNodes: () => {},
  selectedNodes: [],
};

const CanvasContext = createContext(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  return (
    <CanvasContext.Provider value={{ selectedNodes, setSelectedNodes }}>
      {children}
    </CanvasContext.Provider>
  );
};
