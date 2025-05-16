import Konva from "konva";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Vector2d } from "konva/lib/types";
export interface CanvasSize {
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

interface CanvasContextValueProps {
  // canvasSize: CanvasSize;
  canvasPos: Vector2d;
  stageScale: number;
  viewportSize: ViewportSize;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  // setCanvasSize: Dispatch<SetStateAction<CanvasSize>>;
  setCanvasPos: Dispatch<SetStateAction<Vector2d>>;
  setStageScale: Dispatch<SetStateAction<number>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
  selectNodesByIdList: (idList: string[]) => void;
  getPointerPosition: () => Vector2d;
  setViewportSize: Dispatch<SetStateAction<ViewportSize>>;
}

const defaultValue: CanvasContextValueProps = {
  // canvasSize: { width: 0, height: 0 },
  canvasPos: { x: 0, y: 0 },
  stageScale: 1,
  viewportSize: { width: 0, height: 0 },
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  // setCanvasSize: () => {},
  setCanvasPos: () => {},
  setStageScale: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
  getPointerPosition: () => ({ x: 0, y: 0 }),
  setViewportSize: () => {},
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const { canvasPos: cPos, viewportSize: vSize } = defaultValue;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [canvasPos, setCanvasPos] = useState<Vector2d>(cPos);
  // const [canvasSize, setCanvasSize] = useState<CanvasSize>(canvasSizeFromStore);
  const [stageScale, setStageScale] = useState<number>(defaultValue.stageScale);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(vSize);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);

  const getPointerPosition = useCallback((): Vector2d => {
    if (!stageRef.current) return { x: 0, y: 0 };
    const stagePos = stageRef.current.getPosition();
    const scale = stageRef.current.getAbsoluteScale();
    const pointerPos = stageRef.current.getPointerPosition() as Vector2d;

    return {
      x: (pointerPos.x - stagePos.x) / scale.x,
      y: (pointerPos.y - stagePos.y) / scale.y,
    };
  }, []);

  const selectNodeById = (id: string) => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = getAllSelectedNodes();
    const stage = stageRef.current;
    const node = stage.find(".shape").find(({ attrs }) => attrs.id === id);
    if (node && !selectedNodes.includes(node)) {
      setSelectedNodes([node]);
    }
  };

  const selectNodesByIdList = useCallback((idList: string[]) => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;

    const nodes = stage.find(({ attrs }: Konva.Node) =>
      idList.includes(attrs.id)
    );
    if (nodes && nodes.length > 0) setSelectedNodes(nodes);
  }, []);

  const getSingleSelectedNode = (): Konva.Node | undefined =>
    transformerRef.current?.getNode();

  const getAllSelectedNodes = (): Konva.Node[] =>
    transformerRef.current?.getNodes() ?? [];

  return (
    <CanvasContext.Provider
      value={{
        // canvasSize,
        canvasPos,
        stageScale,
        viewportSize,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        // setCanvasSize,
        setCanvasPos,
        setStageScale,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
        getPointerPosition,
        setViewportSize,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
