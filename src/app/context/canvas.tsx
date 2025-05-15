import Konva from "konva";
import {
  createContext,
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useShapeStore } from "../store/canvas";
import { Vector2d } from "konva/lib/types";
import { ShapeConfig } from "../types/canvas";
import { convertPosition } from "@/utils/canvas";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

interface CanvasContextValueProps {
  canvasSize: CanvasSize;
  canvasPos: Vector2d;
  stageScale: number;
  viewportSize: ViewportSize;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasSize: Dispatch<SetStateAction<CanvasSize>>;
  setCanvasPos: Dispatch<SetStateAction<Vector2d>>;
  setStageScale: Dispatch<SetStateAction<number>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
  selectNodesByIdList: (idList: string[]) => void;
  getPointerPosition: () => Vector2d;
}

const defaultValue: CanvasContextValueProps = {
  canvasSize: { width: 400, height: 600 },
  canvasPos: { x: 0, y: 0 },
  stageScale: 1,
  viewportSize: { width: 0, height: 0 },
  selectedNodes: [],
  stageRef: { current: null },
  transformerRef: { current: null },
  setCanvasSize: () => {},
  setCanvasPos: () => {},
  setStageScale: () => {},
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
  getPointerPosition: () => ({ x: 0, y: 0 }),
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
  const canvasPosRef = useRef<Vector2d>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [canvasPos, setCanvasPos] = useState<Vector2d>(cPos);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(cSize);
  const [stageScale, setStageScale] = useState<number>(defaultValue.stageScale);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(vSize);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);

  const setShapes = useShapeStore((state) => state.setShapes);

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

  // 위치를 절대 위치 또는 상대 위치로 바꾸는 함수

  const convertToAbsolutePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      const canvasPos = canvasPosRef.current || { x: 0, y: 0 };
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        true
      );
    },
    []
  );

  const convertToRelativePosition = useCallback(
    (props: ShapeConfig, parentX?: number, parentY?: number) => {
      const canvasPos = canvasPosRef.current || { x: 0, y: 0 };
      return convertPosition(
        props,
        parentX ?? canvasPos.x,
        parentY ?? canvasPos.y,
        false
      );
    },
    []
  );

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      return;
    }
    transformerRef.current?.nodes([]);
  }, [selectedNodes]);

  const resize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const posX = (width - canvasSize.width) / 2;
    const posY = (height - canvasSize.height) / 2;

    setShapes(
      (shapes) =>
        shapes.map((shape) => ({
          ...shape,
          ...convertToAbsolutePosition(
            convertToRelativePosition(shape),
            posX,
            posY
          ),
        })),
      false
    );
    setViewportSize({ width, height });
    setCanvasPos({
      x: posX,
      y: posY,
    });
    canvasPosRef.current = { x: posX, y: posY };
  }, [
    canvasSize,
    convertToAbsolutePosition,
    convertToRelativePosition,
    setShapes,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [resize]);

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
        canvasSize,
        canvasPos,
        stageScale,
        viewportSize,
        selectedNodes,
        stageRef: stageRef as RefObject<Konva.Stage>,
        transformerRef: transformerRef as RefObject<Konva.Transformer>,
        setCanvasSize,
        setCanvasPos,
        setStageScale,
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
        getPointerPosition,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
