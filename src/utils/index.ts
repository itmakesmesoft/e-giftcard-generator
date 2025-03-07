import { generateCode } from "./generator";
import { readCodeByImage } from "./reader";
import { convertBarcodeFormat } from "./adapter";
import { saveToLocalStorage, loadFromLocalStorage } from "./canvas";
import type { GeneraterFormatType, ReaderFormatType } from "./type";

export {
  generateCode,
  readCodeByImage,
  convertBarcodeFormat,
  saveToLocalStorage,
  loadFromLocalStorage,
};
export type { GeneraterFormatType, ReaderFormatType };
