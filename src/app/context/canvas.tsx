import Konva from "konva";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface CanvasSize {
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
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
}

const defaultValue: CanvasContextValueProps = {
  canvasSize: { width: 1000, height: 600 },
  setCanvasSize: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
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

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      console.log(selectedNodes);
    }
  }, [selectedNodes]);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;
    const node = stage.find(".shape").find((node) => node.attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectedNodes([node]);
    }
  };

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

  return (
    <CanvasContext.Provider
      value={{
        canvasSize,
        setCanvasSize,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        selectedNodes,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
