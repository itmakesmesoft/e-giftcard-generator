import bwipjs from "@bwip-js/browser";
import type { GeneraterFormatType } from "./type";
import type { RenderOptions as RenderOptionsFromBWIP } from "@bwip-js/browser";

interface RenderOptions extends Omit<RenderOptionsFromBWIP, "bcid"> {
  bcid: GeneraterFormatType;
}

interface GenerateCodeProps {
  canvas: string | HTMLCanvasElement;
  options: RenderOptions;
}

export const generateCode = ({ canvas, options }: GenerateCodeProps) => {
  try {
    bwipjs.toCanvas(canvas, {
      ...options,
      includetext: true,
    });
  } catch (e) {
    console.error(e);
  }
};
