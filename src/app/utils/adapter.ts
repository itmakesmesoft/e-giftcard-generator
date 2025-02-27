const formatMapping: Record<string, string> = {
  CODABAR: "Codabar",
  CODE_39: "CODE39",
  CODE_128: "CODE128",
  EAN_8: "EAN8",
  EAN_13: "EAN13",
  ITF: "ITF",
  UPC_A: "UPC",
};

// ZXing에만 존재하는 형식
const unmatched = [
  "AZTEC",
  "CODE_93",
  "DATA_MATRIX",
  "MAXICODE",
  "PDF_417",
  "QR_CODE",
  "RSS_14",
  "RSS_EXPANDED",
  "UPC_E",
  "UPC_EAN_EXTENSION",
];

export const convertBarcodeFormat = (format: string) => {
  if (unmatched.includes(format)) {
    console.log(`${format}은 지원되지 않는 형식이에요.`);
    return null;
  }
  return formatMapping[format];
};
