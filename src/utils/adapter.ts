import { GeneraterFormatType } from "./type";

const barcodeFormatMap: Record<string, string> = {
  AZTEC: "azteccode",
  CODABAR: "rationalizedCodabar",
  CODE_39: "code39",
  CODE_93: "code93",
  CODE_128: "code128",
  DATA_MATRIX: "datamatrix",
  EAN_8: "ean8",
  EAN_13: "ean13",
  ITF: "interleaved2of5",
  MAXICODE: "maxicode",
  PDF_417: "pdf417",
  QR_CODE: "qrcode",
  RSS_14: "databaromni",
  RSS_EXPANDED: "databarexpanded",
  UPC_A: "upca",
  UPC_E: "upce",
  UPC_EAN_EXTENSION: "ean2",
};

export const convertBarcodeFormat = (format: string) => {
  return barcodeFormatMap[format] as GeneraterFormatType;
};
