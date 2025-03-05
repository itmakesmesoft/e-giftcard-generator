"use client";

import Image from "next/image";
import { useState } from "react";
import { readCodeByImage } from "../utils/reader";
import { generateCode } from "../utils/generator";
import { convertBarcodeFormat } from "@/utils/adapter";
import type { GeneraterFormatType } from "@/utils/type";

export default function Home() {
  const [image, setImage] = useState<Base64URLString | null>(null);

  const decodeImage = async () => {
    if (!image) return;

    const data = await readCodeByImage(image);
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
      setImage(reader.result as Base64URLString);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
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
