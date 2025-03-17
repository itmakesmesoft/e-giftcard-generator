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

export interface CanvasSize {
  width: number;
  height: number;
}
export interface CanvasPos {
  x: number;
  y: number;
}
export interface ViewportSize {
  width: number;
  height: number;
}
interface CanvasContextValueProps {
  canvasSize: CanvasSize;
  canvasPos: CanvasPos;
  viewportSize: ViewportSize;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasSize: Dispatch<SetStateAction<CanvasSize>>;
  setCanvasPos: Dispatch<SetStateAction<CanvasPos>>;
  // setViewportSize: Dispatch<SetStateAction<ViewportSize>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
  selectNodesByIdList: (idList: string[]) => void;
}

const defaultValue: CanvasContextValueProps = {
  canvasSize: { width: 400, height: 600 },
  canvasPos: { x: 0, y: 0 },
  viewportSize: { width: 0, height: 0 },
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  setCanvasSize: () => {},
  setCanvasPos: () => {},
  // setViewportSize: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const {
    canvasPos: cPos,
    canvasSize: cSize,
    viewportSize: vSize,
  } = defaultValue;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [canvasPos, setCanvasPos] = useState<CanvasPos>(cPos);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(cSize);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(vSize);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      return;
    }
    transformerRef.current?.nodes([]);
  }, [selectedNodes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    const resize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setCanvasPos({
      x: (viewportSize.width - canvasSize.width) / 2,
      y: (viewportSize.height - canvasSize.height) / 2,
    });
  }, [canvasSize, setCanvasPos, viewportSize]);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;
    const node = stage.find(".shape").find(({ attrs }) => attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectedNodes([node]);
    }
  };

  const selectNodesByIdList = (idList: string[]) => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;

    const nodes = stage.find(({ attrs }: Konva.Node) =>
      idList.includes(attrs.id)
    );
    if (nodes && nodes.length > 0) setSelectedNodes(nodes);
  };

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

  return (
    <CanvasContext.Provider
      value={{
        canvasSize,
        canvasPos,
        viewportSize,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        setCanvasSize,
        setCanvasPos,
        // setViewportSize,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
