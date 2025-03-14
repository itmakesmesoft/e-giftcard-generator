import Konva from "konva";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface CanvasInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}
interface CanvasContextValueProps {
  canvasInfo: CanvasInfo;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasInfo: Dispatch<SetStateAction<CanvasInfo>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
}

const defaultValue: CanvasContextValueProps = {
  canvasInfo: { width: 1000, height: 600, x: 0, y: 0 },
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  setCanvasInfo: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const [canvasInfo, setCanvasInfo] = useState<CanvasInfo>(
    defaultValue.canvasInfo
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
        canvasInfo,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        setCanvasInfo,
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
