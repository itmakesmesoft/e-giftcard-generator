import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

const FORMAT_LIST = [
  "AZTEC",
  "CODABAR",
  "CODE_39",
  "CODE_93",
  "CODE_128",
  "DATA_MATRIX",
  "EAN_8",
  "EAN_13",
  "ITF",
  "MAXICODE",
  "PDF_417",
  "QR_CODE",
  "RSS_14",
  "RSS_EXPANDED",
  "UPC_A",
  "UPC_E",
  "UPC_EAN_EXTENSION",
];

export const readCodeByImage = async (image: string | HTMLImageElement) => {
  const reader = new BrowserMultiFormatReader();

  try {
    if (image instanceof HTMLImageElement) {
      return await reader
        .decodeFromImageElement(image)
        .then((res) => extractData(res));
    }
    return await reader
      .decodeFromImageUrl(image)
      .then((res) => extractData(res));
  } catch (err) {
    if (err instanceof NotFoundException) {
      return null;
    }
    console.error(err);
    throw err;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractData = (data: any) => {
  const format = FORMAT_LIST[data.format];
  const returnObject = { format, value: data.text as string };
  console.log(returnObject);
  return returnObject;
};
