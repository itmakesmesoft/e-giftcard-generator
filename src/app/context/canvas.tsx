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

interface CanvasContextValueProps {
  canvasPos: Vector2d;
  // stageScale: number;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasPos: Dispatch<SetStateAction<Vector2d>>;
  // setStageScale: Dispatch<SetStateAction<number>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string, additive?: boolean) => void;
  selectNodesByIdList: (idList: string[]) => void;
  getPointerPosition: () => Vector2d;
  cancelPendingDeselect: () => void;
  commitPendingDeselect: () => void;
}

const defaultValue: CanvasContextValueProps = {
  canvasPos: { x: 0, y: 0 },
  // stageScale: 1,
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  setCanvasPos: () => {},
  // setStageScale: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
  getPointerPosition: () => ({ x: 0, y: 0 }),
  cancelPendingDeselect: () => {},
  commitPendingDeselect: () => {},
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const { canvasPos: cPos } = defaultValue;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [canvasPos, setCanvasPos] = useState<Vector2d>(cPos);
  // const [stageScale, setStageScale] = useState<number>(defaultValue.stageScale);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  const pendingDeselectIdRef = useRef<string | null>(null);

  const cancelPendingDeselect = useCallback(() => {
    pendingDeselectIdRef.current = null;
  }, []);

  const commitPendingDeselect = useCallback(() => {
    const id = pendingDeselectIdRef.current;
    pendingDeselectIdRef.current = null;
    if (!id || !stageRef.current) return;
    const node = stageRef.current
      .find(".shape")
      .find(({ attrs }) => attrs.id === id);
    if (node) setSelectedNodes([node]);
  }, []);

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

  const selectNodeById = (id: string, additive = false) => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const node = stage.find(".shape").find(({ attrs }) => attrs.id === id);
    if (!node) return;

    if (additive) {
      const current = getAllSelectedNodes();
      if (current.includes(node)) {
        const filtered = current.filter((n) => n !== node);
        setSelectedNodes(filtered);
      } else {
        setSelectedNodes([...current, node]);
      }
    } else {
      const current = getAllSelectedNodes();
      if (current.length > 1 && current.some((n) => n.attrs.id === id)) {
        pendingDeselectIdRef.current = id;
        return;
      }
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
        canvasPos,
        // stageScale,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        setCanvasPos,
        // setStageScale,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
        getPointerPosition,
        cancelPendingDeselect,
        commitPendingDeselect,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
