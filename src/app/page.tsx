"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { readCodeByImage } from "../utils/code/reader";
import { generateCode } from "../utils/code/generator";
import { convertBarcodeFormat } from "@/utils/code/adapter";
import type { GeneraterFormatType } from "@/utils/code/type";

export default function Home() {
  const imgRef = useRef<Base64URLString | null>(null);
  const [image, setImage] = useState<Base64URLString | null>(null);

  const decodeImage = async () => {
    if (!imgRef.current) return;

    const data = await readCodeByImage(imgRef.current);
    if (!data) return;

    const format = convertBarcodeFormat(data.format) as GeneraterFormatType;
    generateCode({
      canvas: "canvas",
      options: { bcid: format, text: data.value },
    });
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as Base64URLString;
      imgRef.current = result;
      setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {image && (
        <Image src={image} alt="barcode preview" width={300} height={300} />
      )}
      <label className="cursor-pointer">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <span className="px-4 py-2 bg-blue-500 text-white rounded inline-block">
          Select Image
        </span>
      </label>
      <button
        onClick={decodeImage}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Decode
      </button>
      <canvas id="canvas" className="bg-white p-4" />
    </div>
  );
}
