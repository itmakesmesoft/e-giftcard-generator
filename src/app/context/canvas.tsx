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
import { Group } from "konva/lib/Group";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Vector2d } from "konva/lib/types";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface CanvasData {
  canvas: {
    width: number;
    height: number;
    children: (Group | Shape<ShapeConfig>)[] | undefined;
  };
}

interface CanvasContextValueProps {
  canvasSize: CanvasSize;
  canvasPos: Vector2d;
  viewportSize: ViewportSize;
  selectedNodes: Konva.Node[];
  stageRef: RefObject<Konva.Stage | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  setCanvasSize: Dispatch<SetStateAction<CanvasSize>>;
  setCanvasPos: Dispatch<SetStateAction<Vector2d>>;
  setSelectedNodes: (node: Konva.Node[]) => void;
  getAllSelectedNodes: () => Konva.Node[];
  getSingleSelectedNode: () => Konva.Node | undefined;
  selectNodeById: (id: string) => void;
  selectNodesByIdList: (idList: string[]) => void;
  loadCanvasByJSON: (data: CanvasData) => void;
  exportCanvasAsJSON: () => CanvasData | undefined;
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
  setSelectedNodes: () => {},
  getAllSelectedNodes: () => [],
  getSingleSelectedNode: () => undefined,
  selectNodeById: () => {},
  selectNodesByIdList: () => {},
  loadCanvasByJSON: () => {},
  exportCanvasAsJSON: () => undefined,
};

const CanvasContext = createContext<CanvasContextValueProps>(defaultValue);

export const useCanvasContext = () => useContext(CanvasContext);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  const setShapes = useShapeStore((state) => state.setShapes);

  const {
    canvasPos: cPos,
    canvasSize: cSize,
    viewportSize: vSize,
  } = defaultValue;
  const [canvasPos, setCanvasPos] = useState<Vector2d>(cPos);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(cSize);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(vSize);

  // 위치를 절대 위치 또는 상대 위치로 바꾸는 함수
  const convertPosition = useCallback(
    (props: ShapeConfig, parentX = 0, parentY = 0, isAbsolute = true) => {
      const { x, y, points } = props;
      return {
        ...(x && { x: x + (isAbsolute ? parentX : -parentX) }),
        ...(y && { y: y + (isAbsolute ? parentY : -parentY) }),
        ...(points && {
          points: points?.map((point: number, index: number) =>
            index % 2
              ? point + (isAbsolute ? parentY : -parentY)
              : point + (isAbsolute ? parentX : -parentX)
          ),
        }),
      };
    },
    []
  );

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
    [convertPosition]
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
    [convertPosition]
  );

  useEffect(() => {
    if (selectedNodes.length > 0) {
      transformerRef.current?.nodes([...selectedNodes]);
      console.log(selectedNodes);
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

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const canvasPosRef = useRef<Vector2d>(null);

  useEffect(() => {
    setCanvasPos({
      x: (viewportSize.width - canvasSize.width) / 2,
      y: (viewportSize.height - canvasSize.height) / 2,
    });
  }, [canvasSize, setCanvasPos, viewportSize]);

  useEffect(() => {
    setShapes((shapes) =>
      shapes.map((shape) => ({
        ...shape,
        ...convertToAbsolutePosition(
          convertToRelativePosition(shape),
          canvasPos.x,
          canvasPos.y
        ),
      }))
    );
    canvasPosRef.current = canvasPos;
  }, [
    canvasPos,
    convertToAbsolutePosition,
    convertToRelativePosition,
    setShapes,
  ]);

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

  const loadCanvasByJSON = (data: CanvasData) => {
    if (!stageRef.current) return;

    const children = data.canvas.children?.map((child) => ({
      ...child,
      attrs: {
        ...child.attrs,
        ...convertToAbsolutePosition(child.attrs), // 절대 좌표로 변환
      },
    }));
    if (!children) return;
    setShapes(children.map(({ attrs }) => attrs));
  };

  const exportCanvasAsJSON = () => {
    if (!stageRef.current) return;
    const stagedChildren = stageRef.current.getChildren();
    const extractIds = ["_shapeLayer", "_drawLayer"];
    const children = stagedChildren
      .filter(({ attrs }) => extractIds.includes(attrs.id))
      .map(({ children }) =>
        children.map((child) => ({
          ...child,
          attrs: {
            ...child.attrs,
            ...convertToRelativePosition(child.attrs), // 상대 좌표로 변환
          },
        }))
      )
      .flat() as (Group | Shape<ShapeConfig>)[];

    return {
      canvas: {
        ...canvasSize,
        children: children,
      },
    };
  };

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
        setSelectedNodes,
        getAllSelectedNodes,
        getSingleSelectedNode,
        selectNodeById,
        selectNodesByIdList,
        loadCanvasByJSON,
        exportCanvasAsJSON,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
