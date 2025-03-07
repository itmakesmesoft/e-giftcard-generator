import Konva from "konva";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";

interface CanvasSize {
  width: number;
  height: number;
}
interface CanvasContextValueProps {
  canvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;
  setSelectedNodes: (node: Konva.Node[]) => void;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
}

const defaultValue: CanvasContextValueProps = {
  canvasSize: { width: 1000, height: 600 },
  setCanvasSize: () => {},
  setSelectedNodes: () => {},
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(
    defaultValue.canvasSize
  );
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  return (
    <CanvasContext.Provider
      value={{
        canvasSize,
        setCanvasSize,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        selectedNodes,
        setSelectedNodes,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
