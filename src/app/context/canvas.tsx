import Konva from "konva";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";

interface CanvasContextValueProps {
  setSelectedNodes: (node: Konva.Node[]) => void;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
}

const defaultValue: CanvasContextValueProps = {
  setSelectedNodes: () => {},
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  return (
    <CanvasContext.Provider
      value={{
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
