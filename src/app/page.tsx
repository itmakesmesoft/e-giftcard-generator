"use client";

import { useRef } from "react";
import { readCodeByImage } from "./utils/codeReader";
import { generateBarcode } from "./utils/codeGenerator";

// import Image from "next/image";

export default function Home() {
  const ref = useRef(null);

  const clickDecodeButton = async () => {
    if (ref.current) {
      const target = ref.current as HTMLImageElement;
      const res = await readCodeByImage(target.src);
      generateBarcode("canvas", res);
    }
  };
  return (
    <div>
      <img ref={ref} src="/example.png" alt="image" />
      <input type="file" name="" id="" accept="image/*" />
      <button onClick={clickDecodeButton}>decode</button>
      <canvas id="canvas" />
    </div>
  );
}
