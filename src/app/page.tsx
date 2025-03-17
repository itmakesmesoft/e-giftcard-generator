import Canvas from "./components/CanvasContainer";
import Toast from "./components/ui/Toast";

export default function Page() {
  return (
    <Toast.Provider>
      <Canvas />
      <Toast.Viewport className="fixed bottom-0 right-0 z-100" />
    </Toast.Provider>
  );
}
