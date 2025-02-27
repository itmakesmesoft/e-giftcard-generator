"use client";

import { useRef, useState } from "react";
import { readCodeByImage } from "./utils/codeReader";
import { generateBarcode } from "./utils/codeGenerator";
import Image from "next/image";

export default function Home() {
  const imgRef = useRef<Base64URLString>(null);
  const [image, setImage] = useState<Base64URLString>();

  const clickDecodeButton = async () => {
    if (imgRef.current) {
      const res = await readCodeByImage(imgRef.current as string);
      if (!res) {
        console.log("not found");
        return null;
      }
      console.log(res);
      generateBarcode("canvas", res);
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      const result = fileReader.result;
      if (!result || result instanceof ArrayBuffer) return;
      imgRef.current = result;
      setImage(result);
    };
  };

  return (
    <div>
      {/* <img ref={ref} src="/example.png" alt="image" /> */}
      {image && <Image src={image} alt="image" width="300" height="300" />}
      <input
        type="file"
        onChange={handleChangeFile}
        name="barcode"
        id="barcode"
        accept="image/*"
      />
      <button onClick={clickDecodeButton}>decode</button>
      <canvas id="canvas" />
    </div>
  );
}
